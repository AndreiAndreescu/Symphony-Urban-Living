"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Options = {
  /** Time each plate is on show, in ms */
  interval: number;
  /** Time before the first change, so the intro finishes on the first plate */
  firstDelay: number;
  /** False while the hero is off-screen */
  active: boolean;
};

/**
 * Index of the plate on show, advancing on a slow timer.
 *
 * Holds still (on the first plate) under prefers-reduced-motion, and pauses
 * while the hero is off-screen or the tab is hidden, so it never changes where
 * nobody can see it and a returning visitor gets a full interval.
 */
export function usePlateCycle(count: number, { interval, firstDelay, active }: Options) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const running = count > 1 && !reduce && active && visible;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(
      () => {
        setStarted(true);
        setIndex((i) => (i + 1) % count);
      },
      started ? interval : firstDelay,
    );
    return () => window.clearTimeout(id);
  }, [running, index, started, count, interval, firstDelay]);

  return index;
}
