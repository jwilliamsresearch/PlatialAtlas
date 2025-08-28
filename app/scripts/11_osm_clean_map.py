#!/usr/bin/env python3
import json, os, sys

SRC = "data/staging/osm_raw.geojson"
OUT = "data/staging/osm_poi_clean.geojson"

os.makedirs("data/staging", exist_ok=True)

def map_category(tags):
    """
    Map OSM tags to a broad category/facet. For now, prefer the top-level key present.
    This is compatible with the UI "Facet" selector and can be refined to 29+ buckets.
    """
    order = [
        'amenity','shop','tourism','leisure','landuse','natural','historic','heritage','office','craft',
        'aeroway','aerialway','railway','public_transport','man_made','healthcare','emergency',
        'club','building','sport','education','place','waterway','highway','power','barrier',
        'boundary','route'
    ]
    for k in order:
        if k in tags:
            return k
    # Fallbacks to previous 5-bucket model when possible
    amenity = tags.get("amenity")
    tourism = tags.get("tourism")
    leisure = tags.get("leisure")
    landuse = tags.get("landuse")
    natural = tags.get("natural")
    historic = tags.get("historic")
    heritage = tags.get("heritage")
    shop = tags.get("shop")
    if amenity in {"school","library","place_of_worship","community_centre","clinic","doctors","hospital","sports_centre","swimming_pool"}:
        return "community"
    if shop or amenity in {"cafe","restaurant","pub","bar","fast_food","marketplace"}:
        return "commerce"
    if tourism in {"museum","gallery","attraction"} or amenity in {"arts_centre","theatre"}:
        return "culture"
    if leisure in {"park","nature_reserve"} or landuse == "forest" or natural == "wood":
        return "nature"
    if historic or heritage:
        return "heritage"
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
