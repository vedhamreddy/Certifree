-- CertiFree: automatic catalog updates.
-- The hand-picked catalog still ships in src/data/courses.ts. These two tables hold what the
-- scheduled job (custom-worker.ts, every 6 hours) finds on its own:
--   catalog_courses: new free courses found in official provider feeds (today: Microsoft Learn)
--   course_status:   link-check results for every course, plus a "hidden" switch you control
-- Anyone may read them (it's the public catalog). Only the service role (the scheduled job)
-- can write. To hide a bad course: Table Editor -> course_status -> set hidden = true
-- (add a row with that course_id if there isn't one yet).

create table public.catalog_courses (
  id text primary key check (id ~ '^[a-z0-9-]{1,80}$'),
  source text not null check (source in ('microsoft-learn')),
  external_id text not null,
  title text not null check (char_length(title) between 1 and 200),
  provider text not null check (provider ~ '^[a-z0-9-]{1,40}$'),
  domain text not null check (domain ~ '^[a-z0-9-]{1,40}$'),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  hours numeric check (hours is null or (hours > 0 and hours < 1000)),
  cost text not null check (cost in ('free-cert', 'free-learn-paid-cert', 'free-learn-paid-exam', 'limited-time', 'free-no-cert')),
  credential text not null check (credential in ('certificate', 'badge', 'exam', 'none')),
  summary text not null check (char_length(summary) <= 400),
  url text not null check (char_length(url) <= 500 and url ~ '^https://'),
  status text not null default 'active' check (status in ('active', 'retired')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (source, external_id)
);
alter table public.catalog_courses enable row level security;
create policy "catalog: everyone reads" on public.catalog_courses for select to anon, authenticated using (true);
revoke insert, update, delete on public.catalog_courses from anon, authenticated;

create table public.course_status (
  course_id text primary key check (course_id ~ '^[a-z0-9-]{1,80}$'),
  hidden boolean not null default false,
  fail_count smallint not null default 0,
  last_http smallint,
  checked_at timestamptz
);
alter table public.course_status enable row level security;
create policy "course status: everyone reads" on public.course_status for select to anon, authenticated using (true);
revoke insert, update, delete on public.course_status from anon, authenticated;
