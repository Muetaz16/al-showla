import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The old projects page was empty; projects now live in the homepage "Featured Projects" section.
  async redirects() {
    return [{ source: "/case-studies", destination: "/#projects", permanent: false }];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  allowedDevOrigins: ['192.168.1.31'],
};

export default nextConfig;
