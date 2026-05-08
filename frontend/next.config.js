/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3000',
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
