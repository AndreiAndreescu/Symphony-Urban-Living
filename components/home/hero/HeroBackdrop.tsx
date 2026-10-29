"use client";

import Image from "next/image";
import { m, type MotionValue } from "framer-motion";
import { HeroAtmosphere } from "@/components/home/hero/HeroAtmosphere";

type Props = {
  image: { src: string; alt: string };
  /** Scroll-linked drift and fade, supplied by HeroScene */
  y: MotionValue<string>;
  opacity: MotionValue<number>;
  /** Pointer drift in px (moves against the plate, for depth) */
  px: MotionValue<number>;
  py: MotionValue<number>;
};

/**
 * Layer 1 of the hero: the dining room as atmosphere, not subject. Pushed back
 * into shadow so the plate reads as the one lit object in the frame.
 *
 * Transforms are split across elements so they never fight: scroll (outer),
 * pointer (middle), load-in settle, then a slow endless breath (inner, CSS).
 */
export function HeroBackdrop({ image, y, opacity, px, py }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {/* Taller and wider than the frame, so neither drift exposes an edge */}
      <m.div className="absolute -inset-x-[3%] -inset-y-[12%]" style={{ y, opacity }}>
        <m.div className="absolute inset-0" style={{ x: px, y: py }}>
          <div className="relative h-full w-full motion-safe:animate-stage-in">
            <div className="relative h-full w-full motion-safe:animate-room-breathe">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-[60%_center] brightness-[0.62] saturate-[0.9]"
              />
            </div>
          </div>
        </m.div>
      </m.div>

      {/* Grading. Desktop keeps the left third quiet for the type; on phones the
          type sits low, so the weight moves to the bottom of the frame. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-ink/25 max-lg:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/80 lg:hidden" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_45%,transparent_30%,rgba(13,12,11,0.7)_100%)]" />
      <HeroAtmosphere />
      <div className="grain absolute inset-0" />
    </div>
  );
}
