SHELL := /usr/bin/env bash

export DATABASE_URL ?= postgres://postgres:postgres@localhost:5433/platial-atlas
export REGION_NAME ?= Nottinghamshire
export REGION_MASK ?= data/boundaries/nottinghamshire.geojson

PSQL := psql -v ON_ERROR_STOP=1 --dbname="$(DATABASE_URL)"

# Cross-platform DB create helper
ifeq ($(OS),Windows_NT)
  DB_CREATE := powershell -ExecutionPolicy Bypass -File scripts\\utils\\db_create.ps1
else
  DB_CREATE := bash scripts/utils/db_create.sh
endif

.PHONY: init mask etl.osm etl.worldcover etl.overture etl.flickr etl.viirs etl.worldpop h3 etl.all db.create db.migrate mv.refresh

init: db.create db.migrate

db.create:
	@echo "Creating database if not exists..."
	@$(DB_CREATE)

db.migrate:
	@echo "Running base migrations..."
	@$(PSQL) -f db/migrations/000_init.sql
	@$(PSQL) -f db/migrations/010_schema.sql
	@$(PSQL) -f db/migrations/020_bounds.sql

mask:
	@bash scripts/01_mask_from_overture.sh

etl.osm:
	@python3 scripts/10_osm_fetch_overpass.py
	@python3 scripts/11_osm_clean_map.py
	@node scripts/12_osm_import.js

etl.worldcover:
	@bash scripts/20_worldcover_fetch.sh
	@bash scripts/21_worldcover_clip.sh
	@bash scripts/22_worldcover_import.sh

etl.overture:
	@bash scripts/30_overture_fetch.sh
	@python3 scripts/31_overture_extract_buildings.py
	@node scripts/32_overture_import.js

.PHONY: etl.overture.cli
etl.overture.cli:
	@python3 scripts/30_overture_cli_download.py
	@node scripts/32_overture_import.js

etl.flickr:
	@python3 scripts/40_flickr_fetch.py
	@bash scripts/41_flickr_import.sh

etl.viirs:
	@bash scripts/50_viirs_fetch.sh
	@bash scripts/51_viirs_import.sh

etl.worldpop:
	@bash scripts/60_worldpop_fetch.sh
	@bash scripts/61_worldpop_import.sh

h3:
	@node scripts/70_h3_assign.js
	@$(PSQL) -f scripts/71_h3_rollup.sql
	@$(PSQL) -f db/migrations/030_materialized.sql
	@bash scripts/72_refresh_materialized.sh

etl.all: mask etl.osm h3 etl.worldcover etl.overture etl.flickr etl.viirs etl.worldpop

mv.refresh:
	@bash scripts/72_refresh_materialized.sh
