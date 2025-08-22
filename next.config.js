/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  env: {
    CUSTOM_KEY: "my-value",
  },
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${
          process.env.API_URL || "http://localhost:3001"
        }/auth/:path*`,
      },
      {
        source: "/api/me",
        destination: `${process.env.API_URL || "http://localhost:3001"}/api/me`,
      },
      {
        source: "/api/profile",
        destination: `${
          process.env.API_URL || "http://localhost:3001"
        }/api/profile`,
      },
      {
        source: "/api/session/:path*",
        destination: `${
          process.env.API_URL || "http://localhost:3001"
        }/api/session/:path*`,
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
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

module.exports = nextConfig;
