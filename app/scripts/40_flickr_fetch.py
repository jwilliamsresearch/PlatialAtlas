#!/usr/bin/env python3
import json, os, sys, time
from urllib.parse import urlencode
from urllib.request import urlopen

API_KEY = os.environ.get("FLICKR_API_KEY", "")
REGION_MASK = os.environ.get("REGION_MASK", "data/boundaries/nottinghamshire.geojson")
OUT = "data/staging/flickr_points.geojson"

if not API_KEY:
    print("[flickr] FLICKR_API_KEY not set; skipping fetch", file=sys.stderr)
    sys.exit(0)

def bbox_from_mask(path:str):
    try:
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
        return (min(xs), min(ys), max(xs), max(ys)) if xs else None
    except Exception:
        return None

bbox = bbox_from_mask(REGION_MASK) or (-1.4, 52.8, -0.5, 53.5)

params = {
    'method': 'flickr.photos.search',
    'api_key': API_KEY,
    'bbox': f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}",
    'extras': 'date_taken,geo,tags,owner_name',
    'format': 'json',
    'nojsoncallback': 1,
    'per_page': 250,
    'page': 1,
    'min_taken_date': '2019-01-01',
    'max_taken_date': '2025-12-31',
}

photos = []
while True:
    url = 'https://api.flickr.com/services/rest/?' + urlencode(params)
    with urlopen(url) as r:
        data = json.loads(r.read().decode('utf-8'))
    page = data['photos']['page']
    pages = data['photos']['pages']
    photos.extend(data['photos']['photo'])
    print(f"[flickr] page {page}/{pages} -> total {len(photos)}")
    if page >= pages:
        break
    params['page'] += 1
    time.sleep(0.2)

features = []
for p in photos:
    lat = float(p.get('latitude', 0) or 0)
    lon = float(p.get('longitude', 0) or 0)
    if not lat and not lon:
        continue
    features.append({
        'type':'Feature',
        'properties':{
            'source':'flickr',
            'title': p.get('title'),
            'owner': p.get('ownername') or p.get('owner'),
            'datetaken': p.get('datetaken'),
            'tags': p.get('tags')
        },
        'geometry':{'type':'Point','coordinates':[lon,lat]}
    })

os.makedirs('data/staging', exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump({'type':'FeatureCollection','features':features}, f)
print(f"[flickr] Wrote {OUT} with {len(features)} features")

