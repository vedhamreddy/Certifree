-- CertiFree: let signed-out visitors report wrong course info.
-- Signed-out reports carry no reporter at all (reporter_id is null). The app's server
-- rate-limits by IP and checks the course ID before inserting. Visitors still can't read
-- any report; only catalog admins can (see 0001).
grant insert (course_id, message) on public.correction_reports to anon;
create policy "reports: visitor files an anonymous report" on public.correction_reports for insert to anon
  with check (reporter_id is null and status = 'open' and reviewed_at is null);
