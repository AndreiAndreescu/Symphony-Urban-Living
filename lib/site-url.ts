/** Absolute base URL of the site, without trailing slash. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Netlify sets URL to the site's main address (custom domain or *.netlify.app)
  if (process.env.URL) return process.env.URL.replace(/\/$/, "");
  return "http://localhost:3000";
}
