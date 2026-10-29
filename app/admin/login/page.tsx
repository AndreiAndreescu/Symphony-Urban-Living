import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { site } from "@/content/site-content";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Staff login", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(205,168,94,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(30,74,61,0.45),transparent_55%)]" />
      <div className="w-full max-w-md">
        <p className="text-center font-serif text-3xl">
          {site.name.split(" ")[0]} <span className="italic text-gold">{site.name.split(" ").slice(1).join(" ")}</span>
        </p>
        <div className="card mt-8 p-8 sm:p-10">
          <h1 className="text-3xl">Staff login</h1>
          <p className="mt-2 text-sm text-cream-muted">Reservations dashboard for the team.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-cream-dim">
          <Link href="/" className="hover:text-cream">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
