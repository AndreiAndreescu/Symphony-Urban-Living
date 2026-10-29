import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteReservationButton } from "@/components/admin/DeleteReservationButton";
import { ReservationForm } from "@/components/admin/ReservationForm";
import { StatusActions } from "@/components/admin/StatusActions";
import { Meta, PageTitle, StatusBadge, formatTimestamp } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { pluralGuests } from "@/lib/format";
import { can } from "@/lib/roles";
import { getBookingSettingsFresh } from "@/lib/settings";
import { requireUser } from "@/lib/session";
import { formatDateLong } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reservation" };

export default async function ReservationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireUser("bookings");
  const { id } = await params;
  const { created } = await searchParams;
  const [reservation, settings] = await Promise.all([
    db.reservation.findUnique({ where: { id }, include: { logs: { orderBy: { createdAt: "desc" } } } }),
    getBookingSettingsFresh(),
  ]);
  if (!reservation) notFound();
  const r = reservation;

  return (
    <>
      <Link href={`/admin?date=${r.date}`} className="mb-4 inline-block text-sm text-cream-dim hover:text-cream">
        ← Back to {formatDateLong(r.date)}
      </Link>
      <PageTitle
        title={r.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-cream">{formatDateLong(r.date)} at {r.time}</span> · {pluralGuests(r.partySize)} ·
            <span className="font-mono text-sm">{r.code}</span> <StatusBadge status={r.status} />
          </span>
        }
      />

      {created && <p role="status" className="mb-6 rounded-xl border border-success/40 bg-success/10 p-3 text-success">Reservation added.</p>}

      <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-xl">Status</h2>
            <StatusActions id={r.id} status={r.status} hasEmail={Boolean(r.email)} showNotifyToggle />
          </section>

          <section>
            <h2 className="mb-4 text-2xl">Edit or reschedule</h2>
            <ReservationForm
              settings={settings}
              initial={{
                id: r.id,
                date: r.date,
                time: r.time,
                partySize: r.partySize,
                seating: r.seating,
                name: r.name,
                email: r.email,
                phone: r.phone,
                occasion: r.occasion ?? "",
                notes: r.notes ?? "",
                internalNote: r.internalNote ?? "",
                status: r.status,
              }}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card space-y-3 p-5 text-sm">
            <h2 className="text-xl">Contact</h2>
            <p><a href={`tel:${r.phone.replace(/\s/g, "")}`} className="text-gold-light underline">{r.phone}</a></p>
            {r.email && <p><a href={`mailto:${r.email}`} className="break-all text-gold-light underline">{r.email}</a></p>}
            <Meta reservation={r} />
            {r.notes && <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-gold-light">⚠ {r.notes}</p>}
          </section>

          <section className="card p-5 text-sm">
            <h2 className="text-xl">Activity</h2>
            <ol className="mt-4 space-y-3 border-l border-cream/10 pl-4">
              {r.logs.map((log) => (
                <li key={log.id}>
                  <p className="text-cream">
                    <span className="capitalize">{log.action.replace("_", "-")}</span>
                    {log.detail && <span className="text-cream-muted"> — {log.detail}</span>}
                  </p>
                  <p className="text-xs text-cream-dim">
                    {formatTimestamp(log.createdAt)} · {log.actorName ?? "Guest (website)"}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-5 text-xs leading-relaxed text-cream-dim">
            <h2 className="mb-2 text-base text-cream">Privacy record</h2>
            <p>Source: {r.source === "website" ? "website booking" : "added by staff"}</p>
            <p>Consent: {formatTimestamp(r.consentAt)} (policy {r.consentVersion})</p>
            {can(user.role, "settings") && (
              <div className="mt-4 border-t border-cream/10 pt-4">
                <p className="mb-2">Guest asked for their data to be erased? Delete this reservation permanently.</p>
                <DeleteReservationButton id={r.id} />
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
