import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageTitle } from "@/components/admin/ui";
import { envNotifyEmails, getBookingSettingsFresh } from "@/lib/settings";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireUser("settings");
  const settings = await getBookingSettingsFresh();
  const emailProvider = process.env.RESEND_API_KEY ? "Resend" : process.env.SMTP_HOST ? "SMTP" : null;
  return (
    <>
      <PageTitle title="Settings" subtitle="Opening hours, booking capacity and who gets notified. No code needed." />
      <SettingsForm initial={settings} envEmails={envNotifyEmails()} emailProvider={emailProvider} />
    </>
  );
}
