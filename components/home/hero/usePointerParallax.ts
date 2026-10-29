"use client";

import { useEffect } from "react";
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";

const SPRING = { stiffness: 40, damping: 18, mass: 1 };

/**
 * Pointer position across the window, normalised to -1…1 and heavily damped,
 * so layers can drift a few pixels against each other and suggest depth.
 *
 * Only listens on devices with a precise pointer (no touch) and never under
 * prefers-reduced-motion; otherwise both values stay at 0.
 */
export function usePointerParallax(): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX, rawY]);

  return { x, y };
}
