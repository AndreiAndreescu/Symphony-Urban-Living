import Link from "next/link";

/**
 * Primary reservation call to action: a solid gold pill whose arrow travels on
 * hover. Used where the CTA has to carry the composition (the hero).
 */
export function ReserveButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link href="/reservations" className={`btn-reserve ${className}`}>
      <span>{children}</span>
      <span className="btn-reserve-arrow" aria-hidden="true">
        <span className="btn-reserve-arrow-track">→</span>
      </span>
    </Link>
  );
}
