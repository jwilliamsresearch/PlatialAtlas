#!/usr/bin/env python3
import glob, json, os, sys

import geopandas as gpd

MASK = os.environ.get("REGION_MASK", "data/boundaries/nottinghamshire.geojson")
SRC = "data/cache/overture/buildings/*.parquet"
OUT = "data/staging/overture_building_pts.geojson"

os.makedirs("data/staging", exist_ok=True)

files = glob.glob(SRC)
if not files:
    print("[overture] No buildings parquet found", file=sys.stderr)
    sys.exit(0)

print(f"[overture] Reading {len(files)} parquet files")
gdfs = [gpd.read_parquet(f) for f in files]
gdf = gpd.pd.concat(gdfs, ignore_index=True)
gdf = gdf.set_geometry('geometry').to_crs(4326)

# Clip to mask
mask = gpd.read_file(MASK).to_crs(4326)
if not mask.empty:
    gdf = gpd.overlay(gdf, mask, how='intersection')

centroids = gdf.geometry.centroid
pts = gpd.GeoDataFrame(
    {
        'levels': gdf.get('levels'),
        'area': gdf.area
    },
    geometry=centroids,
    crs='EPSG:4326'
)

pts.to_file(OUT, driver='GeoJSON')
print(f"[overture] Wrote {OUT} with {len(pts)} points")

