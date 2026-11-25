const params = new URLSearchParams(location.search);
const raw = params.get("event") || "01";
const eventId = /^\d{1,2}$/.test(raw) ? String(Math.min(12, Math.max(1, Number(raw)))).padStart(2, "0") : "01";
const eventNames = {
  "01": "MATH TUNE", "02": "QUIZ", "03": "MATHEMATICAL PAPER PRESENTATION", "04": "PANIC ROOM",
  "05": "ADZAP", "06": "SHIPWRECK", "07": "FACE PAINTING", "08": "MATH RANGOLI",
  "09": "MATH BID", "10": "MR./MS. INFINORA’26 – TITLE EVENT",
  "11": "POSTER MAKING – INK AND INCANTATION", "12": "REELMAKING"
};
const eventLabel = `EVENT ${eventId} — ${eventNames[eventId] || "NAME TBA"}`;
document.getElementById("selectedEvent").textContent = `SELECTED EVENT: ${eventLabel}`;
document.getElementById("backToEvent").href = `event.html?id=${eventId}`;

const form = document.getElementById("registrationForm");
const email = form.elements.email;
const confirmEmail = form.elements.confirmEmail;
const checkEmailMatch = () => {
  confirmEmail.setCustomValidity(confirmEmail.value && confirmEmail.value.trim().toLowerCase() !== email.value.trim().toLowerCase() ? "Email addresses do not match." : "");
};
confirmEmail.addEventListener("input", checkEmailMatch);
email.addEventListener("input", checkEmailMatch);

// Team sizes follow the event rules currently published on the INFINORA event pages.
// Event 01 has three role-based players (Silent, Headphone and Blindfolded).
const TEAM_CONFIG = {
  "01": { min: 3, max: 3, label: "Exactly 3 participants" },
  "02": { min: 2, max: 2, label: "Exactly 2 participants" },
  "04": { min: 3, max: 3, label: "Exactly 3 participants" },
  "05": { min: 5, max: 6, label: "5–6 participants" },
  "07": { min: 2, max: 2, label: "Exactly 2 participants" },
  "08": { min: 3, max: 3, label: "Exactly 3 participants" },
  "09": { min: 3, max: 3, label: "Exactly 3 participants" },
  "12": { min: 1, max: 3, label: "Up to 3 participants" }
};
const isMathBid = eventId === "09";
const team = TEAM_CONFIG[eventId] || { min: 1, max: 1, label: "Individual registration" };
const participantFields = document.getElementById("participantFields");
const participantHint = document.getElementById("participantHint");
const characters = ["The Knight", "The Master", "The Scout"];

function participantCard(index) {
  const n = index + 1;
  const card = document.createElement("div");
  card.className = "participant-card";
  const title = document.createElement("div");
  title.className = "participant-card-title";
  title.textContent = `PARTICIPANT ${["I", "II", "III", "IV", "V", "VI"][index] || n}`;
  card.append(title);
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Participant Name";
  const name = document.createElement("input");
  name.type = "text"; name.name = `participant_${n}`; name.placeholder = `Enter participant ${n} full name`; name.required = true; name.maxLength = 100;
  nameLabel.append(name); card.append(nameLabel);
  if (isMathBid) {
    const extra = document.createElement("div"); extra.className = "form-row math-bid-participant-row";
    const fictionalLabel = document.createElement("label"); fictionalLabel.textContent = "Fictional Name";
    const fictional = document.createElement("input"); fictional.type = "text"; fictional.name = `fictional_${n}`; fictional.required = true; fictional.maxLength = 60; fictional.placeholder = "Enter fictional name";
    fictionalLabel.append(fictional);
    const characterLabel = document.createElement("label"); characterLabel.textContent = "Choose Character";
    const select = document.createElement("select"); select.name = `character_${n}`; select.required = true;
    select.add(new Option("Select character", ""));
    characters.forEach(c => select.add(new Option(c, c)));
    characterLabel.append(select); extra.append(fictionalLabel, characterLabel); card.append(extra);
  }
  return card;
}

participantHint.textContent = team.label;
for (let i = 0; i < team.max; i++) participantFields.append(participantCard(i));
if (team.min !== team.max) {
  participantHint.textContent = team.label + " — complete at least " + team.min + " participant(s).";
  const cards = [...participantFields.children];
  cards.forEach((card, i) => {
    if (i >= team.min) card.querySelectorAll("input,select").forEach(el => el.required = false);
  });
}

const cfg = window.INFINORA_SUPABASE || {};
const supabaseReady = Boolean(cfg.url && cfg.anonKey);
const errorBox = document.getElementById("formError");
const submitButton = form.querySelector(".submit-button");
if (supabaseReady) document.getElementById("formDisclaimer").textContent = "Your team details are sent to the INFINORA organising team when you submit.";

async function saveToSupabase(row) {
  const response = await fetch(`${cfg.url.replace(/\/$/, "")}/rest/v1/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, Prefer: "return=minimal" },
    body: JSON.stringify(row)
  });
  if (response.status === 409) throw new Error("duplicate");
  if (!response.ok) throw new Error(`Save failed (${response.status}): ${await response.text()}`);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault(); checkEmailMatch();
  if (!form.reportValidity()) return;
  errorBox.hidden = true;
  const values = new FormData(form);
  const text = key => String(values.get(key) || "").trim();
  const participants = [];
  for (let i = 1; i <= team.max; i++) {
    const name = text(`participant_${i}`);
    if (!name) continue;
    const item = { name };
    if (isMathBid) { item.fictional_name = text(`fictional_${i}`); item.character = text(`character_${i}`); }
    participants.push(item);
  }
  if (participants.length < team.min || participants.length > team.max) {
    errorBox.textContent = `Please enter ${team.min === team.max ? `exactly ${team.min}` : `between ${team.min} and ${team.max}`} participant names.`; errorBox.hidden = false; return;
  }
  if (isMathBid && participants.some(p => !p.fictional_name || !characters.includes(p.character))) {
    errorBox.textContent = "For all three participants, enter a fictional name and choose Knight, Master or Scout."; errorBox.hidden = false; return;
  }
  const lead = participants[0];
  const college = text("college");
  const reference = `IF-${supabaseReady ? "REG" : "PREVIEW"}-${eventId}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const row = {
    event_id: eventId, event_name: eventNames[eventId] || null, college,
    department: text("department"), study_year: text("year"), shift: text("shift"),
    participant_name: lead.name, participants,
    whatsapp: text("whatsapp"), email: text("email").toLowerCase(),
    fictional_name: isMathBid ? lead.fictional_name : null,
    game_character: isMathBid ? lead.character : null,
    reference_code: reference
  };
  if (supabaseReady) {
    submitButton.disabled = true;
    try { await saveToSupabase(row); }
    catch (err) {
      submitButton.disabled = false;
      errorBox.textContent = err.message === "duplicate" ? "This e-mail address is already registered for this event." : "Sorry, we could not save your registration. Please check your connection and try again.";
      errorBox.hidden = false; return;
    }
  }
  const dateLabel = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const participantNames = participants.map(p => p.name).join(", ");
  document.getElementById("successName").textContent = lead.name;
  document.getElementById("receiptName").textContent = lead.name;
  document.getElementById("receiptCollege").textContent = college;
  document.getElementById("receiptDepartment").textContent = text("department");
  document.getElementById("receiptYear").textContent = text("year");
  document.getElementById("receiptShift").textContent = text("shift");
  document.getElementById("receiptParticipants").textContent = participantNames;
  document.getElementById("receiptEvent").textContent = eventLabel;
  document.getElementById("receiptRef").textContent = reference;
  document.getElementById("receiptDate").textContent = dateLabel;
  if (supabaseReady) {
    document.querySelector(".success-lead").innerHTML = "Your registration has been received, <strong id=\"successName\"></strong>.";
    document.getElementById("successName").textContent = lead.name;
    document.getElementById("ticketLabel").textContent = "REGISTRATION RECEIVED";
    document.getElementById("previewWarning").textContent = "Please keep this reference. A confirmation e-mail with your WhatsApp group link and a downloadable registration PDF is on its way. Check your inbox and spam folder.";
  }
  document.getElementById("formCard").hidden = true;
  document.getElementById("successCard").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.getElementById("printReceipt").addEventListener("click", () => window.print());
