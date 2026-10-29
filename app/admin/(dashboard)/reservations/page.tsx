import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Meta, PageTitle, StatusBadge, formatTimestamp } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { formatDateShort, isValidDateString, zonedNow } from "@/lib/time";
import { STATUSES } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reservations" };

const PAGE_SIZE = 50;
const isPostgres = /^postgres/i.test(process.env.DATABASE_URL ?? "");

type Search = { q?: string; from?: string; to?: string; status?: string; party?: string; page?: string; deleted?: string };

export default async function ReservationsList({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser("bookings");
  const params = await searchParams;
  const today = zonedNow().date;

  const q = (params.q ?? "").trim().slice(0, 80);
  const from = params.from && isValidDateString(params.from) ? params.from : params.from === "" ? "" : today;
  const to = params.to && isValidDateString(params.to) ? params.to : "";
  const status = STATUSES.includes(params.status as never) ? params.status! : params.status === "all" ? "all" : "active";
  const party = Number(params.party) || 0;
  const page = Math.max(1, Number(params.page) || 1);

  const insensitive = isPostgres ? ({ mode: "insensitive" } as object) : {};
  const where: Prisma.ReservationWhereInput = {
    ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    ...(status === "active" ? { status: { in: ["pending", "confirmed", "seated"] } } : status === "all" ? {} : { status }),
    ...(party ? (party >= 8 ? { partySize: { gte: 8 } } : { partySize: party }) : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, ...insensitive } },
            { email: { contains: q.toLowerCase(), ...insensitive } },
            { phone: { contains: q } },
            { code: { contains: q.toUpperCase() } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.reservation.findMany({ where, orderBy: [{ date: "asc" }, { time: "asc" }], take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    db.reservation.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Partial<Search>) =>
    new URLSearchParams(
      Object.entries({ q, from, to, status, party: party ? String(party) : "", ...overrides }).filter(([, v]) => v !== undefined) as [string, string][],
    ).toString();

  return (
    <>
      <PageTitle title="Reservations" subtitle={`${total} ${total === 1 ? "result" : "results"}`}>
        <Link href="/admin/reservations/new" className="btn-primary min-h-[42px] px-5 text-sm">
          + New booking
        </Link>
      </PageTitle>

      {params.deleted && <p role="status" className="mb-4 rounded-xl border border-success/40 bg-success/10 p-3 text-success">Reservation permanently deleted.</p>}

      <form className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" role="search">
        <div>
          <label htmlFor="f-q" className="field-label text-xs">Guest name, email, phone or ref.</label>
          <input id="f-q" name="q" defaultValue={q} placeholder="Search…" className="field py-2.5" />
        </div>
        <div>
          <label htmlFor="f-from" className="field-label text-xs">From</label>
          <input id="f-from" type="date" name="from" defaultValue={from} className="field py-2.5" />
        </div>
        <div>
          <label htmlFor="f-to" className="field-label text-xs">To</label>
          <input id="f-to" type="date" name="to" defaultValue={to} className="field py-2.5" />
        </div>
        <div>
          <label htmlFor="f-status" className="field-label text-xs">Status</label>
          <select id="f-status" name="status" defaultValue={status} className="field py-2.5">
            <option value="active">Active (pending, confirmed, seated)</option>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-party" className="field-label text-xs">Party size</label>
          <select id="f-party" name="party" defaultValue={party || ""} className="field py-2.5">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
            <option value="8">8+</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary min-h-[46px] px-5 text-sm">Filter</button>
          <Link href="/admin/reservations?from=&status=all" className="flex min-h-[46px] items-center px-2 text-sm text-cream-dim hover:text-cream">Reset</Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-cream-muted">No reservations match these filters.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream/10 text-xs uppercase tracking-wider text-cream-dim">
                <tr>
                  <th scope="col" className="px-4 py-3">Date & time</th>
                  <th scope="col" className="px-4 py-3">Guest</th>
                  <th scope="col" className="px-4 py-3">Party</th>
                  <th scope="col" className="px-4 py-3">Details</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/5">
                {rows.map((r) => (
                  <tr key={r.id} className="group hover:bg-cream/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link href={`/admin/reservations/${r.id}`} className="block">
                        <span className="text-cream">{formatDateShort(r.date)}</span>
                        <span className="ml-2 font-medium text-gold-light">{r.time}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/reservations/${r.id}`} className="font-medium text-cream group-hover:text-gold-light">{r.name}</Link>
                      <span className="block text-xs text-cream-dim">{r.phone} · <span className="font-mono">{r.code}</span></span>
                    </td>
                    <td className="px-4 py-3 font-serif text-xl">{r.partySize}</td>
                    <td className="px-4 py-3">
                      <Meta reservation={r} />
                      {r.notes && <span className="mt-1 block max-w-xs truncate text-xs text-gold-light" title={r.notes}>⚠ {r.notes}</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-cream-dim">{formatTimestamp(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/reservations/${r.id}`} className="card block p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm text-cream-muted">{formatDateShort(r.date)} · <span className="text-gold-light">{r.time}</span></span>
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="mt-2 block text-lg text-cream">{r.name} <span className="text-cream-muted">· {r.partySize} ppl</span></span>
                  <span className="mt-2 block"><Meta reservation={r} /></span>
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
              {page > 1 ? <Link href={`?${qs({ page: String(page - 1) })}`} className="text-gold">← Previous</Link> : <span />}
              <span className="text-cream-dim">Page {page} of {pages}</span>
              {page < pages ? <Link href={`?${qs({ page: String(page + 1) })}`} className="text-gold">Next →</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </>
  );
}
