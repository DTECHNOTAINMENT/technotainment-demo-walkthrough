/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server output — runs in a container (ECS Fargate) or serverless.
  // See docs/INFRASTRUCTURE.md §1.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Structured logs to stdout work with CloudWatch out of the box.
  logging: {
    fetches: { fullUrl: false },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  // Legacy → canonical redirects (301) to preserve link equity (docs/ROUTES.md).
  // Dynamic id→slug redirects (/video/:id, /stream/:id) are handled by route handlers.
  async redirects() {
    return [
      { source: "/u/:handle", destination: "/c/:handle", permanent: true },
    ];
  },
};

export default nextConfig;
