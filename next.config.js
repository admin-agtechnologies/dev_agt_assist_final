/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  },
  // ── Fix hot reload Windows ──
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,        // vérifie les changements toutes les 1s
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;