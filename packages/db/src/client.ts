import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";

export function createDatabaseClient(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client.");
  }

  const pool = new Pool({
    connectionString: databaseUrl
  });

  return drizzle(pool, { schema });
}

export const db = createDatabaseClient();

export type Database = ReturnType<typeof createDatabaseClient>;
export { schema };
