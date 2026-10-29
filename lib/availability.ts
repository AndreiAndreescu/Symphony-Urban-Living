import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  periodsForDate,
  SERVICE_LABEL,
  slotsForPeriod,
  type BookingSettings,
  type ServiceId,
} from "@/lib/hours";
import { toMinutes, zonedNow } from "@/lib/time";
import { ACTIVE_STATUSES } from "@/lib/validation";

type Client = Prisma.TransactionClient | typeof db;

export type Slot = { time: string; available: boolean; limited: boolean };
export type ServiceAvailability = { service: ServiceId; label: string; slots: Slot[] };
export type DayAvailability = {
  date: string;
  open: boolean;
  message?: string;
  services: ServiceAvailability[];
};

export class BookingError extends Error {
  constructor(
    public code: "closed" | "unavailable" | "too_soon" | "too_far" | "too_large" | "invalid_time",
    message: string,
  ) {
    super(message);
  }
}

function daysBetween(from: string, to: string) {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** Minutes from "now" (restaurant time) until the given date + time. */
export function minutesUntil(date: string, time: string, now = new Date()) {
  const z = zonedNow(now);
  return daysBetween(z.date, date) * 1440 + toMinutes(time) - z.minutes;
}

/** Covers already booked per time on a date (active reservations only). */
export async function coversByTime(date: string, client: Client = db, excludeId?: string) {
  const rows = await client.reservation.groupBy({
    by: ["time"],
    where: { date, status: { in: ACTIVE_STATUSES }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    _sum: { partySize: true },
  });
  return new Map(rows.map((r) => [r.time, r._sum.partySize ?? 0]));
}

/** Finds which service a time belongs to on a date, or null if it's not a bookable slot. */
export function serviceForSlot(settings: BookingSettings, date: string, time: string): ServiceId | null {
  for (const period of periodsForDate(settings, date)) {
    if (slotsForPeriod(period, settings.services[period.service]).includes(time)) return period.service;
  }
  return null;
}

/** Public rules: open day, booking window, lead time, online party size limit. */
export function assertBookable(settings: BookingSettings, date: string, time: string, partySize: number): ServiceId {
  if (partySize > settings.maxPartySizeOnline) {
    throw new BookingError(
      "too_large",
      `Online bookings are for up to ${settings.maxPartySizeOnline} guests. For larger groups please call us or send an event enquiry.`,
    );
  }
  const days = daysBetween(zonedNow().date, date);
  if (days < 0) throw new BookingError("too_soon", "That date is in the past. Please choose another date.");
  if (days > settings.maxDaysAhead) {
    throw new BookingError("too_far", `We take reservations up to ${settings.maxDaysAhead} days in advance.`);
  }
  if (periodsForDate(settings, date).length === 0) {
    throw new BookingError("closed", "We're closed on that day. Please choose another date.");
  }
  const service = serviceForSlot(settings, date, time);
  if (!service) throw new BookingError("invalid_time", "That time isn't available. Please choose a listed time.");
  if (minutesUntil(date, time) < settings.minLeadMinutes) {
    throw new BookingError("too_soon", "That time is too soon to book online — please pick a later slot or call us.");
  }
  return service;
}

export async function getDayAvailability(
  settings: BookingSettings,
  date: string,
  partySize: number,
): Promise<DayAvailability> {
  const days = daysBetween(zonedNow().date, date);
  if (days < 0) return { date, open: false, message: "That date is in the past.", services: [] };
  if (days > settings.maxDaysAhead) {
    return { date, open: false, message: `We take reservations up to ${settings.maxDaysAhead} days ahead.`, services: [] };
  }
  const periods = periodsForDate(settings, date);
  if (periods.length === 0) {
    return { date, open: false, message: "We're closed on this day. Please choose another date.", services: [] };
  }
  if (partySize > settings.maxPartySizeOnline) {
    return {
      date,
      open: true,
      message: `For groups larger than ${settings.maxPartySizeOnline}, please call us or send an event enquiry.`,
      services: [],
    };
  }

  const booked = await coversByTime(date);
  const byService = new Map<ServiceId, Slot[]>();

  for (const period of periods) {
    const rules = settings.services[period.service];
    for (const time of slotsForPeriod(period, rules)) {
      if (minutesUntil(date, time) < settings.minLeadMinutes) continue; // hide past / too-soon slots
      const remaining = rules.maxCoversPerSlot - (booked.get(time) ?? 0);
      const list = byService.get(period.service) ?? [];
      list.push({
        time,
        available: remaining >= partySize,
        limited: remaining >= partySize && remaining - partySize < Math.max(4, rules.maxCoversPerSlot * 0.25),
      });
      byService.set(period.service, list);
    }
  }

  const services = (["lunch", "dinner"] as ServiceId[])
    .filter((s) => byService.has(s))
    .map((s) => ({ service: s, label: SERVICE_LABEL[s], slots: byService.get(s)! }));

  const anyAvailable = services.some((s) => s.slots.some((slot) => slot.available));
  return {
    date,
    open: true,
    services,
    message: services.length === 0
      ? "No more times left to book online today. Please choose another date."
      : anyAvailable
        ? undefined
        : "We're fully booked for this party size on this date. Try another day or a smaller party.",
  };
}
