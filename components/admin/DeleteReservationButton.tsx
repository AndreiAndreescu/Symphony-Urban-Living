"use client";

import { useState, useTransition } from "react";
import { deleteReservation } from "@/app/admin/actions";

export function DeleteReservationButton({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="rounded-lg border border-danger/40 px-3 py-2 text-danger hover:bg-danger/10">
        Delete permanently…
      </button>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-danger">This cannot be undone.</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteReservation(id);
              if (result && !result.ok) setError(result.error);
            })
          }
          className="rounded-lg border border-danger bg-danger/20 px-3 py-2 text-danger"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button type="button" onClick={() => setArmed(false)} className="rounded-lg border border-cream/15 px-3 py-2 text-cream-muted">
          Keep
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
