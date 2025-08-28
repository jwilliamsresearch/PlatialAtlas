import { NextRequest, NextResponse } from 'next/server';
import { zRes, zBBox } from '@/lib/zodSchemas';
import { query } from '@/lib/db';
import * as h3 from 'h3-js';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const resP = zRes.safeParse(sp.get('res') ?? '8');
  const bboxP = zBBox.safeParse(sp.get('bbox') ?? '-1.4,52.8,-0.5,53.5');
  // Optional source filter: comma-separated among [osm,overture]
  const rawSource = sp.get('source') ?? '';
  const zSource = z
    .string()
    .transform((s) =>
      s
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter((x) => x)
    )
    .transform((arr) => Array.from(new Set(arr)))
    .transform((arr) => arr.filter((x) => x === 'osm' || x === 'overture'));
  const sourceP = zSource.safeParse(rawSource);
  // Optional facet selection(s): 'n' (total) or one/more category keys (CSV)
  // Back-compat: accept 'metric'
  const rawFacet = (sp.get('facet') || sp.get('metric') || '').toLowerCase();
  const facetList = Array.from(
    new Set(
      rawFacet
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s && s !== 'n')
    )
  );
  if (!resP.success || !bboxP.success) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }
  const res = resP.data;
  const [minx, miny, maxx, maxy] = bboxP.data;
  const sources: string[] = sourceP.success ? sourceP.data : [];

  // GeoJSON-like bbox polygon [lng,lat]
  const ring: [number, number][] = [
    [minx, miny],
    [maxx, miny],
    [maxx, maxy],
    [minx, maxy],
    [minx, miny],
  ];
  const cells: string[] = (h3 as any).polygonToCells([ring], res, true);
  if (!cells.length) return NextResponse.json({ type: 'FeatureCollection', features: [] });

  // Fetch counts either from MV (all sources) or on-the-fly (filtered sources or facet filter)
  let rows: { h3: string; n: number; cats: any }[] = [];
  if (sources.length > 0 || facetList.length > 0) {
    if (res === 10) {
      // Special-case r10: parent is h3_r10 itself; no parent map table needed
      if (facetList.length === 0) {
        const sql = `
          WITH agg AS (
            SELECT p.h3_r10 AS h3,
                   COUNT(*)::int AS n,
                   jsonb_build_object(
                     'amenity', COUNT(*) FILTER (WHERE p.category='amenity'),
                     'shop', COUNT(*) FILTER (WHERE p.category='shop'),
                     'tourism', COUNT(*) FILTER (WHERE p.category='tourism'),
                     'leisure', COUNT(*) FILTER (WHERE p.category='leisure'),
                     'landuse', COUNT(*) FILTER (WHERE p.category='landuse'),
                     'natural', COUNT(*) FILTER (WHERE p.category='natural'),
                     'historic', COUNT(*) FILTER (WHERE p.category='historic'),
                     'heritage', COUNT(*) FILTER (WHERE p.category='heritage'),
                     'office', COUNT(*) FILTER (WHERE p.category='office'),
                     'craft', COUNT(*) FILTER (WHERE p.category='craft'),
                     'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway'),
                     'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway'),
                     'railway', COUNT(*) FILTER (WHERE p.category='railway'),
                     'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport'),
                     'man_made', COUNT(*) FILTER (WHERE p.category='man_made'),
                     'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare'),
                     'emergency', COUNT(*) FILTER (WHERE p.category='emergency'),
                     'club', COUNT(*) FILTER (WHERE p.category='club'),
                     'building', COUNT(*) FILTER (WHERE p.category='building'),
                     'sport', COUNT(*) FILTER (WHERE p.category='sport'),
                     'education', COUNT(*) FILTER (WHERE p.category='education'),
                     'place', COUNT(*) FILTER (WHERE p.category='place'),
                     'waterway', COUNT(*) FILTER (WHERE p.category='waterway'),
                     'highway', COUNT(*) FILTER (WHERE p.category='highway'),
                     'power', COUNT(*) FILTER (WHERE p.category='power'),
                     'barrier', COUNT(*) FILTER (WHERE p.category='barrier'),
                     'boundary', COUNT(*) FILTER (WHERE p.category='boundary'),
                     'route', COUNT(*) FILTER (WHERE p.category='route')
                   ) AS cats
            FROM poi p
            WHERE p.h3_r10 IS NOT NULL
              AND p.h3_r10 = ANY($1::text[])
              ${sources.length ? 'AND p.source = ANY($2::text[])' : ''}
            GROUP BY p.h3_r10
          )
          SELECT h3, n, cats FROM agg`;
        const r = await query(sql, sources.length ? [cells, sources] : [cells]);
        rows = r.rows as any;
      } else {
        const sql = `
          WITH agg AS (
            SELECT p.h3_r10 AS h3,
                   SUM((CASE WHEN p.category = ANY($2::text[]) THEN 1 ELSE 0 END)::int)::int AS n,
                   jsonb_build_object(
                     'amenity', COUNT(*) FILTER (WHERE p.category='amenity' AND p.category = ANY($2::text[])),
                     'shop', COUNT(*) FILTER (WHERE p.category='shop' AND p.category = ANY($2::text[])),
                     'tourism', COUNT(*) FILTER (WHERE p.category='tourism' AND p.category = ANY($2::text[])),
                     'leisure', COUNT(*) FILTER (WHERE p.category='leisure' AND p.category = ANY($2::text[])),
                     'landuse', COUNT(*) FILTER (WHERE p.category='landuse' AND p.category = ANY($2::text[])),
                     'natural', COUNT(*) FILTER (WHERE p.category='natural' AND p.category = ANY($2::text[])),
                     'historic', COUNT(*) FILTER (WHERE p.category='historic' AND p.category = ANY($2::text[])),
                     'heritage', COUNT(*) FILTER (WHERE p.category='heritage' AND p.category = ANY($2::text[])),
                     'office', COUNT(*) FILTER (WHERE p.category='office' AND p.category = ANY($2::text[])),
                     'craft', COUNT(*) FILTER (WHERE p.category='craft' AND p.category = ANY($2::text[])),
                     'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway' AND p.category = ANY($2::text[])),
                     'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway' AND p.category = ANY($2::text[])),
                     'railway', COUNT(*) FILTER (WHERE p.category='railway' AND p.category = ANY($2::text[])),
                     'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport' AND p.category = ANY($2::text[])),
                     'man_made', COUNT(*) FILTER (WHERE p.category='man_made' AND p.category = ANY($2::text[])),
                     'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare' AND p.category = ANY($2::text[])),
                     'emergency', COUNT(*) FILTER (WHERE p.category='emergency' AND p.category = ANY($2::text[])),
                     'club', COUNT(*) FILTER (WHERE p.category='club' AND p.category = ANY($2::text[])),
                     'building', COUNT(*) FILTER (WHERE p.category='building' AND p.category = ANY($2::text[])),
                     'sport', COUNT(*) FILTER (WHERE p.category='sport' AND p.category = ANY($2::text[])),
                     'education', COUNT(*) FILTER (WHERE p.category='education' AND p.category = ANY($2::text[])),
                     'place', COUNT(*) FILTER (WHERE p.category='place' AND p.category = ANY($2::text[])),
                     'waterway', COUNT(*) FILTER (WHERE p.category='waterway' AND p.category = ANY($2::text[])),
                     'highway', COUNT(*) FILTER (WHERE p.category='highway' AND p.category = ANY($2::text[])),
                     'power', COUNT(*) FILTER (WHERE p.category='power' AND p.category = ANY($2::text[])),
                     'barrier', COUNT(*) FILTER (WHERE p.category='barrier' AND p.category = ANY($2::text[])),
                     'boundary', COUNT(*) FILTER (WHERE p.category='boundary' AND p.category = ANY($2::text[])),
                     'route', COUNT(*) FILTER (WHERE p.category='route' AND p.category = ANY($2::text[]))
                   ) AS cats
            FROM poi p
            WHERE p.h3_r10 IS NOT NULL
              AND p.h3_r10 = ANY($1::text[])
              ${sources.length ? 'AND p.source = ANY($3::text[])' : ''}
            GROUP BY p.h3_r10
          )
          SELECT h3, n, cats FROM agg`;
        const params: any[] = [cells, facetList];
        if (sources.length) params.push(sources);
        const r = await query(sql, params);
        rows = r.rows as any;
      }
    } else {
      const mapTable = `h3_parent_map_r${res}`;
      if (facetList.length === 0) {
        const sql = `
          WITH agg AS (
            SELECT m.parent_r${res} AS h3,
                   COUNT(*)::int AS n,
                   jsonb_build_object(
                     'amenity', COUNT(*) FILTER (WHERE p.category='amenity'),
                     'shop', COUNT(*) FILTER (WHERE p.category='shop'),
                     'tourism', COUNT(*) FILTER (WHERE p.category='tourism'),
                     'leisure', COUNT(*) FILTER (WHERE p.category='leisure'),
                     'landuse', COUNT(*) FILTER (WHERE p.category='landuse'),
                     'natural', COUNT(*) FILTER (WHERE p.category='natural'),
                     'historic', COUNT(*) FILTER (WHERE p.category='historic'),
                     'heritage', COUNT(*) FILTER (WHERE p.category='heritage'),
                     'office', COUNT(*) FILTER (WHERE p.category='office'),
                     'craft', COUNT(*) FILTER (WHERE p.category='craft'),
                     'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway'),
                     'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway'),
                     'railway', COUNT(*) FILTER (WHERE p.category='railway'),
                     'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport'),
                     'man_made', COUNT(*) FILTER (WHERE p.category='man_made'),
                     'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare'),
                     'emergency', COUNT(*) FILTER (WHERE p.category='emergency'),
                     'club', COUNT(*) FILTER (WHERE p.category='club'),
                     'building', COUNT(*) FILTER (WHERE p.category='building'),
                     'sport', COUNT(*) FILTER (WHERE p.category='sport'),
                     'education', COUNT(*) FILTER (WHERE p.category='education'),
                     'place', COUNT(*) FILTER (WHERE p.category='place'),
                     'waterway', COUNT(*) FILTER (WHERE p.category='waterway'),
                     'highway', COUNT(*) FILTER (WHERE p.category='highway'),
                     'power', COUNT(*) FILTER (WHERE p.category='power'),
                     'barrier', COUNT(*) FILTER (WHERE p.category='barrier'),
                     'boundary', COUNT(*) FILTER (WHERE p.category='boundary'),
                     'route', COUNT(*) FILTER (WHERE p.category='route')
                   ) AS cats
          FROM poi p
          JOIN ${mapTable} m ON m.child_h3_r10 = p.h3_r10
          WHERE p.h3_r10 IS NOT NULL
            AND m.parent_r${res} = ANY($1::text[])
            ${sources.length ? 'AND p.source = ANY($2::text[])' : ''}
          GROUP BY m.parent_r${res}
        )
        SELECT h3, n, cats FROM agg`;
        const r = await query(sql, sources.length ? [cells, sources] : [cells]);
        rows = r.rows as any;
      } else {
        const sql = `
          WITH agg AS (
            SELECT m.parent_r${res} AS h3,
                   SUM((CASE WHEN p.category = ANY($2::text[]) THEN 1 ELSE 0 END)::int)::int AS n,
                   jsonb_build_object(
                     'amenity', COUNT(*) FILTER (WHERE p.category='amenity' AND p.category = ANY($2::text[])),
                     'shop', COUNT(*) FILTER (WHERE p.category='shop' AND p.category = ANY($2::text[])),
                     'tourism', COUNT(*) FILTER (WHERE p.category='tourism' AND p.category = ANY($2::text[])),
                     'leisure', COUNT(*) FILTER (WHERE p.category='leisure' AND p.category = ANY($2::text[])),
                     'landuse', COUNT(*) FILTER (WHERE p.category='landuse' AND p.category = ANY($2::text[])),
                     'natural', COUNT(*) FILTER (WHERE p.category='natural' AND p.category = ANY($2::text[])),
                     'historic', COUNT(*) FILTER (WHERE p.category='historic' AND p.category = ANY($2::text[])),
                     'heritage', COUNT(*) FILTER (WHERE p.category='heritage' AND p.category = ANY($2::text[])),
                     'office', COUNT(*) FILTER (WHERE p.category='office' AND p.category = ANY($2::text[])),
                     'craft', COUNT(*) FILTER (WHERE p.category='craft' AND p.category = ANY($2::text[])),
                     'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway' AND p.category = ANY($2::text[])),
                     'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway' AND p.category = ANY($2::text[])),
                     'railway', COUNT(*) FILTER (WHERE p.category='railway' AND p.category = ANY($2::text[])),
                     'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport' AND p.category = ANY($2::text[])),
                     'man_made', COUNT(*) FILTER (WHERE p.category='man_made' AND p.category = ANY($2::text[])),
                     'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare' AND p.category = ANY($2::text[])),
                     'emergency', COUNT(*) FILTER (WHERE p.category='emergency' AND p.category = ANY($2::text[])),
                     'club', COUNT(*) FILTER (WHERE p.category='club' AND p.category = ANY($2::text[])),
                     'building', COUNT(*) FILTER (WHERE p.category='building' AND p.category = ANY($2::text[])),
                     'sport', COUNT(*) FILTER (WHERE p.category='sport' AND p.category = ANY($2::text[])),
                     'education', COUNT(*) FILTER (WHERE p.category='education' AND p.category = ANY($2::text[])),
                     'place', COUNT(*) FILTER (WHERE p.category='place' AND p.category = ANY($2::text[])),
                     'waterway', COUNT(*) FILTER (WHERE p.category='waterway' AND p.category = ANY($2::text[])),
                     'highway', COUNT(*) FILTER (WHERE p.category='highway' AND p.category = ANY($2::text[])),
                     'power', COUNT(*) FILTER (WHERE p.category='power' AND p.category = ANY($2::text[])),
                     'barrier', COUNT(*) FILTER (WHERE p.category='barrier' AND p.category = ANY($2::text[])),
                     'boundary', COUNT(*) FILTER (WHERE p.category='boundary' AND p.category = ANY($2::text[])),
                     'route', COUNT(*) FILTER (WHERE p.category='route' AND p.category = ANY($2::text[]))
                   ) AS cats
            FROM poi p
            JOIN ${mapTable} m ON m.child_h3_r10 = p.h3_r10
            WHERE p.h3_r10 IS NOT NULL
              AND m.parent_r${res} = ANY($1::text[])
              ${sources.length ? 'AND p.source = ANY($3::text[])' : ''}
            GROUP BY m.parent_r${res}
          )
          SELECT h3, n, cats FROM agg`;
        const params: any[] = [cells, facetList];
        if (sources.length) params.push(sources);
        const r = await query(sql, params);
        rows = r.rows as any;
      }
    }
  } else {
    const table = `mv_poi_counts_r${res}`;
    const r = await query<{ h3: string; n: number; cats: any }>(
      `SELECT h3, (n)::int AS n, cats FROM ${table} WHERE h3 = ANY($1::text[])`,
      [cells],
    );
    rows = r.rows as any;
  }
  const byId = new Map(rows.map((r) => [r.h3, r]));

  const features = cells.map((idx) => {
    const b: any = (h3 as any).cellToBoundary(idx);
    const asLngLat = Array.isArray(b[0])
      ? (b as [number, number][]).map(([lat, lng]) => [lng, lat])
      : (b as { lat: number; lng: number }[]).map(({ lat, lng }) => [lng, lat]);
    const coords = [asLngLat.concat([asLngLat[0]])];
    const rec = byId.get(idx);
    const value = rec?.n ?? 0;
    return {
      type: 'Feature',
      properties: { h3: idx, n: value, cats: rec?.cats ?? {} },
      geometry: { type: 'Polygon', coordinates: coords },
    } as GeoJSON.Feature;
  });

  return NextResponse.json({ type: 'FeatureCollection', features });
}
