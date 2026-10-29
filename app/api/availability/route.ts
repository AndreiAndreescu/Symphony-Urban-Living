import { NextResponse, type NextRequest } from "next/server";
import { getDayAvailability } from "@/lib/availability";
import { getBookingSettings } from "@/lib/settings";
import { availabilityQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const parsed = availabilityQuerySchema.safeParse({
    date: request.nextUrl.searchParams.get("date"),
    partySize: request.nextUrl.searchParams.get("partySize"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a valid date and party size." }, { status: 400 });
  }

  try {
    const settings = await getBookingSettings();
    const availability = await getDayAvailability(settings, parsed.data.date, parsed.data.partySize);
    return NextResponse.json(availability, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[availability]", error);
    return NextResponse.json({ error: "Availability is temporarily unavailable. Please call us." }, { status: 500 });
  }
}
