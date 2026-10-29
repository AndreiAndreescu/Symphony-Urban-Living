import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { StatusActions } from "@/components/admin/StatusActions";
import { Meta, PageTitle, StatusBadge } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { pluralGuests } from "@/lib/format";
import { periodsForDate, SERVICE_LABEL, type ServiceId } from "@/lib/hours";
import { getBookingSettingsFresh } from "@/lib/settings";
import { requireUser } from "@/lib/session";
import { addDays, formatDateLong, formatDateShort, isValidDateString, zonedNow } from "@/lib/time";
import { ACTIVE_STATUSES } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today" };

export default async function DayView({ searchParams }: { searchParams: Promise<{ date?: string; denied?: string }> }) {
  await requireUser("bookings");
  const params = await searchParams;
  const today = zonedNow().date;
  const date = params.date && isValidDateString(params.date) ? params.date : today;
  const isToday = date === today;

  const [reservations, settings, pendingUpcoming, week] = await Promise.all([
    db.reservation.findMany({ where: { date }, orderBy: [{ time: "asc" }, { createdAt: "asc" }] }),
    getBookingSettingsFresh(),
    db.reservation.count({ where: { status: "pending", date: { gte: today } } }),
    db.reservation.groupBy({
      by: ["date"],
      where: { date: { gte: today, lte: addDays(today, 6) }, status: { in: ACTIVE_STATUSES } },
      _sum: { partySize: true },
      _count: true,
    }),
  ]);

  const active = reservations.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const inactive = reservations.filter((r) => !ACTIVE_STATUSES.includes(r.status));
  const covers = (service: ServiceId) => active.filter((r) => r.service === service).reduce((s, r) => s + r.partySize, 0);
  const periods = periodsForDate(settings, date);
  const weekMap = new Map(week.map((w) => [w.date, w]));
  const weekMax = Math.max(1, ...week.map((w) => w._sum.partySize ?? 0));

  // Group active reservations by time for a quick "timeline" glance
  const byTime = new Map<string, typeof active>();
  for (const r of active) byTime.set(r.time, [...(byTime.get(r.time) ?? []), r]);

  return (
    <>
      {params.denied && (
        <p role="alert" className="mb-6 rounded-xl border border-danger/40 bg-danger/10 p-4 text-danger">
          You don&apos;t have permission to open that page.
        </p>
      )}

      <PageTitle
        title={isToday ? "Today's reservations" : formatDateShort(date)}
        subtitle={
          <span className="flex flex-wrap items-center gap-3">
            {formatDateLong(date)}
            {periods.length === 0 && <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-xs text-danger">Closed</span>}
          </span>
        }
      >
        <Link href={`/admin?date=${addDays(date, -1)}`} className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5" aria-label="Previous day">
          ←
        </Link>
        {!isToday && (
          <Link href="/admin" className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5">
            Today
          </Link>
        )}
        <Link href={`/admin?date=${addDays(date, 1)}`} className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5" aria-label="Next day">
          →
        </Link>
        <form action="/admin" className="flex">
          <label htmlFor="jump-date" className="sr-only">Go to date</label>
          <input id="jump-date" type="date" name="date" defaultValue={date} className="field w-auto py-2 text-sm" />
          <button className="ml-2 rounded-lg border border-cream/15 px-3 text-sm hover:bg-cream/5">Go</button>
        </form>
        <AutoRefresh />
      </PageTitle>

      {pendingUpcoming > 0 && (
        <Link
          href="/admin/reservations?status=pending"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-gold/40 bg-gold/10 px-5 py-4 text-gold-light transition-colors hover:bg-gold/15"
        >
          <span>
            <strong>{pendingUpcoming}</strong> {pendingUpcoming === 1 ? "request is" : "requests are"} waiting for confirmation
          </span>
          <span aria-hidden="true">Review →</span>
        </Link>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(["lunch", "dinner"] as ServiceId[]).map((s) => {
          const open = periods.some((p) => p.service === s);
          return (
            <div key={s} className="card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">{SERVICE_LABEL[s]} covers</p>
              <p className="mt-2 font-serif text-4xl">{open ? covers(s) : "—"}</p>
              <p className="mt-1 text-xs text-cream-dim">
                {open ? `${periods.filter((p) => p.service === s).map((p) => `${p.open}–${p.close}`).join(", ")} · max ${settings.services[s].maxCoversPerSlot}/slot` : "Not open"}
              </p>
            </div>
          );
        })}
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">Bookings</p>
          <p className="mt-2 font-serif text-4xl">{active.length}</p>
          <p className="mt-1 text-xs text-cream-dim">
            {active.filter((r) => r.status === "pending").length} pending · {active.filter((r) => r.status === "seated").length} seated
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">Allergies / notes</p>
          <p className="mt-2 font-serif text-4xl">{active.filter((r) => r.notes).length}</p>
          <p className="mt-1 text-xs text-cream-dim">tables with notes</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_18rem]">
        {/* Timeline */}
        <section aria-label="Reservations by time">
          {active.length === 0 ? (
            <div className="card p-10 text-center text-cream-muted">
              No active reservations for this day.{" "}
              <Link href="/admin/reservations/new" className="text-gold underline">
                Add a phone booking
              </Link>
            </div>
          ) : (
            <ol className="space-y-6">
              {Array.from(byTime.entries()).map(([time, list]) => (
                <li key={time} className="grid grid-cols-[4rem_1fr] gap-4 sm:grid-cols-[5rem_1fr]">
                  <div className="pt-4">
                    <p className="font-serif text-2xl text-gold-light">{time}</p>
                    <p className="text-xs text-cream-dim">{list.reduce((s, r) => s + r.partySize, 0)} covers</p>
                  </div>
                  <ul className="space-y-3">
                    {list.map((r) => (
                      <li
                        key={r.id}
                        className={`card p-4 sm:p-5 ${r.status === "pending" ? "border-gold/40" : ""} ${r.status === "seated" ? "opacity-70" : ""}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link href={`/admin/reservations/${r.id}`} className="text-lg font-medium text-cream hover:text-gold-light">
                                {r.name}
                              </Link>
                              <StatusBadge status={r.status} />
                            </div>
                            <p className="mt-1 text-sm text-cream-muted">
                              <span className="font-semibold text-cream">{pluralGuests(r.partySize)}</span> ·{" "}
                              <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="underline decoration-cream/30 hover:text-cream">
                                {r.phone}
                              </a>{" "}
                              · <span className="font-mono text-xs">{r.code}</span>
                            </p>
                            <div className="mt-2">
                              <Meta reservation={r} />
                            </div>
                            {r.notes && (
                              <p className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-light">⚠ {r.notes}</p>
                            )}
                            {r.internalNote && <p className="mt-2 text-sm italic text-cream-dim">Staff: {r.internalNote}</p>}
                          </div>
                          <StatusActions id={r.id} status={r.status} hasEmail={Boolean(r.email)} compact />
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}

          {inactive.length > 0 && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-cream-dim hover:text-cream">
                {inactive.length} cancelled / no-show
              </summary>
              <ul className="mt-3 divide-y divide-cream/10 rounded-xl border border-cream/10">
                {inactive.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                    <Link href={`/admin/reservations/${r.id}`} className="text-cream-muted hover:text-cream">
                      {r.time} · {r.name} · {pluralGuests(r.partySize)}
                    </Link>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        {/* Next 7 days */}
        <aside className="card h-fit p-5">
          <h2 className="text-xl">Next 7 days</h2>
          <ul className="mt-4 space-y-2">
            {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d, i) => {
              const w = weekMap.get(d);
              const c = w?._sum.partySize ?? 0;
              const closed = periodsForDate(settings, d).length === 0;
              return (
                <li key={d}>
                  <Link href={`/admin?date=${d}`} className={`block rounded-lg px-2 py-2 hover:bg-cream/5 ${d === date ? "bg-cream/5" : ""}`}>
                    <span className="flex justify-between text-sm">
                      <span className={closed ? "text-cream-dim" : "text-cream"}>{i === 0 ? "Today" : formatDateShort(d)}</span>
                      <span className="text-cream-muted">{closed ? "Closed" : `${w?._count ?? 0} bk · ${c} cv`}</span>
                    </span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-cream/5">
                      <span className="block h-full rounded-full bg-gradient-to-r from-emerald-light to-gold" style={{ width: `${(c / weekMax) * 100}%` }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/admin/calendar" className="mt-4 inline-block text-sm text-gold hover:text-gold-light">
            Open calendar →
          </Link>
        </aside>
      </div>
    </>
  );
}
