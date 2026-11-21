// INFINORA – sends the confirmation e-mail (with the WhatsApp group link) after a registration.
// Triggered by a Supabase Database Webhook on INSERT into public.registrations.
// Secrets needed (set with `supabase secrets set ...`, see SETUP-EMAIL.txt):
//   BREVO_API_KEY, SENDER_EMAIL, SENDER_NAME, WEBHOOK_SECRET
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by Supabase.

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  // 1. Only accept calls that carry our shared secret (set in the webhook's HTTP headers).
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || payload.type !== "INSERT" || !payload.record) {
    return new Response("Ignored", { status: 200 });
  }
  const r = payload.record;

  // 2. Find the WhatsApp group of THIS event in the event_groups table (edit links in Table Editor).
  const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  let candidate = "";
  try {
    const g = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/event_groups?event_id=eq.${encodeURIComponent(r.event_id)}&select=whatsapp_link`,
      { headers: { apikey: svc, Authorization: `Bearer ${svc}` } },
    );
    if (g.ok) candidate = ((await g.json())[0]?.whatsapp_link ?? "").trim();
  } catch (e) { console.error("event_groups lookup failed", e); }
  // Valid only if it is a real WhatsApp invite link; otherwise the mail says the link will follow.
  const groupLink = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(candidate) ? candidate : "";

  const isMathBid = r.event_id === "09";
  const rows: [string, string][] = [
    ["Participant", r.participant_name],
    ["Event", `Event ${r.event_id} – ${r.event_name ?? ""}`],
    ["College", r.college],
  ];
  if (isMathBid) {
    rows.push(["Fictional name", r.fictional_name], ["Character", r.game_character]);
  }
  rows.push(["Reference", r.reference_code]);

  const rowsHtml = rows.map(([k, v]) =>
    `<tr><td style="padding:7px 0;color:#7a5a2c;font-size:12px;letter-spacing:1px;text-transform:uppercase">${esc(k)}</td>` +
    `<td style="padding:7px 0;color:#2f1c08;font-weight:600;text-align:right">${esc(v)}</td></tr>`).join("");

  const groupHtml = groupLink
    ? `<p style="margin:26px 0 8px;text-align:center"><a href="${esc(groupLink)}" style="display:inline-block;background:#25a244;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:4px">Join the WhatsApp group</a></p>
       <p style="margin:0;text-align:center;font-size:12px;color:#7a5a2c">Tap the button above on your phone. Please do not share this link outside your registration.</p>`
    : `<p style="text-align:center;color:#7a5a2c;font-size:13px">The WhatsApp group link will be shared with you soon.</p>`;

  const html = `<div style="background:#efe0bb;padding:24px;font-family:Georgia,serif">
  <div style="max-width:520px;margin:auto;background:#f6ebcf;border:1px solid #8a6330;padding:30px">
    <p style="text-align:center;letter-spacing:4px;font-size:12px;color:#8a6330;margin:0">INFINORA 2026</p>
    <h1 style="text-align:center;font-size:24px;color:#4a2e10;margin:10px 0 18px">Your journey awaits, ${esc(r.participant_name)}</h1>
    <p style="color:#3a2410;line-height:1.6;text-align:center;margin:0 0 18px">Your registration has been received. Here are your details:</p>
    <table width="100%" style="border-top:1px solid #c9a56a;border-bottom:1px solid #c9a56a;border-collapse:collapse">${rowsHtml}</table>
    ${groupHtml}
    <p style="margin:26px 0 0;text-align:center;font-size:12px;color:#7a5a2c">This is an automatic message from the INFINORA organising team.</p>
  </div></div>`;

  // 3. Send through Brevo (free plan, only needs a verified sender e-mail address).
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": Deno.env.get("BREVO_API_KEY")!, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: Deno.env.get("SENDER_NAME") || "INFINORA", email: Deno.env.get("SENDER_EMAIL") },
      to: [{ email: r.email, name: r.participant_name }],
      subject: `INFINORA registration confirmed – Event ${r.event_id}`,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error("Brevo error", res.status, await res.text());
    return new Response("Email failed", { status: 502 });
  }

  // 4. Remember that the mail was sent (visible in the CSV / Table Editor).
  await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/registrations?id=eq.${r.id}`, {
    method: "PATCH",
    headers: {
      apikey: svc,
      Authorization: `Bearer ${svc}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ confirmation_sent_at: new Date().toISOString() }),
  });

  return new Response("Sent", { status: 200 });
});
