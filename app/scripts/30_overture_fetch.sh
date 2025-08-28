#!/usr/bin/env bash
set -euo pipefail

# Fetch Overture monthly release for buildings, transportation, admin themes
# Requires aws-cli (no-sign-request)

RELEASE=${OVERTURE_RELEASE:-2024-06-13.0}
BUCKET=${OVERTURE_S3_BUCKET:-overturemaps-us-west-2}
export AWS_NO_SIGN_REQUEST=1
export AWS_REGION=${AWS_REGION:-us-west-2}

OUT=data/cache/overture
mkdir -p "$OUT/buildings" "$OUT/transportation" "$OUT/admins"

echo "[overture] Using release $RELEASE from s3://$BUCKET"
echo "[overture] Syncing parquet from public S3 (buildings, transportation, admins)"
aws s3 cp --recursive "s3://$BUCKET/release/$RELEASE/theme=buildings/type=building/" "$OUT/buildings/" || true
aws s3 cp --recursive "s3://$BUCKET/release/$RELEASE/theme=transportation/type=segment/" "$OUT/transportation/" || true
aws s3 cp --recursive "s3://$BUCKET/release/$RELEASE/theme=admins/type=area/" "$OUT/admins/" || true

echo "[overture] Done"
