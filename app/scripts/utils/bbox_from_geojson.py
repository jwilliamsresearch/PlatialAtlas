#!/usr/bin/env python3
import json, sys

def bbox_from_mask(path:str):
    with open(path,"r",encoding="utf-8") as f:
        fc = json.load(f)
    xs, ys = [], []
    for feat in fc.get("features", []):
        geom = feat.get("geometry", {})
        t = geom.get("type")
        cs = geom.get("coordinates", [])
        if t == 'Polygon':
            for ring in cs:
                for x,y in ring:
                    xs.append(x); ys.append(y)
        elif t == 'MultiPolygon':
            for poly in cs:
                for ring in poly:
                    for x,y in ring:
                        xs.append(x); ys.append(y)
    if not xs:
        print("-180 -90 180 90")
    else:
        print(min(xs), min(ys), max(xs), max(ys))

if __name__ == '__main__':
    path = sys.argv[1]
    bbox_from_mask(path)

