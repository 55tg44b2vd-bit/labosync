import fs from 'fs';

const clean = fs.readFileSync(new URL('./recovered-import-clean.js', import.meta.url), 'utf8');
const full = fs.readFileSync(new URL('./recovered-import-full.js', import.meta.url), 'utf8');

let parsers = clean.replace(/^var _importPlan=null;\n?/, '');
const cut = parsers.indexOf('function importAiEnsurePdfJs');
if (cut > 0) parsers = parsers.slice(0, cut);

let ui = full.replace(/^\/\*[\s\S]*?\*\/\nvar _importPlan=null;\n?/, '');
ui = ui.replace(/function importAiPickFile[\s\S]*?^}\n\n/m, '');
ui = ui.replace(/function renderImportPlanPreview[\s\S]*?^}\n\n/m, '');

const d = 'motion'; // avoid accidental replace - use literal div below
const extras = `
function importAiGetMode(){ return 'auto'; }

function importAiPickFile(inp){
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

function _importActionLabel(type){
  if(type==='create_cabinet')return 'Dentiste';
  if(type==='create_bl')return 'Bon de livraison';
  if(type==='create_facture')return 'Facture';
  return 'Élément';
}

function renderImportPlanPreview(plan){
  var pv=document.getElementById('import-ai-preview');if(!pv)return;
  var counts={cab:0,bl:0,fac:0};
  (plan.actions||[]).forEach(function(a){
    if(a.type==='create_cabinet')counts.cab++;
    if(a.type==='create_bl')counts.bl++;
    if(a.type==='create_facture')counts.fac++;
  });
  var qHtml=(plan.questions||[]).map(function(q){
    var mid=q.mergeInto&&typeof q.mergeInto.actionIndex==='number'?String(q.mergeInto.actionIndex):'';
    var pid=q.mergeInto&&q.mergeInto.path?String(q.mergeInto.path).replace(/"/g,'&quot;'):'';
    return '<${'"+d+"'} style="margin-bottom:10px;"><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">'+escHtml(q.prompt||q.id)+'</label>'+
      '<input type="text" class="import-q-inp" data-qid="'+escHtml(q.id)+'" data-idx="'+escHtml(mid)+'" data-path="'+pid+'" placeholder="Votre réponse" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:.88rem;"/></${'"+d+"'}>';
  }).join('');
  qHtml=qHtml.split('${'+d+'}').join('div');
  var actRows=(plan.actions||[]).map(function(a){
    var draft=a.draft||{};
    var detail='';
    if(a.type==='create_cabinet')detail=String(draft.name||'');
    else if(a.type==='create_bl')detail=(draft.cabinetName||'')+' — '+(draft.patient||draft.description||'');
    else if(a.type==='create_facture')detail=(draft.cabinetName||'')+(draft.total!=null?' — '+draft.total+' €':'');
    return '<tr><td style="padding:8px;border-bottom:1px solid var(--border);font-size:.8rem;">'+_importActionLabel(a.type)+'</td>'+
      '<td style="padding:8px;border-bottom:1px solid var(--border);font-size:.8rem;">'+escHtml(detail)+'</td></tr>';
  }).join('');
  pv.innerHTML=
    '<p class="import-preview-lead">'+escHtml(plan.summary||'Voici ce que Labosync va importer dans votre compte.')+'</p>'+
    '<div class="import-preview-stats">'+
      (counts.cab?'<span class="import-stat">🦷 '+counts.cab+' dentiste(s)</span>':'')+
      (counts.bl?'<span class="import-stat">📦 '+counts.bl+' bon(s) de livraison</span>':'')+
      (counts.fac?'<span class="import-stat">💰 '+counts.fac+' facture(s)</span>':'')+
    '</${'"+d+"'}>'+
    (qHtml?'<motion style="font-size:.85rem;font-weight:700;margin:14px 0 8px;">Quelques précisions</motion>'+qHtml:'')+
    (actRows?'<motion style="font-size:.85rem;font-weight:700;margin:14px 0 8px;">Détail</motion><table style="width:100%;border-collapse:collapse;margin-bottom:16px;"><tbody>'+actRows+'</tbody></table>':'')+
    '<button type="button" class="btn btn-a" onclick="applyAiImportPlan()">✓ Tout importer dans mon compte</button>'+
    '<button type="button" class="btn btn-b" style="margin-left:8px;" onclick="_importPlan=null;var p=document.getElementById(\\'import-ai-preview\\');if(p){p.style.display=\\'none\\';p.innerHTML=\\'\\';}">Annuler</button>';
  pv.innerHTML=pv.innerHTML.split('${'+d+'}').join('motion').split('motion').join('div');
  pv.style.display='block';
}

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
    if(fx.ok){
      _importPlan=fx.plan;
      st.textContent='C\\'est prêt — vérifiez le résumé puis validez.';
      st.style.color='#2a6049';
      renderImportPlanPreview(_importPlan);
      return;
    }
  }
  var pr=importProthesisParseCsvText(raw,fn);
  if(pr.ok){
    _importPlan=pr.plan;
    st.textContent='C\\'est prêt — vérifiez le résumé puis validez.';
    st.style.color='#2a6049';
    renderImportPlanPreview(_importPlan);
    return;
  }
  await runAiImportAnalyze();
}

function importRunStructuredFromTextarea(){ runImportPrepare(); }
`;

// Fix the botched template - rewrite extras cleanly without tricks
const extrasClean = fs.readFileSync(new URL('./import-extras.js', import.meta.url), 'utf8').catch?.() || null;
