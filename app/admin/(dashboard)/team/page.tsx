import { TeamManager } from "@/components/admin/TeamManager";
import { PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team logins" };

export default async function TeamPage() {
  const me = await requireUser("team");
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageTitle
        title="Team logins"
        subtitle="Admin: everything · Owner: bookings, menu & settings · Staff: bookings only."
      />
      <TeamManager
        meId={me.id}
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))}
      />
    </>
  );
}
