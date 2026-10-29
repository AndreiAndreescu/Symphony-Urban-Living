// next/image loader for Netlify builds (enabled in next.config.mjs when NETLIFY is set).
// Sends images straight to Netlify's Image CDN, which resizes them and serves
// AVIF/WebP to browsers that support it — no Next.js server function involved.
export default function netlifyImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const params = new URLSearchParams({ url: src, w: String(width), q: String(quality ?? 75) });
  return `/.netlify/images?${params}`;
}
