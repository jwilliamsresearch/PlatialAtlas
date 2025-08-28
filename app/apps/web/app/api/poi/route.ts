import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { zCategory } from '@/lib/zodSchemas';

const zParams = z.object({
  bbox: z
    .string()
    .regex(/^[-0-9.]+,[-0-9.]+,[-0-9.]+,[-0-9.]+$/)
    .transform((s) => s.split(',').map((x) => Number(x)) as [number, number, number, number])
    .optional(),
  category: zCategory,
  limit: z
    .string()
    .transform((s) => Number(s))
    .pipe(z.number().int().min(1).max(10000))
    .optional(),
  source: z
    .string()
    .transform((s) => s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean))
    .transform((arr) => Array.from(new Set(arr)))
    .transform((arr) => arr.filter((x) => x === 'osm' || x === 'overture'))
    .optional(),
});

export async function GET(req: NextRequest) {
  const qp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = zParams.safeParse(qp);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { bbox, category } = parsed.data;
  const source = parsed.data.source ?? [];
  const limit = parsed.data.limit; // if not set, no LIMIT (return all)

  // Build bounding geometry: intersection of region_mask and bbox if provided
  let geomFilter = 'geom && ST_MakeEnvelope($1,$2,$3,$4,4326)';
  let params: any[] = [];
  if (bbox) {
    params = [bbox[0], bbox[1], bbox[2], bbox[3]];
  } else {
    geomFilter = 'TRUE';
  }

  const whereParts = [
    bbox ? geomFilter : 'TRUE',
    'EXISTS (SELECT 1 FROM region_mask rm WHERE ST_Intersects(rm.geom, poi.geom))',
    category ? 'category = $' + (params.push(category), params.length) : 'TRUE',
    source.length ? 'source = ANY($' + (params.push(source), params.length) + '::text[])' : 'TRUE',
  ];

  const baseSql = `
    SELECT id, source, source_id, name, category, ST_AsGeoJSON(geom)::json AS geom
    FROM poi
    WHERE ${whereParts.join(' AND ')}
    ORDER BY id DESC
  `;
  const sql = limit ? `${baseSql} LIMIT $${params.push(limit), params.length}` : baseSql;

  const { rows } = await query(sql, params);
  const features = rows.map((r: any) => ({
    type: 'Feature',
    properties: { id: r.id, source: r.source, source_id: r.source_id, name: r.name, category: r.category },
    geometry: r.geom,
  }));
  return NextResponse.json({ type: 'FeatureCollection', features });
}
