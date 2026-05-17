const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app.html');
let h = fs.readFileSync(file, 'utf8');

const livrOld =
  "            '<motion-div class=\"livr-type\">'+getJobTypeLabel(job)+(job.nb>1?' × '+job.nb:'')+(job.prothesisId?' · #'+job.prothesisId:'')+'</motion-div>'+\n" +
  "            (hasSchedule?'<motion-div style=\"display:flex;align-items:center;gap:6px;margin-top:4px;\">'+";
const livrNew =
  "            '<motion-div class=\"livr-type\">'+getJobTypeLabel(job)+(job.nb>1?' × '+job.nb:'')+(job.prothesisId?' · #'+job.prothesisId:'')+'</motion-div>'+\n" +
  "            (_fmtJobDeliveryLine(job)?'<motion-div style=\"font-size:.68rem;color:#2a6049;margin-top:3px;\">'+_fmtJobDeliveryLine(job)+(_isJobLate(job)?' <span style=\"color:#dc2626;font-weight:700;\">· retard</span>':'')+'</motion-div>':'')+\n" +
  "            (hasSchedule?'<motion-div style=\"display:flex;align-items:center;gap:6px;margin-top:4px;\">'+";

// Replace erroneous tag name with div
const toDiv = (s) => s.replace(/motion-div/g, 'div');

if (h.includes(toDiv(livrOld)) && !h.includes('_fmtJobDeliveryLine(job)?\'<div style="font-size:.68rem;color:#2a6049')) {
  h = h.replace(toDiv(livrOld), toDiv(livrNew));
  console.log('livraisons: OK');
} else if (h.includes('_fmtJobDeliveryLine(job)?\'<div style="font-size:.68rem;color:#2a6049')) {
  console.log('livraisons: déjà fait');
} else {
  console.log('livraisons: pattern non trouvé');
}

const saveOld = `  if(!_editJob.patient.trim()){alert('Le code patient est requis.');return;}
  job.patient=_editJob.patient.trim();`;
const saveNew = `  if(!_editJob.patient.trim()){alert('Le code patient est requis.');return;}
  var ejReq=document.getElementById('ej-req-delivery');
  var ejLab=document.getElementById('ej-lab-delivery');
  var ejSlot=document.getElementById('ej-delivery-slot');
  if(ejReq)_editJob.requestedDeliveryDate=ejReq.value||'';
  if(ejLab)_editJob.labDeliveryDate=ejLab.value||'';
  if(ejSlot)_editJob.labDeliverySlot=ejSlot.value||'12';
  job.patient=_editJob.patient.trim();`;
if (h.includes(saveOld) && !h.includes("getElementById('ej-req-delivery')")) {
  h = h.replace(saveOld, saveNew);
  console.log('saveEditJob: OK');
}

const accOld = `  const job={
    id:String(Date.now()),
    patient:_acceptForm.patient,`;
const accNew = `  var afSlot=document.getElementById('af-delivery-slot');
  if(afSlot)_acceptForm.labDeliverySlot=afSlot.value||'12';
  var afLab=document.getElementById('af-lab-delivery');
  if(afLab){_acceptForm.labDeliveryDate=afLab.value||'';_acceptForm.deliveryDate=afLab.value||'';}
  const job={
    id:String(Date.now()),
    patient:_acceptForm.patient,`;
if (h.includes(accOld) && !h.includes("getElementById('af-delivery-slot')")) {
  h = h.replace(accOld, accNew);
  console.log('confirmAcceptOrder: OK');
}

fs.writeFileSync(file, h, 'utf8');
console.log('Terminé');
