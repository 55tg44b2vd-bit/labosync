const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app.html');
let h = fs.readFileSync(file, 'utf8');

// fix typo tag
h = h.replace(/motion-div/g, 'div');

// saveEditJob
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

// addToQueue
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

// addDirect  
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

// fix broken edit overlay footer if needed
h = h.replace(
  `        _renderJobAttachmentsSection(jobId)+
      '</div>'+
      '<motion-div style="padding:14px 22px;border-top:1px solid #e2e8f0;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;background:#f8fafc;">'+
`,
  `        _renderJobAttachmentsSection(jobId)+
      '</motion-div>'+
      '<motion-div style="padding:14px 22px;border-top:1px solid #e2e8f0;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;background:#f8fafc;">'+
`
);
h = h.replace(/motion-div/g, 'div');

fs.writeFileSync(file, h, 'utf8');
console.log('final patch done');
