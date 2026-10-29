"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettings, sendTestEmail } from "@/app/admin/actions";
import { SERVICE_LABEL, slotsForPeriod, WEEKDAYS, type BookingSettings, type ServiceId } from "@/lib/hours";
import { formatDateShort } from "@/lib/time";

type Props = { initial: BookingSettings; envEmails: string[]; emailProvider: string | null };

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function SettingsForm({ initial, envEmails, emailProvider }: Props) {
  const router = useRouter();
  const [s, setS] = useState<BookingSettings>(initial);
  const [newClosed, setNewClosed] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [testing, startTest] = useTransition();

  const update = (fn: (draft: BookingSettings) => void) =>
    setS((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveSettings(s);
      setMessage(result.ok ? { ok: true, text: result.message ?? "Saved." } : { ok: false, text: result.error });
      if (result.ok) router.refresh();
    });
  }

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ ok: false, text: "Enter a valid email address." });
      return;
    }
    if (!s.notifyEmails.includes(email) && !envEmails.includes(email)) update((d) => void d.notifyEmails.push(email));
    setNewEmail("");
  };

  const num = "field w-28 py-2";

  return (
    <div className="space-y-8 pb-24">
      {/* Opening hours */}
      <section className="card p-5 sm:p-6" aria-labelledby="hours-title">
        <h2 id="hours-title" className="text-2xl">Opening hours</h2>
        <p className="mt-1 text-sm text-cream-muted">
          Used for the website, the &quot;Open now&quot; badge and bookable times. Closing after midnight? Use 23:59.
        </p>
        <div className="mt-6 divide-y divide-cream/10">
          {DAY_ORDER.map((day) => (
            <div key={day} className="grid gap-3 py-4 md:grid-cols-[9rem_1fr]">
              <p className="pt-2 font-medium text-cream">{WEEKDAYS[day]}</p>
              <div className="space-y-2">
                {s.hours[day].length === 0 && <p className="pt-2 text-sm text-cream-dim">Closed</p>}
                {s.hours[day].map((p, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`svc-${day}-${i}`}>Service</label>
                    <select id={`svc-${day}-${i}`} value={p.service} onChange={(e) => update((d) => void (d.hours[day][i].service = e.target.value as ServiceId))} className="field w-32 py-2">
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <label className="sr-only" htmlFor={`open-${day}-${i}`}>Opens</label>
                    <input id={`open-${day}-${i}`} type="time" value={p.open} onChange={(e) => update((d) => void (d.hours[day][i].open = e.target.value))} className="field w-32 py-2" />
                    <span className="text-cream-dim">to</span>
                    <label className="sr-only" htmlFor={`close-${day}-${i}`}>Closes</label>
                    <input id={`close-${day}-${i}`} type="time" value={p.close} onChange={(e) => update((d) => void (d.hours[day][i].close = e.target.value))} className="field w-32 py-2" />
                    <button type="button" onClick={() => update((d) => void d.hours[day].splice(i, 1))} className="rounded-md px-2 py-1 text-sm text-danger hover:bg-danger/10" aria-label={`Remove ${SERVICE_LABEL[p.service]} on ${WEEKDAYS[day]}`}>
                      Remove
                    </button>
                    <span className="w-full text-xs text-cream-dim">
                      Bookable: {slotsForPeriod(p, s.services[p.service]).join(", ") || "none"}
                    </span>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => update((d) => void d.hours[day].push(d.hours[day].some((x) => x.service === "lunch") ? { service: "dinner", open: "18:30", close: "23:00" } : { service: "lunch", open: "12:00", close: "15:30" }))}
                    className="rounded-md border border-cream/15 px-2.5 py-1 text-xs text-cream-muted hover:text-cream"
                  >
                    + Add service
                  </button>
                  {day !== 1 && (
                    <button type="button" onClick={() => update((d) => void (d.hours[day] = structuredClone(d.hours[1])))} className="rounded-md px-2.5 py-1 text-xs text-cream-dim hover:text-cream">
                      Copy Monday
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capacity */}
      <section className="card p-5 sm:p-6" aria-labelledby="cap-title">
        <h2 id="cap-title" className="text-2xl">Booking capacity</h2>
        <p className="mt-1 text-sm text-cream-muted">
          &quot;Max guests per time slot&quot; is the total number of people who can be booked to arrive at the same time. When a slot reaches it, the website shows it as full.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {(["lunch", "dinner"] as ServiceId[]).map((svc) => (
            <fieldset key={svc} className="rounded-xl border border-cream/10 p-4">
              <legend className="px-2 font-serif text-xl">{SERVICE_LABEL[svc]}</legend>
              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between gap-3">
                  Max guests per time slot
                  <input type="number" min={0} max={500} value={s.services[svc].maxCoversPerSlot} onChange={(e) => update((d) => void (d.services[svc].maxCoversPerSlot = Number(e.target.value)))} className={num} />
                </label>
                <label className="flex items-center justify-between gap-3">
                  Time slot every
                  <select value={s.services[svc].slotIntervalMinutes} onChange={(e) => update((d) => void (d.services[svc].slotIntervalMinutes = Number(e.target.value)))} className={num}>
                    {[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} min</option>)}
                  </select>
                </label>
                <label className="flex items-center justify-between gap-3">
                  Last booking (minutes before closing)
                  <input type="number" min={0} max={360} step={15} value={s.services[svc].lastSeatingMinutesBeforeClose} onChange={(e) => update((d) => void (d.services[svc].lastSeatingMinutesBeforeClose = Number(e.target.value)))} className={num} />
                </label>
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-cream/10 p-4">
            Largest party bookable online
            <input type="number" min={1} max={50} value={s.maxPartySizeOnline} onChange={(e) => update((d) => void (d.maxPartySizeOnline = Number(e.target.value)))} className={num} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-cream/10 p-4">
            Minimum notice (hours)
            <input type="number" min={0} max={168} step={0.5} value={s.minLeadMinutes / 60} onChange={(e) => update((d) => void (d.minLeadMinutes = Math.round(Number(e.target.value) * 60)))} className={num} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-cream/10 p-4">
            Bookable days ahead
            <input type="number" min={1} max={365} value={s.maxDaysAhead} onChange={(e) => update((d) => void (d.maxDaysAhead = Number(e.target.value)))} className={num} />
          </label>
        </div>
      </section>

      {/* Closed dates */}
      <section className="card p-5 sm:p-6" aria-labelledby="closed-title">
        <h2 id="closed-title" className="text-2xl">Closed dates</h2>
        <p className="mt-1 text-sm text-cream-muted">Holidays, private buyouts or maintenance — no online bookings on these days.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="closed-date" className="sr-only">Add closed date</label>
          <input id="closed-date" type="date" value={newClosed} onChange={(e) => setNewClosed(e.target.value)} className="field w-auto py-2" />
          <button
            type="button"
            onClick={() => {
              if (newClosed && !s.closedDates.includes(newClosed)) update((d) => void d.closedDates.push(newClosed));
              setNewClosed("");
            }}
            className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {s.closedDates.length === 0 && <li className="text-sm text-cream-dim">None</li>}
          {[...s.closedDates].sort().map((d) => (
            <li key={d} className="flex items-center gap-2 rounded-full border border-cream/15 py-1 pl-3 pr-1 text-sm">
              {formatDateShort(d)} {d.slice(0, 4)}
              <button type="button" onClick={() => update((x) => void (x.closedDates = x.closedDates.filter((c) => c !== d)))} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-danger/20" aria-label={`Remove ${d}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Notifications */}
      <section className="card p-5 sm:p-6" aria-labelledby="notify-title">
        <h2 id="notify-title" className="text-2xl">Reservation notifications</h2>
        <p className="mt-1 text-sm text-cream-muted">Everyone below receives an email for every new website booking.</p>
        <p className={`mt-3 text-sm ${emailProvider ? "text-success" : "text-gold-light"}`}>
          {emailProvider ? `✓ Sending via ${emailProvider}` : "⚠ No email service configured yet — emails are only written to the server log. See README → Email."}
        </p>
        <ul className="mt-4 space-y-2">
          {envEmails.map((e) => (
            <li key={e} className="flex items-center justify-between rounded-lg border border-cream/10 px-3 py-2 text-sm">
              {e} <span className="text-xs text-cream-dim">from NOTIFY_EMAILS (hosting settings)</span>
            </li>
          ))}
          {s.notifyEmails.map((e) => (
            <li key={e} className="flex items-center justify-between rounded-lg border border-cream/10 px-3 py-2 text-sm">
              {e}
              <button type="button" onClick={() => update((d) => void (d.notifyEmails = d.notifyEmails.filter((x) => x !== e)))} className="text-xs text-danger hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <label htmlFor="new-email" className="sr-only">Add notification email</label>
          <input id="new-email" type="email" placeholder="name@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }} className="field max-w-xs py-2" />
          <button type="button" onClick={addEmail} className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5">Add</button>
          <button
            type="button"
            disabled={testing}
            onClick={() => startTest(async () => {
              const r = await sendTestEmail();
              setMessage(r.ok ? { ok: true, text: r.message ?? "Sent." } : { ok: false, text: r.error });
            })}
            className="rounded-lg border border-gold/40 px-3 py-2 text-sm text-gold hover:bg-gold/10"
          >
            {testing ? "Sending…" : "Send test email"}
          </button>
        </div>
        <p className="mt-2 text-xs text-cream-dim">Save settings before sending a test to newly added addresses.</p>
      </section>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-ink/95 px-4 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:px-4">
          <p role="status" className={`text-sm ${message ? (message.ok ? "text-success" : "text-danger") : "text-cream-dim"}`}>
            {message?.text ?? "Changes are not live until you save."}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setS(initial); setMessage(null); }} className="rounded-full px-4 py-2 text-sm text-cream-muted hover:text-cream">Discard</button>
            <button type="button" onClick={save} disabled={pending} className="btn-primary min-h-[44px] px-6 text-sm">{pending ? "Saving…" : "Save settings"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
