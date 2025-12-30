import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames
      },
      {
        protocol: 'http',
        hostname: '**', // Also allow HTTP if needed
      },
    ],
  },
  turbopack: {},
};

export default nextConfig;
