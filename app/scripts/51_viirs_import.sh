#!/usr/bin/env bash
set -euo pipefail

DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
IN=data/cache/viirs/viirs_bbox.tif
CLIP=data/staging/viirs_clip.tif
H3_RES=${H3_STATS_RES:-8}

mkdir -p data/staging

if [ ! -f "$IN" ]; then
  echo "[viirs] Input raster $IN not found; run fetch first." >&2
  exit 1
fi

echo "[viirs] Clipping to region mask -> $CLIP"
gdalwarp -cutline "$REGION_MASK" -crop_to_cutline -dstNodata 0 "$IN" "$CLIP"

echo "[viirs] Computing per-H3 mean at res $H3_RES"
CSV=data/staging/viirs_h3_mean.csv
python3 scripts/utils/raster_to_h3_stats.py --raster "$CLIP" --mask "$REGION_MASK" --res $H3_RES --stat mean --out "$CSV"

echo "[viirs] Importing to DB table viirs_h3_mean"
psql "$DB_URL" -v ON_ERROR_STOP=1 <<SQL
CREATE TABLE IF NOT EXISTS viirs_h3_mean (
  h3 text primary key,
  res int not null,
  mean double precision
);
SQL
psql "$DB_URL" -c "\copy viirs_h3_mean(h3,res,mean) FROM '$CSV' CSV HEADER"
echo "[viirs] Done"
