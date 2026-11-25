-- INFINORA registrations: run this ONCE in Supabase > SQL Editor.

create table if not exists public.registrations (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),
  reference_code   text,
  event_id         text not null check (event_id ~ '^(0[1-9]|1[0-2])$'),
  event_name       text,
  college          text not null,
  department       text not null,
  study_year       text not null,
  participant_name text not null,
  shift            text,
  participants     jsonb not null default '[]'::jsonb,
  whatsapp         text not null,
  email            text not null,
  fictional_name   text,   -- Event 09 (Math Bid) only
  game_character   text,   -- Event 09 (Math Bid) only
  constraint game_character_allowed
    check (game_character is null or game_character in ('The Knight','The Master','The Scout')),
  constraint math_bid_needs_both
    check (event_id <> '09' or (fictional_name is not null and game_character is not null))
);

-- Security: visitors (anon key) may ONLY add rows. Nobody can read them with the public key.
alter table public.registrations enable row level security;
drop policy if exists "visitors can register" on public.registrations;
create policy "visitors can register" on public.registrations
  for insert to anon with check (true);

-- ------------------------------------------------------------------
-- GET A CSV: run a query below in SQL Editor, then click
-- "Download CSV" above the results. (Table Editor > Export > CSV also works.)
-- ------------------------------------------------------------------

-- A) Everything, grouped by event, with Fictional Name + Character columns:
select
  event_id           as "Event No",
  event_name         as "Event",
  participant_name   as "Participant",
  fictional_name     as "Fictional Name",
  game_character     as "Character",
  college            as "College",
  department         as "Department",
  study_year         as "Year",
  shift              as "Shift",
  participants       as "Team Participants (JSON)",
  whatsapp           as "WhatsApp",
  email              as "Email",
  reference_code     as "Reference",
  created_at         as "Registered At"
from public.registrations
order by event_id, created_at;

-- B) Only Math Bid (Event 09), sorted by character:
-- select participant_name as "Participant", fictional_name as "Fictional Name",
--        game_character as "Character", college as "College", whatsapp as "WhatsApp", email as "Email"
-- from public.registrations where event_id = '09' order by game_character, created_at;

-- If you ever rename a character, also update the list in game_character_allowed above
-- (drop and re-add that constraint) and the <option> list in register.html / register.js.


-- ------------------------------------------------------------------
-- v5: AUTOMATIC CONFIRMATION E-MAIL (run this part once as well)
-- ------------------------------------------------------------------
alter table public.registrations add column if not exists confirmation_sent_at timestamptz;

-- One registration per e-mail per event (stops duplicates and repeat e-mails).
create unique index if not exists registrations_one_per_email_event
  on public.registrations (event_id, lower(email));


-- ------------------------------------------------------------------
-- v6: ONE WHATSAPP GROUP LINK PER EVENT
-- After running this, open Table Editor > event_groups and paste each event's
-- invite link (https://chat.whatsapp.com/...) into the whatsapp_link column.
-- You can change a link there at any time; no redeploy needed.
-- Visitors cannot read this table (RLS on, no public policy); only the e-mail function can.
-- ------------------------------------------------------------------
create table if not exists public.event_groups (
  event_id      text primary key check (event_id ~ '^(0[1-9]|1[0-2])$'),
  event_name    text,
  whatsapp_link text
);
alter table public.event_groups enable row level security;

insert into public.event_groups (event_id, event_name) values
  ('01','MATH TUNE'),('02','QUIZ'),('03','MATHEMATICAL PAPER PRESENTATION'),('04','PANIC ROOM'),
  ('05','ADZAP'),('06','SHIPWRECK'),('07','FACE PAINTING'),('08','MATH RANGOLI'),
  ('09','MATH BID'),('10','MR./MS. INFINORA 26 - TITLE EVENT'),
  ('11','POSTER MAKING - INK AND INCANTATION'),('12','REELMAKING')
on conflict (event_id) do nothing;


-- v7: PRIVATE REGISTRATION PDF STORAGE
-- PDFs contain personal information, so keep this bucket PRIVATE.
-- The Edge Function uses the service-role key to upload PDFs and create
-- time-limited signed download links for the confirmation email.
alter table public.registrations
  add column if not exists registration_pdf_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('registration-pdfs', 'registration-pdfs', false, 5242880, array['application/pdf'])
on conflict (id) do update set public = false;
