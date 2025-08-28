#!/usr/bin/env bash
set -euo pipefail

# Download VIIRS NTL monthly raster (COG) and crop to region bbox
# Requires: GDAL (gdal_translate), Python3

REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
VIIRS_COG_URL=${VIIRS_COG_URL:-}
OUTDIR=data/cache/viirs
OUT="$OUTDIR/viirs_bbox.tif"

mkdir -p "$OUTDIR"

if [ -z "$VIIRS_COG_URL" ]; then
  echo "[viirs] Set VIIRS_COG_URL in .env to a monthly COG URL" >&2
  echo "[viirs] Example: https://noaa-viirs-nightlights-pds.s3.amazonaws.com/.../VNL_v21_npp_2021_01_global_vcmslcfg_cog.tif" >&2
  exit 1
fi

read -r MINX MINY MAXX MAXY < <(python3 scripts/utils/bbox_from_geojson.py "$REGION_MASK")
echo "[viirs] BBOX $MINX,$MINY,$MAXX,$MAXY"

echo "[viirs] Cropping COG via gdal_translate -> $OUT"
gdal_translate -projwin_srs EPSG:4326 -projwin $MINX $MAXY $MAXX $MINY "$VIIRS_COG_URL" "$OUT" -co COMPRESS=DEFLATE -co TILED=YES
