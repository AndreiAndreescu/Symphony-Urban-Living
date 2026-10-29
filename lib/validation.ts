import { z } from "zod";
import { dietaryTags, menuCategories } from "@/content/site-content";
import { isValidDateString } from "@/lib/time";

// Shared by the browser (instant feedback) and the server (source of truth).

export const SEATING = ["indoor", "terrace", "private"] as const;
export const OCCASIONS = ["birthday", "anniversary", "business", "other"] as const;
export const STATUSES = ["pending", "confirmed", "seated", "cancelled", "no_show"] as const;
export const ACTIVE_STATUSES: string[] = ["pending", "confirmed", "seated"];
export const ROLES = ["admin", "owner", "staff"] as const;

export type ReservationStatus = (typeof STATUSES)[number];
export type Role = (typeof ROLES)[number];

/** Removes control characters and surrounding whitespace. */
export function clean(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

const cleaned = () => z.string().transform(clean);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please choose a time");
const dateString = z.string().refine(isValidDateString, "Please choose a valid date");

export const phoneField = cleaned().pipe(
  z
    .string()
    .regex(/^\+?[\d\s().-]{7,22}$/, "Please enter a valid phone number")
    .refine((v) => v.replace(/\D/g, "").length >= 8, "Please enter a valid phone number"),
);

export const reservationSchema = z.object({
  name: cleaned().pipe(z.string().min(2, "Please enter your full name").max(80, "Name is too long")),
  email: z
    .string()
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.string().email("Please enter a valid email address").max(120)),
  phone: phoneField,
  date: dateString,
  time: hhmm,
  partySize: z.coerce.number().int().min(1, "Party size must be at least 1").max(50),
  seating: z.enum(SEATING, { errorMap: () => ({ message: "Please choose a seating preference" }) }),
  occasion: z
    .union([z.enum(OCCASIONS), z.literal("")])
    .optional()
    .transform((v) => v || null),
  notes: z
    .string()
    .optional()
    .transform((v) => (v ? clean(v) : ""))
    .pipe(z.string().max(500, "Please keep notes under 500 characters")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept the privacy policy so we can process your booking" }),
  }),
  // Honeypot — real people never see or fill this field.
  company: z.string().max(0).optional(),
});

export type ReservationFormInput = z.input<typeof reservationSchema>;
export type ReservationInput = z.output<typeof reservationSchema>;

export const availabilityQuerySchema = z.object({
  date: dateString,
  partySize: z.coerce.number().int().min(1).max(50),
});

// ─── Admin ──────────────────────────────────────────────────────────────────

const servicePeriodSchema = z
  .object({ service: z.enum(["lunch", "dinner"]), open: hhmm, close: hhmm })
  .refine((p) => p.open !== p.close, "Opening and closing time cannot be the same");

const serviceRulesSchema = z.object({
  maxCoversPerSlot: z.coerce.number().int().min(0).max(500),
  slotIntervalMinutes: z.coerce
    .number()
    .int()
    .refine((v) => [15, 20, 30, 45, 60].includes(v), "Interval must be 15, 20, 30, 45 or 60 minutes"),
  lastSeatingMinutesBeforeClose: z.coerce.number().int().min(0).max(360),
});

export const bookingSettingsSchema = z.object({
  hours: z.array(z.array(servicePeriodSchema).max(4)).length(7),
  services: z.object({ lunch: serviceRulesSchema, dinner: serviceRulesSchema }),
  maxPartySizeOnline: z.coerce.number().int().min(1).max(50),
  minLeadMinutes: z.coerce.number().int().min(0).max(7 * 24 * 60),
  maxDaysAhead: z.coerce.number().int().min(1).max(365),
  closedDates: z.array(dateString).max(365),
  notifyEmails: z.array(z.string().trim().toLowerCase().email("Invalid notification email")).max(25),
});

/** Used by staff to create (no id) or edit (with id) a reservation, e.g. phone bookings. */
export const adminReservationSchema = z.object({
  id: z.string().optional(),
  date: dateString,
  time: hhmm,
  partySize: z.coerce.number().int().min(1, "At least 1 guest").max(200),
  seating: z.enum(SEATING),
  name: cleaned().pipe(z.string().min(2, "Enter the guest's name").max(80)),
  email: z
    .string()
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.union([z.literal(""), z.string().email("Invalid email").max(120)])),
  phone: phoneField,
  occasion: z
    .union([z.enum(OCCASIONS), z.literal("")])
    .optional()
    .transform((v) => v || null),
  status: z.enum(STATUSES).default("confirmed"),
  notes: z
    .string()
    .optional()
    .transform((v) => (v ? clean(v) : ""))
    .pipe(z.string().max(500)),
  internalNote: z
    .string()
    .optional()
    .transform((v) => (v ? clean(v) : ""))
    .pipe(z.string().max(1000)),
  overrideCapacity: z.boolean().default(false),
  notifyGuest: z.boolean().default(true),
});

const categoryIds = menuCategories.map((c) => c.id) as [string, ...string[]];
const tagKeys = Object.keys(dietaryTags) as [string, ...string[]];

export const menuItemSchema = z.object({
  id: z.string().optional(),
  categoryId: z.enum(categoryIds),
  name: cleaned().pipe(z.string().min(1, "Name is required").max(100)),
  description: cleaned().pipe(z.string().max(300)),
  price: z.coerce.number().int("Use whole RON").min(0).max(100000),
  bottlePrice: z
    .union([z.coerce.number().int().min(0).max(1000000), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  tags: z.array(z.enum(tagKeys)).default([]),
  isSpecial: z.boolean().default(false),
  available: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

export const passwordField = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Use letters and at least one number");

export const teamUserSchema = z.object({
  id: z.string().optional(),
  name: cleaned().pipe(z.string().min(2).max(80)),
  email: z
    .string()
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.string().email().max(120)),
  role: z.enum(ROLES),
  password: z.union([passwordField, z.literal("")]).optional(),
  active: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z
    .string()
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.string().email("Enter your email")),
  password: z.string().min(1, "Enter your password").max(128),
});

/** Flattens zod issues to { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
