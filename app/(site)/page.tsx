import Image from "next/image";
import Link from "next/link";
import { about, home, site, testimonials } from "@/content/site-content";
import { Hero } from "@/components/home/Hero";
import { ParallaxBand } from "@/components/home/ParallaxBand";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/PageHero";
import { OpenStatus } from "@/components/site/OpenStatus";
import { formatPrice } from "@/lib/format";
import { summariseHours } from "@/lib/hours";
import { getMenu } from "@/lib/menu";
import { getBookingSettings } from "@/lib/settings";

export default async function HomePage() {
  const [menu, settings] = await Promise.all([getMenu(), getBookingSettings()]);
  const allItems = menu.flatMap((c) => c.items);
  const signature = home.signatureDishes.map((d) => ({ ...d, item: allItems.find((i) => i.name === d.name) }));
  const { story, privateEventsTeaser } = home;

  return (
    <>
      <Hero settings={settings} />

      {/* ── Story ───────────────────────────────────────────── */}
      {/* Pulled up under the hero's fade, so the first screen hands over to the
          page instead of stopping at a hard edge */}
      <section id="story" className="relative -mt-24 scroll-mt-20 pb-24 pt-28 sm:-mt-32 sm:pb-32 sm:pt-40">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative order-2 lg:order-1">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={story.image.src}
                alt={story.image.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
              />
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow={story.eyebrow} title={story.title} />
            <Reveal delay={0.1}>
              {story.body.map((p) => (
                <p key={p} className="mt-6 text-lg leading-relaxed text-cream-muted">
                  {p}
                </p>
              ))}
            </Reveal>
            <Stagger className="mt-12 grid grid-cols-3 gap-4 border-t border-cream/10 pt-10">
              {story.stats.map((s) => (
                <StaggerItem key={s.label}>
                  <p className="font-serif text-4xl text-cream sm:text-5xl">{s.value}</p>
                  <p className="mt-2 text-sm text-cream-dim">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.2}>
              <Link href="/about" className="link-underline mt-10 inline-block text-gold hover:text-gold-light">
                Read our story →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Signature dishes ───────────────────────────────── */}
      <section className="relative py-24 sm:py-32" aria-labelledby="signature-title">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(107,34,50,0.18),transparent_60%)]" />
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">From the kitchen</p>
              <h2 id="signature-title" className="mt-4 text-4xl sm:text-5xl">
                {home.signatureTitle}
              </h2>
              <p className="mt-5 text-lg text-cream-muted">{home.signatureSubtitle}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/menu" className="btn-ghost">
                See the full menu
              </Link>
            </Reveal>
          </div>

          <Stagger as="ul" className="mt-14 grid gap-6 md:grid-cols-3">
            {signature.map(({ name, image, item }) => (
              <StaggerItem as="li" key={name}>
                <Link
                  href="/menu"
                  className="group block overflow-hidden rounded-[1.75rem] border border-cream/10 bg-ink-800 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_30px_60px_-30px_rgba(205,168,94,0.35)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    />
                    {item && (
                      <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3.5 py-1.5 text-sm font-medium text-gold-light backdrop-blur">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  <div className="p-7">
                    <h3 className="text-2xl transition-colors group-hover:text-gold-light">{name}</h3>
                    {item && <p className="mt-2 text-cream-muted">{item.description}</p>}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Chef ───────────────────────────────────────────── */}
      <section className="overflow-hidden py-24 sm:py-32" aria-labelledby="chef-title">
        <div className="container-site grid items-center gap-14 md:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <Reveal className="relative mx-auto w-[calc(100%-2.5rem)] max-w-md sm:w-full">
            <div className="absolute -inset-3 translate-x-2 translate-y-2 rounded-[2rem] sm:translate-x-5 sm:translate-y-5 border border-gold/40" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image src={about.chef.image.src} alt={about.chef.image.alt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">Meet the chef</p>
              <h2 id="chef-title" className="mt-4 text-4xl sm:text-5xl">
                {about.chef.name}
              </h2>
              <p className="mt-2 text-cream-dim">{about.chef.role}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="mt-10 border-l-2 border-gold pl-6 font-serif text-2xl italic leading-snug text-cream sm:text-3xl">
                “{about.chef.quote}”
              </blockquote>
              <p className="mt-8 text-lg leading-relaxed text-cream-muted">{about.chef.bio[0]}</p>
              <Link href="/about" className="link-underline mt-8 inline-block text-gold hover:text-gold-light">
                More about the chef →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <ParallaxBand image={home.ambienceBand.image} quote={home.ambienceBand.quote} />

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="py-24 sm:py-32" aria-labelledby="reviews-title">
        <div className="container-site">
          <Reveal className="text-center">
            <p className="eyebrow">Kind words</p>
            <h2 id="reviews-title" className="mt-4 text-4xl sm:text-5xl">
              What our guests say
            </h2>
          </Reveal>
          <Stagger as="ul" className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <StaggerItem
                as="li"
                key={t.author}
                className="card flex flex-col p-8 transition-colors duration-500 hover:border-gold/30"
              >
                <span className="font-serif text-6xl leading-none text-gold/70" aria-hidden="true">
                  “
                </span>
                <blockquote className="mt-2 flex-1 text-lg leading-relaxed text-cream">{t.quote}</blockquote>
                <p className="mt-8 border-t border-cream/10 pt-5">
                  <span className="block font-medium text-cream">{t.author}</span>
                  <span className="text-sm text-cream-dim">{t.context}</span>
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Private events teaser ──────────────────────────── */}
      <section className="pb-24 sm:pb-32" aria-labelledby="events-title">
        <div className="container-site">
          <Reveal className="relative isolate overflow-hidden rounded-[2rem] border border-cream/10">
            <Image
              src={privateEventsTeaser.image.src}
              alt={privateEventsTeaser.image.alt}
              fill
              sizes="100vw"
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
            <div className="max-w-xl px-7 py-16 sm:px-14 sm:py-24">
              <p className="eyebrow">{privateEventsTeaser.eyebrow}</p>
              <h2 id="events-title" className="mt-4 text-4xl sm:text-5xl">
                {privateEventsTeaser.title}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cream-muted">{privateEventsTeaser.body}</p>
              <Link href="/private-events" className="btn-emerald mt-10">
                {privateEventsTeaser.cta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-cream/10 py-24 sm:py-32" aria-labelledby="cta-title">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(205,168,94,0.14),transparent_65%)]" />
        <div className="container-site grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Tonight, tomorrow, or next month</p>
            <h2 id="cta-title" className="mt-4 text-5xl leading-[1.02] sm:text-7xl">
              Your table is <em className="italic text-gold-light">waiting</em>.
            </h2>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/reservations" className="btn-primary px-9 text-base">
                Reserve a table
              </Link>
              <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="btn-ghost px-9 text-base">
                Call {site.contact.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="card p-8">
            <OpenStatus hours={settings.hours} closedDates={settings.closedDates} />
            <dl className="mt-6 divide-y divide-cream/10">
              {summariseHours(settings.hours).map((row) => (
                <div key={row.days} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-cream">{row.days}</dt>
                  <dd className="text-right text-cream-muted">
                    {row.periods.length ? row.periods.map((p) => `${p.open}–${p.close}`).join(" · ") : "Closed"}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  );
}
