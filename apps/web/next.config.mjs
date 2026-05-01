import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(appDir, "../..");

loadEnv({ path: resolve(rootDir, ".env") });
loadEnv({ path: resolve(rootDir, ".env.local"), override: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@financial-workspace/core", "@financial-workspace/db", "@financial-workspace/ui"]
};

export default nextConfig;
