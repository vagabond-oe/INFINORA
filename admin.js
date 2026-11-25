/* INFINORA live organizer dashboard — no demo/sample registration data. */
(() => {
  const $=id=>document.getElementById(id);
  const cfg=window.INFINORA_SUPABASE||{};
  const client=window.INFINORA_ADMIN_CLIENT||(window.supabase&&cfg.url&&cfg.anonKey?window.supabase.createClient(cfg.url,cfg.anonKey):null);
  const eventFilter=$('eventFilter'),statusFilter=$('statusFilter'),searchInput=$('searchInput');
  const eventNames={
    '01':'Operation Hogwarts', '02':"Snape's Inquisition", '03':'Mathnova', '04':'Vanish Vault',
    '05':'Adzardry', '06':'Math-O-Mania', '07':'The Mystic Brush', '08':'The Wizarding Canvas',
    '09':'The Goblet of Galleons', '10':"Mr./Ms. INFINORA'26", '11':'Ink and Incantation', '12':'Framora'
  };
  let records=[];let authorized=false;let loading=false;let realtimeChannel=null;
  for(let n=1;n<=12;n++){
    const id=String(n).padStart(2,'0');
    const option=new Option(`Event ${id} — ${eventNames[id]}`,id);eventFilter.add(option);
  }
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3000);}
  function setMessage(message){$('registrationRows').innerHTML=`<tr><td colspan="6" class="empty-row">${esc(message)}</td></tr>`;$('recordCount').textContent=message;}
  function participantList(r){
    const members=Array.isArray(r.participants)&&r.participants.length?r.participants:[{name:r.participant_name,fictional_name:r.fictional_name,character:r.game_character}];
    return members.map((p,i)=>`${i+1}. ${p.name||'—'}${r.event_id==='09'?` · ${p.fictional_name||''} (${p.character||''})`:''}`).join('\n');
  }
  function filtered(){
    const q=searchInput.value.trim().toLowerCase(),ev=eventFilter.value,st=statusFilter.value;
    return records.filter(r=>{
      const names=participantList(r);
      return (ev==='all'||String(r.event_id)===ev)&&(st==='all'||r.status===st)&&
        [r.reference_code,r.participant_name,r.college,r.department,r.email,r.whatsapp,r.event_name,names].some(v=>String(v||'').toLowerCase().includes(q));
    });
  }
  function render(){
    const total=records.length,verified=records.filter(r=>r.status==='Verified').length;
    $('totalCount').textContent=String(total).padStart(2,'0');$('verifiedCount').textContent=String(verified).padStart(2,'0');$('pendingCount').textContent=String(total-verified).padStart(2,'0');
    const counts={};records.forEach(r=>{counts[r.event_id]=(counts[r.event_id]||0)+1;});
    $('eventSummary').innerHTML=Object.keys(eventNames).map(id=>`<div class="event-mini"><b>${String(counts[id]||0).padStart(2,'0')}</b><span>${esc(eventNames[id])}</span></div>`).join('');
    const rows=filtered();
    $('registrationRows').innerHTML=rows.length?rows.map(r=>{
      const eventId=String(r.event_id||'').padStart(2,'0');
      const date=r.created_at?new Date(r.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'—';
      const people=participantList(r).split('\n').map(x=>`<small>${esc(x)}</small>`).join('');
      return `<tr>
        <td><strong>${esc(r.participant_name||'—')}</strong>${people}<small>${esc(r.email||'')}</small><small>Ref: ${esc(r.reference_code||'')}</small></td>
        <td>${esc(r.college||'—')}<small>${esc(r.department||'')} · ${esc(r.study_year||'')}</small><small>${esc(r.shift||'')}</small></td>
        <td>EVENT ${esc(eventId)}<small>${esc(r.event_name||eventNames[eventId]||'')}</small></td>
        <td>${esc(date)}</td><td><span class="status ${String(r.status||'Pending').toLowerCase()}">${esc(r.status||'Pending')}</span></td>
        <td><button class="row-action" data-id="${esc(r.id)}" type="button">${r.status==='Verified'?'MARK PENDING':'VERIFY'}</button></td>
      </tr>`;
    }).join(''):`<tr><td colspan="6" class="empty-row">No live registrations match this search.</td></tr>`;
    $('recordCount').textContent=`Showing ${rows.length} of ${total} live registrations`;
    document.querySelectorAll('.row-action').forEach(b=>b.addEventListener('click',()=>changeStatus(b.dataset.id)));
  }
  async function verifyAdmin(user){
    const {data,error}=await client.from('event_content_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error)throw error;if(!data)throw new Error('This login is not on the authorized organizer list.');
  }
  async function loadRecords(){
    if(!authorized||loading)return;loading=true;setMessage('Loading live registrations from Supabase…');
    try{
      const {data,error}=await client.from('registrations').select('*').order('created_at',{ascending:false});
      if(error)throw error;records=data||[];render();
    }catch(e){setMessage(`Could not load registrations: ${e.message||e}`);toast('Registration loading failed.');}
    finally{loading=false;}
  }
  async function activate(user){
    try{
      await verifyAdmin(user);authorized=true;
      $('recordCount').textContent='Organizer access verified. Loading live registrations…';
      await loadRecords();
      if(!realtimeChannel){
        realtimeChannel=client.channel('infinora-admin-registration-feed')
          .on('postgres_changes',{event:'*',schema:'public',table:'registrations'},()=>loadRecords())
          .subscribe();
      }
    }catch(e){authorized=false;setMessage(e.message||'Organizer access required. Sign in above.');}
  }
  async function changeStatus(id){
    const rec=records.find(r=>String(r.id)===String(id));if(!rec)return;
    const next=rec.status==='Verified'?'Pending':'Verified';
    try{
      const {error}=await client.from('registrations').update({status:next}).eq('id',id);
      if(error)throw error;rec.status=next;render();toast(`Registration marked ${next}.`);
    }catch(e){toast(`Could not update status: ${e.message||e}`);}
  }
  function exportCsv(){
    if(!records.length){toast('No live registrations to export.');return;}
    const headers=['Reference','Event ID','Event','Participant Names','College','Department','Year','Shift','Email','WhatsApp','Registered At','Status'];
    const rows=records.map(r=>[r.reference_code,r.event_id,r.event_name||eventNames[r.event_id],participantList(r),r.college,r.department,r.study_year,r.shift,r.email,r.whatsapp,r.created_at,r.status]);
    const safe=v=>{v=String(v??'');return /^[=+\-@\t\r]/.test(v)?"'"+v:v;};
    const csv=[headers,...rows].map(row=>row.map(v=>'"'+safe(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='infinora-live-registrations.csv';a.click();URL.revokeObjectURL(url);toast('Live registrations exported.');
  }
  [searchInput,eventFilter,statusFilter].forEach(el=>el.addEventListener(el===searchInput?'input':'change',render));
  $('exportCsv').addEventListener('click',exportCsv);$('refreshRegistrations').addEventListener('click',loadRecords);
  $('mobileMenu').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
  document.querySelectorAll('.side-link').forEach(a=>a.addEventListener('click',()=>$('sidebar').classList.remove('open')));
  document.addEventListener('infinora-admin-authenticated',e=>activate(e.detail.user));
  document.addEventListener('infinora-admin-signed-out',()=>{authorized=false;records=[];if(realtimeChannel){client.removeChannel(realtimeChannel);realtimeChannel=null;}render();setMessage('Sign in with an authorized organizer account to load live registrations.');});
  if(!client){setMessage('Supabase configuration is missing.');return;}
  client.auth.getSession().then(({data,error})=>{if(error)throw error;if(data.session?.user)activate(data.session.user);else setMessage('Sign in with an authorized organizer account to load live registrations.');}).catch(e=>setMessage(e.message||'Could not check organizer session.'));
})();
