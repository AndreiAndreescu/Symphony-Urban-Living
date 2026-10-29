"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { reservations as copy } from "@/content/site-content";
import { saveReservation } from "@/app/admin/actions";
import { periodsForDate, SERVICE_LABEL, slotsForPeriod, type BookingSettings } from "@/lib/hours";
import { STATUS_LABEL } from "@/lib/format";

export type ReservationFormValues = {
  id?: string;
  date: string;
  time: string;
  partySize: number;
  seating: string;
  name: string;
  email: string;
  phone: string;
  occasion: string;
  notes: string;
  internalNote: string;
  status: string;
};

type Props = {
  initial: ReservationFormValues;
  settings: Pick<BookingSettings, "hours" | "closedDates" | "services">;
};

export function ReservationForm({ initial, settings }: Props) {
  const router = useRouter();
  const isNew = !initial.id;
  const [values, setValues] = useState(initial);
  const [override, setOverride] = useState(false);
  const [notifyGuest, setNotifyGuest] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string; canForce?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ReservationFormValues>(key: K, value: ReservationFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const slotGroups = useMemo(() => {
    return periodsForDate(settings, values.date).map((p) => ({
      label: `${SERVICE_LABEL[p.service]} ${p.open}–${p.close}`,
      slots: slotsForPeriod(p, settings.services[p.service]),
    }));
  }, [settings, values.date]);

  const changedSlot = !isNew && (values.date !== initial.date || values.time !== initial.time || values.partySize !== initial.partySize);

  function submit(e: React.FormEvent, force = false) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveReservation({ ...values, overrideCapacity: override || force, notifyGuest });
      if (result.ok) {
        setMessage({ ok: true, text: result.message ?? "Saved." });
        if (isNew && result.id) router.push(`/admin/reservations/${result.id}?created=1`);
        else router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        setMessage({ ok: false, text: result.error, canForce: result.canForce });
      }
    });
  }

  const field = (key: keyof ReservationFormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`rf-${key}`} className="field-label">{label}</label>
      <input
        id={`rf-${key}`}
        value={String(values[key] ?? "")}
        onChange={(e) => set(key, (props.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value) as never)}
        className="field"
        aria-invalid={Boolean(errors[key])}
        {...props}
      />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-xl">When</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {field("date", "Date", { type: "date", required: true })}
          {field("time", "Time", { type: "time", step: 300, required: true })}
          {field("partySize", "Party size", { type: "number", min: 1, max: 200, required: true })}
        </div>
        {slotGroups.length === 0 ? (
          <p className="text-sm text-danger">The restaurant is closed on this date (you can still override below).</p>
        ) : (
          <div className="space-y-3">
            {slotGroups.map((g) => (
              <div key={g.label}>
                <p className="mb-2 text-xs uppercase tracking-wider text-cream-dim">{g.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.slots.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => set("time", s)}
                      aria-pressed={values.time === s}
                      className="min-h-[40px] min-w-[3.75rem] rounded-md border border-cream/15 px-3 text-sm text-cream-muted hover:border-gold/60 aria-pressed:border-gold aria-pressed:bg-gold aria-pressed:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-cream-muted">
          <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="h-4 w-4 accent-[#CDA85E]" />
          Override hours &amp; capacity (e.g. squeezing in a regular)
        </label>
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-xl">Guest</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("name", "Full name", { required: true, autoComplete: "off" })}</div>
          {field("phone", "Phone", { type: "tel", required: true, autoComplete: "off" })}
          {field("email", "Email (optional for phone bookings)", { type: "email", autoComplete: "off" })}
          <div>
            <label htmlFor="rf-seating" className="field-label">Seating</label>
            <select id="rf-seating" value={values.seating} onChange={(e) => set("seating", e.target.value)} className="field">
              {copy.seatingOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="rf-occasion" className="field-label">Occasion</label>
            <select id="rf-occasion" value={values.occasion} onChange={(e) => set("occasion", e.target.value)} className="field">
              <option value="">None</option>
              {copy.occasions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          {isNew && (
            <div>
              <label htmlFor="rf-status" className="field-label">Status</label>
              <select id="rf-status" value={values.status} onChange={(e) => set("status", e.target.value)} className="field">
                {["confirmed", "pending", "seated"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label htmlFor="rf-notes" className="field-label">Guest notes (allergies, requests)</label>
            <textarea id="rf-notes" rows={2} maxLength={500} value={values.notes} onChange={(e) => set("notes", e.target.value)} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="rf-internal" className="field-label">Internal staff note (never shown to guest)</label>
            <textarea id="rf-internal" rows={2} maxLength={1000} value={values.internalNote} onChange={(e) => set("internalNote", e.target.value)} className="field" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {values.email ? (
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-cream-muted">
            <input type="checkbox" checked={notifyGuest} onChange={(e) => setNotifyGuest(e.target.checked)} className="h-4 w-4 accent-[#CDA85E]" />
            {isNew ? "Email a confirmation to the guest (if confirmed)" : "Email the guest if date, time or party size changes"}
          </label>
        ) : (
          <span className="text-sm text-cream-dim">No email — the guest won&apos;t be notified automatically.</span>
        )}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : isNew ? "Add reservation" : changedSlot ? "Save & reschedule" : "Save changes"}
        </button>
      </div>

      {message && (
        <p role={message.ok ? "status" : "alert"} className={`rounded-xl border p-4 text-sm ${message.ok ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"}`}>
          {message.text}{" "}
          {message.canForce && (
            <button type="button" onClick={(e) => submit(e as unknown as React.FormEvent, true)} className="font-medium underline">
              Save anyway
            </button>
          )}
        </p>
      )}
    </form>
  );
}
