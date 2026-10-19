import type { NextConfig } from "next";

// The backend, e.g. http://localhost:8000/api/v1 in dev or http://api:8000/api/v1 in Docker
const API_ORIGIN = new URL(process.env.API_URL ?? "http://localhost:8000/api/v1").origin;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // A self-contained server for the Docker image
  output: "standalone",
  images: {
    // Source photos are small; encode them with less compression
    qualities: [75, 90],
  },
  partialPrefetching: true,
  experimental: {
    // One 404 for every unknown address (the site and /admin have separate root layouts)
    globalNotFound: true,
  },
  // In production Nginx sends /api/v1 and /media to the backend before they reach Next; in dev
  // these do the same, so the admin and the media library work on one origin
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${API_ORIGIN}/api/v1/:path*` },
      { source: "/media/:path*", destination: `${API_ORIGIN}/media/:path*` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
