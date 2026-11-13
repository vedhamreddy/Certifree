# CertiFree

Every free certification course in one place. CertiFree lists free courses from companies like Google, Microsoft, AWS, IBM, Cisco, Oracle, Salesforce, Meta and HubSpot, and labels each one by what is really free: the certificate, only the learning, or only until a deadline.

## Features (MVP)

- Search across course titles, companies and skills
- Filters for what's free, domain, company and level, kept in the URL so searches can be shared
- Company pages ("All free AWS courses") and course detail pages
- Bookmarks saved on the device
- Works on phones: bottom navigation, bottom-sheet filters, installable as a PWA
- Light and dark mode

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Project layout

```
src/data/companies.ts   companies and their free learning portals
src/data/courses.ts     seed course catalog, cost and credential labels
src/lib/filter.ts       search and filtering
src/lib/bookmarks.ts    bookmarks in localStorage
src/components/         UI pieces (cards, tags, nav, browse page)
src/app/                pages: home, courses, companies, saved
```

## Important: seed data

The catalog in `src/data/courses.ts` was written from general knowledge to build the UI. Before launch, every course must be checked on the provider's site, given a direct course link, and stamped with `lastVerified`. The "Closing soon" deadlines on the home page are sample dates.

## Next steps

1. Verify the seed catalog and add direct course links
2. Move data to Supabase (Postgres) and add Google sign-in to sync bookmarks
3. Add ingestion scripts (starting with the Microsoft Learn Catalog API) on a GitHub Actions schedule
4. Real deadlines and email reminders
