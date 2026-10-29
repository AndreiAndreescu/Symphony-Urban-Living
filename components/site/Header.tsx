"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useScroll, useTransform } from "framer-motion";
import { navigation, site } from "@/content/site-content";

export function Wordmark({ className = "" }: { className?: string }) {
  if (site.logo) {
    return <Image src={site.logo.src} alt={site.name} width={site.logo.width} height={site.logo.height} priority className={className} />;
  }
  const [first, ...rest] = site.name.split(" ");
  return (
    <span className={`font-serif leading-none tracking-tight ${className}`}>
      <span className="text-cream">{first}</span>{" "}
      <span className="italic text-gold">{rest.join(" ")}</span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // The header joins the homepage's opening sequence, on the first load only
  // (it lives in the layout, so it never remounts on client navigation)
  const [intro] = useState(pathname === "/");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The bar's surface gathers as the page scrolls, instead of switching on at
  // a threshold, so it moves with the reader
  const { scrollY } = useScroll();
  const surface = useTransform(scrollY, [0, 180], [0, 1]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      // Keep keyboard focus inside the open menu
      if (e.key === "Tab" && panelRef.current) {
        const focusables = [toggleRef.current!, ...panelRef.current.querySelectorAll<HTMLElement>("a")];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
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
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <m.div
        className="absolute inset-0 -z-10 border-b border-cream/10 bg-ink/85 backdrop-blur-md"
        style={{ opacity: open ? 1 : surface }}
        aria-hidden="true"
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div
        className={`container-site flex h-[76px] items-center justify-between gap-6 sm:h-[84px] ${
          intro ? "motion-safe:animate-fade-in [animation-delay:200ms]" : ""
        }`}
      >
        <Link
          href="/"
          className="whitespace-nowrap text-[1.35rem] transition-opacity duration-500 hover:opacity-80 sm:text-2xl"
          aria-label={`${site.name} — home`}
        >
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.18em] text-cream-muted xl:gap-10">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`link-underline py-2 transition-colors hover:text-cream ${active ? "text-cream" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Deliberately lighter than the hero CTA, so the page has one clear primary action */}
          <Link
            href="/reservations"
            className="hidden min-h-[44px] items-center whitespace-nowrap rounded-full border border-cream/25 px-6 text-[0.7rem] uppercase tracking-[0.18em] text-cream transition-colors duration-500 hover:border-gold hover:text-gold-light sm:inline-flex"
          >
            Reserve a table
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-cream lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-3.5 w-6">
              <span className={`absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 block h-[1.5px] w-6 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={panelRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-[calc(100dvh-76px)] overflow-y-auto border-t border-cream/10 bg-ink sm:h-[calc(100dvh-84px)] lg:hidden"
          >
            <nav aria-label="Mobile" className="container-site flex h-full flex-col py-6">
              <ul className="divide-y divide-cream/[0.07]">
                {[{ href: "/", label: "Home" }, ...navigation].map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    {/* Each item rises out of its own row, one after the other */}
                    <m.div
                      initial={{ opacity: 0, y: "70%" }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 + 0.05 * i }}
                    >
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className="group flex items-baseline gap-5 py-4 font-serif text-[1.85rem] font-light text-cream transition-colors aria-[current=page]:text-gold-light"
                      >
                        <span className="w-6 font-sans text-[0.62rem] tracking-eyebrow text-cream-dim" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </Link>
                    </m.div>
                  </li>
                ))}
              </ul>
              <m.div
                className="mt-auto space-y-4 pt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}
              >
                <Link href="/reservations" className="btn-reserve w-full justify-center">
                  Reserve a table
                </Link>
                <p className="text-center text-sm text-cream-dim">{site.locationLine}</p>
              </m.div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
