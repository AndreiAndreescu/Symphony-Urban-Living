import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site-content";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/app/admin/actions";
import { can } from "@/lib/roles";
import { ROLE_LABEL } from "@/lib/roles";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: `%s · Admin · ${site.shortName}` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = [
    { href: "/admin", label: "Today", show: can(user.role, "bookings") },
    { href: "/admin/reservations", label: "Reservations", show: can(user.role, "bookings") },
    { href: "/admin/calendar", label: "Calendar", show: can(user.role, "bookings") },
    { href: "/admin/reservations/new", label: "+ New booking", show: can(user.role, "bookings") },
    { href: "/admin/menu", label: "Menu & prices", show: can(user.role, "menu") },
    { href: "/admin/settings", label: "Settings", show: can(user.role, "settings") },
    { href: "/admin/team", label: "Team logins", show: can(user.role, "team") },
    { href: "/admin/account", label: "My account", show: true },
  ].filter((i) => i.show);

  return (
    <div className="min-h-[100svh] bg-ink lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-40 border-b border-cream/10 bg-ink-800/95 backdrop-blur lg:h-[100svh] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Link href="/admin" className="font-serif text-xl leading-tight">
            {site.shortName} <span className="block text-xs uppercase tracking-[0.25em] text-gold">Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 lg:mt-6 lg:block">
            <p className="text-right text-xs text-cream-muted lg:text-left">
              <span className="block text-sm text-cream">{user.name}</span>
              {ROLE_LABEL[user.role]}
            </p>
          </div>
        </div>
        <AdminNav items={items} />
        <div className="hidden space-y-2 px-6 pb-6 text-sm lg:absolute lg:bottom-0 lg:block">
          <Link href="/" className="block text-cream-dim hover:text-cream" target="_blank">
            View website ↗
          </Link>
          <form action={logout}>
            <button type="submit" className="text-cream-dim hover:text-cream">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
        <div className="flex justify-center gap-6 border-t border-cream/10 py-6 text-sm lg:hidden">
          <Link href="/" className="text-cream-dim hover:text-cream">
            View website
          </Link>
          <form action={logout}>
            <button type="submit" className="text-cream-dim hover:text-cream">
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
