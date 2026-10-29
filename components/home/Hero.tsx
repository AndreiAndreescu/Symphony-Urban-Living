import Link from "next/link";
import { home, site } from "@/content/site-content";
import { HeroScene } from "@/components/home/hero/HeroScene";
import { ScrollCue } from "@/components/home/hero/ScrollCue";
import { OpenStatus } from "@/components/site/OpenStatus";
import { ReserveButton } from "@/components/site/ReserveButton";
import type { BookingSettings } from "@/lib/hours";

/**
 * The first screen, composed like a campaign film: the signature plates, lit
 * in a darkened room and slowly taking turns, the restaurant's name set large
 * beside them, one clear action.
 *
 * Entrance (CSS only, so it costs no JavaScript and the reduced-motion rule in
 * globals.css settles it instantly):
 *   0.00s room surfaces from the dark    0.70s name rises out of its mask
 *   0.20s header fades in                0.90s supporting copy
 *   0.35s plate opens and settles        1.05s actions · 1.20s footing
 * From there it never goes still: see HeroScene for the continuous motion.
 */
export function Hero({ settings }: { settings: BookingSettings }) {
  const { hero } = home;
  const [first, ...rest] = site.name.split(" ");
  const { address } = site.contact;

  return (
    <HeroScene
      image={hero.image}
      plates={hero.plates}
      labelledBy="hero-title"
      footing={
        <div className="mt-10 flex animate-rise items-center justify-between gap-6 border-t border-cream/10 pt-5 [animation-delay:1200ms] sm:mt-12">
          <ScrollCue className="hidden sm:inline-flex" />

          <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:gap-x-7">
            <div>
              <dt className="sr-only">Right now</dt>
              <dd>
                <OpenStatus hours={settings.hours} closedDates={settings.closedDates} />
              </dd>
            </div>
            <div className="hidden h-3.5 w-px bg-cream/15 sm:block" aria-hidden="true" />
            <div className="hidden sm:block">
              <dt className="sr-only">Where</dt>
              <dd className="text-cream-muted">
                {address.city}, {address.countryName}
              </dd>
            </div>
          </dl>
        </div>
      }
    >
      <div className="max-w-xl lg:max-w-[min(34rem,42vw)]">
        <p className="flex animate-rise items-center gap-4 text-[0.66rem] uppercase tracking-eyebrow text-gold [animation-delay:550ms]">
          <span className="h-px w-8 origin-left bg-gold/70 motion-safe:animate-draw-x [animation-delay:450ms]" aria-hidden="true" />
          {hero.eyebrow}
        </p>

        <h1 id="hero-title" className="text-shadow-soft mt-5 sm:mt-7">
          {/* Each line rises out of its own mask, one after the other */}
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="block font-light leading-[0.84] tracking-[-0.04em] text-[clamp(4.5rem,min(12vw,19svh),10.5rem)] motion-safe:animate-line-rise [animation-delay:700ms]">
              {first}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="block pl-[0.08em] font-light italic leading-[1] tracking-[-0.015em] text-gold-light text-[clamp(2rem,min(4.2vw,7.5svh),3.6rem)] motion-safe:animate-line-rise [animation-delay:820ms]">
              {rest.join(" ")}
            </span>
          </span>
        </h1>

        <p className="mt-5 animate-rise font-serif text-xl font-light leading-snug text-cream [animation-delay:900ms] sm:mt-7 sm:text-2xl">
          {hero.title}.
        </p>
        <p className="mt-3 hidden max-w-[40ch] animate-rise leading-relaxed text-cream-muted [animation-delay:960ms] sm:block">
          {hero.subtitle}
        </p>

        <div className="mt-8 flex animate-rise flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-8 [animation-delay:1050ms] sm:mt-9">
          <ReserveButton className="btn-reserve-sheen max-sm:gap-2.5 max-sm:pl-6 max-sm:pr-4">{hero.primaryCta}</ReserveButton>
          <Link
            href="/menu"
            className="link-underline py-2 text-sm text-cream-muted sm:text-[0.95rem] transition-colors duration-300 hover:text-cream"
          >
            {hero.secondaryCta}
          </Link>
        </div>
      </div>
    </HeroScene>
  );
}
