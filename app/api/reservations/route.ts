import { NextResponse, type NextRequest } from "next/server";
import { BookingError } from "@/lib/availability";
import { notifyNewReservation } from "@/lib/email/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createWebsiteReservation } from "@/lib/reservations";
import { fieldErrors, reservationSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8_000;

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; JSON content-type still blocks cross-site form posts
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // CSRF protection: only accept JSON from our own pages
  if (!request.headers.get("content-type")?.includes("application/json") || !sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let json: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: "Request too large." }, { status: 413 });
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(json);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.company) return NextResponse.json({ error: "Invalid request." }, { status: 400 }); // honeypot hit
    return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors: errors }, { status: 400 });
  }

  // Rate limit: 5 booking attempts per 10 minutes per visitor. Counted after validation
  // so a guest correcting typos isn't locked out.
  const limit = await rateLimit(`reserve:${clientIp(request.headers)}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many booking attempts. Please wait ${Math.ceil(limit.retryAfterSec / 60)} minute(s) or call us.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  try {
    const reservation = await createWebsiteReservation(parsed.data);
    // Awaited so emails are delivered before the serverless function ends; failures are logged, never lost bookings
    await notifyNewReservation(reservation).catch((error) => console.error("[reservations] notify failed", reservation.code, error));

    return NextResponse.json(
      {
        reservation: {
          code: reservation.code,
          status: reservation.status,
          name: reservation.name,
          email: reservation.email,
          date: reservation.date,
          time: reservation.time,
          partySize: reservation.partySize,
          seating: reservation.seating,
          occasion: reservation.occasion,
          notes: reservation.notes,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    console.error("[reservations] create failed", error);
    return NextResponse.json({ error: "We couldn't save your booking. Please try again or call us." }, { status: 500 });
  }
}
