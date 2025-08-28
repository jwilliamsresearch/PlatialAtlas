#!/usr/bin/env python3
import json, os, sys, time
from urllib.request import urlopen, Request

REGION_NAME = os.environ.get("REGION_NAME", "Nottinghamshire")
REGION_MASK = os.environ.get("REGION_MASK", "data/boundaries/nottinghamshire.geojson")
OUT = "data/staging/osm_raw.geojson"

os.makedirs("data/staging", exist_ok=True)

def bbox_from_mask(path:str):
    try:
        with open(path,"r",encoding="utf-8") as f:
            fc = json.load(f)
        if not fc.get("features"):
            return None
        coords = []
        def collect(geom):
            t = geom.get("type")
            if t == "Polygon":
                for ring in geom["coordinates"]:
                    coords.extend(ring)
            elif t == "MultiPolygon":
                for poly in geom["coordinates"]:
                    for ring in poly:
                        coords.extend(ring)
        for feat in fc["features"]:
            collect(feat["geometry"])    
        if not coords:
            return None
        xs = [c[0] for c in coords]
        ys = [c[1] for c in coords]
        return min(xs), min(ys), max(xs), max(ys)
    except Exception:
        return None

bbox = bbox_from_mask(REGION_MASK) or (-1.4, 52.8, -0.5, 53.5)

# Broaden to cover Map Features top-level keys typically used as POIs
# (nodes/ways/relations are returned as points via center)
keys = "amenity|shop|tourism|leisure|landuse|natural|historic|heritage|office|craft|aeroway|aerialway|railway|public_transport|man_made|healthcare|emergency|club|building|sport|education|place|waterway|highway|power|barrier|boundary|route"
area_query = f"area[name=\"{REGION_NAME}\"];(node(area)[~'^({keys})$'~'.'];way(area)[~'^({keys})$'~'.'];relation(area)[~'^({keys})$'~'.'];);out center;"
bbox_query = f"(node({bbox[1]},{bbox[0]},{bbox[3]},{bbox[2]})[~'^({keys})$'~'.'];way({bbox[1]},{bbox[0]},{bbox[3]},{bbox[2]})[~'^({keys})$'~'.'];relation({bbox[1]},{bbox[0]},{bbox[3]},{bbox[2]})[~'^({keys})$'~'.'];);out center;"

def overpass(query):
    body = f"[out:json][timeout:90];{query}".encode("utf-8")
    req = Request("https://overpass-api.de/api/interpreter", data=body, headers={"Content-Type":"application/x-www-form-urlencoded"})
    with urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

print(f"[osm] Querying Overpass for '{REGION_NAME}' area...")
try:
    data = overpass(area_query)
    if not data.get("elements"):
        raise RuntimeError("Empty result for area")
except Exception as e:
    print(f"[osm] Area query failed ({e}); falling back to bbox {bbox}")
    data = overpass(bbox_query)

# Convert to GeoJSON FeatureCollection, using center for ways/relations
def element_to_feature(el):
    tags = el.get("tags", {})
    if el["type"] == "node":
        geom = {"type":"Point","coordinates":[el["lon"], el["lat"]]}
    else:
        c = el.get("center")
        if not c:
            return None
        geom = {"type":"Point","coordinates":[c["lon"], c["lat"]]}
    return {
        "type":"Feature",
        "properties": {
            "id": f"{el['type']}/{el['id']}",
            "tags": tags,
            "name": tags.get("name")
        },
        "geometry": geom
    }

features = []
for el in data.get("elements", []):
    f = element_to_feature(el)
    if f:
        features.append(f)

fc = {"type":"FeatureCollection","features":features}
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(fc, f)
print(f"[osm] Wrote {OUT} with {len(features)} features")
