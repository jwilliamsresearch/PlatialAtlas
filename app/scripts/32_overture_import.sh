#!/usr/bin/env bash
set -euo pipefail

DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
GEOJSON=data/staging/overture_building_pts.geojson

echo "[overture] Importing building points to side table overture_building"
psql "$DB_URL" -c "CREATE TABLE IF NOT EXISTS overture_building (id bigserial primary key, levels int, area double precision, geom geometry(Point,4326)); CREATE INDEX IF NOT EXISTS overture_building_gix ON overture_building USING gist(geom);"

if [ -f "$GEOJSON" ]; then
  ogr2ogr -f PostgreSQL PG:"$DB_URL" "$GEOJSON" -nln overture_building -append -nlt POINT -lco GEOMETRY_NAME=geom
else
  echo "[overture] No $GEOJSON found; skipping."
fi
