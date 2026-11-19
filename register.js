const params = new URLSearchParams(location.search);
const raw = params.get("event") || "01";
const eventId = /^\d{1,2}$/.test(raw) ? String(Math.min(12, Math.max(1, Number(raw)))).padStart(2, "0") : "01";
document.getElementById("selectedEvent").textContent = `SELECTED EVENT: EVENT ${eventId} — NAME TBA`;
document.getElementById("backToEvent").href = `event.html?id=${eventId}`;

const form = document.getElementById("registrationForm");
const email = form.elements.email;
const confirmEmail = form.elements.confirmEmail;
const submitButton = form.querySelector('button[type="submit"]');
const checkEmailMatch = () => {
  confirmEmail.setCustomValidity(confirmEmail.value && confirmEmail.value.trim().toLowerCase() !== email.value.trim().toLowerCase() ? "Email addresses do not match." : "");
};
confirmEmail.addEventListener("input", checkEmailMatch);
email.addEventListener("input", checkEmailMatch);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  checkEmailMatch();
  if (!form.reportValidity()) return;

  if (!window.supabase || !window.INFINORA_SUPABASE_URL || !window.INFINORA_SUPABASE_ANON_KEY) {
    alert("Registration service is not configured. Please contact the organizer.");
    return;
  }

  const values = new FormData(form);
  const participant = String(values.get("participant") || "").trim();
  const college = String(values.get("college") || "").trim();
  const referenceCode = `INF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const payload = {
    reference_code: referenceCode,
    college_name: college,
    department: String(values.get("department") || "").trim(),
    studying_year: String(values.get("year") || "").trim(),
    participant_name: participant,
    whatsapp_number: String(values.get("whatsapp") || "").trim(),
    email: email.value.trim().toLowerCase(),
    event_number: Number(eventId)
  };

  submitButton.disabled = true;
  submitButton.textContent = "SUBMITTING…";
  try {
    const client = window.supabase.createClient(
      window.INFINORA_SUPABASE_URL,
      window.INFINORA_SUPABASE_ANON_KEY
    );
    const { data, error } = await client
      .from("registrations")
      .insert(payload);

    if (error) throw error;

    document.getElementById("successName").textContent = participant;
    document.getElementById("receiptName").textContent = participant;
    document.getElementById("receiptCollege").textContent = college;
    document.getElementById("receiptEvent").textContent = `EVENT ${eventId} — NAME TBA`;
    document.getElementById("receiptRef").textContent = referenceCode;
    document.getElementById("receiptDate").textContent =
      new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
    document.getElementById("formCard").hidden = true;
    document.getElementById("successCard").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("INFINORA registration error:", error);
    alert("We could not save your registration. Please check your internet connection and try again. If the problem continues, contact the organizer.");
    submitButton.disabled = false;
    submitButton.innerHTML = 'SUBMIT REGISTRATION <span>↗</span>';
  }
});

document.getElementById("printReceipt").addEventListener("click", () => window.print());
