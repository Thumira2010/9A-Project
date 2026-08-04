import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

export const NEON_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_cBUiwMagv1u8@ep-steep-frost-ayt61srx.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

try {
  pool = new Pool({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(pool, { schema });
} catch (err) {
  console.error('Failed to initialize PostgreSQL pool:', err);
}

export function getDb() {
  return db;
}

