import Link from "next/link";
import { navigation, site } from "@/content/site-content";
import { summariseHours, type BookingSettings } from "@/lib/hours";
import { Wordmark } from "@/components/site/Header";
import { OpenStatus } from "@/components/site/OpenStatus";

export function Footer({ settings }: { settings: BookingSettings }) {
  const { address } = site.contact;
  const hours = summariseHours(settings.hours);
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-cream/10 bg-ink-800 pb-28 pt-20 sm:pb-12">
      <div className="container-site grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="text-3xl" aria-label={`${site.name} — home`}>
            <Wordmark />
          </Link>
          <p className="mt-5 max-w-sm text-cream-muted">{site.tagline}.</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gold">
            {site.locationLine}
          </p>
        </div>

        <div>
          <h2 className="eyebrow mb-5 font-sans">Visit</h2>
          <address className="not-italic leading-relaxed text-cream-muted">
            {address.street}
            <br />
            {[address.postalCode, address.city].filter(Boolean).join(" ")}, {address.countryName}
          </address>
          <p className="mt-3 text-cream-muted">
            <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="link-underline block w-fit py-2 hover:text-cream">
              {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="link-underline block w-fit break-all py-2 hover:text-cream">
              {site.contact.email}
            </a>
          </p>
        </div>

        <div>
          <h2 className="eyebrow mb-5 font-sans">Hours</h2>
          <OpenStatus hours={settings.hours} closedDates={settings.closedDates} className="mb-4" />
          <dl className="space-y-2 text-sm text-cream-muted">
            {hours.map((row) => (
              <div key={row.days}>
                <dt className="text-cream">{row.days}</dt>
                <dd>{row.periods.length ? row.periods.map((p) => `${p.open}–${p.close}`).join(" · ") : "Closed"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow mb-5 font-sans">Explore</h2>
          <ul className="text-cream-muted">
            {[...navigation, { href: "/reservations", label: "Reservations" }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline inline-block py-2.5 hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container-site mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-sm text-cream-dim sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {site.legal.companyName}. All rights reserved.
        </p>
        <ul className="-my-3 flex flex-wrap gap-x-6">
          <li>
            <Link href="/privacy" className="inline-block py-3 hover:text-cream">Privacy policy</Link>
          </li>
          <li>
            <Link href="/cookies" className="inline-block py-3 hover:text-cream">Cookie notice</Link>
          </li>
          <li>
            <Link href="/admin" className="inline-block py-3 hover:text-cream" rel="nofollow">Staff login</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
