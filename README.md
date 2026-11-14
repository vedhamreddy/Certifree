# CertiFree

**Every free certification, one place.** CertiFree is a web app that collects free courses and certifications from tech companies (Google, Microsoft, AWS, IBM, Cisco, Oracle, Salesforce, Meta, HubSpot, NVIDIA and more) and learning platforms (Coursera, edX, Udemy, freeCodeCamp, Kaggle, NPTEL, SWAYAM, Great Learning, Simplilearn), and labels each one by what is really free.

## Features

- **Honest cost labels** on every course: Free certificate, Paid certificate, Paid exam, Limited-time free, No certificate
- **Search** across course titles, providers and skills, with results as you type
- **Filters** for what's free, domain (AI & ML, Cloud, Cybersecurity, Data, Web dev, DevOps, Programming, CS fundamentals, Networking, Marketing, Career skills), company, platform and level. Filters live in the URL, so a search can be shared as a link
- **Provider pages** ("Free AWS courses") and **course pages** with a direct link to the course on the provider's site
- **Saved courses** (bookmarks) stored on the device
- **My Courses:** tap "Start learning" on a course to track it, set progress and a target date, then add the certificate when you finish and it moves to My Certificates
- **Optional accounts and private sync** (Supabase): Google or email magic link. Nothing is uploaded until you choose what to sync and review every change. See [docs/accounts-setup.md](docs/accounts-setup.md)
- **My Certificates:** tap "I completed this" on any course (or "Add certificate" for courses from anywhere else) to save the certificate with its completion date, credential ID, verification link and an image or PDF of the certificate. All certificates show on one page, filterable by domain and issuer, and the list can be downloaded as a CSV for a resume or LinkedIn
- **Learner dashboard:** quick stats, learning activity chart, upcoming deadlines and a My Courses table with CSV export
- **Mobile first:** sidebar on desktop, bottom navigation on phones, bottom-sheet filters, installable as an app (PWA)
- SEO ready: every course and provider page is pre-rendered, with a sitemap and robots.txt

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Lucide icons · Google Fonts (Inter, Manrope) via `next/font` · Supabase (optional, for accounts). The catalog is a typed data file and every public page is generated at build time. No keys are needed to run it; accounts switch on only when the Supabase variables in `.env.example` are set.

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

## Install as an app

CertiFree is an installable web app (PWA): its own window or home-screen icon, app shortcuts, and offline access to pages you've opened. Installing needs the site served over HTTPS (any deployed address), or `localhost` on the same computer.

| Device | Browser | How to install |
| --- | --- | --- |
| iPhone / iPad | Safari (also Chrome, Edge on iOS 16.4+) | Share → **Add to Home Screen** |
| Android | Chrome, Samsung Internet, Edge | **Install** button in the app, or menu ⋮ → **Install app** |
| Android | Firefox | menu ⋮ → **Add to Home screen** |
| Mac | Safari 17+ | **File → Add to Dock** |
| Mac, Windows, Linux, ChromeOS | Chrome, Edge, Brave, Opera | **Install app** in the sidebar, or the install icon in the address bar |
| Mac, Windows, Linux | Firefox | Not supported by Firefox on desktop; use Chrome, Edge or Safari |

The service worker (`public/sw.js`) runs in production builds only. It never caches `/api`, `/auth`, `/account` or `/sync`, and shows `/offline` when a page isn't available offline.

## Deploy

### Vercel (recommended, free)

1. Push this folder to your GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub and import the repository.
3. Keep the defaults (Framework: Next.js, Build command: `npm run build`) and click **Deploy**.
4. Optional: in **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` with your final address (for example `https://certifree.vercel.app`) so the sitemap uses it, then redeploy.

Every push to the main branch redeploys automatically.

### Cloudflare Workers (OpenNext)

The project includes `@opennextjs/cloudflare` and `wrangler.jsonc`, so it runs on Cloudflare Workers with sign-in and the API working.

```bash
npm install
npx wrangler login          # opens Cloudflare in the browser
npm run deploy              # builds with OpenNext and deploys the "certifree" worker
```

Then in Cloudflare → Workers & Pages → certifree → Settings → Variables and Secrets, add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (as a secret) and `SITE_URL` (your workers.dev or custom address), and redeploy. Add `<SITE_URL>/auth/callback` to Supabase → Authentication → URL Configuration → Redirect URLs. `npm run preview` runs the Cloudflare build locally.

Uploading the folder as a static site (Pages drag-and-drop) won't work: CertiFree needs the server for sign-in and the API.

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
- Write summaries in your own words and link to providers; don't copy their descriptions.

## Provider logos

Logos live in `public/logos/` (served from this site, never hotlinked) and are mapped in `src/data/logos.ts`. They are shown only to identify each provider next to its name. All trademarks belong to their owners, and showing them doesn't mean the provider endorses CertiFree. If a logo is missing, a letter monogram is shown instead.

| Provider | Source |
| --- | --- |
| Cisco, Coursera, Databricks, edX, Fortinet, freeCodeCamp, Google, Great Learning, HubSpot, Infosys, Kaggle, Linux Foundation, Meta, NVIDIA, TCS, Udemy | [Simple Icons](https://simpleicons.org) (icon data CC0; brand colours from Simple Icons) |
| Microsoft, AWS, IBM, Oracle, Salesforce | Wikimedia Commons: `Microsoft_logo.svg`, `Amazon_Web_Services_Logo.svg`, `IBM_logo.svg`, `Oracle_logo.svg`, `Salesforce.com_logo.svg` (metadata stripped) |
| NPTEL | nptel.ac.in site logo |
| SWAYAM | swayam.gov.in site logo |
| Simplilearn | simplilearn.com app icon |

Before a public launch, check each provider's brand guidelines; several (for example AWS and Microsoft) publish rules for showing their logos.

## Project layout

```
src/
  app/                 pages: home, courses, courses/[id], providers, providers/[slug], certificates, saved
  components/          Nav, CourseCard, Browse (search + filters), Tags, Logo, ...
  data/                providers.ts, courses.ts
  lib/                 filter.ts (search + filters), bookmarks.ts (saved courses),
                       certificates.ts (My Certificates: details in localStorage, files in IndexedDB),
                       learning.ts (My Courses), sync.ts + sync-diff.ts (opt-in sync), supabase/ (server-only clients)
  app/api/             server-checked routes for synced data
supabase/migrations/   database tables, row-level security and private storage
public/                icons, logo, service worker
```

## Roadmap

1. ~~Accounts with Google sign-in and sync~~ (done; see docs/accounts-setup.md)
2. Automatic catalog updates (for example the Microsoft Learn Catalog API) on a GitHub Actions schedule
3. Deadlines and email reminders for free exam campaigns and NPTEL enrolment
4. "Report wrong info" button and an admin page for corrections
