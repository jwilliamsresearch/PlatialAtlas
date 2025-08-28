#!/usr/bin/env bash
set -euo pipefail

DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
GEOJSON=data/staging/flickr_points.geojson

echo "[flickr] Importing Flickr points to side table flickr_point"
psql "$DB_URL" -c "CREATE TABLE IF NOT EXISTS flickr_point (id bigserial primary key, title text, owner_name text, datetaken timestamptz, tags text, geom geometry(Point,4326)); CREATE INDEX IF NOT EXISTS flickr_point_gix ON flickr_point USING gist(geom);"

if [ -f "$GEOJSON" ]; then
  ogr2ogr -f PostgreSQL PG:"$DB_URL" "$GEOJSON" -nln flickr_point -append -nlt POINT -lco GEOMETRY_NAME=geom \
    -sql "SELECT properties->>'title' AS title, properties->>'owner' AS owner_name, properties->>'datetaken' AS datetaken, properties->>'tags' AS tags, geometry FROM '$GEOJSON'"
else
  echo "[flickr] No $GEOJSON found; skipping."
fi
