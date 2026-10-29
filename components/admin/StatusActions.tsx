"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setReservationStatus } from "@/app/admin/actions";
import type { ReservationStatus } from "@/lib/validation";

type Props = {
  id: string;
  status: string;
  hasEmail: boolean;
  compact?: boolean;
  showNotifyToggle?: boolean;
};

const btn = "inline-flex min-h-[40px] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-50";

export function StatusActions({ id, status, hasEmail, compact = false, showNotifyToggle = false }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notify, setNotify] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; force?: ReservationStatus } | null>(null);

  function run(next: ReservationStatus, force = false) {
    setFeedback(null);
    setConfirmCancel(false);
    startTransition(async () => {
      const result = await setReservationStatus(id, next, { notifyGuest: notify && hasEmail, force });
      if (result.ok) {
        setFeedback(result.message && result.message !== "Updated." ? { ok: true, text: result.message } : null);
      } else {
        setFeedback({ ok: false, text: result.error, force: result.canForce ? next : undefined });
      }
      router.refresh();
    });
  }

  return (
    <div className={compact ? "" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <button type="button" disabled={pending} onClick={() => run("confirmed")} className={`${btn} border-success/50 bg-success/15 text-success hover:bg-success/25`}>
            ✓ Confirm
          </button>
        )}
        {(status === "pending" || status === "confirmed") && (
          <button type="button" disabled={pending} onClick={() => run("seated")} className={`${btn} border-sky-300/40 text-sky-200 hover:bg-sky-300/10`}>
            Seat
          </button>
        )}
        {status === "confirmed" && (
          <button type="button" disabled={pending} onClick={() => run("no_show")} className={`${btn} border-cream/15 text-cream-muted hover:bg-cream/5`}>
            No-show
          </button>
        )}
        {status === "seated" && (
          <button type="button" disabled={pending} onClick={() => run("confirmed")} className={`${btn} border-cream/15 text-cream-muted hover:bg-cream/5`}>
            Undo seat
          </button>
        )}
        {(status === "cancelled" || status === "no_show") && (
          <button type="button" disabled={pending} onClick={() => run("confirmed")} className={`${btn} border-cream/15 text-cream-muted hover:bg-cream/5`}>
            Restore
          </button>
        )}
        {status !== "cancelled" && status !== "seated" &&
          (confirmCancel ? (
            <>
              <button type="button" disabled={pending} onClick={() => run("cancelled")} className={`${btn} border-danger bg-danger/20 text-danger`}>
                Yes, cancel
              </button>
              <button type="button" onClick={() => setConfirmCancel(false)} className={`${btn} border-cream/15 text-cream-muted`}>
                Keep
              </button>
            </>
          ) : (
            <button type="button" disabled={pending} onClick={() => setConfirmCancel(true)} className={`${btn} border-danger/40 text-danger hover:bg-danger/10`}>
              Cancel
            </button>
          ))}
      </div>

      {showNotifyToggle && hasEmail && (
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-cream-muted">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 accent-[#CDA85E]" />
          Email the guest when confirming or cancelling
        </label>
      )}

      {feedback && (
        <p role="status" className={`mt-2 text-sm ${feedback.ok ? "text-success" : "text-danger"}`}>
          {feedback.text}{" "}
          {feedback.force && (
            <button type="button" className="underline" onClick={() => run(feedback.force!, true)}>
              Do it anyway
            </button>
          )}
        </p>
      )}
    </div>
  );
}
