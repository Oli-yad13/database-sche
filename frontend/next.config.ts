import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Turbopack configuration (Next.js 16+ default)
  turbopack: {},

  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  // Faster compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
