#!/usr/bin/env bash
set -euo pipefail

DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
IN=data/cache/worldpop/worldpop_bbox.tif
CLIP=data/staging/worldpop_clip.tif
H3_RES=${H3_STATS_RES:-8}

mkdir -p data/staging

if [ ! -f "$IN" ]; then
  echo "[worldpop] Input raster $IN not found; run fetch first." >&2
  exit 1
fi

echo "[worldpop] Clipping to region mask -> $CLIP"
gdalwarp -cutline "$REGION_MASK" -crop_to_cutline -dstNodata 0 "$IN" "$CLIP"

echo "[worldpop] Computing per-H3 sum at res $H3_RES"
CSV=data/staging/worldpop_h3_sum.csv
python3 scripts/utils/raster_to_h3_stats.py --raster "$CLIP" --mask "$REGION_MASK" --res $H3_RES --stat sum --out "$CSV"

echo "[worldpop] Importing to DB table worldpop_h3_sum"
psql "$DB_URL" -v ON_ERROR_STOP=1 <<SQL
CREATE TABLE IF NOT EXISTS worldpop_h3_sum (
  h3 text primary key,
  res int not null,
  sum double precision
);
SQL
psql "$DB_URL" -c "\copy worldpop_h3_sum(h3,res,sum) FROM '$CSV' CSV HEADER"
echo "[worldpop] Done"
