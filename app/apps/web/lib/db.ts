import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/platial-atlas';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool__: Pool | undefined;
}

export const pool: Pool = global.__pgPool__ || new Pool({ connectionString });
if (!global.__pgPool__) global.__pgPool__ = pool;

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const res = await pool.query<T>(text, params);
  return { rows: res.rows };
}
