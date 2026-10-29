"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Loads animation features asynchronously after first render (smaller initial
 * bundle, faster interactivity) and makes every Framer Motion animation
 * respect the visitor's "reduce motion" OS setting.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
