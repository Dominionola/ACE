import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - Turbopack config types may be missing in this version
    turbopack: {
      root: process.cwd(),
    }
  }
};

export default nextConfig;
