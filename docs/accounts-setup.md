# Accounts and sync: setup

Accounts are optional. Without the settings below, CertiFree runs exactly as before: everything stays in the browser and no account UI appears.

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a new project. Pick a strong database password and a region near your users.
2. Open **SQL Editor**, paste the whole of `supabase/migrations/0001_accounts_and_sync.sql`, and run it. It creates the tables, the row-level security policies, and the private `certificate-files` storage bucket.
   - If you use the Supabase CLI instead: `supabase link` then `supabase db push`.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill it in from **Project Settings → API** (or **API Keys**):

| Variable | Where it comes from | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Project URL | Read on the server only |
| `SUPABASE_ANON_KEY` | `anon` / publishable key | Read on the server only; the browser never receives it |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` / secret key | **Secret.** Used only to delete an account and its files. Never prefix with `NEXT_PUBLIC_` |
| `SITE_URL` | Your site address | `http://localhost:3000` locally, your real domain in production |

`.env.local` is git-ignored. Never commit real keys. On Vercel, add the same four variables under **Settings → Environment Variables** and redeploy.

Restart `npm run dev` after creating `.env.local`.

## 3. Auth settings in the Supabase dashboard

**Authentication → URL Configuration**
- Site URL: your `SITE_URL`
- Redirect URLs: add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`

**Authentication → Sign In / Providers → Email**
- Enable the Email provider. Leave password sign-in off; CertiFree only uses magic links.
- Keep **Secure email change** on (both addresses must confirm).
- The default "Magic Link" email template works with the PKCE flow as is.

**Google sign-in**
1. In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **OAuth consent screen**: set the app name and support email, and request only the default `openid`, `email` and `profile` scopes.
2. **Credentials → Create credentials → OAuth client ID** → Web application.
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Paste the client ID and client secret into Supabase → **Authentication → Providers → Google** and enable it.

**Rate limits and email**
- Authentication → **Rate Limits**: keep email sends and token verifications low (the defaults are fine).
- For production, set up custom SMTP (Authentication → Emails → SMTP). The built-in sender only allows a few emails an hour and is meant for testing.

**Two-step verification**
- Authentication → **Multi-Factor**: make sure TOTP (authenticator app) is enabled. It's on by default.

## 4. Catalog administrators

Nobody can make themselves an admin: the `admin_roles` table has no write policies. Grant the role from the SQL editor (or a server-side script with the service role):

```sql
insert into public.admin_roles (user_id, role)
select id, 'catalog_admin' from auth.users where email = 'admin@example.com';
```

Remove it with `delete from public.admin_roles where user_id = '<uuid>';`.
The course catalog itself still lives in `src/data/courses.ts`, so managing listings means editing that file. Admins can read and update rows in `correction_reports`.

## How it works (for reviewers)

- **Sessions:** Supabase runs only on the server (`@supabase/ssr`, PKCE). Session and PKCE verifier cookies are forced to `HttpOnly`, `SameSite=Lax`, and `Secure` in production (Safari rejects `Secure` cookies on `http://localhost`, so development drops that one flag). No token or Supabase key is ever sent to the browser or stored in `localStorage`.
- **Authorization:** every `/api` route verifies the user with `supabase.auth.getUser()` on the server, rejects cross-site origins, validates input against the catalog, and filters by `user_id`. Row-level security enforces the same rules in the database.
- **Files:** stored in a private bucket at `<user id>/<certificate id>` (no file names in paths or URLs). Type is checked from the file's bytes (PNG, JPEG, WebP, GIF, PDF), size is capped at 10 MB, and files are streamed back to their owner only. Deleting a certificate removes the file and its metadata; deleting the account removes every file, then the user (rows cascade).
- **Sync is opt-in:** nothing is uploaded at sign-in. On `/sync` the learner picks categories, previews every difference, and resolves each conflict before anything changes. Later changes made on another device show a review banner; nothing is merged silently.
- **Recent sign-in:** export, email change, two-step setup and account deletion need a sign-in within the last 10 minutes (checked from the session's `amr` claim).
- **Rate limiting:** sign-in, email change and code checks have a per-IP and per-email limit in server memory, on top of Supabase's own limits. On serverless hosts each instance counts separately, so keep the Supabase limits configured.
- **Offline cache:** the service worker never caches `/api`, `/auth`, `/account` or `/sync`, or any `no-store` response.

## Known limits

- A magic link must be opened in the same browser that requested it (that's how PKCE protects the link).
- The data export contains details and file metadata. Certificate files are opened from My Certificates.
- Passkeys aren't offered: authenticator-app codes are the stronger sign-in option Supabase supports here.
- There's no "Report wrong info" button or admin screen yet. The table and policies are ready for them (roadmap item 4).
