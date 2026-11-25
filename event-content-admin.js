/* INFINORA complete event-content editor. Organizer access is verified by Supabase RLS. */
(() => {
  const cfg = window.INFINORA_SUPABASE || {};
  const $ = id => document.getElementById(id);
  const loginForm = $('eventContentLoginForm');
  if (!loginForm) return;
  const eventNames = {
    '01':'Operation Hogwarts','02':"Snape's Inquisition",'03':'Mathnova','04':'Vanish Vault',
    '05':'Adzardry','06':'Math-O-Mania','07':'The Mystic Brush','08':'The Wizarding Canvas',
    '09':'The Goblet of Galleons','10':"Mr./Ms. INFINORA'26",'11':'Ink and Incantation','12':'Framora'
  };
  const status = (message, error=false) => {
    const el=$('eventContentStatus'); if(el){el.textContent=message;el.style.color=error?'#ff9b9b':'';}
  };
  if (!window.supabase || !cfg.url || !cfg.anonKey) {
    status('Supabase configuration is missing.', true); $('contentAdminLogin').disabled=true; return;
  }
  const client=window.supabase.createClient(cfg.url,cfg.anonKey);
  window.INFINORA_ADMIN_CLIENT=client;
  const select=$('contentEventSelect');
  Object.entries(eventNames).forEach(([id,name])=>select.add(new Option(`EVENT ${id} — ${name}`,id)));
  let authorized=false;
  const defaults=window.INFINORA_EVENT_DEFAULTS||{};
  const parseOrganizer=value=>{
    const m=/^(.*?)\s*[–-]\s*(\+?[\d\s()+-]{8,})$/.exec(value||'');
    return m?{name:m[1].trim(),phone:m[2].trim()}:{name:value||'',phone:''};
  };
  async function verifyOrganizer(user){
    const {data,error}=await client.from('event_content_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    if(!data)throw new Error('This account is not authorized to manage INFINORA.');
  }
  async function loadSelectedEvent(){
    if(!authorized)return;
    status('Loading event information…');
    const eventId=select.value, fallback=defaults[eventId]||{};
    const {data,error}=await client.from('event_content').select('*').eq('event_id',eventId).maybeSingle();
    if(error)throw error;
    const row=data||{}; const organizer=parseOrganizer(fallback.organizer);
    $('contentTitle').value=row.title??fallback.title??'';
    $('contentSubtitle').value=row.subtitle??fallback.subtitle??'';
    $('contentTime').value=row.event_time??fallback.time??'';
    $('contentVenue').value=row.venue??fallback.venue??'TBA';
    $('contentOrganizerName').value=row.organizer_name??organizer.name;
    $('contentOrganizerPhone').value=row.organizer_phone??organizer.phone;
    $('contentIntro').value=row.intro??fallback.intro??'';
    $('contentAbout').value=row.about??fallback.about??'';
    $('contentEligibility').value=row.eligibility??fallback.eligibility??'';
    $('contentRules').value=Array.isArray(row.rules)?row.rules.join('\n'):(fallback.rules||[]).join('\n');
    $('contentImportantNote').value=row.important_note??fallback.note??'TBA';
    status(`Loaded ${eventNames[eventId]}.`);
  }
  function showEditor(user){
    authorized=true; loginForm.hidden=true; $('eventContentEditor').hidden=false;
    $('contentAdminIdentity').textContent=`SIGNED IN: ${user.email||user.id}`;
    document.dispatchEvent(new CustomEvent('infinora-admin-authenticated',{detail:{user}}));
    loadSelectedEvent().catch(e=>status(e.message||'Could not load event details.',true));
  }
  async function checkSession(){
    const {data,error}=await client.auth.getSession(); if(error)throw error;
    if(!data.session?.user)return;
    try{await verifyOrganizer(data.session.user);showEditor(data.session.user);}
    catch(e){await client.auth.signOut();status(e.message||'This account is not authorized.',true);}
  }
  loginForm.addEventListener('submit',async e=>{
    e.preventDefault();const button=$('contentAdminLogin');button.disabled=true;button.textContent='SIGNING IN…';
    try{
      const {data,error}=await client.auth.signInWithPassword({email:$('contentAdminEmail').value.trim(),password:$('contentAdminPassword').value});
      if(error)throw error; await verifyOrganizer(data.user);$('contentAdminPassword').value='';showEditor(data.user);
    }catch(err){await client.auth.signOut();status(err.message||'Sign-in failed.',true);}
    finally{button.disabled=false;button.textContent='SIGN IN TO EDIT';}
  });
  select.addEventListener('change',()=>loadSelectedEvent().catch(e=>status(e.message||'Could not load event details.',true)));
  $('saveEventContent').addEventListener('click',async()=>{
    if(!authorized)return;
    const button=$('saveEventContent');button.disabled=true;button.textContent='SAVING…';
    const eventId=select.value;
    const payload={
      event_id:eventId,title:$('contentTitle').value.trim(),subtitle:$('contentSubtitle').value.trim(),
      event_time:$('contentTime').value.trim(),venue:$('contentVenue').value.trim()||'TBA',
      organizer_name:$('contentOrganizerName').value.trim(),organizer_phone:$('contentOrganizerPhone').value.trim(),
      intro:$('contentIntro').value.trim(),about:$('contentAbout').value.trim(),eligibility:$('contentEligibility').value.trim(),
      rules:$('contentRules').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),
      important_note:$('contentImportantNote').value.trim()||'TBA',updated_at:new Date().toISOString()
    };
    try{
      const {error}=await client.from('event_content').upsert(payload,{onConflict:'event_id'});
      if(error)throw error;status(`Saved all details for ${eventNames[eventId]}. The public event page will show the changes.`);
      document.dispatchEvent(new CustomEvent('infinora-event-content-saved',{detail:{eventId}}));
    }catch(e){status(e.message||'Could not save event details.',true);}
    finally{button.disabled=false;button.textContent='SAVE ALL EVENT CHANGES';}
  });
  $('contentAdminSignOut').addEventListener('click',async()=>{
    await client.auth.signOut();authorized=false;$('eventContentEditor').hidden=true;loginForm.hidden=false;
    $('contentAdminPassword').value='';document.dispatchEvent(new CustomEvent('infinora-admin-signed-out'));status('Signed out.');
  });
  checkSession().catch(e=>status(e.message||'Could not check organizer session.',true));
})();
