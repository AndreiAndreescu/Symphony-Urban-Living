import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  poweredByHeader: false,
  // Netlify's CDN already gzip/brotli-compresses responses; compressing again
  // inside the function is wasted work (and breaks `netlify serve`/`netlify dev`
  // for routes behind middleware, e.g. /admin).
  compress: !process.env.NETLIFY,
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  // On Netlify, images go through Netlify's Image CDN (resizing + AVIF/WebP);
  // locally (`npm run dev`) Next.js optimises them itself.
  images: process.env.NETLIFY
    ? { loader: "custom", loaderFile: "./lib/netlify-image-loader.ts" }
    : { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
