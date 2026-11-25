-- INFINORA: separate content storage for public event Venue + Important Note.
-- This does NOT alter registrations, event_groups, confirmation emails, or PDF storage.

create table if not exists public.event_content (
  event_id text primary key check (event_id ~ '^(0[1-9]|1[0-2])$'),
  title text,
  subtitle text,
  intro text,
  about text,
  eligibility text,
  rules jsonb default null,
  event_time text,
  organizer_name text,
  organizer_phone text,
  venue text not null default 'TBA',
  important_note text not null default 'TBA',
  updated_at timestamptz not null default now()
);

create table if not exists public.event_content_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Keep older installations in sync with the complete event editor.
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

alter table public.event_content enable row level security;
alter table public.event_content_admins enable row level security;

grant select on public.event_content to anon, authenticated;
grant insert, update, delete on public.event_content to authenticated;
grant select on public.event_content_admins to authenticated;

-- Public visitors may read event information only.
drop policy if exists "Public can read event content" on public.event_content;
create policy "Public can read event content"
  on public.event_content for select
  to anon, authenticated
  using (true);

-- Only user IDs listed in event_content_admins may write event content.
drop policy if exists "Authorized organizers can insert event content" on public.event_content;
create policy "Authorized organizers can insert event content"
  on public.event_content for insert
  to authenticated
  with check (
    exists (
      select 1 from public.event_content_admins a
      where a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Authorized organizers can update event content" on public.event_content;
create policy "Authorized organizers can update event content"
  on public.event_content for update
  to authenticated
  using (
    exists (
      select 1 from public.event_content_admins a
      where a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.event_content_admins a
      where a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Authorized organizers can delete event content" on public.event_content;
create policy "Authorized organizers can delete event content"
  on public.event_content for delete
  to authenticated
  using (
    exists (
      select 1 from public.event_content_admins a
      where a.user_id = (select auth.uid())
    )
  );

-- A signed-in user can only see their own allowlist row. The table itself
-- cannot be modified through the browser; add/remove organizers in SQL Editor.
drop policy if exists "Organizers can verify their own access" on public.event_content_admins;
create policy "Organizers can verify their own access"
  on public.event_content_admins for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Authorized organizers can read registration records in the admin dashboard and update status only.
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

-- Enable live registration updates in the organizer dashboard.
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

-- Seed all 12 events. Existing important notes are preserved; other notes default to TBA.
insert into public.event_content (event_id, venue, important_note) values
  ('01', 'TBA', 'Round 1 details were not provided.'),
  ('02', 'TBA', 'TBA'),
  ('03', 'TBA', 'TBA'),
  ('04', 'TBA', 'TBA'),
  ('05', 'TBA', 'The supplied poster indicates “Continued .....” at the bottom; additional rules may exist on the next page.'),
  ('06', 'TBA', 'TBA'),
  ('07', 'TBA', 'TBA'),
  ('08', 'TBA', 'TBA'),
  ('09', 'TBA', 'The supplied poster indicates “Continued .....” at the bottom; additional rules may exist on the next page.'),
  ('10', 'TBA', 'TBA'),
  ('11', 'TBA', 'TBA'),
  ('12', 'TBA', 'TBA')
on conflict (event_id) do nothing;

-- AFTER creating an organizer account in Supabase Authentication > Users,
-- copy that user's UUID and run this separately in SQL Editor:
-- insert into public.event_content_admins (user_id)
-- values ('PASTE-AUTH-USER-UUID-HERE');
