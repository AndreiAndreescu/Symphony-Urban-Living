"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/** Keeps the service view live: refreshes data every 30 s while the tab is visible. */
export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [updated, setUpdated] = useState<string>("");

  useEffect(() => {
    const stamp = () => setUpdated(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    stamp();
    const id = window.setInterval(() => {
      if (document.hidden) return;
      startTransition(() => router.refresh());
      stamp();
    }, intervalMs);
    const onVisible = () => {
      if (!document.hidden) {
        startTransition(() => router.refresh());
        stamp();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => router.refresh());
        setUpdated(new Date().toLocaleTimeString("en-GB"));
      }}
      className="inline-flex items-center gap-2 rounded-full border border-cream/15 px-3 py-1.5 text-xs text-cream-muted hover:text-cream"
      title="Refresh now"
    >
      <span className={`h-2 w-2 rounded-full ${pending ? "animate-ping bg-gold" : "bg-success"}`} aria-hidden="true" />
      Live · updated {updated}
    </button>
  );
}
