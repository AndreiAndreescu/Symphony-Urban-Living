import { createHash } from "node:crypto";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, type Permission } from "@/lib/roles";
import type { Role } from "@/lib/validation";

export type SessionData = { userId?: string; pv?: string };
export type CurrentUser = { id: string; name: string; email: string; role: Role };

export const SESSION_COOKIE = "su_admin";
const DEV_SECRET = "dev-only-secret-change-me-0123456789abcdef";

function sessionPassword() {
  const secret = process.env.SESSION_SECRET ?? "";
  const isPlaceholder = !secret || secret.startsWith("replace-me");
  if (secret.length >= 32 && !isPlaceholder) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  return DEV_SECRET;
}

function sessionOptions(): SessionOptions {
  return {
    password: sessionPassword(),
    cookieName: SESSION_COOKIE,
    ttl: 60 * 60 * 12, // 12 hours — a full service day
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

/** Changes whenever the password changes, which signs out old sessions. */
export function passwordFingerprint(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.active || session.pv !== passwordFingerprint(user.passwordHash)) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
}

/** For pages: redirects to login (or dashboard) when not allowed. */
export async function requireUser(permission?: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

/** For server actions: throws instead of redirecting. */
export async function authorize(permission: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please log in again.");
  if (!can(user.role, permission)) throw new Error("You don't have permission to do that.");
  return user;
}
