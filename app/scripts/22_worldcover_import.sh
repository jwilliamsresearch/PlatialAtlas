#!/usr/bin/env bash
set -euo pipefail

# Keep on disk for overlays; optionally record metadata in DB
DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
RASTER=data/staging/worldcover_clip.tif

if [ -f "$RASTER" ]; then
  echo "[worldcover] Staged clipped raster at $RASTER"
  echo "[worldcover] Recording metadata in DB"
  psql "$DB_URL" -v ON_ERROR_STOP=1 <<SQL
CREATE TABLE IF NOT EXISTS worldcover_raster (
  id serial primary key,
  path text,
  inserted_at timestamptz default now()
);
INSERT INTO worldcover_raster(path) VALUES ('$RASTER');
SQL
else
  echo "[worldcover] No raster to import; skipping"
fi
