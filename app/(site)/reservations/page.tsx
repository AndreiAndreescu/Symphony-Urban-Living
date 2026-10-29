import type { Metadata } from "next";
import Link from "next/link";
import { reservations, site } from "@/content/site-content";
import { BookingForm } from "@/components/reservations/BookingForm";
import { OpenStatus } from "@/components/site/OpenStatus";
import { summariseHours } from "@/lib/hours";
import { getBookingSettings } from "@/lib/settings";
import { zonedNow } from "@/lib/time";

export const metadata: Metadata = {
  title: "Reserve a Table",
  description: `Book a table at ${site.name} — choose your date, time and party size and get instant availability.`,
  alternates: { canonical: "/reservations" },
};

// Re-rendered at most every minute (and immediately when settings change).
// The form also re-checks "today" in the browser and loads live availability.
export const revalidate = 60;

export default async function ReservationsPage() {
  const settings = await getBookingSettings();
  const openWeekdays = settings.hours.map((periods) => periods.length > 0);

  return (
    <section className="relative isolate pb-24 pt-32 sm:pt-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(ellipse_at_top_left,rgba(205,168,94,0.16),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(107,34,50,0.28),transparent_50%)]" />
      <div className="container-site">
        {/* CSS-only entrance: paints before JavaScript for a fast LCP */}
        <div className="max-w-3xl">
          <p className="eyebrow animate-rise">{reservations.eyebrow}</p>
          <h1 className="mt-4 animate-focus-in text-5xl leading-[1.04] [animation-delay:60ms] sm:text-6xl lg:text-7xl">
            {reservations.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-cream-muted">{reservations.intro}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
          <div className="min-w-0">
            <BookingForm
              today={zonedNow().date}
              maxPartySize={settings.maxPartySizeOnline}
              maxDaysAhead={settings.maxDaysAhead}
              openWeekdays={openWeekdays}
              closedDates={settings.closedDates}
            />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start" aria-label="Booking information">
            <div className="card p-7">
              <h2 className="text-2xl">Opening hours</h2>
              <OpenStatus hours={settings.hours} closedDates={settings.closedDates} className="mt-3" />
              <dl className="mt-5 divide-y divide-cream/10 text-sm">
                {summariseHours(settings.hours).map((row) => (
                  <div key={row.days} className="flex justify-between gap-3 py-2.5">
                    <dt className="text-cream">{row.days}</dt>
                    <dd className="text-right text-cream-muted">
                      {row.periods.length ? row.periods.map((p) => `${p.open}–${p.close}`).join(" · ") : "Closed"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card space-y-4 p-7 text-sm leading-relaxed text-cream-muted">
              <p>
                <strong className="block text-cream">Larger group?</strong>
                {reservations.largeGroupNote}{" "}
                <Link href="/private-events" className="text-gold underline hover:text-gold-light">
                  Private events
                </Link>
              </p>
              <p>
                <strong className="block text-cream">Changes & cancellations</strong>
                {reservations.cancellationNote}
              </p>
              <p>
                <strong className="block text-cream">Prefer to call?</strong>
                <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="text-gold underline hover:text-gold-light">
                  {site.contact.phone}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
