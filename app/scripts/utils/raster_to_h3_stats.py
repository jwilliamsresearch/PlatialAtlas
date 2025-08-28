#!/usr/bin/env python3
"""
Compute per-H3 statistics for a raster within a region mask.
Requires: rasterio, shapely, numpy, pyproj, h3 (python)

Usage:
  raster_to_h3_stats.py --raster path.tif --mask region.geojson --res 8 --stat mean --out out.csv
Outputs CSV with header: h3,res,value
"""
import argparse
import json
from typing import Tuple

import numpy as np
import rasterio
from rasterio.mask import mask as rio_mask
from shapely.geometry import shape, Polygon, mapping
from shapely.ops import unary_union
from pyproj import Transformer
import h3


def load_region_geom(mask_path: str):
    with open(mask_path, 'r', encoding='utf-8') as f:
        fc = json.load(f)
    geoms = [shape(feat['geometry']) for feat in fc.get('features', [])]
    return unary_union(geoms)


def h3_cell_polygon(h: str) -> Polygon:
    b = h3.cell_to_boundary(h, geo_json=True)  # list of [lng, lat]
    return Polygon(b)


def reproject_geom(geom, src_epsg: int, dst_epsg: int):
    if src_epsg == dst_epsg:
        return geom
    transformer = Transformer.from_crs(src_epsg, dst_epsg, always_xy=True)
    return shapely_transform(geom, transformer)


def shapely_transform(geom, transformer: Transformer):
    def _coord_iter(coords):
        for x, y in coords:
            yield transformer.transform(x, y)

    if geom.geom_type == 'Polygon':
        exterior = list(_coord_iter(geom.exterior.coords))
        interiors = [list(_coord_iter(r.coords)) for r in geom.interiors]
        return Polygon(exterior, interiors)
    elif geom.geom_type == 'MultiPolygon':
        parts = [shapely_transform(g, transformer) for g in geom.geoms]
        return unary_union(parts)
    else:
        raise ValueError('Unsupported geometry type for reprojection')


def polygon_to_h3(geom: Polygon, res: int):
    # h3 expects lat,lng rings
    g = mapping(geom)
    coords = g['coordinates']
    if g['type'] == 'Polygon':
        exterior = [[lat, lng] for lng, lat in coords[0]]
        holes = [[[lat, lng] for lng, lat in ring] for ring in coords[1:]]
        return list(h3.polyfill({'type': 'Polygon', 'coordinates': [exterior, *holes]}, res))
    elif g['type'] == 'MultiPolygon':
        cells = set()
        for poly in coords:
            exterior = [[lat, lng] for lng, lat in poly[0]]
            holes = [[[lat, lng] for lng, lat in ring] for ring in poly[1:]]
            cells.update(h3.polyfill({'type': 'Polygon', 'coordinates': [exterior, *holes]}, res))
        return list(cells)
    else:
        return []


def compute_stat(arr: np.ndarray, stat: str, nodata):
    data = arr.astype(float)
    if nodata is not None:
        data = data[data != nodata]
    else:
        data = data[~np.isnan(data)]
    if data.size == 0:
        return None
    if stat == 'mean':
        return float(np.mean(data))
    if stat == 'sum':
        return float(np.sum(data))
    raise ValueError('Unknown stat')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--raster', required=True)
    ap.add_argument('--mask', required=True)
    ap.add_argument('--res', required=True, type=int)
    ap.add_argument('--stat', required=True, choices=['mean', 'sum'])
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    region = load_region_geom(args.mask)

    with rasterio.open(args.raster) as ds:
        nodata = ds.nodata
        # region in dataset CRS
        try:
            crs = ds.crs
            epsg = crs.to_epsg() if crs else 4326
        except Exception:
            epsg = 4326
        region_ds = reproject_geom(region, 4326, epsg)

        # generate H3 cells covering region (in 4326)
        cells = polygon_to_h3(region, args.res)
        rows = []
        for i, h in enumerate(cells):
            poly = h3_cell_polygon(h)
            poly_ds = reproject_geom(poly, 4326, epsg)
            if not poly_ds.intersects(region_ds):
                continue
            geojson = [mapping(poly_ds)]
            try:
                out_img, out_transform = rio_mask(ds, geojson, crop=True)
            except Exception:
                continue
            val = compute_stat(out_img[0], args.stat, nodata)
            if val is None:
                continue
            rows.append((h, args.res, val))

    # write CSV
    with open(args.out, 'w', encoding='utf-8') as f:
        f.write('h3,res,value\n')
        for h,res,val in rows:
            f.write(f'{h},{res},{val}\n')


if __name__ == '__main__':
    main()

