#!/usr/bin/env python3
"""
Use the official Overture CLI to download buildings for the region mask bbox.
Requires: pip install overturemaps

Env:
  REGION_MASK=data/boundaries/nottinghamshire.geojson
  OVERTURE_RELEASE (optional, latest by default)
Output:
  data/staging/overture_building_pts.geojson
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

REGION_MASK = os.environ.get('REGION_MASK', 'data/boundaries/nottinghamshire.geojson')
RELEASE = os.environ.get('OVERTURE_RELEASE')  # optional
OUT = Path('data/staging/overture_building_pts.geojson')


def bbox_from_mask(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        fc = json.load(f)
    xs, ys = [], []
    for feat in fc.get('features', []):
        geom = feat.get('geometry') or {}
        t = geom.get('type')
        cs = geom.get('coordinates') or []
        if t == 'Polygon':
            for ring in cs:
                for x, y in ring:
                    xs.append(x); ys.append(y)
        elif t == 'MultiPolygon':
            for poly in cs:
                for ring in poly:
                    for x, y in ring:
                        xs.append(x); ys.append(y)
    if not xs:
        raise RuntimeError('Region mask has no coordinates')
    return min(xs), min(ys), max(xs), max(ys)


def find_cli() -> str | None:
    cli = shutil.which('overturemaps')
    if cli:
        return cli
    # Try alongside current interpreter (Windows Scripts/ or POSIX bin/)
    exe_dir = Path(sys.executable).parent
    scripts_dir = exe_dir / ('Scripts' if os.name == 'nt' else 'bin')
    candidate = scripts_dir / ('overturemaps.exe' if os.name == 'nt' else 'overturemaps')
    if candidate.exists():
        return str(candidate)
    return None


def main():
    if not Path(REGION_MASK).exists():
        print(f"[overture-cli] Region mask not found: {REGION_MASK}", file=sys.stderr)
        sys.exit(1)

    cli = find_cli()
    if not cli:
        print('[overture-cli] overturemaps CLI not found. Install and ensure it is on PATH:')
        print('  python -m pip install --user overturemaps')
        print('  (Then restart your shell so PATH picks up the Scripts folder)')
        sys.exit(1)

    minx, miny, maxx, maxy = bbox_from_mask(REGION_MASK)
    bbox = f"{minx},{miny},{maxx},{maxy}"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    args = ['--bbox', bbox, '-f', 'geojson', '--type', 'building', '-o', str(OUT)]
    if RELEASE:
        args += ['--release', RELEASE]

    cmd = [cli, 'download'] + args
    print('[overture-cli] Running:', ' '.join(cmd))
    subprocess.run(cmd, check=True)
    print(f'[overture-cli] Wrote {OUT}')


if __name__ == '__main__':
    main()
