"use client";

import { useRef } from "react";
import { m, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { HeroBackdrop } from "@/components/home/hero/HeroBackdrop";
import { HeroPlate, type HeroDish } from "@/components/home/hero/HeroPlate";
import { usePlateCycle } from "@/components/home/hero/usePlateCycle";
import { usePointerParallax } from "@/components/home/hero/usePointerParallax";

/** Each plate is on show this long before the next turns into place */
const PLATE_INTERVAL = 7500;

type Props = {
  image: { src: string; alt: string };
  plates: HeroDish[];
  /** Headline, copy and actions (server-rendered) */
  children: React.ReactNode;
  /** Bottom rail: scroll cue and live status */
  footing: React.ReactNode;
  labelledBy: string;
};

/**
 * The hero's stage. It stays alive for as long as it's on screen:
 *   • the signature plates cycle, one slow cross-dissolve every 7.5s
 *   • each plate breathes, the room breathes, light crosses it and motes rise
 *     (CSS, see HeroPlate and HeroAtmosphere)
 *   • the room, the plate and the type answer the pointer and the scroll at
 *     different rates, so the frame reads as having depth
 *
 * On scroll the plate lifts and recedes while the room falls away beneath it,
 * handing over to the story section, which is pulled up under the hero.
 * Off-screen, everything pauses (`data-idle`); under reduced motion, it all
 * holds on one still frame.
 */
export function HeroScene({ image, plates, children, footing, labelledBy }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const pointer = usePointerParallax();
  // Starts "in view" so the server render and the pre-hydration intro run unpaused
  const inView = useInView(ref, { amount: 0.15, initial: true });
  // First change lands a beat after the intro has settled on the first plate
  const active = usePlateCycle(plates.length, { interval: PLATE_INTERVAL, firstDelay: 6500, active: inView });

  // Under reduced motion every range collapses to its start value, so layers
  // stay put. (Swapping the style off instead would differ from the server
  // render and break hydration.)
  const range = <T,>(from: T, to: T): T[] => (reduce ? [from, from] : [from, to]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const roomY = useTransform(scrollYProgress, [0, 1], range("0%", "14%"));
  const roomOpacity = useTransform(scrollYProgress, [0, 0.9], range(1, 0.25));
  const plateY = useTransform(scrollYProgress, [0, 1], range("0%", "-16%"));
  const plateScale = useTransform(scrollYProgress, [0, 1], range(1, 0.9));
  const copyY = useTransform(scrollYProgress, [0, 1], range("0%", "-22%"));
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], range(1, 0));
  const footingOpacity = useTransform(scrollYProgress, [0, 0.12], range(1, 0));

  // The plate leads the pointer; the room trails it. (The pointer hook stays
  // at rest under reduced motion or on touch screens.)
  const plateX = useTransform(pointer.x, (v) => v * 14);
  const plateYPointer = useTransform(pointer.y, (v) => v * 10);
  const roomX = useTransform(pointer.x, (v) => v * -10);
  const roomYPointer = useTransform(pointer.y, (v) => v * -6);

  return (
    <section
      ref={ref}
      className="hero-stage relative isolate overflow-hidden bg-ink"
      aria-labelledby={labelledBy}
      // Pauses the endless CSS animations while off-screen
      data-idle={inView ? undefined : "true"}
    >
      <HeroBackdrop image={image} y={roomY} opacity={roomOpacity} px={roomX} py={roomYPointer} />
      <HeroPlate plates={plates} active={active} y={plateY} scale={plateScale} px={plateX} py={plateYPointer} />

      {/* Layer 3: grade in front of the plate. The plate sinks into shadow at the
          foot of the frame instead of being cut by it, and on phones the lower
          half darkens for the type. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink via-ink/70 to-transparent lg:hidden" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* Layer 4: type */}
      <div className="hero-copy container-site relative flex min-h-[100svh] flex-col justify-end pb-6 sm:pb-8">
        <m.div style={{ y: copyY, opacity: copyOpacity }}>{children}</m.div>
        <m.div style={{ opacity: footingOpacity }}>{footing}</m.div>
      </div>
    </section>
  );
}
