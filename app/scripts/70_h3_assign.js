#!/usr/bin/env node
/*
  Assign canonical H3 r10 to poi without h3_r10.
  Also populate helper mapping tables h3_parent_map_r6..r9.
*/
const { Pool } = require('pg');
const h3 = require('h3-js');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/platial-atlas';

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('[h3] Fetching POIs missing h3_r10');
    const { rows } = await client.query(
      `SELECT id, ST_Y(geom) AS lat, ST_X(geom) AS lon FROM poi WHERE h3_r10 IS NULL`
    );
    if (!rows.length) {
      console.log('[h3] No POIs to update');
    } else {
      console.log(`[h3] Updating ${rows.length} rows`);
      // Use a temp table for batch upsert (preserve until we drop)
      await client.query('CREATE TEMP TABLE IF NOT EXISTS tmp_h3 (id bigint, h3_r10 text) ON COMMIT PRESERVE ROWS');
      const values = rows.map(r => `(${r.id}, '${h3.latLngToCell(r.lat, r.lon, 10)}')`).join(',');
      await client.query(`INSERT INTO tmp_h3(id,h3_r10) VALUES ${values}`);
      await client.query(`UPDATE poi p SET h3_r10 = t.h3_r10 FROM tmp_h3 t WHERE p.id = t.id`);
      await client.query('DROP TABLE IF EXISTS tmp_h3');
      console.log('[h3] Canonical r10 assignment done');
    }

    // Ensure helper tables exist
    for (const res of [6,7,8,9]) {
      await client.query(
        `CREATE TABLE IF NOT EXISTS h3_parent_map_r${res} (
          child_h3_r10 text PRIMARY KEY,
          parent_r${res} text
        );`
      );
    }

    // Build distinct set of r10 indices to map
    const { rows: r10rows } = await client.query(`SELECT DISTINCT h3_r10 FROM poi WHERE h3_r10 IS NOT NULL`);
    if (!r10rows.length) {
      console.log('[h3] No r10 indices to map');
      return;
    }

    console.log(`[h3] Computing parent mappings for ${r10rows.length} r10 indices`);
    const parents = { 6: [], 7: [], 8: [], 9: [] };
    for (const r of r10rows) {
      const child = r.h3_r10;
      const latlng = h3.cellToLatLng(child);
      // Compute parent per res directly via h3ToParent
      parents[6].push({ child, parent: h3.cellToParent(child, 6) });
      parents[7].push({ child, parent: h3.cellToParent(child, 7) });
      parents[8].push({ child, parent: h3.cellToParent(child, 8) });
      parents[9].push({ child, parent: h3.cellToParent(child, 9) });
    }

    for (const res of [6,7,8,9]) {
      const pairs = parents[res];
      if (!pairs.length) continue;
      await client.query(`TRUNCATE h3_parent_map_r${res}`);
      const batchSize = 5000;
      for (let i = 0; i < pairs.length; i += batchSize) {
        const chunk = pairs.slice(i, i + batchSize);
        const values = chunk.map(p => `('${p.child}','${p.parent}')`).join(',');
        await client.query(`INSERT INTO h3_parent_map_r${res}(child_h3_r10,parent_r${res}) VALUES ${values} ON CONFLICT (child_h3_r10) DO UPDATE SET parent_r${res}=EXCLUDED.parent_r${res}`);
      }
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS h3_parent_map_r${res}_idx ON h3_parent_map_r${res}(child_h3_r10)`);
    }

    console.log('[h3] Parent mapping tables populated');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
