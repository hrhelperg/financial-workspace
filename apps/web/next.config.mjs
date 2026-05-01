/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@financial-workspace/core", "@financial-workspace/db", "@financial-workspace/ui"]
};

export default nextConfig;
