import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'app.html');
let h = fs.readFileSync(file, 'utf8');

if (h.includes('function migrateJobDelivery')) {
  console.log('Already patched');
  process.exit(0);
}

let HELPERS = fs.readFileSync(path.join(root, 'lb-delivery-helpers-snippet.txt'), 'utf8');
if (HELPERS.includes('motion-div')) {
  HELPERS = HELPERS.replace(/motion-div/g, 'div');
}

h = h.replace(
  "function saveScanHist(){localStorage.setItem('lb_scans',JSON.stringify(scanHist));scheduleSave();}",
  "function saveScanHist(){localStorage.setItem('lb_scans',JSON.stringify(scanHist));scheduleSave();}\n" + HELPERS
);

h = h.replace(
  '<motion-div class="fl" style="min-width:150px;"><label data-i18n="form.delivery">📅 Date de livraison</label><input type="date" id="saisie-idelivery"/></motion-div>',
  ''
);
h = h.replace(
  '<div class="fl" style="min-width:150px;"><label data-i18n="form.delivery">📅 Date de livraison</label><input type="date" id="saisie-idelivery"/></motion-div>',
  `<div class="fl" style="min-width:150px;"><label>📅 Date demandée (cabinet)</label><input type="date" id="saisie-ireq-delivery" onchange="onSaisieRequestedDateChange()"/></motion-div>
      <div class="fl" style="min-width:150px;"><label>📦 Date labo (coursier)</label><input type="date" id="saisie-ilab-delivery" onchange="onSaisieLabDateChange()"/></motion-div>
      <div class="fl" style="min-width:140px;"><label>🚚 Créneau coursier</label><select id="saisie-idelivery-slot" style="width:100%;border:1.5px solid var(--border);border-radius:7px;padding:9px;font-size:.88rem;background:#fff;"><option value="9">9h — finir avant</option><option value="12" selected>12h — finir avant</option><option value="18">18h — finir avant</option></select></motion-div>`
);

h = h.replace(
  "let _acceptForm={portalId:null,caseId:null,stepId:null,patient:'',deliveryDate:'',urgent:false,items:[],note:''};",
  "let _acceptForm={portalId:null,caseId:null,stepId:null,patient:'',requestedDeliveryDate:'',labDeliveryDate:'',labDeliverySlot:'12',deliveryDate:'',urgent:false,items:[],note:''};"
);

h = h.replace(
  `    deliveryDate:step.deliveryDate||'',
    urgent:false,`,
  `    requestedDeliveryDate:step.deliveryDate||'',
    labDeliveryDate:_suggestLabDateFromRequested(step.deliveryDate||'')||step.deliveryDate||'',
    labDeliverySlot:'12',
    deliveryDate:_suggestLabDateFromRequested(step.deliveryDate||'')||step.deliveryDate||'',
    urgent:false,`
);

h = h.replace(
  `          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Date de livraison</label>'+
            '<input type="date" id="af-delivery" value="'+escH2(_acceptForm.deliveryDate)+'" oninput="_acceptForm.deliveryDate=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:1rem;outline:none;"/></motion-div>'+
        '</motion-div>'+`,
  `          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Date demandée (cabinet)</label>'+
            '<input type="date" id="af-req-delivery" value="'+escH2(_acceptForm.requestedDeliveryDate)+'" readonly style="width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:11px 13px;font-size:1rem;background:#f8fafc;color:#64748b;"/></motion-div>'+
        '</motion-div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">'+
          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Date labo (enlèvement coursier)</label>'+
            '<input type="date" id="af-lab-delivery" value="'+escH2(_acceptForm.labDeliveryDate)+'" oninput="_acceptForm.labDeliveryDate=this.value;_acceptForm.deliveryDate=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:1rem;outline:none;"/></motion-div>'+
          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Créneau coursier</label>'+
            '<select id="af-delivery-slot" onchange="_acceptForm.labDeliverySlot=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:1rem;">'+_deliverySlotOptionsHtml(_acceptForm.labDeliverySlot)+'</select></motion-div>'+
        '</motion-div>'+`
);

h = h.replace(
  `    deliveryDate:_acceptForm.deliveryDate||'',
    cabinet:cab.id,`,
  `    requestedDeliveryDate:_acceptForm.requestedDeliveryDate||'',
    labDeliveryDate:_acceptForm.labDeliveryDate||_acceptForm.requestedDeliveryDate||'',
    labDeliverySlot:_acceptForm.labDeliverySlot||'12',
    deliveryDate:_acceptForm.labDeliveryDate||_acceptForm.requestedDeliveryDate||'',
    cabinet:cab.id,`
);

h = h.replace(
  "let _editJob={id:null,patient:'',deliveryDate:'',urgent:false,items:[],note:''};",
  "let _editJob={id:null,patient:'',requestedDeliveryDate:'',labDeliveryDate:'',labDeliverySlot:'12',deliveryDate:'',urgent:false,items:[],note:''};"
);

h = h.replace(
  `  _editJob={
    id:jobId,
    patient:job.patient||'',
    deliveryDate:job.deliveryDate||'',
    urgent:!!job.urgent,`,
  `  migrateJobDelivery(job);
  _editJob={
    id:jobId,
    patient:job.patient||'',
    requestedDeliveryDate:_jobRequestedDeliveryDate(job),
    labDeliveryDate:_jobLabDeliveryDate(job),
    labDeliverySlot:job.labDeliverySlot||'12',
    deliveryDate:_jobLabDeliveryDate(job),
    urgent:!!job.urgent,`
);

h = h.replace(
  `          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">📅 Date livraison</label>'+
            '<input type="date" id="ej-delivery" value="'+escH2(_editJob.deliveryDate)+'" oninput="_editJob.deliveryDate=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;outline:none;"/></motion-div>'+
        '</motion-div>'+`,
  `          '<motion-div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">Date demandée</label>'+
            '<input type="date" id="ej-req-delivery" value="'+escH2(_editJob.requestedDeliveryDate)+'" oninput="_editJob.requestedDeliveryDate=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;outline:none;"/></motion-div>'+
        '</motion-div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'+
          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">📦 Date labo</label>'+
            '<input type="date" id="ej-lab-delivery" value="'+escH2(_editJob.labDeliveryDate)+'" oninput="_editJob.labDeliveryDate=this.value;_editJob.deliveryDate=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;outline:none;"/></motion-div>'+
          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">🚚 Créneau</label>'+
            '<select id="ej-delivery-slot" onchange="_editJob.labDeliverySlot=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;">'+_deliverySlotOptionsHtml(_editJob.labDeliverySlot)+'</select></motion-div>'+
        '</motion-div>'+`
);

h = h.replace(
  `          '<textarea id="ej-note" oninput="_editJob.note=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:10px;font-size:.86rem;outline:none;min-height:120px;resize:vertical;font-family:Inter,sans-serif;">'+escH2(_editJob.note)+'</textarea></motion-div>'+
      '</motion-div>'+`,
  `          '<textarea id="ej-note" oninput="_editJob.note=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:10px;font-size:.86rem;outline:none;min-height:120px;resize:vertical;font-family:Inter,sans-serif;">'+escH2(_editJob.note)+'</textarea></motion-div>'+
        _renderJobAttachmentsSection(jobId)+
      '</motion-div>'+`
);

h = h.replace(
  `  job.patient=_editJob.patient.trim();
  job.deliveryDate=_editJob.deliveryDate||'';
  job.urgent=!!_editJob.urgent;`,
  `  job.patient=_editJob.patient.trim();
  job.requestedDeliveryDate=_editJob.requestedDeliveryDate||'';
  job.labDeliveryDate=_editJob.labDeliveryDate||_editJob.requestedDeliveryDate||'';
  job.labDeliverySlot=_editJob.labDeliverySlot||'12';
  job.deliveryDate=job.labDeliveryDate;
  job.urgent=!!_editJob.urgent;`
);

h = h.replace(
  `  const deliveryDate=document.getElementById('saisie-idelivery')?.value||'';
  const cabEl=document.getElementById('saisie-icab');const cab=cabEl?cabEl.value:'';
  const urg=document.getElementById('saisie-iurg').checked;
  const emp=document.getElementById('saisie-iemp')?.checked||false;
  const missingItems=_readMissingItems();
  if(!name){alert(t('alert.enter_patient'));return;}
  const allItems=getSaisieItems(type,nb);
  const queueItem={id:String(Date.now()),patient:name,type:allItems[0].type,nb:allItems[0].nb,items:allItems,note,deliveryDate,cabinet:cab,urgent:urg,emp:emp||false,createdAt:new Date().toISOString()};`,
  `  const deliv=readSaisieDeliveryFields();
  const cabEl=document.getElementById('saisie-icab');const cab=cabEl?cabEl.value:'';
  const urg=document.getElementById('saisie-iurg').checked;
  const emp=document.getElementById('saisie-iemp')?.checked||false;
  const missingItems=_readMissingItems();
  if(!name){alert(t('alert.enter_patient'));return;}
  const allItems=getSaisieItems(type,nb);
  const queueItem=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,emp:emp||false,createdAt:new Date().toISOString()},deliv);`
);

h = h.replace(
  `  const deliveryDate=document.getElementById('saisie-idelivery')?.value||'';
  const cabEl=document.getElementById('saisie-icab');const cab=cabEl?cabEl.value:'';
  const urg=document.getElementById('saisie-iurg').checked;
  const missingItems=_readMissingItems();
  if(!name){alert(t('alert.enter_patient'));return;}
  const allItems=getSaisieItems(type,nb);
  const job={id:String(Date.now()),patient:name,type:allItems[0].type,tasks:[],nb:allItems[0].nb,items:allItems,note,deliveryDate,cabinet:cab,urgent:urg,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId:''};`,
  `  const deliv=readSaisieDeliveryFields();
  const cabEl=document.getElementById('saisie-icab');const cab=cabEl?cabEl.value:'';
  const urg=document.getElementById('saisie-iurg').checked;
  const missingItems=_readMissingItems();
  if(!name){alert(t('alert.enter_patient'));return;}
  const allItems=getSaisieItems(type,nb);
  const job=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,tasks:[],nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId:''},deliv);`
);

h = h.replace(/if\(document\.getElementById\('saisie-idelivery'\)\)document\.getElementById\('saisie-idelivery'\)\.value='';/g, 'resetSaisieDeliveryFields();');

h = h.replace(
  'const urgentOrLate=jobsWithoutBL.filter(function(j){return j.urgent||(j.deliveryDate&&j.deliveryDate<todayISO);});',
  'const urgentOrLate=jobsWithoutBL.filter(function(j){return j.urgent||_isJobLate(j);});'
);
h = h.replace(
  'const dueToday=jobsWithoutBL.filter(function(j){return j.deliveryDate===todayISO;});',
  'const dueToday=jobsWithoutBL.filter(function(j){return _jobLabDeliveryDate(j)===todayISO;});'
);
h = h.replace('const late=j.deliveryDate&&j.deliveryDate<todayISO;', 'const late=_isJobLate(j);');
h = h.replace(
  "(j.deliveryDate?' · 📅 '+new Date(j.deliveryDate+'T12:00:00').toLocaleDateString(t('locale')):'')",
  "(_fmtJobDeliveryLine(j)?' · '+_fmtJobDeliveryLine(j):'')"
);
h = h.replace(
  "const delivStr=j.deliveryDate?new Date(j.deliveryDate+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'—';",
  "const delivStr=_fmtJobDeliveryLine(j)||'—';"
);
h = h.replace(
  "${j.deliveryDate?'<span style=\"color:#2a6049;font-weight:500;\">📦 '+delivStr+'</span>':'<span style=\"color:var(--ink-soft);\">'+created+'</span>'}",
  "${_jobLabDeliveryDate(j)?'<span style=\"color:#2a6049;font-weight:500;\">'+delivStr+'</span>':'<span style=\"color:var(--ink-soft);\">'+created+'</span>'}"
);
h = h.replace(
  'deliveryDate:job.deliveryDate||null,',
  'deliveryDate:_jobLabDeliveryDate(job)||null,labDeliverySlot:job.labDeliverySlot||\'12\',requestedDeliveryDate:_jobRequestedDeliveryDate(job)||null,'
);
h = h.replace(
  '  const noBL=[...jobsNoBL,...queueNoBL];',
  `  const noBL=[...jobsNoBL,...queueNoBL].sort(function(a,b){
    var da=_jobLabDeliveryDate(a)||(a.createdAt?String(a.createdAt).slice(0,10):'');
    var db=_jobLabDeliveryDate(b)||(b.createdAt?String(b.createdAt).slice(0,10):'');
    if(da!==db)return da.localeCompare(db);
    return (a.patient||'').localeCompare(b.patient||'');
  });`
);
h = h.replace(
  `            '<div class="livr-type">'+getJobTypeLabel(job)+(job.nb>1?' × '+job.nb:'')+(job.prothesisId?' · #'+job.prothesisId:'')+'</motion-div>'+
            (hasSchedule?`,
  `            '<div class="livr-type">'+getJobTypeLabel(job)+(job.nb>1?' × '+job.nb:'')+(job.prothesisId?' · #'+job.prothesisId:'')+'</motion-div>'+
            (_fmtJobDeliveryLine(job)?'<div style="font-size:.68rem;color:#2a6049;margin-top:3px;">'+_fmtJobDeliveryLine(job)+(_isJobLate(job)?' <span style="color:#dc2626;font-weight:700;">· retard</span>':'')+'</motion-div>':'')+
            (hasSchedule?`
);
h = h.replace(
  "${fmt(job.deliveryDate)||'Non renseignée'}",
  "${_fmtJobDeliveryLine(job)||'Non renseignée'}"
);
h = h.replace(
  'color:${job.deliveryDate?',
  'color:${_jobLabDeliveryDate(j)?'
);
h = h.replace(
  "document.getElementById('saisie-ip').addEventListener('keydown',function(e){if(e.key==='Enter'){if(isProgActif())addToQueue();else addDirect();}});",
  "document.getElementById('saisie-ip').addEventListener('keydown',function(e){if(e.key==='Enter'){if(isProgActif())addToQueue();else addDirect();}});\nvar _reqDel=document.getElementById('saisie-ireq-delivery');if(_reqDel)_reqDel.addEventListener('change',onSaisieRequestedDateChange);"
);

// Fix accidental motion-div in template strings
h = h.replace(/motion-div/g, 'div');

fs.writeFileSync(file, h, 'utf8');
console.log('Patched app.html OK');
