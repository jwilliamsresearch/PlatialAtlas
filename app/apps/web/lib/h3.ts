import { z } from 'zod';

export async function fetchH3Choropleth(
  res: number,
  bbox: string,
  sources?: string[],
  facets?: string[],
) {
  const params = new URLSearchParams({ res: String(res), bbox });
  if (sources && sources.length) params.set('source', sources.join(','));
  if (facets && facets.length) params.set('facet', facets.join(','));
  const r = await fetch(`/api/tiles/h3?${params.toString()}`);
  if (!r.ok) throw new Error('Failed to fetch tiles');
  return (await r.json()) as GeoJSON.FeatureCollection;
}

export const zBboxString = z
  .string()
  .regex(/^[-0-9.]+,[-0-9.]+,[-0-9.]+,[-0-9.]+$/);

export function parseBbox(bbox: string): [number, number, number, number] {
  const parts = bbox.split(',').map((x) => Number(x));
  if (parts.length !== 4 || parts.some((x) => Number.isNaN(x))) throw new Error('Invalid bbox');
  return parts as [number, number, number, number];
}

export function isValidRes(res: number) {
  return Number.isInteger(res) && res >= 6 && res <= 10;
}
