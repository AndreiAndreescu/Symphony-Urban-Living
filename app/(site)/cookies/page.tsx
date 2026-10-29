import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site-content";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description: `Which cookies ${site.name} uses (very few) and why.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Legal" title="Cookie notice" updated={site.legal.policyLastUpdated}>
      <p>
        We keep this simple: <strong>this website does not use advertising, analytics or tracking cookies</strong>, so we don&apos;t need to
        show you a cookie banner. Fonts and images are served from our own website, not from third parties.
      </p>

      <h2>Cookies we use</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-cream/20 text-cream">
            <tr>
              <th scope="col" className="py-3 pr-4">Name</th>
              <th scope="col" className="py-3 pr-4">Purpose</th>
              <th scope="col" className="py-3 pr-4">Type</th>
              <th scope="col" className="py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream/10">
            <tr>
              <td className="py-3 pr-4 font-mono text-cream">su_admin</td>
              <td className="py-3 pr-4">Keeps restaurant staff signed in to the reservations dashboard. Only set when staff log in.</td>
              <td className="py-3 pr-4">Strictly necessary</td>
              <td className="py-3">12 hours</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Strictly necessary cookies don&apos;t require consent under the ePrivacy Directive and Romanian Law no. 506/2004.</p>

      <h2>Google Maps</h2>
      <p>
        The map on our <Link href="/contact">contact page</Link> is provided by Google and may set Google cookies. It is{" "}
        <strong>not loaded</strong> unless you click &quot;Show map&quot;. Clicking it is your choice; you can use &quot;Get directions&quot;
        instead, which opens Google Maps in a new tab.
      </p>

      <h2>Your booking data</h2>
      <p>
        The booking form doesn&apos;t use cookies. How we handle the details you give us is explained in our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Managing cookies</h2>
      <p>You can delete or block cookies in your browser settings at any time. Blocking the staff cookie only affects the staff login area.</p>
    </LegalPage>
  );
}
