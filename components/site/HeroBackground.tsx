"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambient hero background: slow-drifting warm light (CSS transforms only) plus
 * a canvas of soft "bokeh" particles, like candle-light through a lens.
 *
 * Performance: sprites are pre-rendered once, the loop is capped at ~40 fps,
 * device-pixel-ratio is capped, and it pauses when off-screen or the tab is
 * hidden. With prefers-reduced-motion it draws a single still frame.
 */
export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const palette = ["255,196,120", "205,168,94", "244,236,222", "240,150,110"];

    const sprites = palette.map((rgb) => {
      const s = document.createElement("canvas");
      s.width = s.height = 128;
      const g = s.getContext("2d")!;
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, `rgba(${rgb},0.9)`);
      grad.addColorStop(0.35, `rgba(${rgb},0.45)`);
      grad.addColorStop(0.7, `rgba(${rgb},0.12)`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      return s;
    });

    type Particle = { x: number; y: number; r: number; vx: number; vy: number; a: number; phase: number; speed: number; sprite: number };
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 640 ? 22 : width < 1200 ? 34 : 46;
      particles = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(18, width < 640 ? 70 : 110),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.22, -0.05),
        a: rand(0.08, 0.32),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.0003, 0.0009),
        sprite: Math.floor(rand(0, sprites.length)),
      }));
    }

    function draw(t: number, move: boolean) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (move) {
          p.x += p.vx + Math.sin(t * p.speed + p.phase) * 0.12;
          p.y += p.vy;
          if (p.y < -p.r) {
            p.y = height + p.r;
            p.x = rand(0, width);
          }
          if (p.x < -p.r) p.x = width + p.r;
          if (p.x > width + p.r) p.x = -p.r;
        }
        ctx!.globalAlpha = p.a * (0.65 + 0.35 * Math.sin(t * p.speed * 2 + p.phase));
        ctx!.drawImage(sprites[p.sprite], p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(t: number) {
      raf = requestAnimationFrame(loop);
      if (t - last < 25) return;
      last = t;
      draw(t, true);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (motionQuery.matches) {
        draw(0, false);
        return;
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    }

    resize();
    draw(0, false);
    setReady(true);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now(), false);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Also pause the CSS light drift while off-screen (saves GPU/battery on phones)
      if (rootRef.current) rootRef.current.dataset.paused = String(!visible);
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", start);

    // Start once the browser is idle, so the headline and interactivity come first
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let idleId = 0;
    const idle = window.setTimeout(() => {
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(start, { timeout: 2000 });
      else start();
    }, 900);

    return () => {
      window.clearTimeout(idle);
      if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", start);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-ink [&[data-paused=true]>*]:[animation-play-state:paused]"
    >
      {/* Slow drifting warm light — GPU composited transforms, static under reduced motion */}
      <div className="absolute -left-[20%] -top-[25%] h-[80vmax] w-[80vmax] rounded-full bg-[radial-gradient(circle,rgba(205,140,70,0.38)_0%,rgba(205,140,70,0)_62%)] will-change-transform motion-safe:animate-drift1" />
      <div className="absolute -right-[25%] top-[5%] h-[75vmax] w-[75vmax] rounded-full bg-[radial-gradient(circle,rgba(107,34,50,0.55)_0%,rgba(107,34,50,0)_60%)] will-change-transform motion-safe:animate-drift2" />
      <div className="absolute -bottom-[35%] left-[15%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(30,74,61,0.6)_0%,rgba(30,74,61,0)_60%)] will-change-transform motion-safe:animate-drift3" />

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-[2000ms] ${ready ? "opacity-100" : "opacity-0"}`}
      />

      {/* Contrast scrims keep text WCAG AA legible over any frame */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,12,11,0.25)_0%,rgba(13,12,11,0.7)_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
