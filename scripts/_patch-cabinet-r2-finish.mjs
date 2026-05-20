import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'cabinet.html');
let c = readFileSync(path, 'utf8');

// Preview: fichiers joints
const previewNeedle =
  "(o.firstStep.notes?'<motion.div style=\"font-size:.84rem;margin-top:8px;\"><strong>📝 Notes :</strong><div style=\"background:#fff;border:1px solid #fed7aa;padding:8px 10px;border-radius:6px;margin-top:4px;white-space:pre-wrap;\">'+esc(o.firstStep.notes)+'</div></div>':'')+\n        '</div>'+";
const previewRepl =
  "(o.firstStep.notes?'<div style=\"font-size:.84rem;margin-top:8px;\"><strong>📝 Notes :</strong><div style=\"background:#fff;border:1px solid #fed7aa;padding:8px 10px;border-radius:6px;margin-top:4px;white-space:pre-wrap;\">'+esc(o.firstStep.notes)+'</div></div>':'')+\n          (_orderPendingFiles.length?'<div style=\"margin-top:12px;\"><div style=\"font-size:.74rem;font-weight:700;color:#64748b;margin-bottom:6px;\">🦷 FICHIERS JOINTS ('+_orderPendingFiles.length+')</div>'+_orderFilesHtml(_orderPendingFiles,'_removeOrderPendingFile')+'</div>':'')+\n        '</div>'+";

// Fix needle without motion typo
const previewNeedle2 =
  "(o.firstStep.notes?'<div style=\"font-size:.84rem;margin-top:8px;\"><strong>📝 Notes :</strong><motion.div style=\"background:#fff;border:1px solid #fed7aa;padding:8px 10px;border-radius:6px;margin-top:4px;white-space:pre-wrap;\">'+esc(o.firstStep.notes)+'</div></motion.div>':'')+\n        '</div>'+";

if (!c.includes('_orderPendingFiles.length?\'<div style="margin-top:12px')) {
  if (c.includes(previewNeedle2)) {
    c = c.replace(previewNeedle2, previewRepl);
    console.log('preview: fixed motion typo + files');
  } else {
    const n =
      "(o.firstStep.notes?'<div style=\"font-size:.84rem;margin-top:8px;\"><strong>📝 Notes :</strong><div style=\"background:#fff;border:1px solid #fed7aa;padding:8px 10px;border-radius:6px;margin-top:4px;white-space:pre-wrap;\">'+esc(o.firstStep.notes)+'</div></div>':'')+\n        '</div>'+";
    if (c.includes(n)) {
      c = c.replace(n, previewRepl);
      console.log('preview: files block added');
    } else {
      console.warn('preview: needle not found');
    }
  }
} else {
  console.log('preview: already patched');
}

// Add step overlay: fichiers
const addStepNeedle =
  "      '<div style=\"margin-bottom:6px;\">'+\n        '<label style=\"font-size:.78rem;font-weight:600;color:var(--ink);display:block;margin-bottom:4px;\">📝 Notes &amp; instructions</label>'+\n        '<textarea id=\"as-notes\" placeholder=\"Précisions éventuelles…\" style=\"width:100%;border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;font-size:.92rem;outline:none;min-height:70px;resize:vertical;\"></textarea>'+\n      '</div>'+\n    '</div>'+";

const addStepRepl =
  "      '<div style=\"margin-bottom:6px;\">'+\n        '<label style=\"font-size:.78rem;font-weight:600;color:var(--ink);display:block;margin-bottom:4px;\">📝 Notes &amp; instructions</label>'+\n        '<textarea id=\"as-notes\" placeholder=\"Précisions éventuelles…\" style=\"width:100%;border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;font-size:.92rem;outline:none;min-height:70px;resize:vertical;\"></textarea>'+\n      '</div>'+\n      '<div style=\"margin-bottom:14px;padding:14px;border:1.5px dashed #93c5fd;border-radius:10px;background:#f8fafc;\">'+\n        '<div style=\"font-size:.78rem;font-weight:700;color:#1e40af;margin-bottom:8px;\">🦷 Empreintes numériques</div>'+\n        '<div id=\"as-files-list\">'+_orderFilesHtml(_addStepPendingFiles,'_removeAddStepPendingFile')+'</div>'+\n        '<label style=\"display:inline-block;margin-top:8px;background:#2563eb;color:#fff;padding:9px 14px;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;\">+ Ajouter des fichiers<input type=\"file\" id=\"as-files-input\" multiple accept=\".stl,.obj,.ply,.zip,.pdf,.3mf,.7z,.rar\" style=\"display:none;\" onchange=\"_onAddStepFilesSelected(this)\"/></label>'+\n      '</div>'+\n    '</div>'+";

if (!c.includes('id="as-files-list"')) {
  if (c.includes(addStepNeedle)) {
    c = c.replace(addStepNeedle, addStepRepl);
    console.log('addStep: files UI');
  } else {
    console.warn('addStep: needle not found');
  }
} else {
  console.log('addStep: already patched');
}

// addStepToCase: reset pending files
if (!c.includes('_addStepPendingFiles=[]; // reset')) {
  c = c.replace(
    'async function addStepToCase(caseId){\n  const list=await _loadCabinetOrders();',
    'async function addStepToCase(caseId){\n  _addStepPendingFiles=[];\n  const list=await _loadCabinetOrders();',
  );
  console.log('addStepToCase: reset pending');
}

// confirmAddStep: upload
const confirmNeedle = `    const stepId='step_'+Date.now()+'_'+Math.random().toString(36).substr(2,5);
    const now=new Date().toISOString();
    list[idx].steps.push({
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

const confirmRepl = `    const stepId='step_'+Date.now()+'_'+Math.random().toString(36).substr(2,5);
    const now=new Date().toISOString();
    var newStep={
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
    };
    if(_addStepPendingFiles.length){
      showToast('Envoi des fichiers…','#2563eb');
      newStep.files=await _uploadAddStepFilesToR2(sessionPortalId,caseId,stepId);
      _addStepPendingFiles=[];
    }
    list[idx].steps.push(newStep);`;

if (!c.includes('newStep.files=await _uploadAddStepFilesToR2')) {
  if (c.includes(confirmNeedle)) {
    c = c.replace(confirmNeedle, confirmRepl);
    console.log('confirmAddStep: upload');
  } else {
    console.warn('confirmAddStep: needle not found');
  }
}

c = c.replace(/motion\.div/g, 'motion.div'); // noop detect
c = c.replace(/<\/?motion\.div/g, (m) => m.replace('motion.', ''));

writeFileSync(path, c, 'utf8');
console.log('cabinet.html saved');
