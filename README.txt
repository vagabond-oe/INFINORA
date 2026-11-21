INFINORA homepage – animated version

Files:
- index.html
- style.css
- script.js
- images/  (plate.jpg, logo.png, compass.png, scarf.png, owl-body.png, owl-wing-l.png, owl-wing-r.png, fog-*.png)

How to run:
1. Keep index.html, style.css, script.js and the images folder together.
2. Double-click index.html, or open the folder in VS Code and use Live Server.

What moves:
- Scarf waves like a ripple (script.js, section 3)
- Clouds: moving fog layers (style.css, .fog) + baked clouds slowly billow (script.js, section 4)
- Messenger owl flaps and flies across the whole page, then returns (script.js, section 6)
- Stars twinkle, golden dust floats, shooting stars (script.js, section 5)

The Events link points to events.html – create that page next, or change the link for now.
The old images/infinora-hero.png is no longer used; you can delete it.


ABOUT PAGE UPDATE
- Click About in the top navigation to open about.html.
- The uploaded Great Hall image is used as the full-screen background: images/about-hall.png.
- The festival description is intentionally marked as To Be Announced (TBA).
- The page shares the existing magical particle effects, mobile navigation, and flying owl script.


EVENTS PAGE UPDATE
- Click Events in the navigation.
- The uploaded 17.74-second video plays first (muted autoplay; sound toggle included).
- After the clip ends, or if visitors press Skip Intro, the 12-card event catalogue appears.
- Event names currently read EVENT 01–12 and DETAILS TBA.
- Add event images later as images/event-01.jpg through images/event-12.jpg.
- Replace each card title in events.html with the confirmed event name.
- The 12-card layout follows the supplied neon blue/purple reference image.


NEXT STEP: EVENT DETAILS + REGISTRATION PREVIEW
- Every event card now opens event.html?id=01 through event.html?id=12.
- One reusable details page shows About, Eligibility, Rules and Register button.
- The Register button opens register.html?event=01 (or the selected event).
- Registration form fields: college, department, year, participant name, WhatsApp, email, confirm email.
- Email matching and required-field validation work in the browser.
- IMPORTANT: The form is currently a front-end preview only. It does NOT save or send participant data. Supabase connection and database insert will be done after you provide your Supabase Project URL and publishable/anon key. Never share a service-role key.
- Replace EVENT 01–12, TBA descriptions and event images when final content is ready.

STEP 7 — ORGANIZER DASHBOARD (FRONTEND PREVIEW)
------------------------------------------------
Open admin.html with Live Server to view the INFINORA organizer dashboard.
The dashboard currently uses clearly-labelled demo preview records only.
Search, event/status filters, local preview status toggles, and CSV export are
provided to demonstrate the interface. No real participant data is loaded,
saved, or transmitted. Supabase integration and secure organizer authentication
must be configured before using this dashboard with actual registrations.

EVENT DETAILS UPDATE (21 NOV 2026)
----------------------------------
Event detail pages now load the event title, description, eligibility, rules,
time/venue/organiser information from event-detail.js.
The event detail media frame displays only supplied video/GIF/image media.
It does not display the old emblem, logo, star ornament or an empty media box.

Current event media mapping:
01 MathTune             images/mathtune-scene.mp4
02 Quiz                 images/quiz-scene.mp4
03 Paper Presentation   images/marauders-map.gif
04 Panic Room           images/murder-scene.mp4
10 Title Event          images/title-scene.mp4

To add or replace a scene later, copy the media into the images folder and
change the matching entry in the eventMedia object in event-detail.js.
Events 05-09 and 11-12 currently have no top media; their media frame stays
hidden until an image, GIF or video is supplied.

IMPORTANT CONTENT CHECKS BEFORE PUBLISHING:
- The supplied latest Step 7 ZIP had generic TBA text for MathTune, rather than
  the previously mentioned MathTune description/rules. Its title and preview
  are set here, but the exact MathTune text should be checked/added if needed.
- Math Bid details supplied two different times: game start 10:30 AM and event
  time 11:30 AM. Both are retained in the page note for organiser confirmation.
- The paper-presentation submission email address was left as not provided.


INFINORA EVENT PAGE UPDATE NOTES
- The Events listing uses individual inline gold SVG emblems only; event videos/GIFs are not shown on the listing cards.
- Each event detail page keeps the same golden preview frame. Supplied media appears inside it; events without media retain a clean, dark empty frame.
- Event preview media is mapped in event-detail.js under eventMedia. Replace/add files in images/ and update that map when new event media is supplied.
- Event emblems are inline SVGs in events.html and can be edited independently of the preview media.


INFO BOX RELIABILITY UPDATE (21 NOV 2026)
----------------------------------------
Every event detail page now includes a permanent INFO box directly in event.html,
after the About / Eligibility / Rules panels. It contains Timing, Venues,
Organizer name and Mobile number, each set to TBA (the WhatsApp row was removed in v4).
Because the box is static HTML, it remains visible even if event-detail.js
fails to load. The event detail JS/CSS references include a version query to
reduce stale browser-cache issues.

GITHUB PAGES DEPLOYMENT IMPORTANT:
1. Extract this ZIP on your computer.
2. Open the extracted 'infinora-homepage' folder.
3. Upload/replace the CONTENTS of that folder in the GitHub repository's
   publishing root (the same level where index.html currently exists).
4. Do NOT upload the whole 'infinora-homepage' folder as a nested folder.
5. Commit to the branch/folder configured in Settings > Pages.
6. Wait for the Pages deployment workflow to finish successfully.
7. Hard-refresh the site (Ctrl+Shift+R) or open a private/incognito tab.


BUG-FIX UPDATE (21 NOV 2026, v3)
--------------------------------
- INFO box: Timing, Venue, Organizer name and Mobile number are now filled
  automatically from event-detail.js (before, they always showed TBA). Anything not supplied stays TBA.
- Layout: the Rules panel no longer leaves an empty hole in the grid; it spans the full width.
- Layout: added the missing gap between the Rules/Note panels and the INFO box.
- Layout: INFO labels and values now share one baseline; event text lines up with the preview frame.
- events.css: the hidden intro section can no longer be re-shown by "display:grid".
- event.html: "&" in RULES & GUIDELINES is now written as &amp; (valid HTML).
- event-detail.js: renamed the variable "event" (it clashed with the browser's window.event).
- register.js: the selected-event line and receipt now show the real event name instead of "NAME TBA".
- admin.js: Verified/Pending counters now follow the table (they were hard-coded and wrong);
  CSV export neutralises cells that start with = + - @ ; download link is more reliable.
- Cache-busting version on event.html bumped to ?v=20261121-info3.


v4 UPDATE – WHATSAPP REMOVED, MATH BID FIELDS, SUPABASE
-------------------------------------------------------
- The "WhatsApp Link" row is removed from the INFO box on every event page.
- Event 09 (Math Bid) registration now also asks for "Fictional Name" and "Character"
  (The Knight / The Master / The Scout). Other events are unchanged.
  To change the characters: edit the <option> list in register.html and CHARACTERS in register.js.
- Admin preview table + CSV now include Fictional Name and Character.
- Supabase (saving + CSV):
  1. Supabase > SQL Editor: run supabase-setup.sql once (creates the table, visitors can only ADD rows).
  2. Open supabase-config.js and paste your Project URL + publishable/anon key. Never a service-role key.
  3. Upload the files to GitHub as before. Until step 2 is done the form stays in preview mode.
  4. CSV: Supabase > SQL Editor > run query A (or B for Math Bid only) from supabase-setup.sql >
     "Download CSV". The columns include Participant, Fictional Name and Character side by side.


v5 UPDATE – PARCHMENT PRINT + CONFIRMATION E-MAIL
-------------------------------------------------
- Print Preview (after registering) now prints on the parchment paper design (images/parchment.jpg),
  A4, with the details on a parchment panel. In the print dialog turn ON "Background graphics"
  if your browser does not print the background by itself.
- Automatic e-mail with the WhatsApp group link: see SETUP-EMAIL.txt and
  supabase/functions/send-confirmation/index.ts. Duplicate registrations (same e-mail + event) are refused.

v6: every event has its own WhatsApp group. Links live in the Supabase table event_groups
(Table Editor > event_groups > whatsapp_link). The confirmation e-mail uses the link of the event the
participant registered for. See SETUP-EMAIL.txt step 3.

v7: print preview box is now transparent; words are bold and dark with a light glow, placed on the clear parchment area below the artwork.
