#!/usr/bin/env bash
set -euo pipefail

# Download WorldPop population raster and crop to region bbox
# Requires: GDAL (gdal_translate), Python3

REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
WORLDPOP_TIFF_URL=${WORLDPOP_TIFF_URL:-}
OUTDIR=data/cache/worldpop
OUT="$OUTDIR/worldpop_bbox.tif"

mkdir -p "$OUTDIR"

if [ -z "$WORLDPOP_TIFF_URL" ]; then
  echo "[worldpop] Set WORLDPOP_TIFF_URL in .env to the desired GeoTIFF" >&2
  echo "[worldpop] Example: https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/GBR/GBR_ppp_2020.tif" >&2
  exit 1
fi

read -r MINX MINY MAXX MAXY < <(python3 scripts/utils/bbox_from_geojson.py "$REGION_MASK")
echo "[worldpop] BBOX $MINX,$MINY,$MAXX,$MAXY"

echo "[worldpop] Cropping via gdal_translate -> $OUT"
gdal_translate -projwin_srs EPSG:4326 -projwin $MINX $MAXY $MAXX $MINY "$WORLDPOP_TIFF_URL" "$OUT" -co COMPRESS=DEFLATE -co TILED=YES
