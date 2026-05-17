import fs from 'fs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const full = readFileSync(new URL('./recovered-import-full.js', import.meta.url), 'utf8');

const pick = `function importAiPickFile(inp){
  var f=inp.files&&inp.files[0];if(!f)return;
  var st=document.getElementById('import-ai-status');
  var ta=document.getElementById('import-ai-raw');
  if(st){st.textContent='Lecture du fichier « '+f.name+' »…';st.style.color='var(--ink-soft)';}
  var r=new FileReader();
  r.onload=function(){
    var txt=String(r.result||'');
    if(ta)ta.value=txt;
    var fn=f.name||'';
    if(/^\\s*</.test(txt)||/\\.xml$/i.test(fn)){
      var fx=importFacturXBuildPlan(txt,fn);
      if(fx.ok){
        _importPlan=fx.plan;
        if(fx.textDump&&ta)ta.value=fx.textDump;
        if(st){st.textContent='Fichier reconnu. Vérifiez le résumé ci-dessous.';st.style.color='#2a6049';}
        renderImportPlanPreview(_importPlan);
        inp.value='';
        return;
      }
    }
    if(importTryLoadStructuredAfterFile(txt,fn)){inp.value='';return;}
    if(st){st.textContent='Fichier chargé. Cliquez sur « Préparer l\\'import ».';st.style.color='var(--ink-soft)';}
    inp.value='';
  };
  r.onerror=function(){if(st){st.textContent='Impossible de lire ce fichier.';st.style.color='#c0392b';}};
  r.readAsText(f,'UTF-8');
}

function importAiGetMode(){ return 'auto'; }

function _importActionLabel(type){
  if(type==='create_cabinet')return 'Dentiste';
  if(type==='create_bl')return 'Bon de livraison';
  if(type==='create_facture')return 'Facture';
  return 'Élément';
}

`;

const render = full.match(/function renderImportPlanPreview[\s\S]*?^}\n\n/)?.[0] || '';
const renderPatched = render
  .replace(/escHtml\(a\.type\)/g, '_importActionLabel(a.type)')
  .replace(
    /escHtml\(JSON\.stringify\(a\.draft\|\|\{\}\)\.slice\(0,220\)\)/,
    "(function(){var d=a.draft||{};var s='';if(a.type==='create_cabinet')s=d.name||'';else if(a.type==='create_bl')s=(d.cabinetName||'')+' — '+(d.patient||d.description||'');else if(a.type==='create_facture')s=(d.cabinetName||'')+(d.total!=null?' — '+d.total+' €':'');return escHtml(String(s).slice(0,220));})()"
  )
  .replace('Informations complémentaires', 'Quelques précisions')
  .replace(/Actions prévues \(/, 'Détail (')
  .replace('Appliquer ce plan au compte', 'Tout importer dans mon compte')
  .replace('<th style="text-align:left;padding:6px 8px;">#</th>', '')
  .replace('<th style="text-align:left;padding:6px 8px;">Type</th>', '<th style="text-align:left;padding:8px;">Élément</th>')
  .replace('<th style="text-align:left;padding:6px 8px;">Brouillon</th>', '<th style="text-align:left;padding:8px;">Détail</th>')
  .replace("return '<tr><td style=\"padding:6px 8px;", "return '<tr><td style=\"display:none;");
const run = `
async function runImportPrepare(){
  if(!guardPerm('action:data_import','⛔ Votre rôle ne permet pas d\\'importer des données.'))return;
  var ta=document.getElementById('import-ai-raw');
  var st=document.getElementById('import-ai-status');
  var pv=document.getElementById('import-ai-preview');
  if(!ta||!st)return;
  var raw=ta.value||'';
  if(!raw.trim()){st.textContent='Choisissez un fichier ou collez un export de votre ancien logiciel.';st.style.color='#c0392b';return;}
  var fn=(document.getElementById('import-ai-file')&&document.getElementById('import-ai-file').files[0]&&document.getElementById('import-ai-file').files[0].name)||'export';
  _importPlan=null;
  if(pv){pv.style.display='none';pv.innerHTML='';}
  st.textContent='Analyse en cours…';st.style.color='var(--ink-soft)';
  if(/^\\s*</.test(raw)||/\\.xml$/i.test(fn)){
    var fx=importFacturXBuildPlan(raw,fn);
    if(fx.ok){ _importPlan=fx.plan; st.textContent='C\\'est prêt — vérifiez le résumé puis validez.'; st.style.color='#2a6049'; renderImportPlanPreview(_importPlan); return; }
  }
  var pr=importProthesisParseCsvText(raw,fn);
  if(pr.ok){ _importPlan=pr.plan; st.textContent='C\\'est prêt — vérifiez le résumé puis validez.'; st.style.color='#2a6049'; renderImportPlanPreview(_importPlan); return; }
  await runAiImportAnalyze();
}
function importRunStructuredFromTextarea(){ runImportPrepare(); }
`;

fs.writeFileSync(new URL('./import-extras.js', import.meta.url), pick + renderPatched + run);
console.log('extras ok');
