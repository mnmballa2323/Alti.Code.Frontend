/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone mode for optimized Docker builds, export for Desktop
  output: process.env.BUILD_TARGET === 'desktop' ? "export" : "standalone",
  devIndicators: false,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@heroui/react", "lucide-react", "framer-motion", "three", "monaco-editor", "@monaco-editor/react", "react-icons", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' tauri: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.vercel-scripts.com https://unpkg.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com https://unpkg.com; font-src 'self' fonts.gstatic.com data: https://unpkg.com; img-src 'self' data: blob: images.unsplash.com https://i.pravatar.cc https://logos.composio.dev https://logo.clearbit.com https://cdn.jsdelivr.net https://unpkg.com https://cdn.simpleicons.org; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https://unpkg.com https://cdn.jsdelivr.net https://cdn.simpleicons.org tauri:; frame-src 'self' https://*.google.com; worker-src 'self' blob: data:; child-src 'self' blob:; object-src 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
