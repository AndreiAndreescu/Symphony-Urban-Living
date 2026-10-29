"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";

export type GalleryImage = { src: string; alt: string; category: string; width: number; height: number };

/** Filterable masonry grid with an accessible keyboard/touch lightbox. */
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(images.map((i) => i.category)))], [images]);
  const [filter, setFilter] = useState("All");
  const [index, setIndex] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const visible = filter === "All" ? images : images.filter((i) => i.category === filter);

  const close = useCallback(() => {
    setIndex(null);
    lastTrigger.current?.focus();
  }, []);
  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Tab") {
        // Trap focus inside the dialog's buttons
        const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-lightbox] button"));
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, go]);

  const current = index !== null ? visible[index] : null;

  return (
    <>
      <div role="group" aria-label="Filter gallery" className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className="rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream-muted transition-colors hover:border-cream/40 hover:text-cream aria-pressed:border-gold aria-pressed:bg-gold aria-pressed:text-ink"
          >
            {c}
          </button>
        ))}
      </div>

      <m.ul layout className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
        <AnimatePresence mode="popLayout">
          {visible.map((img, i) => (
            <m.li
              key={img.src}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 break-inside-avoid"
            >
              <button
                type="button"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget;
                  setIndex(i);
                }}
                className="group relative block w-full overflow-hidden rounded-2xl border border-cream/10 text-left"
                aria-label={`Open image: ${img.alt}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={filter === "All" && i === 0}
                  className="h-auto w-full transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="absolute bottom-0 left-0 right-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <span className="eyebrow block">{img.category}</span>
                  <span className="mt-1 block text-cream">{img.alt}</span>
                </span>
              </button>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      <AnimatePresence>
        {current && (
          <m.div
            data-lightbox
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <m.figure
              key={current.src}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="relative flex max-h-full w-full max-w-6xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="90vw"
                className="max-h-[78vh] w-auto rounded-xl object-contain"
              />
              <figcaption className="mt-4 text-center text-cream-muted">
                {current.alt} <span className="text-cream-dim">· {index! + 1} / {visible.length} · placeholder image</span>
              </figcaption>
            </m.figure>

            <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 text-2xl text-cream transition-colors hover:border-gold hover:text-gold">
              ×
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image" className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 text-xl text-cream transition-colors hover:border-gold hover:text-gold sm:flex">
              ←
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image" className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 text-xl text-cream transition-colors hover:border-gold hover:text-gold sm:flex">
              →
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
