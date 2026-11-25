-- Applied to the connected INFINORA Supabase project on 25 Nov 2026.
-- Safe schema additions: no registration rows are deleted or modified.
alter table public.event_content
  add column if not exists title text,
  add column if not exists subtitle text,
  add column if not exists intro text,
  add column if not exists about text,
  add column if not exists eligibility text,
  add column if not exists rules jsonb default null,
  add column if not exists event_time text,
  add column if not exists organizer_name text,
  add column if not exists organizer_phone text;
alter table public.event_content alter column rules drop not null;
alter table public.event_content alter column rules set default null;

grant select on public.registrations to authenticated;
grant update (status) on public.registrations to authenticated;
drop policy if exists "Authorized organizers can view registrations" on public.registrations;
create policy "Authorized organizers can view registrations"
on public.registrations for select to authenticated
using (exists (select 1 from public.event_content_admins a where a.user_id = (select auth.uid())));
drop policy if exists "Authorized organizers can update registration status" on public.registrations;
create policy "Authorized organizers can update registration status"
on public.registrations for update to authenticated
using (exists (select 1 from public.event_content_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.event_content_admins a where a.user_id = (select auth.uid())));

-- Live dashboard refresh when a new registration is inserted or status changes.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'registrations'
  ) then
    alter publication supabase_realtime add table public.registrations;
  end if;
end $$;
