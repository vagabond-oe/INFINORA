/* INFINORA organizer dashboard — interface preview only.
   No real participant data is loaded, stored, or transmitted. Replace the demo adapter
   with Supabase queries and authenticated organizer access during the integration step. */
const DEMO_MODE = true;
const demoRecords = [
  {id:'IF-DEMO-001',name:'Aarav Kumar',college:'Loyola College',email:'aarav@example.test',event:1,date:'19 Nov 2026',status:'Pending'},
  {id:'IF-DEMO-002',name:'Meera S',college:'Ethiraj College',email:'meera@example.test',event:2,date:'19 Nov 2026',status:'Verified'},
  {id:'IF-DEMO-003',name:'Rithik Raj',college:'Presidency College',email:'rithik@example.test',event:4,date:'18 Nov 2026',status:'Pending'},
  {id:'IF-DEMO-004',name:'Nivetha R',college:'Loyola College',email:'nivetha@example.test',event:1,date:'18 Nov 2026',status:'Verified'},
  {id:'IF-DEMO-005',name:'Arjun P',college:'Madras Christian College',email:'arjun@example.test',event:7,date:'17 Nov 2026',status:'Pending'},
  {id:'IF-DEMO-006',name:'Diya Thomas',college:'Stella Maris College',email:'diya@example.test',event:3,date:'17 Nov 2026',status:'Verified'},
  {id:'IF-DEMO-007',name:'Karthik M',college:'Loyola College',email:'karthik@example.test',event:9,date:'17 Nov 2026',status:'Pending',fictionalName:'Sir Galleon',character:'The Knight'}
];
let records = DEMO_MODE ? demoRecords.map(x=>({...x})) : [];
const $ = id => document.getElementById(id);
const eventFilter = $('eventFilter'), statusFilter = $('statusFilter'), searchInput = $('searchInput');
for(let n=1;n<=12;n++){const o=document.createElement('option');o.value=String(n);o.textContent=`Event ${String(n).padStart(2,'0')}`;eventFilter.append(o)}
$('eventSummary').innerHTML=Array.from({length:12},(_,i)=>`<div class="event-mini"><b>${String(i+1).padStart(2,'0')}</b><span>EVENT ${String(i+1).padStart(2,'0')}</span></div>`).join('');
function showToast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2800)}
function render(){const total=records.length,verified=records.filter(r=>r.status==='Verified').length;const pad=n=>String(n).padStart(2,'0');$('totalCount').textContent=pad(total);$('verifiedCount').textContent=pad(verified);$('pendingCount').textContent=pad(total-verified);
 const q=searchInput.value.trim().toLowerCase(),ev=eventFilter.value,st=statusFilter.value;
 const rows=records.filter(r=>(ev==='all'||String(r.event)===ev)&&(st==='all'||r.status===st)&&[r.name,r.college,r.email,r.id].some(v=>String(v).toLowerCase().includes(q)));
 $('registrationRows').innerHTML=rows.length?rows.map(r=>`<tr><td><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.email)}</small></td><td>${escapeHtml(r.college)}</td><td>EVENT ${String(r.event).padStart(2,'0')}${r.character?`<small>${escapeHtml(r.character)} · ${escapeHtml(r.fictionalName||'')}</small>`:''}</td><td>${escapeHtml(r.date)}</td><td><span class="status ${r.status.toLowerCase()}">${r.status}</span></td><td><button class="row-action" data-id="${r.id}">${r.status==='Verified'?'MARK PENDING':'VERIFY'}</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty-row">No matching records. Try another search or filter.</td></tr>`;
 $('recordCount').textContent=`Showing ${rows.length} of ${total} ${DEMO_MODE?'demo preview':'live'} records`;document.querySelectorAll('.row-action').forEach(b=>b.addEventListener('click',()=>{const rec=records.find(r=>r.id===b.dataset.id);if(!rec)return;rec.status=rec.status==='Verified'?'Pending':'Verified';render();showToast('Preview status updated locally only.')}));}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
[searchInput,eventFilter,statusFilter].forEach(el=>el.addEventListener(el===searchInput?'input':'change',render));
$('exportCsv').addEventListener('click',()=>{if(!records.length){showToast('No records to export yet.');return}const headers=['Reference','Participant','College','Email','Event','Fictional Name','Character','Registered','Status'];const lines=[headers,...records.map(r=>[r.id,r.name,r.college,r.email,`Event ${String(r.event).padStart(2,'0')}`,r.fictionalName||'',r.character||'',r.date,r.status])];const safeCell=v=>{v=String(v);return /^[=+\-@\t\r]/.test(v)?"'"+v:v};const csv=lines.map(row=>row.map(v=>'"'+safeCell(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='infinora-registration-preview.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Demo CSV exported. It contains sample data only.');});
$('mobileMenu').addEventListener('click',()=>$('sidebar').classList.toggle('open'));document.querySelectorAll('.side-link').forEach(a=>a.addEventListener('click',()=>$('sidebar').classList.remove('open')));
render();
