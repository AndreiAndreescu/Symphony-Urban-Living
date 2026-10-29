import Link from "next/link";
import { PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { periodsForDate } from "@/lib/hours";
import { getBookingSettingsFresh } from "@/lib/settings";
import { requireUser } from "@/lib/session";
import { monthLabel, zonedNow } from "@/lib/time";
import { ACTIVE_STATUSES } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar" };

const pad = (n: number) => String(n).padStart(2, "0");

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireUser("bookings");
  const { month } = await searchParams;
  const today = zonedNow().date;
  const [y, m] = /^\d{4}-\d{2}$/.test(month ?? "") ? month!.split("-").map(Number) : [Number(today.slice(0, 4)), Number(today.slice(5, 7))];

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const first = `${y}-${pad(m)}-01`;
  const last = `${y}-${pad(m)}-${pad(daysInMonth)}`;
  const leading = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday-first

  const [settings, stats, pending] = await Promise.all([
    getBookingSettingsFresh(),
    db.reservation.groupBy({
      by: ["date"],
      where: { date: { gte: first, lte: last }, status: { in: ACTIVE_STATUSES } },
      _sum: { partySize: true },
      _count: true,
    }),
    db.reservation.groupBy({ by: ["date"], where: { date: { gte: first, lte: last }, status: "pending" }, _count: true }),
  ]);
  const statMap = new Map(stats.map((s) => [s.date, s]));
  const pendingMap = new Map(pending.map((p) => [p.date, p._count]));
  const maxCovers = Math.max(1, ...stats.map((s) => s._sum.partySize ?? 0));

  const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
  const monthTotal = stats.reduce((s, d) => s + (d._sum.partySize ?? 0), 0);

  return (
    <>
      <PageTitle title={monthLabel(y, m - 1)} subtitle={`${stats.reduce((s, d) => s + d._count, 0)} bookings · ${monthTotal} covers`}>
        <Link href={`?month=${prev}`} className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5" aria-label="Previous month">←</Link>
        <Link href="/admin/calendar" className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5">This month</Link>
        <Link href={`?month=${next}`} className="rounded-lg border border-cream/15 px-3 py-2 text-sm hover:bg-cream/5" aria-label="Next month">→</Link>
      </PageTitle>

      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-1.5">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="pb-2 text-center text-xs uppercase tracking-wider text-cream-dim">{d}</div>
          ))}
          {Array.from({ length: leading }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = `${y}-${pad(m)}-${pad(i + 1)}`;
            const s = statMap.get(date);
            const covers = s?._sum.partySize ?? 0;
            const closed = periodsForDate(settings, date).length === 0;
            const p = pendingMap.get(date) ?? 0;
            return (
              <Link
                key={date}
                href={`/admin?date=${date}`}
                className={`group relative flex min-h-[6.5rem] flex-col rounded-xl border p-2.5 transition-colors hover:border-gold/50 ${
                  date === today ? "border-gold bg-gold/5" : "border-cream/10 bg-ink-800"
                } ${date < today ? "opacity-60" : ""}`}
              >
                <span className="flex items-center justify-between text-sm">
                  <span className={date === today ? "font-semibold text-gold-light" : "text-cream"}>{i + 1}</span>
                  {p > 0 && <span className="rounded-full bg-gold px-1.5 text-[0.65rem] font-semibold text-ink" title={`${p} pending`}>{p}</span>}
                </span>
                {closed ? (
                  <span className="mt-auto text-xs text-cream-dim">Closed</span>
                ) : (
                  <span className="mt-auto">
                    <span className="block text-xs text-cream-muted">{s ? `${s._count} bk · ${covers} cv` : "—"}</span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-cream/5">
                      <span className="block h-full rounded-full bg-gradient-to-r from-emerald-light to-gold" style={{ width: `${(covers / maxCovers) * 100}%` }} />
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-xs text-cream-dim">bk = bookings, cv = covers (guests). Gold badge = requests waiting for confirmation. Click a day to open it.</p>
    </>
  );
}
