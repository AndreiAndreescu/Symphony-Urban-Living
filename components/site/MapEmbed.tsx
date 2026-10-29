"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * GDPR-friendly map: Google Maps (which sets its own cookies) only loads after
 * the visitor clicks. Until then nothing is requested from Google.
 */
export function MapEmbed({ query, label }: { query: string; label: string }) {
  const [loaded, setLoaded] = useState(false);
  const q = encodeURIComponent(query);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-cream/10 bg-ink-800 sm:aspect-[16/10]">
      {loaded ? (
        <iframe
          title={`Map showing ${label}`}
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          className="h-full w-full border-0 [filter:grayscale(0.4)_invert(0.9)_hue-rotate(180deg)_contrast(0.9)]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_center,rgba(30,74,61,0.45),transparent_70%)] p-8 text-center">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <p className="max-w-sm text-sm text-cream-muted">
            The map is provided by Google, which may set cookies. It only loads if you choose to show it. See our{" "}
            <Link href="/cookies" className="underline hover:text-cream">
              cookie notice
            </Link>
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setLoaded(true)} className="btn-ghost">
              Show map
            </button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Get directions<span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
