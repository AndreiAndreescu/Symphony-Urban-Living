import { ReservationForm } from "@/components/admin/ReservationForm";
import { PageTitle } from "@/components/admin/ui";
import { getBookingSettingsFresh } from "@/lib/settings";
import { requireUser } from "@/lib/session";
import { isValidDateString, zonedNow } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "New booking" };

export default async function NewReservationPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireUser("bookings");
  const params = await searchParams;
  const settings = await getBookingSettingsFresh();
  const date = params.date && isValidDateString(params.date) ? params.date : zonedNow().date;

  return (
    <div className="max-w-3xl">
      <PageTitle title="New booking" subtitle="For phone, walk-in or email reservations." />
      <ReservationForm
        settings={settings}
        initial={{ date, time: "", partySize: 2, seating: "indoor", name: "", email: "", phone: "", occasion: "", notes: "", internalNote: "", status: "confirmed" }}
      />
    </div>
  );
}
