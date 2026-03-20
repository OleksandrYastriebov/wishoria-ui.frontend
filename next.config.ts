import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL ?? 'https://notionary-8oyd.onrender.com';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/sitemap.xml',
        destination: `${BACKEND_URL}/api/v1/seo/sitemap.xml`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
