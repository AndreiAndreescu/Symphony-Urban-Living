"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { site } from "@/content/site-content";

/** Sticky "Reserve a table" bar on phones, shown once the visitor scrolls. */
export function MobileReserveBar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/reservations")) return null;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-ink/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:hidden"
        >
          <div className="flex items-center gap-3">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="btn-ghost min-h-[48px] px-4 text-sm"
              aria-label={`Call ${site.name}`}
            >
              Call
            </a>
            <Link href="/reservations" className="btn-primary flex-1">
              Reserve a table
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
