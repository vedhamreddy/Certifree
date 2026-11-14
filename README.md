# CertiFree

**Every free certification, one place.** CertiFree is a web app that collects free courses and certifications from tech companies (Google, Microsoft, AWS, IBM, Cisco, Oracle, Salesforce, Meta, HubSpot, NVIDIA and more) and learning platforms (Coursera, edX, Udemy, freeCodeCamp, Kaggle, NPTEL, SWAYAM, Great Learning, Simplilearn), and labels each one by what is really free.

## Features

- **Honest cost labels** on every course: Free certificate, Paid certificate, Paid exam, Limited-time free, No certificate
- **Search** across course titles, providers and skills, with results as you type
- **Filters** for what's free, domain (AI & ML, Cloud, Cybersecurity, Data, Web dev, DevOps, Programming, CS fundamentals, Networking, Marketing, Career skills), company, platform and level. Filters live in the URL, so a search can be shared as a link
- **Provider pages** ("Free AWS courses") and **course pages** with a direct link to the course on the provider's site
- **Saved courses** (bookmarks) stored on the device
- **My Certificates:** tap "I completed this" on any course (or "Add certificate" for courses from anywhere else) to save the certificate with its completion date, credential ID, verification link and an image or PDF of the certificate. All certificates show on one page, filterable by domain and issuer, and the list can be downloaded as a CSV for a resume or LinkedIn
- **Mobile first:** bottom navigation, bottom-sheet filters, light and dark mode, installable as an app (PWA)
- SEO ready: every course and provider page is pre-rendered, with a sitemap and robots.txt

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Google Fonts (Poppins, Inter) via `next/font`. No database or API keys are needed: the catalog is a typed data file, and every page is generated at build time.

## Run it locally

You need Node.js 18.18 or newer (20 LTS recommended).

```bash
npm install
npm run dev        # open http://localhost:3000
```

Other commands:

```bash
npm run build      # production build (also type-checks)
npm run start      # serve the production build on http://localhost:3000
npm run lint       # ESLint
```

## Deploy

### Vercel (recommended, free)

1. Push this folder to your GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub and import the repository.
3. Keep the defaults (Framework: Next.js, Build command: `npm run build`) and click **Deploy**.
4. Optional: in **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` with your final address (for example `https://certifree.vercel.app`) so the sitemap uses it, then redeploy.

Every push to the main branch redeploys automatically.

### Netlify or any Node host

Netlify detects Next.js automatically: import the repo and deploy. On any other host, run `npm ci && npm run build`, then `npm run start` (set `PORT` if needed).

## Push to GitHub

```bash
git init            # skip if the folder is already a git repo
git add -A
git commit -m "CertiFree app"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

## Adding or updating courses

All data lives in two files:

- `src/data/providers.ts`: companies and platforms (name, portal link, brand color, short description, `kind: "company" | "platform"`)
- `src/data/courses.ts`: the course catalog

To add a course, add an object to the `rows` list in `src/data/courses.ts`:

```ts
{
  id: "kg-pandas",                     // unique, used in the URL
  title: "Pandas",
  provider: "kaggle",                  // a slug from providers.ts
  domain: "data",                      // see domainLabels
  level: "beginner",
  hours: 4,                            // optional: only if the provider states it
  cost: "free-cert",                   // free-cert | free-learn-paid-cert | free-learn-paid-exam | limited-time | free-no-cert
  credential: "certificate",           // certificate | badge | exam | none
  summary: "One sentence in your own words.",
  url: "https://www.kaggle.com/learn/pandas",
  trending: true,                      // optional: show on the home page
  verified: "2026-11-14",              // optional: date you confirmed cost + credential on the provider's page
}
```

The build fails if a course points to a provider that doesn't exist, so typos are caught early.

## About the data

- The catalog has 76 courses from 24 providers. Every link is the provider's own course page, found on 14 Nov 2026.
- Courses marked **✓ Checked** had their cost and credential confirmed on the provider's page that day. For the rest, the free status comes from the provider's catalog and should be re-checked from time to time.
- Free offers change often (for example, Great Learning now charges for certificates, and Oracle's free exams come in campaigns). Re-check the catalog every few weeks.
- NPTEL and SWAYAM courses run each semester; links point to a course page, and students enrol in the current run.
- Write summaries in your own words and link to providers; don't copy their descriptions or logos.

## Project layout

```
src/
  app/                 pages: home, courses, courses/[id], providers, providers/[slug], certificates, saved
  components/          Nav, CourseCard, Browse (search + filters), Tags, Logo, ...
  data/                providers.ts, courses.ts
  lib/                 filter.ts (search + filters), bookmarks.ts (saved courses),
                       certificates.ts (My Certificates: details in localStorage, files in IndexedDB)
public/                icons, logo, service worker
```

## Roadmap

1. Accounts with Google sign-in (Supabase) so saved courses and certificates sync across devices. Until then, they are stored only in the browser where they were added, so clearing browser data removes them
2. Automatic catalog updates (for example the Microsoft Learn Catalog API) on a GitHub Actions schedule
3. Deadlines and email reminders for free exam campaigns and NPTEL enrolment
4. "Report wrong info" button and an admin page for corrections
