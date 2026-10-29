"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/reservations") return pathname.startsWith("/admin/reservations") && pathname !== "/admin/reservations/new";
    return pathname.startsWith(href);
  };
  return (
    <nav aria-label="Dashboard">
      <ul className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-col lg:px-3 lg:pb-0">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                  active ? "bg-gold/15 text-gold-light" : "text-cream-muted hover:bg-cream/5 hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
