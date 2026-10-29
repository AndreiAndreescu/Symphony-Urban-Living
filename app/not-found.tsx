import Link from "next/link";
import { site } from "@/content/site-content";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(205,168,94,0.14),transparent_60%)]" />
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-5xl sm:text-7xl">This table doesn&apos;t exist</h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-cream-muted">The page you were looking for has moved or never existed. Let us seat you somewhere better.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Back to {site.shortName}
          </Link>
          <Link href="/reservations" className="btn-ghost">
            Reserve a table
          </Link>
        </div>
      </div>
    </main>
  );
}
