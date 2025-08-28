# Platial Atlas Monorepo

A TypeScript monorepo for a web-first MVP (no auth) that serves POIs and H3 choropleths from a local PostgreSQL 16 + PostGIS 3 database.

## Quick Start
- Install: PostgreSQL 16 + PostGIS 3, GDAL/ogr2ogr, Node 18+, Python 3.10+.
  - Python deps for ETL rasters: `pip install geopandas rasterio shapely pyproj h3`
  - Optional: `aws-cli` (no-sign-request) for Overture sync
- Copy env: `cp .env.example .env` and edit values.
- Init DB: `make init` (optional: `psql "$DATABASE_URL" -f db/seed/seed_demo.sql`).
- Region mask: `make mask`.
- Minimal ETL: `make etl.osm && make h3`.
- Run app: `npm install && npm run dev` then open http://localhost:3000/map.

## Layout
- apps/web: Next.js app (App Router)
- db/migrations: 000_init.sql, 010_schema.sql, 020_bounds.sql, 030_materialized.sql
- db/seed: seed_demo.sql
- data/: boundaries/, staging/, cache/
- scripts/: ETL and helpers (00..72)
- Makefile, .env.example

## API
- GET `/api/poi?bbox=minx,miny,maxx,maxy&category=&limit=`
- GET `/api/tiles/h3?res=8&bbox=…`
- GET `/api/choropleth?res=8&bbox=…&metric=n`

## Notes
- H3 r6..r10 supported; canonical storage at r10; materialized views for r6..r10.
- Recommended city–region scales: r6..r10.
 - WorldCover/VIIRS/WorldPop scripts:
   - Set `WORLD_COVER_COG_URL`, `VIIRS_COG_URL`, `WORLDPOP_TIFF_URL` in `.env`.
   - Use `make etl.worldcover`, `make etl.viirs`, `make etl.worldpop`.
   - VIIRS/WorldPop import compute per-H3 stats (`H3_STATS_RES`, default 8) and load to DB.

## Licences
- Code: MIT. Content: CC BY 4.0.
- Datasets: OSM (ODbL), WorldCover (open), Overture (CDLA), Flickr (API ToS), VIIRS (open), WorldPop (open).

## Next Steps
- Implement full downloads for WorldCover/VIIRS/WorldPop.
- Add clustering jobs, validation metrics, narratives UI.

