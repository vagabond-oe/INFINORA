const params = new URLSearchParams(window.location.search);
const rawId = params.get("id") || "01";
const id = /^\d{1,2}$/.test(rawId) ? String(Math.min(12, Math.max(1, Number(rawId)))).padStart(2, "0") : "01";

const eventMedia = {
  "02": {
    "type": "video",
    "src": "images/quiz-scene.mp4",
    "alt": "Quiz cinematic preview"
  },
  "03": {
    "type": "image",
    "src": "images/marauders-map.gif",
    "alt": "Marauder's Map animated preview"
  },
  "04": {
    "type": "video",
    "src": "images/murder-scene.mp4",
    "alt": "Vanish Vault event preview"
  },
  "10": {
    "type": "video",
    "src": "images/title-scene.mp4",
    "alt": "INFINORA title cinematic preview"
  }
};
const events = window.INFINORA_EVENT_DEFAULTS || {};
window.INFINORA_EVENT_DEFAULTS = events;
const eventData = events[id] || events["01"];
document.getElementById("eventNumber").textContent = `EVENT ${id}`;
document.getElementById("eventTitle").textContent = eventData.title;
document.getElementById("eventSubtitle").textContent = eventData.subtitle || "";
document.getElementById("eventIntro").textContent = eventData.intro || "";
document.title = `${eventData.title} | INFINORA`;
const register = document.querySelector(".register-cta");
register.href = `register.html?event=${id}`;
if (id === "10") register.hidden = true;

const art = document.getElementById("detailArt");
const media = eventMedia[id];
if (media) {
  if (media.type === "video") {
    const video = document.createElement("video"); video.src = media.src; video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true; video.preload = "metadata"; video.setAttribute("aria-label", media.alt); art.appendChild(video); video.play().catch(() => { video.controls = true; });
  } else { const image = document.createElement("img"); image.src = media.src; image.alt = media.alt; art.appendChild(image); }
}
const panels = document.getElementById("detailPanels"); panels.innerHTML = "";
function addPanel(title, content, list = false, wide = false) {
  const article = document.createElement("article"); article.className = wide ? "info-panel wide" : "info-panel";
  const heading = document.createElement("h2"); heading.textContent = title; article.appendChild(heading);
  if (list) { const ul = document.createElement("ul"); content.forEach(item => { const li = document.createElement("li"); li.textContent = item; ul.appendChild(li); }); article.appendChild(ul); }
  else { const p = document.createElement("p"); p.textContent = content; article.appendChild(p); }
  panels.appendChild(article);
}
addPanel("ABOUT THE EVENT", eventData.about || "Details will be announced soon.");
addPanel("ELIGIBILITY", eventData.eligibility || "To Be Announced.");
addPanel("RULES & GUIDELINES", eventData.rules || ["To Be Announced."], true, true);
addPanel("IMPORTANT NOTE", eventData.note || "TBA", false, true);
const importantNotePanel = panels.lastElementChild;
const infoCells = {};
document.querySelectorAll(".event-info-row").forEach(row => { const label = row.querySelector("dt"), value = row.querySelector("dd"); if (label && value) infoCells[label.textContent.trim()] = value; });
function fillInfo(label, text, href) { const cell = infoCells[label]; if (!cell || !text) return; cell.textContent = ""; if (!href) { cell.textContent = text; return; } const link = document.createElement("a"); link.href = href; link.textContent = text; cell.appendChild(link); }
fillInfo("Timing", eventData.time); fillInfo("Venue", eventData.venue || "TBA");

// All editable event details are loaded from Supabase; static event data remains the fallback.
function updatePanel(headingText, content, list=false) {
  const article=[...panels.querySelectorAll('.info-panel')].find(a=>a.querySelector('h2')?.textContent===headingText);
  if(!article)return;
  const old=article.querySelector('p,ul'); if(old)old.remove();
  if(list){const ul=document.createElement('ul');(Array.isArray(content)?content:[]).forEach(item=>{const li=document.createElement('li');li.textContent=item;ul.appendChild(li);});article.appendChild(ul);}
  else{const p=document.createElement('p');p.textContent=content||'To Be Announced.';article.appendChild(p);}
}
function updateOrganizer(name, phone){
  fillInfo('Organizer name',name||'To Be Announced');
  const digits=String(phone||'').replace(/\D/g,'');
  fillInfo('Mobile number',phone||'To Be Announced',digits?`tel:${digits}`:undefined);
}
updateOrganizer((eventData.organizer||'').split(/[–-]/)[0].trim(),((eventData.organizer||'').match(/[–-]\s*(.*)$/)||[])[1]||'');
(async function loadEditableEventContent(){
  const cfg=window.INFINORA_SUPABASE||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey)return;
  try{
    const client=window.supabase.createClient(cfg.url,cfg.anonKey);
    const {data,error}=await client.from('event_content').select('title,subtitle,intro,about,eligibility,rules,event_time,venue,organizer_name,organizer_phone,important_note').eq('event_id',id).maybeSingle();
    if(error)throw error;if(!data)return;
    if(data.title){document.getElementById('eventTitle').textContent=data.title;document.title=`${data.title} | INFINORA`;}
    if(data.subtitle!==null&&data.subtitle!==undefined)document.getElementById('eventSubtitle').textContent=data.subtitle;
    if(data.intro)document.getElementById('eventIntro').textContent=data.intro;
    if(data.about)updatePanel('ABOUT THE EVENT',data.about);
    if(data.eligibility)updatePanel('ELIGIBILITY',data.eligibility);
    if(Array.isArray(data.rules))updatePanel('RULES & GUIDELINES',data.rules,true);
    fillInfo('Timing',data.event_time||eventData.time);
    fillInfo('Venue',data.venue||eventData.venue||'TBA');
    updateOrganizer(data.organizer_name||((eventData.organizer||'').split(/[–-]/)[0].trim()),data.organizer_phone||(((eventData.organizer||'').match(/[–-]\s*(.*)$/)||[])[1]||''));
    if(data.important_note!==null&&data.important_note!==undefined)updatePanel('IMPORTANT NOTE',data.important_note);
  }catch(error){console.warn('Editable event information could not be loaded; showing default details.',error);}
})();