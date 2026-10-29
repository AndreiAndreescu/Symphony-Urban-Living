"use client";

import { useEffect, useState } from "react";
import { computeOpenState, type BookingSettings } from "@/lib/hours";

type Props = {
  hours: BookingSettings["hours"];
  closedDates: string[];
  className?: string;
};

/** Live "Open now / Closed" badge, recalculated every minute in restaurant time. */
export function OpenStatus({ hours, closedDates, className = "" }: Props) {
  const [state, setState] = useState(() => computeOpenState({ hours, closedDates }));

  useEffect(() => {
    const update = () => setState(computeOpenState({ hours, closedDates }));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [hours, closedDates]);

  return (
    <p className={`inline-flex items-center gap-2.5 text-sm ${className}`} role="status" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        {state.isOpen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state.isOpen ? "bg-success" : "bg-danger"}`} />
      </span>
      <span suppressHydrationWarning className={state.isOpen ? "text-success" : "text-cream-muted"}>
        {state.label}
      </span>
    </p>
  );
}
