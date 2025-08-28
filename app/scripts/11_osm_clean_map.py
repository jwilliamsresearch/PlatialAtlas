#!/usr/bin/env python3
import json, os, sys

SRC = "data/staging/osm_raw.geojson"
OUT = "data/staging/osm_poi_clean.geojson"

os.makedirs("data/staging", exist_ok=True)

def map_category(tags):
    """
    Map OSM tags to a broad category/facet matching the 29 categories in facets.ts exactly.
    This ensures compatibility with the UI facet filtering system.
    """
    # Primary categories matching facets.ts exactly (excluding 'n' which is for totals)
    facet_keys = [
        'amenity', 'shop', 'tourism', 'leisure', 'landuse', 'natural', 'historic', 'heritage',
        'office', 'craft', 'aeroway', 'aerialway', 'railway', 'public_transport', 'man_made',
        'healthcare', 'emergency', 'club', 'building', 'sport', 'education', 'place',
        'waterway', 'highway', 'power', 'barrier', 'boundary', 'route'
    ]
    
    # Return the first matching key found in tags
    for key in facet_keys:
        if key in tags:
            return key
    
    # No category found
    return None

with open(SRC, "r", encoding="utf-8") as f:
    raw = json.load(f)

clean_features = []
for feat in raw.get("features", []):
    props = feat.get("properties", {})
    tags = props.get("tags", {})
    cat = map_category(tags)
    # Keep features even if no mapped category; category may be None
    name = props.get("name")
    fid = props.get("id")
    geom = feat.get("geometry")
    if not geom:
        continue
    if geom.get("type") != "Point":
        # already center points from fetch stage; guard anyway
        continue
    clean_features.append({
        "type":"Feature",
        "properties":{
            "source":"osm",
            "source_id":fid,
            "name":name,
            "category":cat,
            "tags":tags
        },
        "geometry": geom
    })

with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"type":"FeatureCollection","features":clean_features}, f)
print(f"[osm] Cleaned -> {OUT} with {len(clean_features)} features")
