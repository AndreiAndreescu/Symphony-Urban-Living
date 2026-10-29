import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const routes: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"],
    ["/reservations", 0.9, "weekly"],
    ["/menu", 0.9, "weekly"],
    ["/about", 0.7, "monthly"],
    ["/gallery", 0.6, "monthly"],
    ["/private-events", 0.7, "monthly"],
    ["/contact", 0.8, "monthly"],
    ["/privacy", 0.2, "yearly"],
    ["/cookies", 0.2, "yearly"],
  ];
  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
