import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@trpc/client", "@trpc/server", "@trpc/react-query"],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
