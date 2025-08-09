import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid vendor-chunk ENOENT by bundling these ESM packages in both runtimes
  transpilePackages: ["@trpc/client", "@trpc/server", "@trpc/react-query"],
  output: 'standalone',
  // Remove experimental.turbo as it's deprecated
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
