import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  experimental: {
    serverActions: {},
  },
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "./tsconfig.json",
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["."],
  },
  distDir: "build",
  output: "standalone",
  outputFileTracingRoot: __dirname,
  modularizeImports: {
    lodash: { transform: "lodash/{{member}}", preventFullImport: true },
  },
  compiler: {
    styledComponents: true,
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: [
              "accelerometer=()",
              "autoplay=()",
              "camera=()",
              "display-capture=()",
              "encrypted-media=()",
              "fullscreen=()",
              "geolocation=()",
              "gyroscope=()",
              "hid=()",
              "microphone=()",
              "midi=()",
              "payment=()",
              "usb=()",
              "xr-spatial-tracking=()",
            ].join(", "),
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" }, // or "same-origin"
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "X-Frame-Options", value: "DENY" }, // legacy backup for frame-ancestors
          { key: "X-DNS-Prefetch-Control", value: "off" },

          // CSP: keep dev workable; tighten for prod as you remove inline styles/scripts
          // {
          //   key: "Content-Security-Policy",
          //   value: [
          //     "default-src 'self'",
          //     //"script-src 'self'",
          //     //"style-src 'self'", // drop 'unsafe-inline' once you move inline styles
          //     "img-src 'self' data: blob:",
          //     "connect-src 'self'",
          //     "frame-ancestors 'none'",
          //     "frame-src 'none'", // <-- no stray plus!
          //     "form-action 'self'",
          //     "base-uri 'self'",
          //   ].join("; "),
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
