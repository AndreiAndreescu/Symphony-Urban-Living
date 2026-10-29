"use server";

import bcrypt from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { site } from "@/content/site-content";
import { coversByTime, serviceForSlot } from "@/lib/availability";
import { db } from "@/lib/db";
import { notifyGuestUpdate } from "@/lib/email/notify";
import { sendEmail } from "@/lib/email/send";
import type { ServiceId } from "@/lib/hours";
import { MENU_TAG } from "@/lib/menu";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { generateCode } from "@/lib/reservations";
import { authorize, getCurrentUser, getSession, passwordFingerprint } from "@/lib/session";
import { getBookingSettingsFresh, notificationRecipients, saveBookingSettings, SETTINGS_TAG } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";
import { formatDateLong, toMinutes } from "@/lib/time";
import {
  ACTIVE_STATUSES,
  adminReservationSchema,
  bookingSettingsSchema,
  fieldErrors,
  loginSchema,
  menuItemSchema,
  passwordField,
  STATUSES,
  teamUserSchema,
  type ReservationStatus,
} from "@/lib/validation";

export type ActionResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; canForce?: boolean };

const fail = (error: string, extra: Partial<Extract<ActionResult, { ok: false }>> = {}): ActionResult => ({ ok: false, error, ...extra });

async function guard<T extends ActionResult>(fn: () => Promise<T>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (error) {
    // redirect() works by throwing; let Next handle it
    if (error && typeof error === "object" && "digest" in error && String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[admin action]", error);
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}

// A real bcrypt hash so failed logins for unknown emails take the same time as wrong passwords
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password-placeholder", 10);

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return fail("Enter your email and password.");

  const ip = clientIp(await headers());
  const limit = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return fail(`Too many login attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`);

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.active) return fail("Incorrect email or password.");

  const session = await getSession();
  session.userId = user.id;
  session.pv = passwordFingerprint(user.passwordHash);
  await session.save();
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

export async function changeOwnPassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const current = await getCurrentUser();
  if (!current) return fail("Your session has expired. Please log in again.");
  const user = await db.user.findUniqueOrThrow({ where: { id: current.id } });

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const next = passwordField.safeParse(String(formData.get("newPassword") ?? ""));
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return fail("Your current password is incorrect.");
  if (!next.success) return fail(next.error.issues[0].message);
  if (next.data !== formData.get("confirmPassword")) return fail("The new passwords don't match.");

  const passwordHash = await bcrypt.hash(next.data, 12);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  const session = await getSession();
  session.pv = passwordFingerprint(passwordHash);
  await session.save();
  return { ok: true, message: "Password updated." };
}

// ─── Reservations ───────────────────────────────────────────────────────────

export async function setReservationStatus(
  id: string,
  status: ReservationStatus,
  options: { notifyGuest?: boolean; force?: boolean } = {},
): Promise<ActionResult> {
  return guard(async () => {
    const user = await authorize("bookings");
    if (!STATUSES.includes(status)) return fail("Unknown status.");
    const reservation = await db.reservation.findUnique({ where: { id } });
    if (!reservation) return fail("Reservation not found.");
    if (reservation.status === status) return { ok: true };

    // Re-activating a cancelled/no-show booking: make sure the slot still has room
    if (ACTIVE_STATUSES.includes(status) && !ACTIVE_STATUSES.includes(reservation.status) && !options.force) {
      const settings = await getBookingSettingsFresh();
      const rules = settings.services[reservation.service as ServiceId];
      const booked = (await coversByTime(reservation.date, db, reservation.id)).get(reservation.time) ?? 0;
      if (rules && booked + reservation.partySize > rules.maxCoversPerSlot) {
        return fail(`This slot is now full (${booked}/${rules.maxCoversPerSlot} covers booked).`, { canForce: true });
      }
    }

    const updated = await db.reservation.update({
      where: { id },
      data: { status, logs: { create: { action: status, actorName: user.name } } },
    });

    let message = "Updated.";
    if (options.notifyGuest && updated.email && (status === "confirmed" || status === "cancelled")) {
      const result = await notifyGuestUpdate(updated, status);
      message = result.ok ? "Updated — guest notified by email." : "Updated, but the guest email could not be sent.";
    }
    revalidatePath("/admin", "layout");
    return { ok: true, message };
  });
}

export async function saveReservation(input: unknown): Promise<ActionResult> {
  return guard(async () => {
    const user = await authorize("bookings");
    const parsed = adminReservationSchema.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
    const data = parsed.data;

    const existing = data.id ? await db.reservation.findUnique({ where: { id: data.id } }) : null;
    if (data.id && !existing) return fail("Reservation not found.");

    const settings = await getBookingSettingsFresh();
    const slotService = serviceForSlot(settings, data.date, data.time);
    const service: ServiceId = slotService ?? (toMinutes(data.time) < 17 * 60 ? "lunch" : "dinner");
    const willBeActive = ACTIVE_STATUSES.includes(existing ? existing.status : data.status);
    const slotChanged =
      !existing || existing.date !== data.date || existing.time !== data.time || existing.partySize !== data.partySize;

    if (willBeActive && slotChanged && !data.overrideCapacity) {
      if (!slotService) {
        return fail("That time is outside the booking schedule for this date. Tick “Override hours & capacity” to book it anyway.", {
          canForce: true,
        });
      }
      const max = settings.services[slotService].maxCoversPerSlot;
      const booked = (await coversByTime(data.date, db, existing?.id)).get(data.time) ?? 0;
      if (booked + data.partySize > max) {
        return fail(
          `Only ${Math.max(0, max - booked)} of ${max} covers left at ${data.time}. Tick “Override hours & capacity” to book anyway.`,
          { canForce: true },
        );
      }
    }

    const common = {
      date: data.date,
      time: data.time,
      service,
      partySize: data.partySize,
      seating: data.seating,
      name: data.name,
      email: data.email,
      phone: data.phone,
      occasion: data.occasion,
      notes: data.notes || null,
      internalNote: data.internalNote || null,
    };

    if (existing) {
      const moved = existing.date !== data.date || existing.time !== data.time;
      const detail = moved
        ? `${existing.date} ${existing.time} → ${data.date} ${data.time}${existing.partySize !== data.partySize ? `, party ${existing.partySize} → ${data.partySize}` : ""}`
        : existing.partySize !== data.partySize
          ? `Party ${existing.partySize} → ${data.partySize}`
          : "Details edited";
      const updated = await db.reservation.update({
        where: { id: existing.id },
        data: { ...common, logs: { create: { action: moved || existing.partySize !== data.partySize ? "rescheduled" : "edited", detail, actorName: user.name } } },
      });
      let message = "Reservation saved.";
      if ((moved || existing.partySize !== data.partySize) && data.notifyGuest && updated.email && updated.status !== "cancelled") {
        const r = await notifyGuestUpdate(updated, "rescheduled");
        message = r.ok ? "Saved — guest notified of the change." : "Saved, but the guest email could not be sent.";
      }
      revalidatePath("/admin", "layout");
      return { ok: true, message, id: updated.id };
    }

    let created = null;
    for (let attempt = 0; attempt < 4 && !created; attempt++) {
      try {
        created = await db.reservation.create({
          data: {
            ...common,
            code: generateCode(),
            status: data.status,
            source: "admin",
            consentAt: new Date(),
            consentVersion: "staff-entry",
            logs: { create: { action: "created", detail: `Added by staff (${data.status})`, actorName: user.name } },
          },
        });
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
    let message = "Reservation added.";
    if (created && data.notifyGuest && created.email && data.status === "confirmed") {
      const r = await notifyGuestUpdate(created, "confirmed");
      message = r.ok ? "Reservation added — confirmation emailed to the guest." : "Added, but the confirmation email could not be sent.";
    }
    revalidatePath("/admin", "layout");
    return { ok: true, message, id: created!.id };
  });
}

export async function deleteReservation(id: string): Promise<ActionResult> {
  const result = await guard(async () => {
    const user = await authorize("settings");
    const r = await db.reservation.delete({ where: { id } });
    console.log(`[admin] reservation ${r.code} permanently deleted by ${user.email}`);
    revalidatePath("/admin", "layout");
    return { ok: true } as const;
  });
  if (result.ok) redirect("/admin/reservations?deleted=1");
  return result;
}

// ─── Menu ───────────────────────────────────────────────────────────────────

export async function saveMenuItem(input: unknown): Promise<ActionResult> {
  return guard(async () => {
    await authorize("menu");
    const parsed = menuItemSchema.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
    const { id, tags, bottlePrice, ...rest } = parsed.data;
    const data = { ...rest, tags: tags.join(","), bottlePrice: rest.categoryId === "wine" ? bottlePrice : null };
    const item = id ? await db.menuItem.update({ where: { id }, data }) : await db.menuItem.create({ data });
    revalidateTag(MENU_TAG);
    revalidatePath("/admin/menu");
    return { ok: true, message: `“${item.name}” saved.`, id: item.id };
  });
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  return guard(async () => {
    await authorize("menu");
    await db.menuItem.delete({ where: { id } });
    revalidateTag(MENU_TAG);
    revalidatePath("/admin/menu");
    return { ok: true, message: "Item deleted." };
  });
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function saveSettings(input: unknown): Promise<ActionResult> {
  return guard(async () => {
    await authorize("settings");
    const parsed = bookingSettingsSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid settings.", { fieldErrors: fieldErrors(parsed.error) });
    const settings = { ...parsed.data, closedDates: Array.from(new Set(parsed.data.closedDates)).sort(), notifyEmails: Array.from(new Set(parsed.data.notifyEmails)) };
    await saveBookingSettings(settings);
    revalidateTag(SETTINGS_TAG);
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved. The website is updated." };
  });
}

export async function sendTestEmail(): Promise<ActionResult> {
  return guard(async () => {
    const user = await authorize("settings");
    const recipients = notificationRecipients(await getBookingSettingsFresh());
    if (recipients.length === 0) return fail("There are no notification addresses yet. Add one and save first.");
    const text = `This is a test notification from ${site.name}, sent by ${user.name} on ${formatDateLong(new Date().toISOString().slice(0, 10))}.\n\nIf you received this, new reservation alerts will reach this inbox.\n\nDashboard: ${siteUrl()}/admin`;
    const results = await Promise.all(
      recipients.map((to) =>
        sendEmail({ to, subject: `Test notification · ${site.name}`, text, html: `<p style="font-family:sans-serif">${text.replace(/\n/g, "<br>")}</p>` }),
      ),
    );
    if (results[0]?.provider === "console") {
      return { ok: true, message: "No email service is configured yet, so the test was printed to the server log instead of being sent. Add RESEND_API_KEY (see README)." };
    }
    const failed = results.filter((r) => !r.ok).length;
    return failed
      ? fail(`${failed} of ${recipients.length} test emails failed. Check the email settings and server logs.`)
      : { ok: true, message: `Test email sent to ${recipients.join(", ")}.` };
  });
}

// ─── Team ───────────────────────────────────────────────────────────────────

export async function saveTeamUser(input: unknown): Promise<ActionResult> {
  return guard(async () => {
    const me = await authorize("team");
    const parsed = teamUserSchema.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
    const { id, password, ...data } = parsed.data;

    const clash = await db.user.findUnique({ where: { email: data.email } });
    if (clash && clash.id !== id) return fail("Another login already uses that email.");

    if (!id) {
      if (!password) return fail("Set a password for the new login.", { fieldErrors: { password: "Required for new logins" } });
      await db.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 12) } });
      revalidatePath("/admin/team");
      return { ok: true, message: `Login created for ${data.email}. Share the password with them securely.` };
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return fail("User not found.");
    if (existing.id === me.id && (data.role !== existing.role || !data.active)) {
      return fail("You can't change your own role or deactivate yourself. Ask another admin.");
    }
    if (existing.role === "admin" && (data.role !== "admin" || !data.active)) {
      const admins = await db.user.count({ where: { role: "admin", active: true } });
      if (admins <= 1) return fail("There must always be at least one active admin.");
    }
    await db.user.update({
      where: { id },
      data: { ...data, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
    });
    revalidatePath("/admin/team");
    return { ok: true, message: password ? "Saved. The new password is active and old sessions were signed out." : "Saved." };
  });
}
