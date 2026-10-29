import { fromMinutes, toMinutes, weekdayOf, zonedNow } from "@/lib/time";

// Shared by server and browser (no database access in this file).

export type ServiceId = "lunch" | "dinner";

export type ServicePeriod = { service: ServiceId; open: string; close: string };

/** Index 0 = Sunday … 6 = Saturday. An empty array means closed that day. */
export type WeeklyHours = ServicePeriod[][];

export type ServiceRules = {
  maxCoversPerSlot: number; // total guests that may start in the same time slot
  slotIntervalMinutes: number; // 15 or 30
  lastSeatingMinutesBeforeClose: number;
};

export type BookingSettings = {
  hours: WeeklyHours;
  services: Record<ServiceId, ServiceRules>;
  maxPartySizeOnline: number;
  minLeadMinutes: number; // earliest booking = now + lead time
  maxDaysAhead: number;
  closedDates: string[]; // YYYY-MM-DD
  notifyEmails: string[];
};

export const SERVICE_LABEL: Record<ServiceId, string> = { lunch: "Lunch", dinner: "Dinner" };

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Periods that are open on the given calendar date (honouring closed dates). */
export function periodsForDate(settings: Pick<BookingSettings, "hours" | "closedDates">, date: string) {
  if (settings.closedDates.includes(date)) return [];
  return settings.hours[weekdayOf(date)] ?? [];
}

/** All bookable start times for one service period. */
export function slotsForPeriod(period: ServicePeriod, rules: ServiceRules): string[] {
  const start = toMinutes(period.open);
  let end = toMinutes(period.close);
  if (end <= start) end += 24 * 60; // closes after midnight
  const last = end - rules.lastSeatingMinutesBeforeClose;
  const out: string[] = [];
  for (let t = start; t <= last; t += rules.slotIntervalMinutes) {
    if (t >= 24 * 60) break; // do not offer slots on the next calendar day
    out.push(fromMinutes(t));
  }
  return out;
}

export type OpenState = {
  isOpen: boolean;
  label: string; // "Open now · until 23:00" / "Closed · opens today at 18:30"
  current?: ServicePeriod;
};

/** Live open/closed status for the contact page and footer. */
export function computeOpenState(
  settings: Pick<BookingSettings, "hours" | "closedDates">,
  now: Date = new Date(),
): OpenState {
  const z = zonedNow(now);

  // A period from yesterday that runs past midnight may still be open.
  const yesterday = shiftDate(z.date, -1);
  for (const p of periodsForDate(settings, yesterday)) {
    const o = toMinutes(p.open);
    const c = toMinutes(p.close);
    if (c <= o && z.minutes < c) {
      return { isOpen: true, label: `Open now · until ${p.close}`, current: p };
    }
  }

  const today = periodsForDate(settings, z.date);
  for (const p of today) {
    const o = toMinutes(p.open);
    let c = toMinutes(p.close);
    if (c <= o) c += 24 * 60;
    if (z.minutes >= o && z.minutes < c) {
      return { isOpen: true, label: `Open now · ${p.service} until ${p.close}`, current: p };
    }
  }

  const laterToday = today.filter((p) => toMinutes(p.open) > z.minutes).sort((a, b) => a.open.localeCompare(b.open));
  if (laterToday.length) return { isOpen: false, label: `Closed · opens today at ${laterToday[0].open}` };

  for (let i = 1; i <= 14; i++) {
    const d = shiftDate(z.date, i);
    const periods = periodsForDate(settings, d);
    if (periods.length) {
      const first = [...periods].sort((a, b) => a.open.localeCompare(b.open))[0];
      const when = i === 1 ? "tomorrow" : WEEKDAYS[weekdayOf(d)];
      return { isOpen: false, label: `Closed · opens ${when} at ${first.open}` };
    }
  }
  return { isOpen: false, label: "Closed" };
}

function shiftDate(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Groups consecutive days with identical hours, e.g. "Tue – Thu". */
export function summariseHours(hours: WeeklyHours) {
  const order = [1, 2, 3, 4, 5, 6, 0]; // Monday first
  const key = (day: number) => JSON.stringify(hours[day] ?? []);
  const rows: { days: string; periods: ServicePeriod[] }[] = [];
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && key(order[j + 1]) === key(order[i])) j++;
    const a = WEEKDAYS[order[i]].slice(0, 3);
    const b = WEEKDAYS[order[j]].slice(0, 3);
    rows.push({ days: i === j ? WEEKDAYS[order[i]] : `${a} – ${b}`, periods: hours[order[i]] ?? [] });
    i = j + 1;
  }
  return rows;
}
