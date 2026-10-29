import type { Reservation } from "@prisma/client";
import { site } from "@/content/site-content";
import { sendEmail } from "@/lib/email/send";
import { guestRequestReceivedEmail, guestStatusEmail, staffNewReservationEmail, type GuestUpdateKind } from "@/lib/email/templates";
import { getBookingSettingsFresh, notificationRecipients } from "@/lib/settings";

/** Guest confirmation + one notification to every owner/staff/admin address. */
export async function notifyNewReservation(reservation: Reservation) {
  const settings = await getBookingSettingsFresh();
  const recipients = notificationRecipients(settings);

  const guest = guestRequestReceivedEmail(reservation);
  const staff = staffNewReservationEmail(reservation);

  const results = await Promise.allSettled([
    sendEmail({ to: reservation.email, ...guest }),
    // Sent individually so staff never see each other's addresses and one bad address doesn't block the rest
    ...recipients.map((to) => sendEmail({ to, ...staff, replyTo: reservation.email })),
  ]);

  if (recipients.length === 0) {
    console.warn("[email] NOTIFY_EMAILS is empty — nobody was notified about reservation", reservation.code);
  }
  return results;
}

export async function notifyGuestUpdate(reservation: Reservation, kind: GuestUpdateKind) {
  const email = guestStatusEmail(reservation, kind);
  return sendEmail({ to: reservation.email, ...email, replyTo: process.env.EMAIL_REPLY_TO || site.contact.email });
}
