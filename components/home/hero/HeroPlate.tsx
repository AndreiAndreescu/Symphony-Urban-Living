"use client";

import Image from "next/image";
import Link from "next/link";
import { m, type MotionValue } from "framer-motion";

export type HeroDish = { src: string; alt: string; dish: string };

type Props = {
  plates: HeroDish[];
  /** Plate on show, from usePlateCycle */
  active: number;
  /** Scroll-linked lift, supplied by HeroScene */
  y: MotionValue<string>;
  scale: MotionValue<number>;
  /** Pointer drift in px */
  px: MotionValue<number>;
  py: MotionValue<number>;
};

/**
 * Layers 2 and 6 of the hero: the signature plates, presented like product
 * shots — lit from the upper left, casting a soft shadow into the room, with a
 * hairline ring and a small caption as the only ornament.
 *
 * All plates are stacked in the same square. The one on show breathes; when
 * the next arrives it turns into place as the last one turns away, both
 * dissolving slowly (see `.hero-dish` in globals.css), like a plate being set
 * down rather than a slide changing. Nothing here changes size, so the cycle
 * can't shift the layout.
 *
 * Size and position come from `.hero-plate` in globals.css, which gives each
 * breakpoint its own composition.
 */
export function HeroPlate({ plates, active, y, scale, px, py }: Props) {
  const previous = (active - 1 + plates.length) % plates.length;
  const state = (i: number) => (i === active ? "active" : i === previous ? "leaving" : "waiting");

  return (
    <m.div className="hero-plate pointer-events-none" style={{ y, scale }}>
      {/* Warm pool of light the plate sits in, drifting like candlelight */}
      <div className="absolute -inset-[35%] motion-safe:animate-fade-in [animation-delay:250ms]" aria-hidden="true">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(214,160,96,0.22)_0%,rgba(214,160,96,0.06)_40%,transparent_68%)] motion-safe:animate-glow-drift" />
      </div>

      {/* Charger ring: a quiet echo of the plate's edge, with a short arc of
          light travelling slowly round it */}
      <div
        className="absolute -inset-[7%] motion-safe:animate-fade-in [animation-delay:1100ms] [animation-duration:2.4s]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-full border border-cream/[0.09]" />
        <svg className="absolute inset-0 h-full w-full opacity-0 motion-safe:animate-orbit motion-safe:opacity-100" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="hero-orbit" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#E3C88F" stopOpacity="0" />
              <stop offset="1" stopColor="#E3C88F" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="49.75"
            fill="none"
            stroke="url(#hero-orbit)"
            strokeWidth="1"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="14 86"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <m.div className="absolute inset-0" style={{ x: px, y: py }}>
        <div className="absolute inset-0 motion-safe:animate-plate-reveal [animation-delay:350ms]">
          {plates.map((plate, i) => (
            <div key={plate.src} className="hero-dish" data-state={state(i)} aria-hidden={i === active ? undefined : true}>
              {/* Contact shadow, offset away from the key light */}
              <div className="absolute inset-[4%] translate-x-[4%] translate-y-[6%] rounded-full bg-black/80 blur-[42px]" />
              <div className="relative h-full w-full motion-safe:animate-plate-breathe">
                <Image
                  src={plate.src}
                  alt={plate.alt}
                  fill
                  // Only the first plate is part of the first paint; the rest
                  // load straight after so each is ready before its turn
                  priority={i === 0}
                  loading={i === 0 ? undefined : "eager"}
                  sizes="(min-width: 1024px) 46vw, (min-width: 640px) 76vw, 90vw"
                  className="select-none object-contain"
                />
              </div>
            </div>
          ))}
          {/* Key light from the upper left: lifts the near rim, lets the far
              side fall into the room's shadow so every plate reads as round */}
          <div
            className="absolute inset-[1.5%] rounded-full bg-[radial-gradient(circle_at_34%_28%,rgba(255,244,226,0.12)_0%,transparent_42%,rgba(13,12,11,0.55)_100%)]"
            aria-hidden="true"
          />
        </div>
      </m.div>

      {/* Caption, product-sheet style, changing with the plate. Large screens
          only, where there's room beside the plate */}
      <div className="pointer-events-auto absolute right-[96%] top-[12%] hidden items-center gap-5 whitespace-nowrap motion-safe:animate-fade-in [animation-delay:1500ms] xl:flex">
        <Link href="/menu" className="group grid text-right" aria-label={`${plates[active].dish}: see the menu`}>
          {plates.map((plate, i) => (
            <span key={plate.dish} className="hero-caption col-start-1 row-start-1" data-state={state(i)} aria-hidden="true">
              <span className="block text-[0.6rem] uppercase tracking-eyebrow text-cream-dim">
                N° {String(i + 1).padStart(2, "0")} · Signature
              </span>
              <span className="mt-1.5 block font-serif text-lg italic text-cream transition-colors duration-500 group-hover:text-gold-light">
                {plate.dish}
              </span>
            </span>
          ))}
        </Link>
        <span
          className="block h-px w-16 origin-right bg-gradient-to-r from-cream/0 to-cream/40 motion-safe:animate-draw-x [animation-delay:1500ms]"
          aria-hidden="true"
        />
      </div>
    </m.div>
  );
}
