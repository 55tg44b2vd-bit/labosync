import fs from 'fs';

const clean = fs.readFileSync(new URL('./recovered-import-clean.js', import.meta.url), 'utf8');
const full = fs.readFileSync(new URL('./recovered-import-full.js', import.meta.url), 'utf8');

let parsers = clean.replace(/^var _importPlan=null;\n?/, '');
const cut = parsers.indexOf('function importAiEnsurePdfJs');
if (cut > 0) parsers = parsers.slice(0, cut);

const ui = full.replace(/^\/\*[\s\S]*?\*\/\n/, '');

const bundle = `/* Import données — parseurs + application */
var _importPlan=null;

${parsers}

${ui}

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
        if(st){st.textContent='Fichier reconnu : facture électronique. Vérifiez le résumé ci-dessous.';st.style.color='#2a6049';}
        renderImportPlanPreview(_importPlan);
        inp.value='';
        return;
      }
    }
    if(importTryLoadStructuredAfterFile(txt,fn)){inp.value='';return;}
    if(st){st.textContent='Fichier chargé. Cliquez sur « Préparer l\\'import » pour continuer.';st.style.color='var(--ink-soft)';}
    inp.value='';
  };
  r.onerror=function(){if(st){st.textContent='Impossible de lire ce fichier.';st.style.color='#c0392b';}};
  if(/\\.pdf$/i.test(f.name||''))r.readAsArrayBuffer(f);
  else r.readAsText(f,'UTF-8');
}

function _importActionLabel(type){
  if(type==='create_cabinet')return 'Ajouter un dentiste';
  if(type==='create_bl')return 'Bon de livraison';
  if(type==='create_facture')return 'Facture';
  return type||'—';
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
    return '<motion style="margin-bottom:10px;"><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">'+escHtml(q.prompt||q.id)+'</label>'+
      '<input type="text" class="import-q-inp" data-qid="'+escHtml(q.id)+'" data-idx="'+escHtml(mid)+'" data-path="'+pid+'" placeholder="Votre réponse" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:.88rem;"/></motion>';
  }).join('');
  var actRows=(plan.actions||[]).map(function(a,i){
    var d=a.draft||{};
    var detail='';
    if(a.type==='create_cabinet')detail=String(d.name||'');
    else if(a.type==='create_bl')detail=(d.cabinetName||'')+' — '+(d.patient||d.description||'');
    else if(a.type==='create_facture')detail=(d.cabinetName||'')+' — '+(d.total!=null?d.total+' €':'');
    return '<tr><td style="padding:8px;border-bottom:1px solid var(--border);font-size:.8rem;vertical-align:top;">'+_importActionLabel(a.type)+'</td>'+
      '<td style="padding:8px;border-bottom:1px solid var(--border);font-size:.8rem;">'+escHtml(detail)+'</td></tr>';
  }).join('');
  pv.innerHTML=
    '<p class="import-preview-lead">'+escHtml(plan.summary||'Voici ce que Labosync va importer.')+'</p>'+
    '<div class="import-preview-stats">'+
      (counts.cab?'<span class="import-stat">🦷 '+counts.cab+' dentiste(s)</span>':'')+
      (counts.bl?'<span class="import-stat">📦 '+counts.bl+' bon(s) de livraison</span>':'')+
      (counts.fac?'<span class="import-stat">💰 '+counts.fac+' facture(s)</span>':'')+
    '</div>'+
    (qHtml?'<div style="font-size:.85rem;font-weight:700;margin:14px 0 8px;">Quelques précisions</div>'+qHtml.replace(/<motion/g,'<div').replace(/<\\/motion>/g,'</motion>').replace(/<\\/motion>/g,'</motion>').replace(/<motion/g,'<div').replace(/<\\/motion>/g,'</div>') : '')+
    (actRows?'<div style="font-size:.85rem;font-weight:700;margin:14px 0 8px;">Détail</motion><table style="width:100%;border-collapse:collapse;margin-bottom:16px;"><tbody>'+actRows+'</tbody></table>':'')+
    '<button type="button" class="btn btn-a" onclick="applyAiImportPlan()">✓ Tout importer dans mon compte</button>'+
    '<button type="button" class="btn btn-b" style="margin-left:8px;" onclick="_importPlan=null;var p=document.getElementById(\\'import-ai-preview\\');if(p){p.style.display=\\'none\\';p.innerHTML=\\'\\';}">Annuler</button>';
  pv.style.display='block';
}

async function runImportPrepare(){
  if(!guardPerm('action:data_import','⛔ Votre rôle ne permet pas d\\'importer des données.'))return;
  var ta=document.getElementById('import-ai-raw');
  var st=document.getElementById('import-ai-status');
  var pv=document.getElementById('import-ai-preview');
  if(!ta||!st)return;
  var raw=ta.value||'';
  if(!raw.trim()){st.textContent='Choisissez un fichier ou collez un tableau exporté de votre ancien logiciel.';st.style.color='#c0392b';return;}
  var fn=(document.getElementById('import-ai-file')&&document.getElementById('import-ai-file').files[0]&&document.getElementById('import-ai-file').files[0].name)||'export';
  _importPlan=null;
  if(pv){pv.style.display='none';pv.innerHTML='';}
  if(/^\\s*</.test(raw)||/\\.xml$/i.test(fn)){
    var fx=importFacturXBuildPlan(raw,fn);
    if(fx.ok){
      _importPlan=fx.plan;
      st.textContent='Facture électronique reconnue. Vérifiez puis validez.';
      st.style.color='#2a6049';
      renderImportPlanPreview(_importPlan);
      return;
    }
  }
  var pr=importProthesisParseCsvText(raw,fn);
  if(pr.ok){
    _importPlan=pr.plan;
    st.textContent='Tableau reconnu. Vérifiez puis validez.';
    st.style.color='#2a6049';
    renderImportPlanPreview(_importPlan);
    return;
  }
  await runAiImportAnalyze();
}

function importRunStructuredFromTextarea(){ runImportPrepare(); }
`;

// fix motion typos in bundle
const fixed = bundle
  .replace(/<motion /g, '<motion ')
  .replace(/<motion style/g, '<div style')
  .replace(/<\/motion>/g, '</div>')
  .replace(/Détail<\/motion><table/g, 'Détail</motion><table')
  .replace(/Détail<\/motion><table/g, 'Détail</div><table')
  .replace(/Détail<\/div><table/g, 'Détail</motion><table');

// manual fix renderImportPlanPreview - I made a mess with motion. Let me rewrite that function cleanly in the file

const renderFn = `function renderImportPlanPreview(plan){
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
    return '<motion style="margin-bottom:10px;"><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">'+escHtml(q.prompt||q.id)+'</label>'+
      '<input type="text" class="import-q-inp" data-qid="'+escHtml(q.id)+'" data-idx="'+escHtml(mid)+'" data-path="'+pid+'" placeholder="Votre réponse" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:.88rem;"/></motion>';
  }).join('').replace(/<motion/g,'<motion').replace(/<motion style/g,'<div style').replace(/<\\/motion>/g,'</div>');
`;

// Simpler: write final bundle file with write tool directly
