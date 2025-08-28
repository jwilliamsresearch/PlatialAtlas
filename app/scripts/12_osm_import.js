#!/usr/bin/env node
/*
  Cross-platform OSM POI importer without GDAL.
  Reads data/staging/osm_poi_clean.geojson and inserts rows into table poi.
*/
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/platial-atlas';
const INPUT = path.join(__dirname, '..', 'data', 'staging', 'osm_poi_clean.geojson');

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`[osm-import] Missing ${INPUT}. Run 10_osm_fetch_overpass.py and 11_osm_clean_map.py first.`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
  const feats = (raw && raw.features) || [];
  console.log(`[osm-import] Importing ${feats.length} features`);
  if (!feats.length) return;

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const batchSize = 1000;
    for (let i = 0; i < feats.length; i += batchSize) {
      const chunk = feats.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let p = 1;
      for (const f of chunk) {
        if (!f || !f.geometry || f.geometry.type !== 'Point') continue;
        const [lon, lat] = f.geometry.coordinates;
        const props = f.properties || {};
        const source = props.source || 'osm';
        const source_id = props.source_id || null;
        const name = props.name || null;
        const category = props.category || null;
        params.push(source, source_id, name, category, lon, lat);
        values.push(`($${p++}, $${p++}, $${p++}, $${p++}, ST_SetSRID(ST_MakePoint($${p++}, $${p++}),4326))`);
      }
      if (!values.length) continue;
      const sql = `INSERT INTO poi(source, source_id, name, category, geom) VALUES ${values.join(',')}`;
      await client.query(sql, params);
      console.log(`[osm-import] Inserted ${values.length} rows`);
    }
    await client.query('COMMIT');
    console.log('[osm-import] Done.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
