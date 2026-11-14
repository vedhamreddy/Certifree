-- CertiFree: optional weekly email alerts (new free courses and closing deadlines).
-- Stores only: the account ID, on/off, a random unsubscribe token and when the last email went out.
-- The email address is NOT copied here; the job reads it from Supabase Auth at send time.
create table public.email_alerts (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  enabled boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.email_alerts enable row level security;
create policy "alerts: owner reads" on public.email_alerts for select to authenticated using ((select auth.uid()) = user_id);
create policy "alerts: owner adds" on public.email_alerts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "alerts: owner updates" on public.email_alerts for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Learners can only switch alerts on or off; they can't set the token or send times.
revoke all on public.email_alerts from anon, authenticated;
grant select (user_id, enabled) on public.email_alerts to authenticated;
grant insert (enabled) on public.email_alerts to authenticated;
grant update (enabled) on public.email_alerts to authenticated;

-- One-click unsubscribe from the email link, without signing in. Knowing the random token is enough.
create function public.unsubscribe_email_alerts(token uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.email_alerts set enabled = false where unsubscribe_token = token;
  return found;
end;
$$;
revoke execute on function public.unsubscribe_email_alerts(uuid) from public;
grant execute on function public.unsubscribe_email_alerts(uuid) to anon, authenticated;
