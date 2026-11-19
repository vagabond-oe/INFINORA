const $ = id => document.getElementById(id);
const showToast = message => {
  const t = $("toast"); t.textContent = message; t.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => t.classList.remove("show"), 3000);
};
$("totalCount").textContent = "—";
$("verifiedCount").textContent = "—";
$("pendingCount").textContent = "—";
$("eventSummary").innerHTML = Array.from({length:12},(_,i)=>
  `<div class="event-mini"><b>${String(i+1).padStart(2,"0")}</b><span>EVENT ${String(i+1).padStart(2,"0")}</span></div>`
).join("");
$("registrationRows").innerHTML =
  `<tr><td colspan="6" class="empty-row">Participant records are kept in your private Supabase project. Use the button above to open the database and export the real registrations as CSV.</td></tr>`;
$("recordCount").textContent = "Open Supabase to view live registrations";
$("searchInput").disabled = true;
$("eventFilter").disabled = true;
$("statusFilter").disabled = true;
$("exportCsv").textContent = "OPEN DATABASE / EXPORT CSV";
$("exportCsv").addEventListener("click", () => {
  window.open("https://supabase.com/dashboard/project/vinxjahrdrahhzweyomm/editor", "_blank", "noopener");
  showToast("Open public.registrations in Table Editor, then choose Export → CSV.");
});
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.querySelectorAll(".side-link").forEach(a=>a.addEventListener("click",()=>$("sidebar").classList.remove("open")));
