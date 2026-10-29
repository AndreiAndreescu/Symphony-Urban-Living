import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site-content";
import { Reveal } from "@/components/motion/Reveal";
import { MapEmbed } from "@/components/site/MapEmbed";
import { OpenStatus } from "@/components/site/OpenStatus";
import { PageHero } from "@/components/site/PageHero";
import { SERVICE_LABEL, WEEKDAYS } from "@/lib/hours";
import { getBookingSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact & Opening Hours",
  description: `Address, phone, email and opening hours for ${site.name} in ${site.contact.address.city}.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getBookingSettings();
  const { address } = site.contact;
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <>
      <PageHero eyebrow="Contact" title="Find us in Sector 3, București" />

      <section className="pb-24 sm:pb-32">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-10">
            <Reveal className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="eyebrow font-sans">Address</h2>
                <address className="mt-4 not-italic text-lg leading-relaxed text-cream">
                  {site.name}
                  <br />
                  {address.street}
                  <br />
                  {[address.postalCode, address.city].filter(Boolean).join(" ")}
                  <br />
                  {address.countryName}
                </address>
              </div>
              <div>
                <h2 className="eyebrow font-sans">Get in touch</h2>
                <p className="mt-4 space-y-2 text-lg">
                  <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="link-underline block w-fit text-cream">
                    {site.contact.phone}
                  </a>
                  <a href={`mailto:${site.contact.email}`} className="link-underline block w-fit break-all text-cream">
                    {site.contact.email}
                  </a>
                </p>
                {(site.social.instagram || site.social.facebook) && (
                  <p className="mt-4 flex gap-4 text-sm text-cream-muted">
                    {site.social.instagram && <a href={site.social.instagram} className="hover:text-cream" rel="noopener">Instagram</a>}
                    {site.social.facebook && <a href={site.social.facebook} className="hover:text-cream" rel="noopener">Facebook</a>}
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="card p-7 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl">Opening hours</h2>
                <OpenStatus hours={settings.hours} closedDates={settings.closedDates} />
              </div>
              <table className="mt-6 w-full text-left text-sm">
                <caption className="sr-only">Opening hours by day ({site.timezone} time)</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream/10">
                  {order.map((day) => (
                    <tr key={day}>
                      <th scope="row" className="py-3 pr-4 font-normal text-cream">
                        {WEEKDAYS[day]}
                      </th>
                      <td className="py-3 text-right text-cream-muted">
                        {settings.hours[day].length
                          ? settings.hours[day].map((p) => (
                              <span key={p.service + p.open} className="block sm:inline sm:pl-4">
                                <span className="text-cream-dim">{SERVICE_LABEL[p.service]}</span> {p.open}–{p.close}
                              </span>
                            ))
                          : "Closed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>

            <Reveal delay={0.15} className="flex flex-col gap-3 sm:flex-row">
              <Link href="/reservations" className="btn-primary">
                Reserve a table
              </Link>
              <Link href="/private-events" className="btn-ghost">
                Private events
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <MapEmbed query={site.contact.mapQuery} label={`${site.name}, ${address.city}`} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
