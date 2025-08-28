#!/usr/bin/env bash
set -euo pipefail

DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
GEOJSON=data/staging/osm_poi_clean.geojson

if [ ! -f "$GEOJSON" ]; then
  echo "Missing $GEOJSON" >&2
  exit 1
fi

# Import via ogr2ogr into poi table
ogr2ogr -f PostgreSQL PG:"$DB_URL" "$GEOJSON" -nln poi -append \
  -nlt POINT -lco GEOMETRY_NAME=geom \
  -oo RFC7946=YES \
  -sql "SELECT properties->>'source' as source, properties->>'source_id' as source_id, properties->>'name' as name, properties->>'category' as category, geometry FROM "$GEOJSON""

echo "[osm] Imported cleaned POIs into table poi"
