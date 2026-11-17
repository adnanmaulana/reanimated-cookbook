import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Bundles a minimal Node server into .next/standalone for the VPS deploy.
  output: "standalone",
};

export default nextConfig;
