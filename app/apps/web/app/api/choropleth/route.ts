import { NextRequest, NextResponse } from 'next/server';
import { zRes, zBBox } from '@/lib/zodSchemas';
import { query } from '@/lib/db';
import * as h3 from 'h3-js';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const resP = zRes.safeParse(sp.get('res') ?? '8');
  const bboxP = zBBox.safeParse(sp.get('bbox') ?? '-1.4,52.8,-0.5,53.5');
  const metric = sp.get('metric') || 'n';
  if (!resP.success || !bboxP.success) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }
  const res = resP.data;
  const [minx, miny, maxx, maxy] = bboxP.data;
  const ring: [number, number][] = [
    [minx, miny],
    [maxx, miny],
    [maxx, maxy],
    [minx, maxy],
    [minx, miny],
  ];
  const cells: string[] = (h3 as any).polygonToCells([ring], res, true);
  const table = `mv_poi_counts_r${res}`;
  const { rows } = await query<{ h3: string; n: number; cats: any }>(
    `SELECT h3, n, cats FROM ${table} WHERE h3 = ANY($1::text[])`,
    [cells],
  );
  const byId = new Map(rows.map((r) => [r.h3, r]));
  const features = cells.map((idx) => {
    const b: any = (h3 as any).cellToBoundary(idx);
    const asLngLat = Array.isArray(b[0])
      ? (b as [number, number][]).map(([lat, lng]) => [lng, lat])
      : (b as { lat: number; lng: number }[]).map(({ lat, lng }) => [lng, lat]);
    const coords = [asLngLat.concat([asLngLat[0]])];
    const rec = byId.get(idx);
    const value = metric === 'n' ? rec?.n ?? 0 : rec?.cats?.[metric] ?? 0;
    return {
      type: 'Feature',
      properties: { h3: idx, value, cats: rec?.cats ?? {}, n: rec?.n ?? 0 },
      geometry: { type: 'Polygon', coordinates: coords },
    } as GeoJSON.Feature;
  });
  return NextResponse.json({ type: 'FeatureCollection', features });
}
