#!/usr/bin/env node
/*
  Cross-platform importer for Overture building centroids.
  Reads data/staging/overture_building_pts.geojson and inserts into overture_building.
*/
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/platial-atlas';
const INPUT = path.join(__dirname, '..', 'data', 'staging', 'overture_building_pts.geojson');

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`[overture-import] Missing ${INPUT}. Run 30_overture_fetch.sh and 31_overture_extract_buildings.py first.`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
  const feats = (raw && raw.features) || [];
  console.log(`[overture-import] Importing ${feats.length} features`);
  if (!feats.length) return;

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS overture_building (id bigserial primary key, levels int, area double precision, geom geometry(Point,4326))');
    await client.query('CREATE INDEX IF NOT EXISTS overture_building_gix ON overture_building USING gist(geom)');
    await client.query('BEGIN');
    const batchSize = 2000;
    for (let i = 0; i < feats.length; i += batchSize) {
      const chunk = feats.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let p = 1;
      for (const f of chunk) {
        if (!f || !f.geometry || f.geometry.type !== 'Point') continue;
        const [lon, lat] = f.geometry.coordinates;
        const props = f.properties || {};
        const levels = props.levels != null && props.levels !== '' ? Number(props.levels) : null;
        const area = props.area != null && props.area !== '' ? Number(props.area) : null;
        params.push(levels, area, lon, lat);
        values.push(`($${p++}, $${p++}, ST_SetSRID(ST_MakePoint($${p++}, $${p++}),4326))`);
      }
      if (!values.length) continue;
      const sql = `INSERT INTO overture_building(levels, area, geom) VALUES ${values.join(',')}`;
      await client.query(sql, params);
      console.log(`[overture-import] Inserted ${values.length} rows`);
    }
    await client.query('COMMIT');
    console.log('[overture-import] Done.');
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
