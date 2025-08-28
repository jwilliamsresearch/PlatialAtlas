#!/usr/bin/env bash
set -euo pipefail

# Download a cropped ESA WorldCover 2021 v200 mosaic window for region bbox
# Requires: GDAL (gdal_translate), Python3

REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
WORLD_COVER_COG_URL=${WORLD_COVER_COG_URL:-https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/ESA_WorldCover_10m_2021_v200_Map.tif}
OUTDIR=data/cache/worldcover
OUT="$OUTDIR/worldcover_bbox.tif"

mkdir -p "$OUTDIR"

if [ -z "$WORLD_COVER_COG_URL" ]; then
  echo "[worldcover] WORLD_COVER_COG_URL not set" >&2
  exit 1
fi

# Derive bbox from region mask (minx miny maxx maxy)
read -r MINX MINY MAXX MAXY < <(python3 scripts/utils/bbox_from_geojson.py "$REGION_MASK")
echo "[worldcover] BBOX $MINX,$MINY,$MAXX,$MAXY"

echo "[worldcover] Cropping COG via gdal_translate -> $OUT"
gdal_translate \
  -projwin_srs EPSG:4326 \
  -projwin $MINX $MAXY $MAXX $MINY \
  "$WORLD_COVER_COG_URL" "$OUT" -co COMPRESS=DEFLATE -co TILED=YES

echo "[worldcover] Saved $OUT"
