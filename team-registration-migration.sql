-- INFINORA team registration fields
-- One registration row represents one team; all team member details are stored in participants JSON.
alter table public.registrations
  add column if not exists shift text,
  add column if not exists participants jsonb not null default '[]'::jsonb;

comment on column public.registrations.shift is 'Participant selected event shift: Shift I or Shift II';
comment on column public.registrations.participants is 'Array of team members: name, and for Math Bid fictional_name and character';
