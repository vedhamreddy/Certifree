import Link from "next/link";
import type { Metadata } from "next";
import { Contact, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The simple rules for using CertiFree.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>By using CertiFree you agree to these terms. They are short on purpose.</p>

      <h2>What CertiFree is</h2>
      <p>
        CertiFree is a free, independent directory of online courses and certifications. We are not affiliated with the course providers. Course names, logos
        and trademarks belong to their owners, and every course link goes to the provider&apos;s own website.
      </p>

      <h2>Course information</h2>
      <p>
        We check course details, but providers change prices, certificates and deadlines without notice. Always confirm the details on the provider&apos;s site
        before you enrol or pay for anything. CertiFree is not responsible for a provider&apos;s courses, certificates, exams or fees. Whether a college accepts a
        course for credit is decided by that college.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>An account is optional. Keep your sign-in secure; you are responsible for activity on your account.</li>
        <li>Only upload certificates and files that are yours. Don&apos;t upload anything illegal, harmful or someone else&apos;s private data.</li>
        <li>Don&apos;t misuse the service: no spam reports, scraping that overloads the site, or attempts to access other people&apos;s data.</li>
        <li>We may suspend accounts that break these rules. You can delete your account at any time from <Link href="/account">Account</Link>.</li>
      </ul>

      <h2>No warranty</h2>
      <p>
        CertiFree is provided free and &quot;as is&quot;, without guarantees that it is always available or error-free. To the extent the law allows, we are not liable
        for losses that come from using the site or relying on its information.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle data is explained in our <Link href="/privacy">Privacy policy</Link>.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms and will change the date at the top when we do. These terms are governed by the laws of India. Questions: write to <Contact />.
      </p>
    </LegalPage>
  );
}
