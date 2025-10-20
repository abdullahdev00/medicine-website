import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  sw: 'service-worker.js',
  scope: '/',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    webpackMemoryOptimizations: true,
    cpus: 1,
    workerThreads: false,
  },
  
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        poll: false,
        ignored: /node_modules/,
      };
    }
    return config;
  },
}

export default withPWA(nextConfig);
