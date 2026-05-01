import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const packageDir = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(packageDir, "../../.env"), quiet: true });
config({ path: resolve(packageDir, ".env"), override: true, quiet: true });

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  },
  strict: true,
  verbose: true
});
