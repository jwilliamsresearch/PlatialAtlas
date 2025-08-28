#!/usr/bin/env bash
set -euo pipefail

# Requires: curl, jq, ogr2ogr (GDAL >= 3.6), aws-cli OR curl with url

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

REGION_NAME=${REGION_NAME:-Nottinghamshire}
REGION_MASK=${REGION_MASK:-data/boundaries/nottinghamshire.geojson}
DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}
RELEASE=${OVERTURE_RELEASE:-2024-06-13.0}
BUCKET=${OVERTURE_S3_BUCKET:-overturemaps-us-west-2}

mkdir -p data/cache/overture data/boundaries

echo "[mask] Downloading Overture Admin Areas parquet (release=$RELEASE)"

# Using AWS CLI if available for faster wildcard sync; otherwise curl a known key list
if command -v aws >/dev/null 2>&1; then
  export AWS_NO_SIGN_REQUEST=1
  export AWS_REGION=${AWS_REGION:-us-west-2}
  aws s3 cp --recursive s3://$BUCKET/release/$RELEASE/theme=admins/type=area/ data/cache/overture/admins/
else
  echo "Please install aws-cli for admins parquet sync (fallback not implemented)." >&2
fi

echo "[mask] Building region mask for $REGION_NAME"
TMP_MERGED="data/cache/overture/admins_merged.parquet"
if command -v python3 >/dev/null 2>&1; then
  python3 - <<'PY'
import os, sys
import glob
import geopandas as gpd

files = glob.glob('data/cache/overture/admins/*.parquet')
if not files:
    print('No admin parquet files found', file=sys.stderr)
    sys.exit(1)
gdfs = [gpd.read_parquet(f) for f in files]
gdf = gpd.pd.concat(gdfs, ignore_index=True)
mask = gdf[(gdf.get('name', '')==os.environ.get('REGION_NAME','')) | (gdf.get('locality','')==os.environ.get('REGION_NAME',''))]
if mask.empty:
    # try partial match
    rn = os.environ.get('REGION_NAME','').lower()
    mask = gdf[gdf.get('name','').str.lower().str.contains(rn, na=False)]
if mask.empty:
    print('Could not find region in Overture admins', file=sys.stderr)
    sys.exit(1)
mask = mask.to_crs(4326)
geom = mask.geometry.unary_union
mp = gpd.GeoSeries([geom]).set_crs(4326)
mp.to_file(os.environ.get('REGION_MASK','data/boundaries/nottinghamshire.geojson'), driver='GeoJSON')
print('Wrote', os.environ.get('REGION_MASK'))
PY
else
  echo "Python3 (with geopandas) required to build mask." >&2
  exit 1
fi

echo "[mask] Inserting mask into DB"
psql "$DB_URL" -c "TRUNCATE region_mask;" || true
ogr2ogr -f PostgreSQL PG:"$DB_URL" "$REGION_MASK" -nln region_mask -nlt MULTIPOLYGON -overwrite -lco GEOMETRY_NAME=geom

echo "[mask] Done."
