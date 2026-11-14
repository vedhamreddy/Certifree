import Link from "next/link";
import type { Metadata } from "next";
import { Contact, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What CertiFree stores, why, and how to export or delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        CertiFree is a free directory of online courses and certifications. You can browse it without an account. This page explains what we store, why,
        and how you stay in control. In short: we collect as little as possible, we never sell data, and we show no ads.
      </p>

      <h2>Without an account</h2>
      <ul>
        <li>Saved courses, My Courses, certificates you add, your language and your &quot;Find my course&quot; answers are kept in your own browser (local storage). They are not sent to us.</li>
        <li>We do not use cookies for tracking or advertising.</li>
        <li>We count how often each course page is viewed and its link is clicked, as daily totals per course. No IP address, account or device ID is stored with these counts. If your browser sends &quot;Do Not Track&quot; or &quot;Global Privacy Control&quot;, we don&apos;t count your visits at all.</li>
        <li>If the site owner switches it on, Cloudflare Web Analytics counts page visits without cookies and without identifying you.</li>
        <li>To stop abuse, your IP address is used briefly in server memory to limit how many reports and requests one connection can send. It is not saved.</li>
      </ul>

      <h2>If you sign in</h2>
      <p>Signing in is optional. It lets you keep your progress safe and see it on other devices. When you sign in (with Google or email) we store:</p>
      <ul>
        <li>Your email address and sign-in details, handled by our account provider, Supabase. If you use Google, we receive your name, email and profile picture from Google and use only the email to identify your account.</li>
        <li>An optional display name.</li>
        <li>Only what you choose to sync: saved courses, My Courses progress and dates, and certificates you add, including any certificate file you upload.</li>
        <li>Certificate files are kept in private storage. Only you can open them. There are no public profiles.</li>
      </ul>
      <p>Nothing on this device uploads until you review it on the Sync page and choose to sync.</p>

      <h2>Email alerts</h2>
      <p>
        Weekly emails about new free courses and closing offers are off unless you switch them on in your account. They are sent through Resend. Every email
        has a one-click unsubscribe link. We read your email address only at send time.
      </p>

      <h2>Course reports</h2>
      <p>
        If you use &quot;Report wrong info&quot;, we store your message and the course it&apos;s about. If you are signed in, the report is linked to your account. Please don&apos;t
        include personal details in reports.
      </p>

      <h2>Who processes data for us</h2>
      <ul>
        <li>Cloudflare: hosts the website.</li>
        <li>Supabase: accounts, database and private file storage (servers in Mumbai, India).</li>
        <li>Google: sign-in, only if you choose &quot;Continue with Google&quot;.</li>
        <li>Resend: sends email alerts, only if you switch them on.</li>
      </ul>
      <p>Course links take you to the provider&apos;s own website (for example Google, Microsoft or NPTEL). Their own privacy policies apply there.</p>

      <h2>Your choices and rights</h2>
      <ul>
        <li><strong>Export:</strong> download everything stored for your account as a file from <Link href="/account">Account</Link>.</li>
        <li><strong>Delete:</strong> delete your account from <Link href="/account">Account</Link>. Your profile, synced data and certificate files are removed. Reports you sent stay, but without your account linked.</li>
        <li><strong>On this device:</strong> clear your browser&apos;s site data to remove everything stored locally.</li>
        <li><strong>Emails:</strong> unsubscribe from any email or switch alerts off in your account.</li>
      </ul>
      <p>We keep account data until you delete your account. We don&apos;t knowingly create accounts for children under 13.</p>

      <h2>Changes and contact</h2>
      <p>
        If this policy changes, we will update the date at the top. Questions or requests: write to <Contact />. See also our <Link href="/terms">Terms of use</Link>.
      </p>
    </LegalPage>
  );
}
