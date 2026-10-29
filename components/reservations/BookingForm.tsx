"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { m } from "framer-motion";
import { reservations, site } from "@/content/site-content";
import type { DayAvailability } from "@/lib/availability";
import { OCCASION_LABEL, pluralGuests, SEATING_LABEL } from "@/lib/format";
import { addDays, formatDateLong, weekdayOf, zonedNow } from "@/lib/time";
import { fieldErrors, reservationSchema } from "@/lib/validation";

type Props = {
  today: string;
  maxPartySize: number;
  maxDaysAhead: number;
  openWeekdays: boolean[];
  closedDates: string[];
};

type Confirmation = {
  code: string;
  name: string;
  email: string;
  date: string;
  time: string;
  partySize: number;
  seating: string;
  occasion: string | null;
  notes: string | null;
};

type AvailabilityState =
  | { status: "loading" }
  | { status: "ready"; data: DayAvailability }
  | { status: "error"; message: string };

const FIELD_ORDER = ["partySize", "date", "time", "seating", "name", "phone", "email", "notes", "consent"];

export function BookingForm({ today: serverToday, maxPartySize, maxDaysAhead, openWeekdays, closedDates }: Props) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [today, setToday] = useState(serverToday);
  const isClosed = useCallback(
    (d: string) => !openWeekdays[weekdayOf(d)] || closedDates.includes(d),
    [openWeekdays, closedDates],
  );
  const firstOpen = useCallback(
    (from: string) => {
      for (let i = 0; i < 14; i++) if (!isClosed(addDays(from, i))) return addDays(from, i);
      return from;
    },
    [isClosed],
  );

  const [partySize, setPartySize] = useState(2);
  const [partyDraft, setPartyDraft] = useState<string | null>(null); // while typing in the number field
  const [date, setDate] = useState(() => firstOpen(serverToday));
  const [time, setTime] = useState("");
  const [seating, setSeating] = useState<string>("indoor");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot

  const [availability, setAvailability] = useState<AvailabilityState>({ status: "loading" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const successRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Correct "today" if the page was rendered around midnight
  useEffect(() => {
    const now = zonedNow().date;
    if (now !== serverToday) {
      setToday(now);
      setDate((d) => (d < now ? firstOpen(now) : d));
    }
  }, [serverToday, firstOpen]);

  // Live availability for the chosen date + party size
  useEffect(() => {
    const controller = new AbortController();
    setAvailability({ status: "loading" });
    fetch(`/api/availability?date=${date}&partySize=${partySize}`, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load availability");
        setAvailability({ status: "ready", data: body as DayAvailability });
        setTime((current) => {
          const stillFree = (body as DayAvailability).services.some((s) => s.slots.some((sl) => sl.time === current && sl.available));
          return stillFree ? current : "";
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setAvailability({ status: "error", message: err.message || "Could not load availability" });
      });
    return () => controller.abort();
  }, [date, partySize, reloadKey]);

  const clearError = (field: string) => setErrors((e) => (e[field] ? { ...e, [field]: "" } : e));

  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const maxDate = addDays(today, maxDaysAhead);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const payload = {
      name,
      phone,
      email,
      date,
      time,
      partySize,
      seating,
      occasion,
      notes,
      consent,
      company,
    };

    const parsed = reservationSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setConfirmation(body.reservation as Confirmation);
        requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          successRef.current?.focus({ preventScroll: true });
        });
        return;
      }
      if (res.status === 400 && body.fieldErrors) {
        setErrors(body.fieldErrors);
        focusFirstError(body.fieldErrors);
      } else {
        setServerError(body.error ?? "Something went wrong. Please try again or call us.");
      }
      if (res.status === 409) {
        setTime("");
        setReloadKey((k) => k + 1);
      }
    } catch {
      setServerError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function focusFirstError(errs: Record<string, string>) {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const el = document.getElementById(id(first));
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (confirmation) {
    return (
      <div ref={rootRef} className="scroll-mt-28">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-gold/40 bg-gradient-to-br from-emerald-dark via-ink-800 to-ink-800 p-7 sm:p-12"
          role="status"
          aria-live="polite"
        >
          <svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden="true">
            <m.circle cx="26" cy="26" r="24" fill="none" stroke="#CDA85E" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
            <m.path d="M15 27 l7 7 l15 -16" fill="none" stroke="#E3C88F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
          </svg>
          <h2 ref={successRef} tabIndex={-1} className="mt-6 text-4xl outline-none sm:text-5xl">
            Thank you, {confirmation.name.split(" ")[0]}.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream-muted">
            Your request has been received. We&apos;ve sent a summary to <strong className="text-cream">{confirmation.email}</strong> and will
            email you again as soon as your table is confirmed.
          </p>

          <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-cream/10 pt-8 sm:grid-cols-2">
            {[
              ["Reference", confirmation.code],
              ["Status", "Pending confirmation"],
              ["Date", formatDateLong(confirmation.date)],
              ["Time", confirmation.time],
              ["Party", pluralGuests(confirmation.partySize)],
              ["Seating", SEATING_LABEL[confirmation.seating] ?? confirmation.seating],
              ...(confirmation.occasion ? [["Occasion", OCCASION_LABEL[confirmation.occasion] ?? confirmation.occasion]] : []),
              ...(confirmation.notes ? [["Notes", confirmation.notes]] : []),
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-[0.2em] text-cream-dim">{k}</dt>
                <dd className={`mt-1 text-lg text-cream ${k === "Reference" ? "font-mono tracking-wider text-gold-light" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm text-cream-dim">{reservations.cancellationNote}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu" className="btn-primary">
              Browse the menu
            </Link>
            <Link href="/" className="btn-ghost">
              Back to home
            </Link>
          </div>
        </m.div>
      </div>
    );
  }

  const selectedService = availability.status === "ready" ? availability.data : null;
  // The radio that error-focus jumps to: the chosen slot, otherwise the first bookable one
  const focusSlot =
    time || selectedService?.services.flatMap((s) => s.slots).find((sl) => sl.available)?.time || "";

  return (
    <div ref={rootRef} className="scroll-mt-28">
      <form onSubmit={onSubmit} noValidate className="card space-y-12 p-6 sm:p-10" aria-describedby={id("required-note")}>
        <p id={id("required-note")} className="-mb-4 text-sm text-cream-dim">
          Fields marked <span aria-hidden="true" className="text-gold">*</span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>

        {/* 1. Party size */}
        <fieldset>
          <legend className="flex items-baseline gap-3 font-serif text-2xl">
            <span className="font-sans text-sm text-gold">01</span> Party size <span aria-hidden="true" className="text-gold">*</span>
          </legend>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <div className="flex items-center rounded-full border border-ink-500 bg-ink-800 p-1">
              <button
                type="button"
                onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                disabled={partySize <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-cream/10 disabled:opacity-30"
                aria-label="Fewer guests"
              >
                −
              </button>
              <label htmlFor={id("partySize")} className="sr-only">
                Number of guests
              </label>
              <input
                id={id("partySize")}
                type="number"
                inputMode="numeric"
                min={1}
                max={maxPartySize}
                value={partyDraft ?? partySize}
                onChange={(e) => {
                  setPartyDraft(e.target.value);
                  const n = Number(e.target.value);
                  if (e.target.value !== "" && Number.isFinite(n)) setPartySize(Math.min(maxPartySize, Math.max(1, Math.round(n))));
                }}
                onBlur={() => setPartyDraft(null)}
                className="w-14 bg-transparent text-center font-serif text-3xl text-cream [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-describedby={id("party-hint")}
              />
              <button
                type="button"
                onClick={() => setPartySize((n) => Math.min(maxPartySize, n + 1))}
                disabled={partySize >= maxPartySize}
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-cream/10 disabled:opacity-30"
                aria-label="More guests"
              >
                +
              </button>
            </div>
            <p id={id("party-hint")} className="text-sm text-cream-dim">
              {pluralGuests(partySize)} · online bookings up to {maxPartySize}.{" "}
              {partySize >= maxPartySize && (
                <Link href="/private-events" className="text-gold underline">
                  Larger group?
                </Link>
              )}
            </p>
          </div>
        </fieldset>

        {/* 2. Date */}
        <fieldset>
          <legend className="flex items-baseline gap-3 font-serif text-2xl">
            <span className="font-sans text-sm text-gold">02</span> Date <span aria-hidden="true" className="text-gold">*</span>
          </legend>
          <div className="-mx-1 mt-5 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]" role="radiogroup" aria-label="Choose a date in the next two weeks">
            {dates.map((d) => {
              const closed = isClosed(d);
              const [, , day] = d.split("-");
              const wd = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
              const mon = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
              const selected = d === date;
              return (
                <label
                  key={d}
                  className={`relative flex min-w-[4.6rem] shrink-0 snap-start cursor-pointer flex-col items-center rounded-2xl border px-3 py-3 transition-all duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-light ${
                    closed
                      ? "cursor-not-allowed border-ink-500/60 text-cream-dim/60"
                      : selected
                        ? "border-gold bg-gold text-ink shadow-[0_10px_30px_-12px_rgba(205,168,94,0.7)]"
                        : "border-ink-500 hover:-translate-y-0.5 hover:border-cream/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="date"
                    value={d}
                    checked={selected}
                    disabled={closed}
                    onChange={() => {
                      setDate(d);
                      clearError("date");
                    }}
                    className="sr-only"
                    aria-label={`${formatDateLong(d)}${closed ? " (closed)" : ""}`}
                  />
                  <span className={`text-xs uppercase tracking-wider ${selected ? "text-ink/70" : ""}`}>{d === today ? "Today" : wd}</span>
                  <span className="mt-0.5 font-serif text-2xl leading-none">{Number(day)}</span>
                  <span className={`mt-1 text-[0.7rem] ${selected ? "text-ink/70" : "text-cream-dim"}`}>{closed ? "Closed" : mon}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor={id("date")} className="text-sm text-cream-muted">
              Or pick another date:
            </label>
            <input
              id={id("date")}
              type="date"
              min={today}
              max={maxDate}
              value={date}
              onChange={(e) => {
                if (e.target.value) {
                  setDate(e.target.value);
                  clearError("date");
                }
              }}
              className="field w-auto py-2"
              aria-invalid={Boolean(errors.date)}
            />
          </div>
          {errors.date && <p className="field-error">{errors.date}</p>}
        </fieldset>

        {/* 3. Time */}
        <fieldset aria-describedby={id("time-status")}>
          <legend className="flex items-baseline gap-3 font-serif text-2xl">
            <span className="font-sans text-sm text-gold">03</span> Time <span aria-hidden="true" className="text-gold">*</span>
          </legend>
          <p className="mt-2 text-sm text-cream-dim">{formatDateLong(date)} · {pluralGuests(partySize)}</p>

          <div id={id("time-status")} aria-live="polite" className="mt-5">
            {availability.status === "loading" && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label="Loading available times">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-12 animate-shimmer rounded-xl bg-[linear-gradient(90deg,#1C1915_0%,#26221C_50%,#1C1915_100%)] bg-[length:200%_100%]" />
                ))}
              </div>
            )}
            {availability.status === "error" && (
              <p className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-danger">
                {availability.message}{" "}
                <button type="button" className="underline" onClick={() => setReloadKey((k) => k + 1)}>
                  Try again
                </button>
              </p>
            )}
            {selectedService && selectedService.message && (
              <p className="mb-5 rounded-xl border border-gold/30 bg-gold/10 p-4 text-cream">{selectedService.message}</p>
            )}
            {selectedService && (
              <div className="space-y-6">
                {selectedService.services.map((svc) => (
                  <div key={svc.service}>
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cream-dim">{svc.label}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6" role="radiogroup" aria-label={`${svc.label} times`}>
                      {svc.slots.map((slot) => {
                        const selected = time === slot.time;
                        return (
                          <label
                            key={slot.time}
                            className={`relative flex h-12 items-center justify-center rounded-xl border text-base transition-all duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-light ${
                              !slot.available
                                ? "cursor-not-allowed border-ink-500/50 text-cream-dim/50 line-through"
                                : selected
                                  ? "cursor-pointer border-gold bg-gold font-medium text-ink"
                                  : "cursor-pointer border-ink-500 text-cream hover:-translate-y-0.5 hover:border-gold/60"
                            }`}
                          >
                            <input
                              id={slot.time === focusSlot ? id("time") : undefined}
                              type="radio"
                              name="time"
                              value={slot.time}
                              checked={selected}
                              disabled={!slot.available}
                              onChange={() => {
                                setTime(slot.time);
                                clearError("time");
                              }}
                              className="sr-only"
                              aria-label={`${slot.time}${!slot.available ? " — fully booked" : slot.limited ? " — few tables left" : ""}`}
                            />
                            {slot.time}
                            {slot.available && slot.limited && (
                              <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${selected ? "bg-ink" : "bg-gold"}`} aria-hidden="true" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedService.services.some((s) => s.slots.some((sl) => sl.limited)) && (
                  <p className="flex items-center gap-2 text-xs text-cream-dim">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" /> Few tables left
                  </p>
                )}
              </div>
            )}
          </div>
          {errors.time && <p className="field-error">{errors.time}</p>}
        </fieldset>

        {/* 4. Seating */}
        <fieldset>
          <legend className="flex items-baseline gap-3 font-serif text-2xl">
            <span className="font-sans text-sm text-gold">04</span> Seating preference
          </legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-3" role="radiogroup">
            {reservations.seatingOptions.map((opt, i) => {
              const selected = seating === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-light ${
                    selected ? "border-gold bg-gold/10" : "border-ink-500 hover:border-cream/40"
                  }`}
                >
                  <input
                    id={i === 0 ? id("seating") : undefined}
                    type="radio"
                    name="seating"
                    value={opt.id}
                    checked={selected}
                    onChange={() => setSeating(opt.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-cream">{opt.label}</span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-gold" : "border-cream/30"}`} aria-hidden="true">
                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-sm text-cream-dim">{opt.description}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-cream-dim">We&apos;ll do our best to honour your preference; it isn&apos;t guaranteed.</p>
        </fieldset>

        {/* 5. Details */}
        <fieldset>
          <legend className="flex items-baseline gap-3 font-serif text-2xl">
            <span className="font-sans text-sm text-gold">05</span> Your details
          </legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={id("name")} className="field-label">
                Full name <span aria-hidden="true" className="text-gold">*</span>
              </label>
              <input
                id={id("name")}
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                className="field"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? id("name-error") : undefined}
              />
              {errors.name && <p id={id("name-error")} className="field-error">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={id("phone")} className="field-label">
                Phone <span aria-hidden="true" className="text-gold">*</span>
              </label>
              <input
                id={id("phone")}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+40 7xx xxx xxx"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError("phone");
                }}
                className="field"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? id("phone-error") : undefined}
              />
              {errors.phone && <p id={id("phone-error")} className="field-error">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor={id("email")} className="field-label">
                Email <span aria-hidden="true" className="text-gold">*</span>
              </label>
              <input
                id={id("email")}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                className="field"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? id("email-error") : undefined}
              />
              {errors.email && <p id={id("email-error")} className="field-error">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor={id("occasion")} className="field-label">
                Occasion <span className="text-cream-dim">(optional)</span>
              </label>
              <select id={id("occasion")} value={occasion} onChange={(e) => setOccasion(e.target.value)} className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23CFC4B2%22><path d=%22M5 7l5 5 5-5z%22/></svg>')] bg-[length:1.25rem] bg-[right_0.9rem_center] bg-no-repeat pr-10">
                <option value="">No special occasion</option>
                {reservations.occasions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={id("notes")} className="field-label">
                Dietary requirements, allergies or requests <span className="text-cream-dim">(optional)</span>
              </label>
              <textarea
                id={id("notes")}
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  clearError("notes");
                }}
                className="field resize-y"
                placeholder="e.g. one vegetarian, nut allergy, high chair needed"
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={id("notes-count")}
              />
              <p id={id("notes-count")} className="mt-1.5 text-right text-xs text-cream-dim">
                {notes.length}/500
              </p>
              {errors.notes && <p className="field-error">{errors.notes}</p>}
            </div>
          </div>
        </fieldset>

        {/* Honeypot: hidden from people and assistive tech */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company
            <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
        </div>

        {/* Consent + submit */}
        <div className="space-y-6 border-t border-cream/10 pt-8">
          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                id={id("consent")}
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  clearError("consent");
                }}
                className="mt-1 h-5 w-5 shrink-0 accent-[#CDA85E]"
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? id("consent-error") : undefined}
              />
              <span className="text-sm leading-relaxed text-cream-muted">
                I agree that {site.legal.companyName} may use my details (including any dietary or allergy information I provide) to manage this
                reservation, as described in the{" "}
                <Link href="/privacy" target="_blank" className="text-gold underline hover:text-gold-light">
                  privacy policy<span className="sr-only"> (opens in new tab)</span>
                </Link>
                . <span aria-hidden="true" className="text-gold">*</span>
              </span>
            </label>
            {errors.consent && <p id={id("consent-error")} className="field-error">{errors.consent}</p>}
            <p className="mt-2 pl-8 text-xs text-cream-dim">We won&apos;t send marketing emails. Only messages about your booking.</p>
          </div>

          {(serverError || Object.values(errors).some(Boolean)) && (
            <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-danger">
              {serverError || "Please check the highlighted fields above."}
            </div>
          )}

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-cream-muted" aria-live="polite">
              {time ? (
                <>
                  <span className="text-cream">{formatDateLong(date)}</span> at <span className="text-cream">{time}</span> · {pluralGuests(partySize)}
                </>
              ) : (
                "Choose a time to continue"
              )}
            </p>
            <button type="submit" className="btn-primary w-full px-10 text-base sm:w-auto" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" />
                  Sending request…
                </>
              ) : (
                "Request reservation"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
