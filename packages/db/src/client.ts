import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolClient, type PoolConfig } from "pg";
import { getRequestIdentity } from "./identity";
import * as schema from "./schema/index";

const APP_USER_ID_GUC = "app.current_user_id";
const AUTHENTICATED_ROLE = "authenticated";

type ConnectCallback = (err: Error | undefined, client?: PoolClient, done?: (release?: unknown) => void) => void;

async function applyIdentity(client: PoolClient): Promise<void> {
  const userId = getRequestIdentity();

  if (userId) {
    await client.query(`SET ROLE ${AUTHENTICATED_ROLE}`);
    await client.query(`SELECT set_config($1, $2, false)`, [APP_USER_ID_GUC, userId]);
  } else {
    await client.query(`RESET ROLE`);
    await client.query(`SELECT set_config($1, '', false)`, [APP_USER_ID_GUC]);
  }
}

class IdentityPool extends Pool {
  constructor(config?: PoolConfig) {
    super(config);
  }

  // Promise form — used by Drizzle for transactions and by direct callers.
  connect(): Promise<PoolClient>;
  // Callback form — used internally by pg's `pool.query()`, which Drizzle uses
  // for non-transactional queries.
  connect(callback: ConnectCallback): void;
  connect(callback?: ConnectCallback): Promise<PoolClient> | void {
    if (typeof callback === "function") {
      super.connect((err: Error | undefined, client?: PoolClient, done?: (release?: unknown) => void) => {
        if (err || !client) {
          callback(err, client, done);
          return;
        }
        applyIdentity(client).then(
          () => callback(undefined, client, done),
          (setupErr: Error) => {
            done?.();
            callback(setupErr, undefined, () => undefined);
          }
        );
      });
      return;
    }

    return (async () => {
      const client = await super.connect();
      try {
        await applyIdentity(client);
      } catch (error) {
        client.release();
        throw error;
      }
      return client;
    })();
  }
}

export function createDatabaseClient(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client.");
  }

  const pool = new IdentityPool({
    connectionString: databaseUrl
  });

  return drizzle(pool, { schema });
}

export const db = createDatabaseClient();

export type Database = ReturnType<typeof createDatabaseClient>;
export { schema };
