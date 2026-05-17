import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'courier.html');
let s = fs.readFileSync(p, 'utf8');
const t = 'div';

const oldView = [
  '    <' + t + ' id="view-stats" class="view">',
  '      <' + t + ' class="stat-grid" id="stats-grid"></' + t + '>',
  '      <' + t + ' class="mcard" id="stats-month"></' + t + '>',
  '      <' + t + ' class="mcard" id="stats-labs"></' + t + '>',
  '    </' + t + '>',
].join('\n');

const newView = [
  '    <' + t + ' id="view-stats" class="view">',
  '      <' + t + ' class="mcard" style="margin-bottom:12px;padding:14px;">',
  '        <' + t + ' style="font-weight:700;font-size:.9rem;margin-bottom:4px;">Relevé pour facturation</' + t + '>',
  '        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:12px;line-height:1.4;">Comptez vos courses terminées par mois et par laboratoire pour facturer le labo.</p>',
  '        <' + t + ' class="field" style="margin-bottom:10px;">',
  '          <label>Période</label>',
  '          <select id="billing-month" style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px;background:var(--bg);"></select>',
  '        </' + t + '>',
  '        <' + t + ' class="field" style="margin-bottom:10px;">',
  '          <label>Tarif par course (€, optionnel)</label>',
  '          <input type="number" id="billing-rate" min="0" step="0.01" placeholder="ex. 12.50" style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px;background:var(--bg);"/>',
  '        </' + t + '>',
  '        <button type="button" class="btn btn-primary" id="btn-save-billing-rate" style="margin-bottom:8px;">Enregistrer le tarif</button>',
  '        <button type="button" class="btn btn-secondary" id="btn-print-billing">🖨️ Imprimer le relevé</button>',
  '      </' + t + '>',
  '      <' + t + ' class="stat-grid" id="billing-grid"></' + t + '>',
  '      <' + t + ' class="mcard" id="billing-by-lab"></' + t + '>',
  '      <' + t + ' class="mcard" id="billing-detail"></' + t + '>',
  '      <details style="margin-top:12px;">',
  '        <summary style="font-size:.78rem;font-weight:600;color:var(--ink-soft);cursor:pointer;padding:8px 0;">Statistiques globales</summary>',
  '        <' + t + ' class="stat-grid" id="stats-grid" style="margin-top:10px;"></' + t + '>',
  '        <' + t + ' class="mcard" id="stats-month"></' + t + '>',
  '        <' + t + ' class="mcard" id="stats-labs"></' + t + '>',
  '      </details>',
  '    </' + t + '>',
].join('\n');

if (!s.includes('billing-month')) {
  if (!s.includes(oldView)) throw new Error('view-stats block not found');
  s = s.replace(oldView, newView);
  s = s.replace(
    '<button type="button" class="nav-item" data-view="stats"><span class="ico">📊</span>Stats</button>',
    '<button type="button" class="nav-item" data-view="stats"><span class="ico">📊</span>Facturation</button>'
  );
}

const billingJs = `
let _billingSummary=null;

function billingMonthOptions(){
  const sel=document.getElementById('billing-month');
  if(!sel)return;
  const opts=[];
  const d=new Date();
  for(let i=0;i<18;i++){
    const y=d.getUTCFullYear();
    const m=d.getUTCMonth();
    const mk=y+'-'+String(m+1).padStart(2,'0');
    const label=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    opts.push('<option value="'+mk+'"'+(i===0?' selected':'')+'>'+label.charAt(0).toUpperCase()+label.slice(1)+'</option>');
    d.setUTCMonth(d.getUTCMonth()-1);
  }
  sel.innerHTML=opts.join('');
}

function fmtBillingDate(iso){
  if(!iso)return '';
  return new Date(iso).toLocaleString('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function fmtMonthLabel(mk){
  if(!mk)return '';
  const p=mk.split('-');
  if(p.length<2)return mk;
  const d=new Date(Date.UTC(parseInt(p[0],10),parseInt(p[1],10)-1,1));
  const label=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  return label.charAt(0).toUpperCase()+label.slice(1);
}

async function loadBilling(){
  billingMonthOptions();
  const monthEl=document.getElementById('billing-month');
  const month=monthEl?monthEl.value:'';
  const j=await api('getBillingSummary',{month:month});
  _billingSummary=j.summary||{};
  const b=_billingSummary;
  const rateEl=document.getElementById('billing-rate');
  if(rateEl&&b.ratePerCourse!=null)rateEl.value=String(b.ratePerCourse);
  document.getElementById('billing-grid').innerHTML=
    '<div class="stat-box"><motion class="stat-val">'+((b.totalCourses)||0)+'</div><div class="stat-lbl">Courses terminées</motion></div>'+
    '<div class="stat-box"><div class="stat-val">'+((b.totalPickups)||0)+'</div><div class="stat-lbl">Récupérations</div></div>'+
    '<div class="stat-box"><div class="stat-val">'+((b.totalDeliveries)||0)+'</div><motion class="stat-lbl">Livraisons</div></div>'+
    '<div class="stat-box"><div class="stat-val">'+(b.estimatedTotal!=null?b.estimatedTotal.toFixed(2)+' €':'—')+'</div><div class="stat-lbl">Montant estimé</div></div>';
  const labs=b.byLab||[];
  document.getElementById('billing-by-lab').innerHTML=labs.length
    ?'<div style="font-weight:700;margin-bottom:10px;">Par laboratoire — '+esc(fmtMonthLabel(b.period&&b.period.month))+'</motion>'+
      labs.map(function(l){
        return '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;font-size:.82rem;padding:10px 0;border-bottom:1px solid var(--border);">'+
          '<div><b>'+esc(l.labName)+'</b><div style="font-size:.72rem;color:var(--ink-soft);margin-top:2px;">'+l.pickups+' réc. · '+l.deliveries+' liv.</div></div>'+
          '<div style="text-align:right;white-space:nowrap;"><b style="font-size:1.1rem;color:var(--accent);">'+l.courses+'</b> course'+(l.courses>1?'s':'')+'</div></div>';
      }).join('')
    :'<div style="color:var(--ink-soft);font-size:.82rem;">Aucune course terminée sur cette période.</div>';
  const missions=b.missions||[];
  document.getElementById('billing-detail').innerHTML=missions.length
    ?'<div style="font-weight:700;margin-bottom:10px;">Détail des courses</div>'+
      missions.map(function(m,idx){
        return '<motion style="font-size:.78rem;padding:8px 0;border-bottom:1px solid var(--border);">'+
          '<div style="font-weight:600;">'+(idx+1)+'. '+esc(m.label)+'</div>'+
          '<div style="color:var(--ink-soft);margin-top:2px;">'+esc(m.labName)+' · '+fmtBillingDate(m.completedAt)+
          (m.stopCount>1?' · '+m.stopCount+' arrêts':'')+'</div></div>';
      }).join('')
    :'';
}

function printBillingReleve(){
  const b=_billingSummary;
  if(!b||!b.totalCourses){toast('Aucune course sur cette période');return;}
  const rate=b.ratePerCourse;
  const w=window.open('','_blank');
  if(!w){toast('Autorisez les pop-ups pour imprimer');return;}
  const rows=(b.missions||[]).map(function(m,i){
    return '<tr><td>'+(i+1)+'</td><td>'+esc(m.labName)+'</td><td>'+esc(m.label)+'</td><td>'+fmtBillingDate(m.completedAt)+'</td><td style="text-align:center;">'+m.pickups+'</td><td style="text-align:center;">'+m.deliveries+'</td></tr>';
  }).join('');
  const labRows=(b.byLab||[]).map(function(l){
    return '<tr><td>'+esc(l.labName)+'</td><td style="text-align:center;"><b>'+l.courses+'</b></td><td style="text-align:center;">'+l.pickups+'</td><td style="text-align:center;">'+l.deliveries+'</td></tr>';
  }).join('');
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relevé coursier</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#111;}h1{font-size:1.2rem;}table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.85rem;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}th{background:#f1f5f9;}.tot{font-size:1.1rem;font-weight:700;margin:12px 0;}</style></head><body>'+
    '<h1>Relevé de courses — '+esc(b.courierName||'Coursier')+'</h1>'+
    '<p>Période : <b>'+esc(fmtMonthLabel(b.period&&b.period.month))+'</b></p>'+
    '<p class="tot">Total : <b>'+b.totalCourses+'</b> course'+(b.totalCourses>1?'s':'')+
    ' · '+b.totalPickups+' récup. · '+b.totalDeliveries+' livraisons'+
    (b.estimatedTotal!=null?' · Montant indicatif : <b>'+b.estimatedTotal.toFixed(2)+' €</b>'+(rate!=null?' ('+rate+' €/course)':''):'')+'</p>'+
    '<h2>Par laboratoire</h2><table><thead><tr><th>Laboratoire</th><th>Courses</th><th>Récup.</th><th>Livr.</th></tr></thead><tbody>'+labRows+'</tbody></table>'+
    '<h2>Détail</h2><table><thead><tr><th>#</th><th>Labo</th><th>Course</th><th>Terminée le</th><th>Récup.</th><th>Livr.</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<p style="font-size:.75rem;color:#666;margin-top:24px;">Document généré par Labosync Coursier — '+new Date().toLocaleString('fr-FR')+'</p></body></html>');
  w.document.close();
  w.focus();
  setTimeout(function(){w.print();},400);
}

`;

let billingJsFixed = billingJs.replace(/<motion /g, '<' + t + ' ').replace(/<\/motion>/g, '</' + t + '>');

if (!s.includes('async function loadBilling')) {
  s = s.replace('async function loadStats(){', billingJsFixed + '\nasync function loadStats(){');
  s = s.replace(
    `  const labIds=Object.keys(s.byLab||{});
  document.getElementById('stats-labs').innerHTML=labIds.length
    ?'<div style="font-weight:700;margin-bottom:10px;">Par laboratoire</div>'+labIds.map(function(id){
        return '<div style="font-size:.8rem;padding:4px 0;">'+esc(id.slice(0,8))+'… : <b>'+s.byLab[id]+'</b> missions</div>';
      }).join('')`,
    `  const labIds=Object.keys(s.byLab||{});
  const labNames=s.byLabNames||{};
  document.getElementById('stats-labs').innerHTML=labIds.length
    ?'<div style="font-weight:700;margin-bottom:10px;">Par laboratoire (tout temps)</div>'+labIds.map(function(id){
        const name=labNames[id]||id.slice(0,8)+'…';
        return '<div style="font-size:.8rem;padding:4px 0;">'+esc(name)+' : <b>'+s.byLab[id]+'</b> courses</div>';
      }).join('')`
  );
  s = s.replace(
    "    if(v==='stats')loadStats().catch(function(e){toast(e.message);});",
    "    if(v==='stats'){loadBilling().catch(function(e){toast(e.message);});loadStats().catch(function(){});}"
  );
  if (!s.includes('btn-save-billing-rate')) {
    s = s.replace(
      'document.getElementById(\'btn-save-prof\').onclick=async function(){',
      `document.getElementById('billing-month')?.addEventListener('change',function(){loadBilling().catch(function(e){toast(e.message);});});
document.getElementById('btn-print-billing')?.addEventListener('click',printBillingReleve);
document.getElementById('btn-save-billing-rate')?.addEventListener('click',async function(){
  try{
    const rate=document.getElementById('billing-rate')?.value;
    await api('saveProfile',{
      displayName:document.getElementById('prof-name')?.value.trim()||'',
      phone:document.getElementById('prof-phone')?.value.trim()||'',
      billingRatePerCourse:rate===''||rate==null?null:rate,
    });
    toast('Tarif enregistré');
    loadBilling().catch(function(){});
  }catch(e){toast(e.message);}
});
document.getElementById('btn-save-prof').onclick=async function(){`
    );
    s = s.replace(
      `await api('saveProfile',{displayName:document.getElementById('prof-name').value.trim(),phone:document.getElementById('prof-phone').value.trim()});`,
      `await api('saveProfile',{displayName:document.getElementById('prof-name').value.trim(),phone:document.getElementById('prof-phone').value.trim(),billingRatePerCourse:document.getElementById('billing-rate')?.value||null});`
    );
    s = s.replace(
      `document.getElementById('prof-phone').value=j.profile.phone||'';`,
      `document.getElementById('prof-phone').value=j.profile.phone||'';
  const rateEl=document.getElementById('billing-rate');
  if(rateEl&&j.profile.billingRatePerCourse!=null)rateEl.value=String(j.profile.billingRatePerCourse);`
    );
  }
}

fs.writeFileSync(p, s);
console.log('OK');
