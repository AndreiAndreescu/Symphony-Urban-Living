import { site } from "@/content/site-content";
import type { BookingSettings } from "@/lib/hours";
import { siteUrl } from "@/lib/site-url";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Schema.org Restaurant data so Google can show hours, address, cuisine and price range. */
export function RestaurantJsonLd({ settings }: { settings: BookingSettings }) {
  const base = siteUrl();
  const { address } = site.contact;

  const openingHoursSpecification = settings.hours.flatMap((periods, day) =>
    periods.map((p) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAY[day]}`,
      opens: p.open,
      closes: p.close,
    })),
  );

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${base}/#restaurant`,
    name: site.name,
    description: site.description,
    url: base,
    image: [`${base}/opengraph-image`, `${base}/images/interior-dining-room.jpg`],
    telephone: site.contact.phone,
    email: site.contact.email,
    servesCuisine: site.cuisines,
    priceRange: site.priceRange,
    currenciesAccepted: site.currency,
    acceptsReservations: `${base}/reservations`,
    hasMenu: `${base}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.country,
    },
    ...(site.contact.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: site.contact.geo.lat, longitude: site.contact.geo.lng } }
      : {}),
    openingHoursSpecification,
    sameAs: [site.social.instagram, site.social.facebook].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
