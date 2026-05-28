import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.nps.gov",
      },
      {
        // Google Maps static images (Street View, satellite tiles)
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// varlock is only available locally (requires GPG/pass)
// On Vercel, env vars come from the dashboard directly
// eslint-disable-next-line @typescript-eslint/no-require-imports
const finalConfig = process.env.VERCEL
  ? nextConfig
  : require("@varlock/nextjs-integration/plugin").varlockNextConfigPlugin()(nextConfig);

export default finalConfig;
