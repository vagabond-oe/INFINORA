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

// Event 09 (Math Bid) asks for two extra answers: Fictional Name + Character.
// To change the character choices, edit the <option> list in register.html (and the list below).
const CHARACTERS = ["The Knight", "The Master", "The Scout"];
const isMathBid = eventId === "09";
const mathBidFields = document.getElementById("mathBidFields");
mathBidFields.hidden = !isMathBid;
form.elements.fictionalName.required = isMathBid;
form.elements.character.required = isMathBid;

const cfg = window.INFINORA_SUPABASE || {};
const supabaseReady = Boolean(cfg.url && cfg.anonKey);
const errorBox = document.getElementById("formError");
const submitButton = form.querySelector(".submit-button");
if (supabaseReady) {
  document.getElementById("formDisclaimer").textContent = "Your details are sent to the INFINORA organising team when you submit.";
}

async function saveToSupabase(row) {
  const response = await fetch(`${cfg.url.replace(/\/$/, "")}/rest/v1/registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.anonKey,
      Authorization: `Bearer ${cfg.anonKey}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify(row)
  });
  if (response.status === 409) throw new Error("duplicate");
  if (!response.ok) throw new Error(`Save failed (${response.status})`);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  checkEmailMatch();
  if (!form.reportValidity()) return;
  errorBox.hidden = true;

  const values = new FormData(form);
  const text = (key) => String(values.get(key) || "").trim();
  const participant = text("participant") || "Guest";
  const college = text("college") || "—";
  const fictionalName = isMathBid ? text("fictionalName") : "";
  const character = isMathBid ? text("character") : "";
  if (isMathBid && !CHARACTERS.includes(character)) { errorBox.textContent = "Please choose a character."; errorBox.hidden = false; return; }
  const reference = `IF-${supabaseReady ? "REG" : "PREVIEW"}-${eventId}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  if (supabaseReady) {
    submitButton.disabled = true;
    try {
      await saveToSupabase({
        event_id: eventId,
        event_name: eventNames[eventId] || null,
        college,
        department: text("department"),
        study_year: text("year"),
        participant_name: participant,
        whatsapp: text("whatsapp"),
        email: text("email").toLowerCase(),
        fictional_name: fictionalName || null,
        game_character: character || null,
        reference_code: reference
      });
    } catch (err) {
      submitButton.disabled = false;
      errorBox.textContent = err.message === "duplicate"
        ? "This e-mail address is already registered for this event."
        : "Sorry, we could not save your registration. Please check your connection and try again.";
      errorBox.hidden = false;
      return;
    }
  }

  const dateLabel = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  document.getElementById("successName").textContent = participant;
  document.getElementById("receiptName").textContent = participant;
  document.getElementById("receiptCollege").textContent = college;
  document.getElementById("receiptEvent").textContent = eventLabel;
  document.getElementById("receiptRef").textContent = reference;
  document.getElementById("receiptDate").textContent = dateLabel;
  if (isMathBid) {
    document.getElementById("receiptFictional").textContent = fictionalName;
    document.getElementById("receiptCharacter").textContent = character;
    document.getElementById("receiptFictionalRow").hidden = false;
    document.getElementById("receiptCharacterRow").hidden = false;
  }
  if (supabaseReady) {
    document.querySelector(".success-lead").innerHTML = "Your registration has been received, <strong id=\"successName\"></strong>.";
    document.getElementById("successName").textContent = participant;
    document.getElementById("ticketLabel").textContent = "REGISTRATION RECEIVED";
    document.getElementById("previewWarning").textContent = "Please keep this reference. A confirmation e-mail with your WhatsApp group link is on its way. Check your inbox and spam folder.";
  }
  document.getElementById("formCard").hidden = true;
  document.getElementById("successCard").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("printReceipt").addEventListener("click", () => window.print());
