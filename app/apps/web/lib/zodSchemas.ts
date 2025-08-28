import { z } from 'zod';

export const zBBox = z
  .string()
  .regex(/^[-0-9.]+,[-0-9.]+,[-0-9.]+,[-0-9.]+$/)
  .transform((s) => s.split(',').map((x) => Number(x)) as [number, number, number, number]);

export const zRes = z
  .string()
  .transform((s) => Number(s))
  .pipe(z.number().int().min(6).max(10));

// Allow arbitrary category strings (for expanded OSM category set)
export const zCategory = z.string().min(1).max(64).optional();
