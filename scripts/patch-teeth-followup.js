const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app.html');
let h = fs.readFileSync(file, 'utf8');

// Remove accidental <motion> typos
h = h.replace(/<motion /g, '<div ');
h = h.replace(/<\/motion>/g, '</div>');

if (!h.includes('saisie-teeth-section')) {
  h = h.replace(
    '<div id="saisie-extra-lines"></div>\n    <div class="frow2"',
    '<div id="saisie-extra-lines"></div>\n    <div id="saisie-teeth-section" style="margin-top:10px;"></div>\n    <div class="frow2"'
  );
}

function rep(a, b, label) {
  if (!h.includes(a)) {
    console.warn('skip', label);
    return;
  }
  h = h.replace(a, b);
  console.log('ok', label);
}

rep(
  "var hay=[j.patient,j.note,j.trackCode,j.prothesisId,getJobTypeLabel(j)].join(' ').toLowerCase();",
  "var td=_jobTeethArrays(j);var hay=[j.patient,j.note,j.trackCode,j.prothesisId,getJobTypeLabel(j),td.teeth.join(' ')].join(' ').toLowerCase();",
  'search teeth'
);

rep(
  'jobs.push({id:String(Date.now()),patient:lbl,type,tasks,nb,items,urgent:urg,note,deliveryDate,cabinet:cab,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId});',
  'var toothD=_readSaisieTeethFields();jobs.push({id:String(Date.now()),patient:lbl,type,tasks,nb,items,urgent:urg,note,deliveryDate,cabinet:cab,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId,teeth:toothD.teeth,links:toothD.links});',
  'addJob teeth'
);

rep(
  'const queueItem=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,emp:emp||false,createdAt:new Date().toISOString()},deliv);',
  'var toothD=_readSaisieTeethFields();const queueItem=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,emp:emp||false,createdAt:new Date().toISOString(),teeth:toothD.teeth,links:toothD.links},deliv);',
  'queue teeth'
);

rep(
  "resetSaisieLines();\n  updateQueueBadge();\n  renderQueueMain();\n}",
  "resetSaisieLines();\n  _resetSaisieTeethPick();\n  updateQueueBadge();\n  renderQueueMain();\n  render();\n  if(typeof showToast==='function')showToast('✅ Ajouté aux nouveaux travaux (à programmer)','#2a6049',3500);\n  var qs=document.getElementById('queue-section');if(qs)qs.scrollIntoView({behavior:'smooth',block:'start'});\n}",
  'addToQueue feedback'
);

rep(
  "const job=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,tasks:[],nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId:''},deliv);",
  "var toothD=_readSaisieTeethFields();const job=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,tasks:[],nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId:'',teeth:toothD.teeth,links:toothD.links},deliv);",
  'addDirect teeth'
);

rep(
  "resetSaisieLines();\n  render();\n}\n\nfunction removeFromQueue",
  "resetSaisieLines();\n  _resetSaisieTeethPick();\n  render();\n  if(typeof showToast==='function')showToast('✅ Travail ajouté à la liste','#2a6049',3000);\n  var jt=document.getElementById('jobs-ops-toolbar');if(jt)jt.scrollIntoView({behavior:'smooth',block:'start'});\n}\n\nfunction removeFromQueue",
  'addDirect feedback'
);

rep(
  "          '<motion id=\"ej-price-summary\"",
  "          '<div id=\"ej-price-summary\"",
  'fix ej if broken'
);

rep(
  "'<div><label style=\"font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;\">📝 Note</label>'+\n          '<textarea id=\"ej-note\"",
  "'+_renderLabTeethPickerBlock('ej-tooth-chart','ej-tooth-summary')+'<div><label style=\"font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;\">📝 Note</label>'+\n          '<textarea id=\"ej-note\"",
  'editJob teeth block'
);

rep(
  "  document.body.appendChild(overlay);\n  renderEditJobItems();\n}",
  "  document.body.appendChild(overlay);\n  var td=_jobTeethArrays(job);\n  _initLabTeethPick(td.teeth,td.links,'ej-tooth-chart','ej-tooth-summary');\n  renderEditJobItems();\n}",
  'editJob init teeth'
);

rep(
  "  job.note=_editJob.note||'';\n  job.items=validItems.map",
  "  job.note=_editJob.note||'';\n  var ejTooth=_teethArraysFromMap(_labTeethPick.teeth,_labTeethPick.links);\n  job.teeth=ejTooth.teeth;\n  job.links=ejTooth.links;\n  job.items=validItems.map",
  'saveEditJob teeth'
);

rep(
  "    orderData:c,\n    parentJobId:c.parentJobId||null\n  };",
  "    orderData:c,\n    parentJobId:c.parentJobId||null,\n    teeth:(c.teeth||[]).slice(),\n    links:(c.links||[]).slice()\n  };",
  'acceptOrder teeth'
);

rep(
  "  var reqD=_jobRequestedDeliveryDate(job);\n  return '<div class=\"print-wrap\"",
  "  var reqD=_jobRequestedDeliveryDate(job);\n  var toothD=_jobTeethArrays(job);\n  var teethLbl=toothD.teeth.length?toothD.teeth.join(', '):'';\n  var teethSummary=teethLbl?_formatTeethSummary(toothD.teeth,toothD.links):'';\n  return '<div class=\"print-wrap\"",
  'lab sheet vars'
);

rep(
  "      (reqD&&reqD!==_jobLabDeliveryDate(job)?'<tr><td style=\"padding:6px 0;color:#64748b;\">Date demandée</td><td>'+new Date(reqD+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</td></tr>':'')+\n    '</table>'+",
  "      (reqD&&reqD!==_jobLabDeliveryDate(job)?'<tr><td style=\"padding:6px 0;color:#64748b;\">Date demandée</td><td>'+new Date(reqD+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</td></tr>':'')+\n      (teethLbl?'<tr><td style=\"padding:6px 0;color:#64748b;\">Dents (FDI)</td><td style=\"font-family:monospace;font-weight:600;\">'+escH2(teethLbl)+'</td></tr>':'')+\n    '</table>'+\n    (toothD.teeth.length?'<div style=\"margin-bottom:14px;\">'+_renderToothChartReadonly(toothD.teeth,toothD.links)+'</div>':'')+",
  'lab sheet teeth row'
);

rep(
  "      const created=j.createdAt?new Date(j.createdAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'—';\n      const delivStr=_fmtJobDeliveryLine(j)||'—';\n      rows.push(`<tr>",
  "      const created=j.createdAt?new Date(j.createdAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'—';\n      const delivStr=_fmtJobDeliveryLine(j)||'—';\n      const jTeeth=_jobTeethArrays(j).teeth;\n      const teethHint=jTeeth.length?'<div style=\"font-size:.65rem;color:#2a6049;font-family:monospace;margin-top:2px;\">🦷 '+jTeeth.join(', ')+'</div>':'';\n      rows.push(`<tr>",
  'table teeth hint'
);

rep(
  '${missingBadge}${j.patient}${j.note?`<div style="font-size:.65rem;color:var(--ink-soft);font-style:italic;margin-top:2px;">📝 ${j.note}</div>`:\'\'}${missing?',
  '${missingBadge}${j.patient}${teethHint}${j.note?`<div style="font-size:.65rem;color:var(--ink-soft);font-style:italic;margin-top:2px;">📝 ${j.note}</div>`:\'\'}${missing?',
  'table patient cell teeth'
);

rep(
  "render();\nrenderDashboard();\n",
  "initSaisieTeethSection();\nrender();\nrenderDashboard();\n",
  'init teeth on load'
);

if (!h.includes('function initSaisieTeethSection')) {
  const fn = `
function initSaisieTeethSection(){
  var sts=document.getElementById('saisie-teeth-section');
  if(!sts||sts.dataset.inited)return;
  sts.innerHTML=_renderLabTeethPickerBlock('saisie-tooth-chart','saisie-tooth-summary');
  sts.dataset.inited='1';
  _resetSaisieTeethPick();
}
`;
  h = h.replace('function _resetSaisieTeethPick(){', fn + 'function _resetSaisieTeethPick(){');
}

rep(
  "if(pane==='saisie'){syncSaisieCab();renderQueueSaisie();loadAndRenderPendingOrders();}",
  "if(pane==='saisie'){syncSaisieCab();initSaisieTeethSection();renderQueueSaisie();loadAndRenderPendingOrders();}",
  'init on saisie tab'
);

fs.writeFileSync(file, h);
console.log('done', h.includes('saisie-teeth-section'), h.includes('initSaisieTeethSection'));
