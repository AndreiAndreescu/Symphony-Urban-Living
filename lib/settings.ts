import { unstable_cache } from "next/cache";
import { defaultBookingSettings } from "@/content/site-content";
import { db } from "@/lib/db";
import type { BookingSettings } from "@/lib/hours";
import { bookingSettingsSchema } from "@/lib/validation";

export const SETTINGS_KEY = "booking";
export const SETTINGS_TAG = "settings";

export function defaultSettings(): BookingSettings {
  return structuredClone(defaultBookingSettings) as BookingSettings;
}

async function loadSettings(): Promise<BookingSettings> {
  try {
    const row = await db.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return defaultSettings();
    const parsed = bookingSettingsSchema.safeParse({ ...defaultSettings(), ...JSON.parse(row.value) });
    return parsed.success ? (parsed.data as BookingSettings) : defaultSettings();
  } catch (error) {
    console.error("[settings] falling back to defaults:", error);
    return defaultSettings();
  }
}

/** Cached; invalidated with revalidateTag("settings") when saved in /admin. */
export const getBookingSettings = unstable_cache(loadSettings, ["booking-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: 300,
});

/** Uncached read for admin screens and booking writes. */
export const getBookingSettingsFresh = loadSettings;

export async function saveBookingSettings(settings: BookingSettings) {
  await db.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: JSON.stringify(settings) },
    update: { value: JSON.stringify(settings) },
  });
}

/** NOTIFY_EMAILS env var + addresses added in /admin → Settings, de-duplicated. */
export function notificationRecipients(settings: BookingSettings): string[] {
  const fromEnv = envNotifyEmails();
  return Array.from(new Set([...fromEnv, ...settings.notifyEmails.map((e) => e.toLowerCase())]));
}

export function envNotifyEmails(): string[] {
  return (process.env.NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}
