-- CertiFree: optional accounts and private sync.
-- The public course catalog is NOT in the database; it stays in src/data and is never
-- mixed with user data. Every user-owned table below has row-level security so a learner
-- can only read and change their own rows, even if a server bug forgot a check.

-- ---------------------------------------------------------------------------
-- Profiles: auth user ID plus an optional display name. Nothing else.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles: owner reads" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: owner updates" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Bookmarks (saved courses)
-- ---------------------------------------------------------------------------
create table public.bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id text not null check (course_id ~ '^[a-z0-9-]{1,80}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
alter table public.bookmarks enable row level security;
create policy "bookmarks: owner reads" on public.bookmarks for select to authenticated using ((select auth.uid()) = user_id);
create policy "bookmarks: owner adds" on public.bookmarks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "bookmarks: owner removes" on public.bookmarks for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- My Courses: courses the learner is currently taking
-- ---------------------------------------------------------------------------
create table public.learning (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id text not null check (course_id ~ '^[a-z0-9-]{1,80}$'),
  started_on date not null,
  progress smallint not null default 0 check (progress between 0 and 100),
  target_date date,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
alter table public.learning enable row level security;
create policy "learning: owner reads" on public.learning for select to authenticated using ((select auth.uid()) = user_id);
create policy "learning: owner adds" on public.learning for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "learning: owner updates" on public.learning for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "learning: owner removes" on public.learning for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Certificates: the same fields the app already stores on the device.
-- Private by default. There is no public view, share link or "verified by CertiFree" flag.
-- ---------------------------------------------------------------------------
create table public.certificates (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (id ~ '^[A-Za-z0-9-]{1,64}$'),
  course_id text check (course_id is null or course_id ~ '^[a-z0-9-]{1,80}$'),
  title text not null check (char_length(title) between 1 and 200),
  provider text not null check (provider ~ '^[a-z0-9-]{1,40}$'),
  provider_name text check (provider_name is null or char_length(provider_name) <= 100),
  domain text not null check (domain ~ '^[a-z0-9-]{1,40}$'),
  issued_on date not null,
  credential_id text check (credential_id is null or char_length(credential_id) <= 200),
  link text check (link is null or (char_length(link) <= 500 and link ~* '^https?://')),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.certificates enable row level security;
create policy "certificates: owner reads" on public.certificates for select to authenticated using ((select auth.uid()) = user_id);
create policy "certificates: owner adds" on public.certificates for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "certificates: owner updates" on public.certificates for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "certificates: owner removes" on public.certificates for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Certificate file metadata. The file itself lives in the private storage bucket at
-- "<user id>/<certificate id>" so the original file name never appears in a path or URL.
-- ---------------------------------------------------------------------------
create table public.certificate_files (
  user_id uuid not null default auth.uid(),
  certificate_id text not null,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 200),
  mime_type text not null check (mime_type in ('image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now(),
  primary key (user_id, certificate_id),
  foreign key (user_id, certificate_id) references public.certificates (user_id, id) on delete cascade,
  check (storage_path = user_id::text || '/' || certificate_id)
);
alter table public.certificate_files enable row level security;
create policy "files: owner reads" on public.certificate_files for select to authenticated using ((select auth.uid()) = user_id);
create policy "files: owner adds" on public.certificate_files for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "files: owner updates" on public.certificate_files for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "files: owner removes" on public.certificate_files for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Privileged roles. Only "catalog_admin" exists. There are NO insert/update/delete
-- policies, so nobody can grant a role through the API, including at sign-up.
-- Grant it from the SQL editor or a server-side script using the service role:
--   insert into public.admin_roles (user_id, role) values ('<user uuid>', 'catalog_admin');
-- ---------------------------------------------------------------------------
create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role = 'catalog_admin'),
  granted_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;
create policy "admin_roles: user sees own role" on public.admin_roles for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.admin_roles from anon, authenticated;

create function public.is_catalog_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_roles where user_id = (select auth.uid()) and role = 'catalog_admin'
  );
$$;
revoke execute on function public.is_catalog_admin() from public, anon;
grant execute on function public.is_catalog_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Course correction reports, with minimal reporter data (just the account ID, which is
-- cleared if the account is deleted). Catalog admins review them.
-- ---------------------------------------------------------------------------
create table public.correction_reports (
  id uuid primary key default gen_random_uuid(),
  course_id text not null check (course_id ~ '^[a-z0-9-]{1,80}$'),
  message text not null check (char_length(message) between 5 and 1000),
  reporter_id uuid default auth.uid() references auth.users (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
alter table public.correction_reports enable row level security;
create policy "reports: learner files a report" on public.correction_reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id and status = 'open' and reviewed_at is null);
create policy "reports: reporter or admin reads" on public.correction_reports for select to authenticated
  using ((select auth.uid()) = reporter_id or (select public.is_catalog_admin()));
create policy "reports: admin reviews" on public.correction_reports for update to authenticated
  using ((select public.is_catalog_admin())) with check ((select public.is_catalog_admin()));
create policy "reports: admin deletes" on public.correction_reports for delete to authenticated
  using ((select public.is_catalog_admin()));

-- Signed-out visitors get nothing from any user table.
revoke all on public.profiles, public.bookmarks, public.learning, public.certificates,
  public.certificate_files, public.admin_roles, public.correction_reports from anon;

-- ---------------------------------------------------------------------------
-- Private storage bucket for certificate files (10 MB, images and PDF only).
-- Each learner can only touch objects inside their own "<user id>/" folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificate-files', 'certificate-files', false, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "certificate files: owner reads" on storage.objects for select to authenticated
  using (bucket_id = 'certificate-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "certificate files: owner uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'certificate-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "certificate files: owner replaces" on storage.objects for update to authenticated
  using (bucket_id = 'certificate-files' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'certificate-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "certificate files: owner deletes" on storage.objects for delete to authenticated
  using (bucket_id = 'certificate-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
