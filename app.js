const LS = {
  g: k => { try { return JSON.parse(localStorage.getItem(k)||'[]'); } catch { return []; } },
  s: (k,v) => localStorage.setItem(k, JSON.stringify(v))
};
let P = LS.g('rtm_p'), T = LS.g('rtm_t'), Y = LS.g('rtm_y'), M = LS.g('rtm_m');
const save = () => { LS.s('rtm_p',P); LS.s('rtm_t',T); LS.s('rtm_y',Y); LS.s('rtm_m',M); };
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const td = () => new Date().toISOString().split('T')[0];
const fmt = n => 'PKR '+Number(n||0).toLocaleString();
const dif = (a,b) => Math.floor((new Date(a)-new Date(b))/864e5);
const gp = id => P.find(x=>x.id===id)||{};
const gt = id => T.find(x=>x.id===id)||{};

function toast(msg, type='g') {
  const d=document.createElement('div');
  d.className=`ti a${type}`; d.textContent=msg;
  document.getElementById('toast').appendChild(d);
  setTimeout(()=>d.remove(),2800);
}

function go(id,btn) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));
  document.getElementById('page-'+id).classList.add('on');
  if(btn) btn.classList.add('on');
  rAll();
}

let ePid=null, eTid=null;

function saveProp() {
  const a=document.getElementById('p-addr').value.trim();
  const ty=document.getElementById('p-type').value;
  const r=parseFloat(document.getElementById('p-rent').value);
  if(!a||!r){toast('Enter address and rent','r');return;}
  if(ePid){const p=P.find(x=>x.id===ePid);Object.assign(p,{address:a,type:ty,rent:r});ePid=null;document.getElementById('pt').textContent='Add Property';}
  else P.push({id:uid(),address:a,type:ty,rent:r,occupied:false});
  save();clearProp();renderProps();rDrops();rDash();toast('Property saved!');
}
function clearProp(){document.getElementById('p-addr').value='';document.getElementById('p-rent').value='';document.getElementById('p-type').value='Apartment';ePid=null;document.getElementById('pt').textContent='Add Property';}
function editProp(id){const p=gp(id);document.getElementById('p-addr').value=p.address;document.getElementById('p-type').value=p.type;document.getElementById('p-rent').value=p.rent;ePid=id;document.getElementById('pt').textContent='Edit Property';}
function delProp(id){if(!confirm('Delete property?'))return;P=P.filter(x=>x.id!==id);save();renderProps();rDrops();rDash();toast('Deleted','y');}
function renderProps(){
  const tb=document.getElementById('p-tb');
  if(!P.length){tb.innerHTML='<tr><td colspan="6" class="empty">No properties yet.</td></tr>';return;}
  tb.innerHTML=P.map((p,i)=>`<tr><td>${i+1}</td><td>${p.address}</td><td>${p.type}</td><td>${fmt(p.rent)}/mo</td>
  <td><span class="badge ${p.occupied?'by':'bg'}">${p.occupied?'Occupied':'Vacant'}</span></td>
  <td><button class="btn bp bs" onclick="editProp('${p.id}')">Edit</button> <button class="btn bd bs" onclick="delProp('${p.id}')">Del</button></td></tr>`).join('');
}

function saveTen(){
  const n=document.getElementById('t-name').value.trim();
  const c=document.getElementById('t-cnic').value.trim();
  const ct=document.getElementById('t-cont').value.trim();
  const pi=document.getElementById('t-prop').value;
  const s=document.getElementById('t-st').value;
  const e=document.getElementById('t-en').value;
  if(!n||!c||!ct||!pi||!s||!e){toast('Fill all fields','r');return;}
  if(eTid){
    const t=T.find(x=>x.id===eTid);
    const op=gp(t.propId);if(op.id)op.occupied=false;
    Object.assign(t,{name:n,cnic:c,contact:ct,propId:pi,start:s,end:e});
    eTid=null;document.getElementById('tt').textContent='Add Tenant';
  } else T.push({id:uid(),name:n,cnic:c,contact:ct,propId:pi,start:s,end:e});
  const pr=gp(pi);if(pr.id)pr.occupied=true;
  save();clearTen();renderTens();renderProps();rDrops();rDash();toast('Tenant saved!');
}
function clearTen(){['t-name','t-cnic','t-cont','t-st','t-en'].forEach(id=>document.getElementById(id).value='');eTid=null;document.getElementById('tt').textContent='Add Tenant';rDrops();}
function editTen(id){
  const t=gt(id);
  document.getElementById('t-name').value=t.name;
  document.getElementById('t-cnic').value=t.cnic;
  document.getElementById('t-cont').value=t.contact;
  document.getElementById('t-st').value=t.start;
  document.getElementById('t-en').value=t.end;
  eTid=id;
  document.getElementById('t-prop').innerHTML=P.map(p=>`<option value="${p.id}" ${p.id===t.propId?'selected':''}>${p.address}</option>`).join('');
  document.getElementById('tt').textContent='Edit Tenant';
}
function delTen(id){
  if(!confirm('Delete tenant?'))return;
  const t=gt(id);const pr=gp(t.propId);if(pr.id)pr.occupied=false;
  T=T.filter(x=>x.id!==id);save();renderTens();renderProps();rDrops();rDash();toast('Deleted','y');
}
function renderTens(){
  const tb=document.getElementById('t-tb');
  if(!T.length){tb.innerHTML='<tr><td colspan="7" class="empty">No tenants yet.</td></tr>';return;}
  tb.innerHTML=T.map((t,i)=>{
    const p=gp(t.propId);const d=dif(t.end,td());
    const col=new Date(t.end)<new Date()?'var(--red)':d<=30?'var(--ylw)':'inherit';
    return `<tr><td>${i+1}</td><td>${t.name}</td><td>${t.cnic}</td><td>${t.contact}</td>
    <td>${p.address||'—'}</td><td style="color:${col}">${t.end}</td>
    <td><button class="btn bp bs" onclick="editTen('${t.id}')">Edit</button> <button class="btn bd bs" onclick="delTen('${t.id}')">Del</button></td></tr>`;
  }).join('');
}

function fillPay(){
  const ti=document.getElementById('py-t').value;if(!ti)return;
  const t=gt(ti);const p=gp(t.propId);
  if(p.rent)document.getElementById('py-am').value=p.rent;
  document.getElementById('py-dt').value=td();
  const du=new Date();du.setDate(5);document.getElementById('py-du').value=du.toISOString().split('T')[0];
}
function savePay(){
  const ti=document.getElementById('py-t').value;
  const am=parseFloat(document.getElementById('py-am').value);
  const dt=document.getElementById('py-dt').value;
  const du=document.getElementById('py-du').value;
  const fr=parseFloat(document.getElementById('py-fr').value)||0;
  if(!ti||!am||!dt||!du){toast('Fill all fields','r');return;}
  const t=gt(ti);const p=gp(t.propId);
  const ld=Math.max(0,dif(dt,du));
  const fi=ld*fr;const bal=Math.max(0,(p.rent||0)-am);
  Y.push({id:uid(),tenId:ti,amount:am,date:dt,due:du,fineRate:fr,lateDays:ld,fine:fi,balance:bal,rent:p.rent||0});
  save();renderPays();rDash();
  ['py-am','py-dt','py-du'].forEach(id=>document.getElementById(id).value='');
  toast('Payment recorded!');
}
function renderPays(){
  const tb=document.getElementById('py-tb');
  if(!Y.length){tb.innerHTML='<tr><td colspan="10" class="empty">No payments yet.</td></tr>';return;}
  tb.innerHTML=[...Y].reverse().map((y,i)=>{
    const t=gt(y.tenId);
    return `<tr><td>${Y.length-i}</td><td>${t.name||'—'}</td><td>${fmt(y.amount)}</td><td>${y.date}</td><td>${y.due}</td>
    <td style="color:${y.lateDays>0?'var(--red)':'var(--grn)'}">${y.lateDays}d</td>
    <td style="color:${y.fine>0?'var(--red)':'inherit'}">${fmt(y.fine)}</td>
    <td style="color:${y.balance>0?'var(--ylw)':'var(--grn)'}">${fmt(y.balance)}</td>
    <td><span class="badge ${y.lateDays>0?'br_':'bg'}">${y.lateDays>0?'Late':'On Time'}</span></td>
    <td><button class="btn bw bs" onclick="showM('${y.id}')">&#129534;</button></td></tr>`;
  }).join('');
}

function saveMaint(){
  const ti=document.getElementById('m-t').value;
  const dt=document.getElementById('m-dt').value;
  const ds=document.getElementById('m-ds').value.trim();
  if(!ti||!dt||!ds){toast('Fill all fields','r');return;}
  M.push({id:uid(),tenId:ti,date:dt,desc:ds,status:'Pending'});
  save();renderMaint();rDash();document.getElementById('m-ds').value='';toast('Request logged!');
}
function updMs(id,s){const m=M.find(x=>x.id===id);if(m){m.status=s;save();renderMaint();rDash();}}
function delM(id){M=M.filter(x=>x.id!==id);save();renderMaint();rDash();toast('Deleted','y');}
function renderMaint(){
  const tb=document.getElementById('m-tb');
  if(!M.length){tb.innerHTML='<tr><td colspan="7" class="empty">No maintenance requests.</td></tr>';return;}
  const cm={Pending:'br_','In Progress':'by',Resolved:'bg'};
  tb.innerHTML=[...M].reverse().map((m,i)=>{
    const t=gt(m.tenId);
    return `<tr><td>${M.length-i}</td><td>${t.name||'—'}</td>
    <td style="max-width:180px;word-break:break-word">${m.desc}</td><td>${m.date}</td>
    <td><span class="badge ${cm[m.status]||'bb'}">${m.status}</span></td>
    <td><select onchange="updMs('${m.id}',this.value)" style="font-size:12px;padding:4px 8px">
      <option ${m.status==='Pending'?'selected':''}>Pending</option>
      <option ${m.status==='In Progress'?'selected':''}>In Progress</option>
      <option ${m.status==='Resolved'?'selected':''}>Resolved</option>
    </select></td>
    <td><button class="btn bd bs" onclick="delM('${m.id}')">&#10005;</button></td></tr>`;
  }).join('');
}

function rDrops(){
  const vac=P.filter(p=>!p.occupied);
  const po=vac.length?vac.map(p=>`<option value="${p.id}">${p.address} — ${fmt(p.rent)}/mo</option>`).join(''):'<option value="">No vacant properties</option>';
  document.getElementById('t-prop').innerHTML=po;
  const to=T.length?'<option value="">Select Tenant</option>'+T.map(t=>`<option value="${t.id}">${t.name}</option>`).join(''):'<option value="">No tenants yet</option>';
  ['py-t','m-t'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=to;});
  const rf=document.getElementById('r-f');
  if(rf)rf.innerHTML='<option value="">All Tenants</option>'+T.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}

function buildRec(y,t,p){
  return `<div class="rec">
  <div class="rt">&#127968; RENT PAYMENT RECEIPT</div>
  <div class="rr"><span style="color:var(--mut)">Receipt No.</span><span>#${y.id.toUpperCase()}</span></div>
  <div class="rr"><span style="color:var(--mut)">Issued</span><span>${new Date().toLocaleDateString()}</span></div>
  <div class="rs"></div>
  <div class="rr"><span style="color:var(--mut)">Tenant</span><span>${t.name||'—'}</span></div>
  <div class="rr"><span style="color:var(--mut)">CNIC</span><span>${t.cnic||'—'}</span></div>
  <div class="rr"><span style="color:var(--mut)">Contact</span><span>${t.contact||'—'}</span></div>
  <div class="rr"><span style="color:var(--mut)">Property</span><span>${p.address||'—'}</span></div>
  <div class="rs"></div>
  <div class="rr"><span style="color:var(--mut)">Monthly Rent</span><span>${fmt(y.rent)}</span></div>
  <div class="rr"><span style="color:var(--mut)">Amount Paid</span><span style="color:var(--grn)">${fmt(y.amount)}</span></div>
  <div class="rr"><span style="color:var(--mut)">Payment Date</span><span>${y.date}</span></div>
  <div class="rr"><span style="color:var(--mut)">Due Date</span><span>${y.due}</span></div>
  <div class="rr"><span style="color:var(--mut)">Days Late</span><span>${y.lateDays}d</span></div>
  <div class="rr"><span style="color:var(--mut)">Fine (${fmt(y.fineRate)}/d &times; ${y.lateDays}d)</span><span style="color:${y.fine>0?'var(--red)':'var(--grn)'}">${fmt(y.fine)}</span></div>
  <div class="rs"></div>
  <div class="rr" style="font-weight:700;font-size:14px"><span>Balance</span><span style="color:${y.balance>0?'var(--red)':'var(--grn)'}">${fmt(y.balance)}</span></div>
  <div class="rr" style="margin-top:5px"><span>Status</span><span>${y.lateDays>0?'&#9888; Late':'&#10003; On Time'}</span></div>
  </div>`;
}
function showM(yid){
  const y=Y.find(x=>x.id===yid);if(!y)return;
  const t=gt(y.tenId);const p=gp(t.propId);
  document.getElementById('m-body').innerHTML=buildRec(y,t,p);
  document.getElementById('ov').classList.add('on');
}
function closeM(){document.getElementById('ov').classList.remove('on');}
function printR(){
  const c=document.getElementById('m-body').innerHTML;
  const w=window.open('','_blank','width=460,height=640');
  w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:20px;color:#111;font-size:13px}.rec{border:1px dashed #aaa;padding:18px;border-radius:8px;line-height:1.9}.rr{display:flex;justify-content:space-between;gap:10px}.rt{text-align:center;font-size:16px;font-weight:700;margin-bottom:12px;padding-bottom:10px;border-bottom:1px dashed #ccc}.rs{border-top:1px dashed #ccc;margin:8px 0}[style*="mut"]{color:#555!important}[style*="grn"]{color:#166534!important}[style*="red"]{color:#991b1b!important}[style*="ylw"]{color:#92400e!important}</style></head><body>${c}</body></html>`);
  w.document.close();setTimeout(()=>w.print(),300);
}
function renderRecs(){
  const f=document.getElementById('r-f').value;
  const list=Y.filter(y=>!f||y.tenId===f);
  const c=document.getElementById('r-con');
  if(!list.length){c.innerHTML='<div class="card empty">No receipts found.</div>';return;}
  c.innerHTML=[...list].reverse().map(y=>{
    const t=gt(y.tenId);const p=gp(t.propId);
    return `<div class="card">${buildRec(y,t,p)}<div class="br" style="margin-top:10px"><button class="btn bw bs" onclick="showM('${y.id}')">&#128424; Print</button></div></div>`;
  }).join('');
}
function renderAlerts(){
  const c=document.getElementById('al-con');const now=new Date();
  const tm=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const al=[];
  T.forEach(t=>{
    const d=dif(t.end,td());
    if(new Date(t.end)<now) al.push({ty:'r',m:`Lease Expired: ${t.name} — expired ${t.end}`});
    else if(d<=30) al.push({ty:'y',m:`Expiring Soon: ${t.name} — ${d} day(s) left (${t.end})`});
    if(!Y.some(y=>y.tenId===t.id&&y.date.startsWith(tm))) al.push({ty:'r',m:`Overdue: ${t.name} has no payment this month`});
  });
  M.filter(m=>m.status==='Pending').forEach(m=>{
    const t=gt(m.tenId);al.push({ty:'y',m:`Pending Maintenance: ${t.name||'?'} — ${m.desc.slice(0,70)}${m.desc.length>70?'...':''}`});
  });
  if(!al.length){c.innerHTML='<div class="ab ag">&#10003; No active alerts. Everything looks good!</div>';return;}
  c.innerHTML=al.map(a=>`<div class="ab a${a.ty}">${a.ty==='r'?'&#128680;':'&#9888;'} ${a.m}</div>`).join('');
}
function rDash(){
  const now=new Date();const tm=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const due=P.filter(p=>p.occupied).reduce((s,p)=>s+p.rent,0);
  const col=Y.filter(y=>y.date.startsWith(tm)).reduce((s,y)=>s+y.amount,0);
  const ov=T.filter(t=>!Y.some(y=>y.tenId===t.id&&y.date.startsWith(tm)));
  const pm=M.filter(m=>m.status!=='Resolved');
  document.getElementById('sg').innerHTML=`
    <div class="sc b"><div class="lbl">Properties</div><div class="val">${P.length}</div></div>
    <div class="sc g"><div class="lbl">Tenants</div><div class="val">${T.length}</div></div>
    <div class="sc b"><div class="lbl">Monthly Due</div><div class="val" style="font-size:15px">${fmt(due)}</div></div>
    <div class="sc g"><div class="lbl">Collected</div><div class="val" style="font-size:15px">${fmt(col)}</div></div>
    <div class="sc r"><div class="lbl">Overdue</div><div class="val">${ov.length}</div></div>
    <div class="sc y"><div class="lbl">Maintenance</div><div class="val">${pm.length}</div></div>`;
  document.getElementById('d-ov').innerHTML=ov.length?ov.map(t=>`<div class="ab ar">&#128248; ${t.name} — ${gp(t.propId).address||'—'}</div>`).join(''):'<div class="ab ag">&#10003; All paid this month</div>';
  const ex=T.filter(t=>{const d=dif(t.end,td());return d>=0&&d<=30;});
  document.getElementById('d-ex').innerHTML=ex.length?ex.map(t=>`<div class="ab ay">&#8987; ${t.name} — ${t.end}</div>`).join(''):'<div class="ab ag">&#10003; No leases expiring soon</div>';
  document.getElementById('d-mt').innerHTML=pm.length?pm.map(m=>`<div class="ab ay">&#128295; ${gt(m.tenId).name||'—'}: ${m.desc.slice(0,80)}</div>`).join(''):'<div class="ab ag">&#10003; No pending maintenance</div>';
}
function rAll(){renderProps();renderTens();renderPays();renderMaint();rDrops();renderRecs();renderAlerts();rDash();const el=document.getElementById('m-dt');if(el&&!el.value)el.value=td();}
rAll();

