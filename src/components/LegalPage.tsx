/** Shared layout for the privacy policy and terms. Plain English, kept short. */
export const UPDATED = "14 November 2026";
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Contact() {
  return CONTACT ? (
    <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
  ) : (
    <>the contact email shown on CertiFree&apos;s Google sign-in screen</>
  );
}

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {UPDATED}</p>
      <div className="legal mt-8 space-y-4 rounded-3xl border border-line bg-white p-6 text-[15px] leading-relaxed text-ink shadow-card sm:p-10 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}
