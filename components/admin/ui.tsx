import { OCCASION_LABEL, SEATING_LABEL, STATUS_LABEL } from "@/lib/format";

const STATUS_STYLE: Record<string, string> = {
  pending: "border-gold/50 bg-gold/15 text-gold-light",
  confirmed: "border-success/40 bg-success/10 text-success",
  seated: "border-sky-300/40 bg-sky-300/10 text-sky-200",
  cancelled: "border-cream/15 bg-cream/5 text-cream-dim",
  no_show: "border-danger/40 bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ""}`}>
      {status === "pending" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />}
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <div className="mt-2 text-cream-muted">{subtitle}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Meta({ reservation }: { reservation: { seating: string; occasion: string | null; source: string } }) {
  return (
    <span className="flex flex-wrap gap-1.5 text-xs">
      <span className="rounded-md bg-cream/5 px-2 py-0.5 text-cream-muted">{SEATING_LABEL[reservation.seating] ?? reservation.seating}</span>
      {reservation.occasion && (
        <span className="rounded-md bg-burgundy/40 px-2 py-0.5 text-cream">🎉 {OCCASION_LABEL[reservation.occasion] ?? reservation.occasion}</span>
      )}
      {reservation.source === "admin" && <span className="rounded-md bg-cream/5 px-2 py-0.5 text-cream-dim">Staff entry</span>}
    </span>
  );
}

export function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
