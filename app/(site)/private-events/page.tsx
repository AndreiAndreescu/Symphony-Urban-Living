import type { Metadata } from "next";
import { privateEvents, site } from "@/content/site-content";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Private Dining & Events",
  description: `Private dining, group dinners and full buyouts at ${site.name}.`,
  alternates: { canonical: "/private-events" },
};

export default function PrivateEventsPage() {
  const subject = encodeURIComponent(`Private event enquiry — ${site.name}`);
  const body = encodeURIComponent("Date:\nNumber of guests:\nOccasion:\nPreferred space:\nAnything else we should know:\n");

  return (
    <>
      <PageHero eyebrow={privateEvents.eyebrow} title={privateEvents.title} intro={privateEvents.intro} image={privateEvents.image} />

      <section className="pb-24" aria-labelledby="spaces-title">
        <div className="container-site">
          <h2 id="spaces-title" className="sr-only">
            Our spaces
          </h2>
          <Stagger as="ul" className="grid gap-6 md:grid-cols-3">
            {privateEvents.spaces.map((space) => (
              <StaggerItem as="li" key={space.name} className="card group p-8 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-gold/40">
                <p className="eyebrow">{space.capacity}</p>
                <h3 className="mt-4 text-3xl">{space.name}</h3>
                <p className="mt-4 leading-relaxed text-cream-muted">{space.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-cream/10 py-24 sm:py-32">
        <div className="container-site grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Perfect for</p>
            <ul className="mt-6 space-y-4">
              {privateEvents.occasions.map((o) => (
                <li key={o} className="flex items-center gap-4 border-b border-cream/10 pb-4 font-serif text-2xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-emerald-dark to-ink-800 p-8 sm:p-12">
            <h2 className="text-4xl">Start planning</h2>
            <p className="mt-5 text-lg leading-relaxed text-cream-muted">{privateEvents.contactNote}</p>
            <div className="mt-10 flex flex-col gap-3">
              <a href={`mailto:${site.contact.email}?subject=${subject}&body=${body}`} className="btn-primary">
                Send an event enquiry
              </a>
              <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="btn-ghost">
                Call {site.contact.phone}
              </a>
            </div>
            <p className="mt-6 text-sm text-cream-dim">Or email us directly at {site.contact.email}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
