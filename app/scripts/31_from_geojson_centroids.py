#!/usr/bin/env python3
"""
Convert building polygons (from 30_overture_cli_download.py) to centroid Points.

Input:  data/staging/overture_building_pts.geojson (may contain Polygon features)
Output: data/staging/overture_building_pts.geojson (overwritten with Point features)

Keeps simple properties: levels (if present) and area.

Requires: pip install geopandas shapely pyproj
"""
import sys
from pathlib import Path

import geopandas as gpd

IN_PATH = Path('data/staging/overture_building_pts.geojson')


def main():
    if not IN_PATH.exists():
        print(f"[centroids] Missing {IN_PATH}. Run 30_overture_cli_download.py first.")
        sys.exit(1)

    gdf = gpd.read_file(IN_PATH)
    if gdf.empty:
        print(f"[centroids] Input is empty: {IN_PATH}")
        return

    # Ensure CRS
    try:
        gdf = gdf.to_crs(4326)
    except Exception:
        pass

    # Compute centroids; area in degree^2 (consistent with 31_overture_extract_buildings.py)
    centroids = gdf.geometry.centroid
    out = gpd.GeoDataFrame(
        {
            'levels': gdf.get('levels'),
            'area': gdf.area,
        },
        geometry=centroids,
        crs='EPSG:4326'
    )

    out.to_file(IN_PATH, driver='GeoJSON')
    print(f"[centroids] Wrote Points to {IN_PATH} ({len(out)} features)")


if __name__ == '__main__':
    main()

