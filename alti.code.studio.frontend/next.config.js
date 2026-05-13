/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only export as static HTML when explicitly building for Desktop/Tauri
  ...(process.env.BUILD_TARGET === 'desktop' ? { output: "export" } : {}),
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
            value: "default-src 'self' tauri: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.vercel-scripts.com https://unpkg.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com https://unpkg.com; font-src 'self' fonts.gstatic.com data: https://unpkg.com; img-src 'self' data: blob: images.unsplash.com https://i.pravatar.cc; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https://unpkg.com tauri:; frame-src 'self' https://*.google.com; worker-src 'self' blob: data:; child-src 'self' blob:; object-src 'none';",
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
