/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_URL?.replace('https://', '') || 'cdn.mplus.example.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      },
      {
        source: '/profile/:username((?![a-f0-9-]{36})[a-zA-Z0-9_-]+)',
        destination: '/profile/by-username/:username'
      }
    ];
  },

  webpack(config, { isServer }) {
    config.resolve.alias['server-only'] = path.resolve(__dirname, 'src/shims/server-only.js');
    config.resolve.alias['client-only'] = path.resolve(__dirname, 'src/shims/client-only.js');
    return config;
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};

module.exports = nextConfig;
