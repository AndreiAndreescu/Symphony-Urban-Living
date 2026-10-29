"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Full-bleed image band with a gentle parallax drift (disabled for reduced motion). */
export function ParallaxBand({ image, quote }: { image: { src: string; alt: string }; quote: string }) {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  // Applied after hydration: the drift starts off-centre, so dropping it during
  // the first render would differ from the server's HTML
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = mounted && prefersReduced;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <m.div className="absolute inset-x-0 -inset-y-[14%] -z-20" style={{ y }}>
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
      </m.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/55 to-ink" />
      <div className="container-site py-24 text-center">
        <m.blockquote
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-shadow-soft mx-auto max-w-4xl font-serif text-4xl font-light italic leading-tight sm:text-6xl"
        >
          “{quote}”
        </m.blockquote>
      </div>
    </section>
  );
}
