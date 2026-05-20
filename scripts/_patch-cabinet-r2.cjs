const fs = require('fs');
const p = require('path').join(__dirname, '..', 'cabinet.html');
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('of-files-list')) {
  const marker =
    "    '</div>'+\n    '<motion.div style=\"background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 14px;margin-top:16px;font-size:.82rem;color:#1e40af;\">💡 Cliquez sur <strong>« Voir l\\'aperçu »</strong> pour vérifier votre fiche avant l\\'envoi définitif au laboratoire.</motion.div>'+";
  const wrong = marker.replace(/motion\.div/g, 'div');
  const insert =
    "    '</div>'+\n" +
    "    '<div style=\"margin-bottom:14px;padding:14px;border:1.5px dashed #93c5fd;border-radius:10px;background:#f8fafc;\">'+\n" +
    "      '<div style=\"font-size:.78rem;font-weight:700;color:#1e40af;margin-bottom:8px;\">🦷 Empreintes numériques (STL, OBJ, PLY…)</div>'+\n" +
    "      '<p style=\"font-size:.76rem;color:#64748b;margin:0 0 10px;line-height:1.45;\">Joignez les fichiers à cette demande. Le laboratoire les retrouvera sur la fiche (max 150 Mo / fichier).</p>'+\n" +
    "      '<div id=\"of-files-list\">'+_orderFilesHtml(_orderPendingFiles,'_removeOrderPendingFile')+'</div>'+\n" +
    "      '<label style=\"display:inline-block;margin-top:8px;background:#2563eb;color:#fff;padding:9px 14px;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;\">'+\n" +
    "        '+ Ajouter des fichiers<input type=\"file\" id=\"of-files-input\" multiple accept=\".stl,.obj,.ply,.zip,.pdf,.3mf,.7z,.rar\" style=\"display:none;\" onchange=\"_onOrderFilesSelected(this)\"/>'+\n" +
    "      '</label>'+\n" +
    "    '</div>'+\n" +
    "    '<div style=\"background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 14px;margin-top:16px;font-size:.82rem;color:#1e40af;\">💡 Cliquez sur <strong>« Voir l\\'aperçu »</strong> pour vérifier votre fiche avant l\\'envoi définitif au laboratoire.</div>'+";
  if (c.includes(wrong)) c = c.replace(wrong, insert);
  else console.warn('marker not found for file upload block');
}

c = c.replace(/<motion\.motion/g, '<div').replace(/<\/motion\.div>/g, '</div>').replace(/motion\.div/g, 'motion.div');

// submitOrder upload
if (!c.includes('_uploadPendingFilesToR2')) {
  console.warn('upload helper missing');
}

const submitOld = `  try{
    const existing=await _fetchPortalOrders();
    existing.unshift(newCase);
    await _savePortalOrders(existing);`;

const submitNew = `  try{
    if(_orderPendingFiles.length){
      showToast('Envoi des fichiers…','#2563eb');
      newCase.steps[0].files=await _uploadPendingFilesToR2(sessionPortalId,caseId,stepId);
      _orderPendingFiles=[];
    }
    const existing=await _fetchPortalOrders();
    existing.unshift(newCase);
    await _savePortalOrders(existing);`;

if (c.includes(submitOld) && !c.includes('newCase.steps[0].files=await')) {
  c = c.replace(submitOld, submitNew);
}

const resetOld = `_orderForm={patient:{name:'',sexe:'',age:''},finalGoal:'',teeth:{},links:{},shadeType:'vita',shadeValue:'',firstStep:{description:'',deliveryDate:'',notes:''}};
  _orderStep=1;
  _clearDraft();`;

const resetNew = `_orderForm={patient:{name:'',sexe:'',age:''},finalGoal:'',teeth:{},links:{},shadeType:'vita',shadeValue:'',firstStep:{description:'',deliveryDate:'',notes:''}};
  _orderPendingFiles=[];
  _orderStep=1;
  _clearDraft();`;

if (c.includes(resetOld)) c = c.replace(resetOld, resetNew);

const addStepOld = `    list[idx].steps.push({
      id:stepId,
      description:desc,
      deliveryDate:date,
      notes:notes,
      shadeValue:shade,
      shadeType:shade?'vita':'',
      status:'pending',
      jobId:null,blId:null,
      requestedAt:now,
      acceptedAt:null,deliveredAt:null,rejectedAt:null
    });`;

const addStepNew = `    var newStep={
      id:stepId,
      description:desc,
      deliveryDate:date,
      notes:notes,
      shadeValue:shade,
      shadeType:shade?'vita':'',
      status:'pending',
      jobId:null,blId:null,
      files:[],
      requestedAt:now,
      acceptedAt:null,deliveredAt:null,rejectedAt:null
    };
    if(_addStepPendingFiles.length){
      showToast('Envoi des fichiers…','#2563eb');
      newStep.files=await _uploadAddStepFilesToR2(sessionPortalId,caseId,stepId);
      _addStepPendingFiles=[];
    }
    list[idx].steps.push(newStep);`;

if (c.includes(addStepOld) && !c.includes('newStep.files=await')) {
  c = c.replace(addStepOld, addStepNew);
}

fs.writeFileSync(p, c);
console.log('patched cabinet.html', c.includes('of-files-list'), c.includes('newCase.steps[0].files'));
