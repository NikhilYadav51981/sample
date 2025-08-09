import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid vendor-chunk ENOENT by bundling these ESM packages in both runtimes
  transpilePackages: ["@trpc/client", "@trpc/server", "@trpc/react-query"],
  experimental: {
    turbo: {
      // Keep default, but transpilePackages helps even with webpack
    },
  },
  // Make app accessible from other devices on local network
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
