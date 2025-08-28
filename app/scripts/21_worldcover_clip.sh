#!/usr/bin/env bash
set -euo pipefail

# Clip mosaic to region mask
REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
INDIR=data/cache/worldcover
OUT=data/staging/worldcover_clip.tif
mkdir -p data/staging

TIFF=$(ls "$INDIR"/*.tif 2>/dev/null | head -n 1 || true)
if [ -z "${TIFF}" ]; then
  echo "[worldcover] No GeoTIFF found in $INDIR; skipping clip" >&2
  exit 0
fi

echo "[worldcover] Clipping $TIFF -> $OUT"
gdalwarp -cutline "$REGION_MASK" -crop_to_cutline -dstNodata 0 -r nearest "$TIFF" "$OUT"
