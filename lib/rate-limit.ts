import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Database-backed sliding-window rate limiter. Works across serverless function
 * instances (unlike an in-memory counter) without any extra service.
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const hashedKey = hashKey(key);

  const count = await db.rateLimitHit.count({ where: { key: hashedKey, createdAt: { gte: since } } });
  if (count >= limit) {
    const oldest = await db.rateLimitHit.findFirst({
      where: { key: hashedKey, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterSec = oldest ? Math.ceil((oldest.createdAt.getTime() + windowMs - Date.now()) / 1000) : 60;
    return { ok: false as const, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  await db.rateLimitHit.create({ data: { key: hashedKey } });

  // Occasional clean-up of old rows
  if (Math.random() < 0.05) {
    await db.rateLimitHit
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
      .catch(() => undefined);
  }
  return { ok: true as const };
}

/** IPs are hashed before storage (GDPR: no raw IP addresses kept). */
function hashKey(key: string) {
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? "symphony"}:${key}`)
    .digest("hex")
    .slice(0, 40);
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
