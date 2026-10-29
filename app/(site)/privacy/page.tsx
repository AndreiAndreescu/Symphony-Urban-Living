import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site-content";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects and protects your personal data (GDPR).`,
  alternates: { canonical: "/privacy" },
};

// NOTE: This is a sensible GDPR template. Have it reviewed by a lawyer before launch.
export default function PrivacyPage() {
  const { legal, contact } = site;
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated={legal.policyLastUpdated}>
      <p>
        This policy explains how <strong>{site.name}</strong> (&quot;we&quot;) handles your personal data when you visit this website or book a
        table. We follow the EU General Data Protection Regulation (GDPR, Regulation (EU) 2016/679) and Romanian Law no. 190/2018.
      </p>

      <h2>Who is responsible for your data</h2>
      <p>
        The data controller is <strong>{legal.companyName}</strong>, registration no. {legal.registrationNumber}, VAT {legal.vatNumber},{" "}
        {contact.address.street}, {[contact.address.postalCode, contact.address.city].filter(Boolean).join(" ")}, {contact.address.countryName}. For any privacy
        question, write to <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>.
      </p>

      <h2>What we collect and why</h2>
      <p>
        <strong>Table reservations.</strong> Your name, phone number, email, date and time, party size, seating preference and — only if you
        choose to give them — the occasion and notes (such as dietary requirements or allergies).
      </p>
      <ul>
        <li>
          <strong>Purpose:</strong> to manage your reservation, contact you about it (confirmation, changes, cancellation) and prepare your
          visit.
        </li>
        <li>
          <strong>Legal basis:</strong> taking steps at your request before entering into a contract (Art. 6(1)(b) GDPR). Allergy or dietary
          information can reveal health data; we process it only because you give it to us voluntarily and with your explicit consent (Art.
          9(2)(a) GDPR), so we can serve you safely.
        </li>
        <li>
          <strong>Consent record:</strong> we store the time you accepted this policy and its version, to demonstrate compliance.
        </li>
      </ul>
      <p>
        <strong>Security logs.</strong> To prevent abuse of the booking form we keep a one-way (hashed) version of your IP address for up to
        24 hours. We cannot turn it back into your IP address. Legal basis: our legitimate interest in keeping the service secure (Art.
        6(1)(f)).
      </p>
      <p>
        We do <strong>not</strong> use advertising or analytics trackers, and we never sell your data or use it for marketing without asking
        first.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Reservation details are kept for up to <strong>24 months</strong> after your visit so we can recognise returning guests and handle any
        questions, then deleted or anonymised. Notes about allergies are deleted earlier on request. Data we must keep for accounting or legal
        reasons is kept for the period required by law.
      </p>

      <h2>Who we share it with</h2>
      <p>Only with service providers that help us run the website, bound by data processing agreements:</p>
      <ul>
        <li>website hosting (Netlify, Inc.);</li>
        <li>database hosting (e.g. Neon Inc. / Supabase Inc., EU region);</li>
        <li>transactional email delivery (e.g. Resend / our email provider).</li>
      </ul>
      <p>
        Some providers are based in the United States. Transfers are protected by the EU–US Data Privacy Framework or the European
        Commission&apos;s Standard Contractual Clauses.
      </p>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>have it corrected or deleted;</li>
        <li>restrict or object to its processing;</li>
        <li>receive it in a portable format;</li>
        <li>withdraw your consent at any time (this doesn&apos;t affect processing that already happened).</li>
      </ul>
      <p>
        To exercise any right, email <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>. We reply within one month. You can also
        complain to the Romanian data protection authority, ANSPDCP (
        <a href="https://www.dataprotection.ro" rel="noopener noreferrer" target="_blank">
          dataprotection.ro
        </a>
        ).
      </p>

      <h2>Cookies</h2>
      <p>
        We only use a strictly necessary cookie for the staff login area, and Google Maps only loads if you choose to show it. Details in our{" "}
        <Link href="/cookies">cookie notice</Link>.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy in a meaningful way we will update the date above and, for future bookings, ask for your consent again.</p>
    </LegalPage>
  );
}
