/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone mode for optimized Docker builds, export for Desktop
  output: process.env.BUILD_TARGET === 'desktop' ? "export" : "standalone",
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    overlay: true,
  },
  images: {
    unoptimized: true, // License compliance: avoid sharp -> @img/sharp-libvips (LGPL-3.0)
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
    // Enterprise: lint errors must be fixed, not ignored
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enterprise: type errors must be fixed, not ignored
    ignoreBuildErrors: false,
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
            // ── CSP Policy ──────────────────────────────────────────────────
            // default-src: locked to self
            // script-src: allows Google reCAPTCHA, Stripe.js, CDN helpers
            // connect-src: MUST include production API + WSS + Stripe + GCP endpoints
            //   Update NEXT_PUBLIC_API_URL in your env to match your backend domain.
            value: [
              "default-src 'self' tauri: 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.vercel-scripts.com https://unpkg.com https://*.google.com https://*.gstatic.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com https://unpkg.com",
              "font-src 'self' fonts.gstatic.com data: https://unpkg.com",
              "img-src 'self' data: blob: images.unsplash.com https://i.pravatar.cc https://logo.clearbit.com https://icon.horse https://cdn.jsdelivr.net https://unpkg.com https://cdn.simpleicons.org",
              // Production API + WebSocket + third-party service origins
              [
                "connect-src 'self'",
                // Local dev
                "http://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:*",
                // Production backend (REST + WebSocket)
                "https://api.alticode.studio wss://api.alticode.studio",
                // Fallback env-driven override (set NEXT_PUBLIC_API_URL in production)
                process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'https') : '',
                process.env.NEXT_PUBLIC_WS_URL ? process.env.NEXT_PUBLIC_WS_URL : '',
                // CDN / Icon services
                "https://unpkg.com https://cdn.jsdelivr.net https://cdn.simpleicons.org https://api.iconify.design https://*.iconify.design",
                // Stripe API calls
                "https://api.stripe.com https://*.stripe.com",
                // Google OAuth / Vertex AI
                "https://*.googleapis.com https://*.google.com",
                // Tauri IPC
                "tauri:",
              ].filter(Boolean).join(' '),
              "frame-src 'self' https://*.google.com https://js.stripe.com http://localhost:* http://127.0.0.1:*",
              "worker-src 'self' blob: data:",
              "child-src 'self' blob:",
              "object-src 'none'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
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
