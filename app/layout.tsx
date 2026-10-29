import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { site } from "@/content/site-content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// latin-ext is required for Romanian characters (ă, â, î, ș, ț).
// Weight axis only: the extra optical-size axes more than double the file size.
const serif = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

// Body font isn't preloaded: its metric-matched fallback renders first, so the
// swap is barely visible and headings get the bandwidth.
const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["restaurant", "cocktail bar", "fine dining", "terrace", site.contact.address.city, ...site.cuisines],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: "en_GB",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0D0C0B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale} className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
