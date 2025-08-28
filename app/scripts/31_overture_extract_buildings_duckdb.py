#!/usr/bin/env python3
"""
Stream building centroids for a small region directly from Overture using DuckDB httpfs,
without downloading the full global Parquet bundle. Tries Azure first, then falls back to S3.

Requires: pip install duckdb geopandas shapely pyproj

Env:
  OVERTURE_RELEASE (default: 2025-08-20.0)
  REGION_MASK (default: data/boundaries/nottinghamshire.geojson)
Output:
  data/staging/overture_building_pts.geojson
"""
import json
import os
from pathlib import Path

import duckdb
import geopandas as gpd
from shapely import wkt

RELEASE = os.environ.get('OVERTURE_RELEASE', '2025-08-20.0')
MASK = os.environ.get('REGION_MASK', 'data/boundaries/nottinghamshire.geojson')
OUT = Path('data/staging/overture_building_pts.geojson')
SOURCE = os.environ.get('OVERTURE_SOURCE', 's3')  # 'azure' | 's3'
AZ_BASE = f'https://overturemapswestus2.blob.core.windows.net/release/{RELEASE}/theme=buildings/type=building/*.parquet'
S3_BASE = f's3://overturemaps-us-west-2/release/{RELEASE}/theme=buildings/type=building/*.parquet'

def read_mask_wkt(path: str) -> str:
  gdf = gpd.read_file(path).to_crs(4326)
  try:
    geom = gdf.union_all()
  except Exception:
    geom = gdf.geometry.unary_union
  return geom.wkt

def main():
  OUT.parent.mkdir(parents=True, exist_ok=True)
  poly_wkt = read_mask_wkt(MASK)

  con = duckdb.connect()
  con.execute("INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;")
  # Enable caching of file metadata to speed up scans
  con.execute("SET enable_http_metadata_cache=true")
  if SOURCE.lower() == 's3':
    con.execute("SET s3_region='us-west-2'")
    con.execute("SET s3_use_ssl=true")
    con.execute("SET s3_url_style='vhost'")
    con.execute("SET s3_endpoint='s3.us-west-2.amazonaws.com'")

  parquet_path = AZ_BASE if SOURCE.lower() == 'azure' else S3_BASE

  def run_query(path: str):
    return con.execute(f'''
      WITH b AS (
        SELECT geometry AS geom, try_cast(level AS INTEGER) AS levels
        FROM read_parquet('{path}')
      ),
      -- If geom is already GEOMETRY, keep it; if it's WKB, cast to BLOB->GEOMETRY
      g AS (
        SELECT CASE
                 WHEN typeof(geom) = 'GEOMETRY' THEN geom
                 ELSE ST_GeomFromWKB(CAST(geom AS BLOB))
               END AS geom,
               levels
        FROM b
      ),
      c AS (
        SELECT ST_Centroid(geom) AS c, levels FROM g
        WHERE ST_Intersects(geom, ST_GeomFromText('{poly_wkt}', 4326))
      )
      SELECT ST_X(c) AS lon, ST_Y(c) AS lat, levels FROM c
    ''').df()

  print(f'[overture-duckdb] Querying {parquet_path} (this may take a while, but avoids full download)...')
  try:
    df = run_query(parquet_path)
  except Exception as e:
    if parquet_path.startswith('https://'):
      print('[overture-duckdb] Azure fetch failed, trying S3 mirror...')
      con.execute("SET s3_region='us-west-2'")
      con.execute("SET s3_use_ssl=true")
      con.execute("SET s3_url_style='vhost'")
      con.execute("SET s3_endpoint='s3.us-west-2.amazonaws.com'")
      df = run_query(S3_BASE)
    else:
      raise
  print(f'[overture-duckdb] Retrieved {len(df)} centroids')

  if df.empty:
    OUT.write_text(json.dumps({"type":"FeatureCollection","features":[]}))
    print(f'[overture-duckdb] Wrote empty GeoJSON to {OUT}')
    return

  gdf = gpd.GeoDataFrame(
    df[['levels']],
    geometry=gpd.points_from_xy(df['lon'], df['lat'], crs='EPSG:4326')
  )
  gdf.to_file(OUT, driver='GeoJSON')
  print(f'[overture-duckdb] Wrote {OUT}')

if __name__ == '__main__':
  main()
