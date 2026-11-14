-- CertiFree: privacy-friendly course stats. Only daily totals per course:
-- how many times a course page was opened and how many times "Go to course" was clicked.
-- No user ID, IP address, cookie or device data is stored. Only catalog admins can read it.
create table public.course_stats (
  course_id text not null check (course_id ~ '^[a-z0-9-]{1,80}$'),
  day date not null default current_date,
  views integer not null default 0,
  clicks integer not null default 0,
  primary key (course_id, day)
);
alter table public.course_stats enable row level security;
revoke all on public.course_stats from anon, authenticated;
grant select on public.course_stats to authenticated;
create policy "stats: admins read" on public.course_stats for select to authenticated using ((select public.is_catalog_admin()));

-- The only way to write: add one to today's counter. Called by the site's server, which rate-limits it.
create function public.track_course_event(cid text, kind text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if cid !~ '^[a-z0-9-]{1,80}$' or kind not in ('view', 'click') then return; end if;
  insert into public.course_stats (course_id, day, views, clicks)
  values (cid, current_date, (kind = 'view')::int, (kind = 'click')::int)
  on conflict (course_id, day) do update
    set views = public.course_stats.views + excluded.views,
        clicks = public.course_stats.clicks + excluded.clicks;
end;
$$;
revoke execute on function public.track_course_event(text, text) from public;
grant execute on function public.track_course_event(text, text) to anon, authenticated;
