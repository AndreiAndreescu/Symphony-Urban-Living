import { PasswordForm } from "@/components/admin/PasswordForm";
import { PageTitle } from "@/components/admin/ui";
import { ROLE_LABEL } from "@/lib/roles";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="max-w-xl">
      <PageTitle title="My account" subtitle={`${user.name} · ${user.email} · ${ROLE_LABEL[user.role]}`} />
      <div className="card p-6">
        <h2 className="text-xl">Change password</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
