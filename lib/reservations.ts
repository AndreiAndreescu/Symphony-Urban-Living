import { randomInt } from "node:crypto";
import { Prisma, type Reservation } from "@prisma/client";
import { site } from "@/content/site-content";
import { assertBookable, BookingError, coversByTime } from "@/lib/availability";
import { db } from "@/lib/db";
import { getBookingSettingsFresh } from "@/lib/settings";
import type { ReservationInput } from "@/lib/validation";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

export function generateCode() {
  let code = "";
  for (let i = 0; i < 5; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `SU-${code}`;
}

function isRetryable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2034" || error.code === "P2002")
  );
}

/**
 * Creates a website reservation after re-checking every rule and the live
 * capacity inside a serializable transaction (so two guests can't grab the
 * last seats at the same moment).
 */
export async function createWebsiteReservation(input: ReservationInput): Promise<Reservation> {
  const settings = await getBookingSettingsFresh();
  const service = assertBookable(settings, input.date, input.time, input.partySize);
  const rules = settings.services[service];

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db.$transaction(
        async (tx) => {
          const booked = (await coversByTime(input.date, tx)).get(input.time) ?? 0;
          if (booked + input.partySize > rules.maxCoversPerSlot) {
            throw new BookingError(
              "unavailable",
              "Sorry — that time was just booked up. Please choose another time.",
            );
          }
          return tx.reservation.create({
            data: {
              code: generateCode(),
              status: "pending",
              date: input.date,
              time: input.time,
              service,
              partySize: input.partySize,
              seating: input.seating,
              name: input.name,
              email: input.email,
              phone: input.phone,
              occasion: input.occasion,
              notes: input.notes || null,
              consentAt: new Date(),
              consentVersion: site.legal.consentVersion,
              source: "website",
              logs: { create: { action: "created", detail: "Requested on website" } },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10_000 },
      );
    } catch (error) {
      if (isRetryable(error) && attempt < 3) continue;
      throw error;
    }
  }
  throw new Error("Could not create reservation");
}
