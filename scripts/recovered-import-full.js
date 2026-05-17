/* ══════════════════════════════════════════
   Import intelligent (Claude) — plan JSON puis application locale
   ══════════════════════════════════════════ */
var _importPlan=null;

function importAiPickFile(inp){
  var f=inp.files&&inp.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(){
    var ta=document.getElementById('import-ai-raw');if(ta)ta.value=String(r.result||'');
  };
  r.readAsText(f,'UTF-8');
  inp.value='';
}

function _importParseAiJsonText(text){
  var t=String(text||'').trim();
  var fence=t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(fence)t=fence[1].trim();
  return JSON.parse(t);
}

function _importSetByPath(obj, pathStr, val){
  var parts=String(pathStr||'').split('.').filter(Boolean);
  if(!parts.length)return;
  var cur=obj;
  for(var i=0;i<parts.length-1;i++){
    var k=parts[i];
    if(cur[k]==null||typeof cur[k]!=='object')cur[k]={};
    cur=cur[k];
  }
  cur[parts[parts.length-1]]=val;
}

function _importFindCabinetByName(name){
  var n=String(name||'').trim().toLowerCase();if(!n)return null;
  var exact=cabinets.find(function(c){return String(c.name||'').trim().toLowerCase()===n;});
  if(exact)return exact;
  return cabinets.find(function(c){
    var cn=String(c.name||'').trim().toLowerCase();
    return cn&&n&&(cn.indexOf(n)>=0||n.indexOf(cn)>=0);
  })||null;
}

function _importResolveTypeKey(draft){
  var k=String(draft.typeKey||'').trim();
  if(k&&TYPE_LABELS[k])return k;
  var desc=String(draft.description||draft.typeLabel||'').toLowerCase();
  if(desc){
    for(var id in TYPE_LABELS){
      var lab=String(TYPE_LABELS[id]||'').toLowerCase();
      if(lab&&(desc.indexOf(lab)>=0||lab.indexOf(desc)>=0))return id;
    }
  }
  return 'provisoire';
}

function createLegacyImportedBL(cab, draft){
  if(!cab||!draft)return;
  var typeKey=_importResolveTypeKey(draft);
  var nb=Math.max(1,parseInt(draft.nb,10)||1);
  var pu=parseFloat(draft.prix);
  if(!Number.isFinite(pu))pu=0;
  var lignes=draft.lignes;
  if(!Array.isArray(lignes)||!lignes.length){
    lignes=[{type:typeKey,typeLabel:TYPE_LABELS[typeKey]||draft.description||'Import',nb:nb,prix:pu,total:pu*nb}];
  }else{
    lignes=lignes.map(function(l){
      var t=l.type&&TYPE_LABELS[l.type]?l.type:_importResolveTypeKey({typeKey:l.type,description:l.typeLabel||l.label});
      var nbb=Math.max(1,parseFloat(l.nb)||1);
      var p=parseFloat(l.prix);if(!Number.isFinite(p))p=0;
      return {type:t,typeLabel:TYPE_LABELS[t]||l.typeLabel||l.label||t,nb:nbb,prix:p,total:p*nbb};
    });
  }
  var totalBL=lignes.reduce(function(s,l){return s+(l.total!=null?l.total:(l.prix||0)*(l.nb||1));},0);
  var first=lignes[0];
  var leg=String(draft.legacyBlNum||'').trim();
  var num=leg&&!bdl.find(function(b){return b.num===leg;})?leg:genBLNum();
  var dStr=String(draft.dateISO||'').trim();
  var dateIso=dStr&&/^\d{4}-\d{2}-\d{2}$/.test(dStr)?dStr:fmtISO(new Date());
  var bl={
    id:'impbl_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    num:num,
    jobId:null,
    patient:String(draft.patient||'').trim()||'—',
    trackCode:'',
    prothesisId:String(draft.prothesisId||'').trim(),
    type:first.type,
    typeLabel:lignes.length>1?lignes.map(function(l){return l.typeLabel;}).join(', '):first.typeLabel,
    nb:first.nb,
    lignes:lignes,
    note:String(draft.note||'').trim(),
    materiaux:String(draft.materiaux||'').trim(),
    lot:String(draft.lot||'').trim(),
    cabinet:cab.id,
    cabName:cab.name,
    cabPortalId:cab.portalId||'',
    prix:first.prix,
    total:totalBL,
    deliveryDate:'',
    date:dateIso,
    status:'envoye',
    createdAt:new Date().toISOString(),
    importedFrom:'ai_import',
    orderId:null,orderPortalId:null,orderStepId:null,orderData:null,parentJobId:null
  };
  if(!cab.portalId){cab.portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();}
  if(!cab.code){cab.code=Math.random().toString(36).substr(2,6).toUpperCase();}
  if(!cab.pwd){cab.pwd=Math.random().toString(36).substr(2,8);}
  bdl.unshift(bl);
}

function createLegacyImportedFacture(cab, draft){
  if(!cab||!draft)return;
  var lines=Array.isArray(draft.lines)?draft.lines.map(function(l){
    return {label:String(l.label||'').trim()||'Ligne',qty:Math.max(1,parseFloat(l.qty)||1),prix:parseFloat(l.prix)||0};
  }):[];
  if(!lines.length)lines=[{label:String(draft.note||'Import').slice(0,80)||'Import',qty:1,prix:parseFloat(draft.total)||0}];
  var total=parseFloat(draft.total);
  if(!Number.isFinite(total))total=lines.reduce(function(s,l){return s+(l.qty||1)*(l.prix||0);},0);
  var now=new Date();
  var year=now.getFullYear();
  var n=documents.filter(function(d){return d.type==='facture'&&d.num&&d.num.includes(String(year));}).length+1;
  var st=String(draft.status||'brouillon').toLowerCase()==='envoye'?'envoye':'brouillon';
  var leg=String(draft.legacyNum||'').trim();
  var num=leg&&!documents.find(function(d){return d.num===leg;})?leg:('FAC-'+year+'-'+String(n).padStart(3,'0'));
  var dStr=String(draft.dateISO||'').trim();
  var dateIso=dStr&&/^\d{4}-\d{2}-\d{2}$/.test(dStr)?dStr:fmtISO(now);
  documents.unshift({
    id:'impfac_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    num:num,
    type:'facture',
    cabinet:cab.id,
    cabName:cab.name,
    date:dateIso,
    note:String(draft.note||'').trim(),
    lines:lines,
    total:total,
    bdlRefs:[],
    status:st,
    createdAt:now.toISOString(),
    importedFrom:'ai_import'
  });
}

async function runAiImportAnalyze(){
  if(!guardPerm('action:data_import','⛔ Votre rôle ne permet pas d’utiliser l’import intelligent.'))return;
  var ta=document.getElementById('import-ai-raw');
  var st=document.getElementById('import-ai-status');
  var pv=document.getElementById('import-ai-preview');
  if(!ta||!st)return;
  var raw=ta.value||'';
  if(!raw.trim()){st.textContent='Collez du contenu ou choisissez un fichier.';st.style.color='#c0392b';return;}
  _importPlan=null;
  st.textContent='Analyse en cours…';
  st.style.color='var(--ink-soft)';
  if(pv){pv.style.display='none';pv.innerHTML='';}
  try{
    var resp=await fetch('/.netlify/functions/ai-import-plan',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        rawText:raw,
        fileName:(document.getElementById('import-ai-file')&&document.getElementById('import-ai-file').files[0]&&document.getElementById('import-ai-file').files[0].name)||'',
        existingCabinetNames:cabinets.map(function(c){return c.name;})
      })
    });
    var data=await resp.json();
    if(!resp.ok||data.error){
      throw new Error((data.error&&data.error.message)||data.message||('HTTP '+resp.status));
    }
    var aiText=(data.content&&data.content[0]&&data.content[0].text)||'';
    if(!aiText)throw new Error('Réponse vide du modèle.');
    var plan=_importParseAiJsonText(aiText);
    if(!plan||typeof plan!=='object')throw new Error('Format de plan invalide.');
    if(!Array.isArray(plan.actions))plan.actions=[];
    if(!Array.isArray(plan.questions))plan.questions=[];
    _importPlan=plan;
    st.textContent='Plan prêt — vérifiez et complétez ci-dessous.';
    st.style.color='#2a6049';
    renderImportPlanPreview(plan);
  }catch(e){
    st.textContent='Erreur : '+String(e.message||e).slice(0,200);
    st.style.color='#c0392b';
  }
}

function renderImportPlanPreview(plan){
  var pv=document.getElementById('import-ai-preview');if(!pv)return;
  var qHtml=(plan.questions||[]).map(function(q){
    var mid=q.mergeInto&&typeof q.mergeInto.actionIndex==='number'?String(q.mergeInto.actionIndex):'';
    var pid=q.mergeInto&&q.mergeInto.path?String(q.mergeInto.path).replace(/"/g,'&quot;'):'';
    return '<div style="margin-bottom:10px;"><label style="font-size:.72rem;font-weight:600;display:block;margin-bottom:4px;">'+escHtml(q.prompt||q.id)+'</label>'+
      '<input type="text" class="import-q-inp" data-qid="'+escHtml(q.id)+'" data-idx="'+escHtml(mid)+'" data-path="'+pid+'" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--border);border-radius:7px;font-size:.82rem;"/></div>';
  }).join('');
  var actRows=(plan.actions||[]).map(function(a,i){
    return '<tr><td style="padding:6px 8px;border-bottom:1px solid var(--border);font-size:.74rem;">'+i+'</td>'+
      '<td style="padding:6px 8px;border-bottom:1px solid var(--border);font-size:.74rem;">'+escHtml(a.type)+'</td>'+
      '<td style="padding:6px 8px;border-bottom:1px solid var(--border);font-size:.74rem;font-family:monospace;font-size:.68rem;max-width:420px;overflow:hidden;text-overflow:ellipsis;">'+escHtml(JSON.stringify(a.draft||{}).slice(0,220))+(JSON.stringify(a.draft||{}).length>220?'…':'')+'</td></tr>';
  }).join('');
  pv.innerHTML=
    '<div style="font-size:.84rem;font-weight:700;margin-bottom:8px;">Résumé</div>'+
    '<p style="font-size:.78rem;color:var(--ink-soft);margin:0 0 12px;line-height:1.45;">'+escHtml(plan.summary||'—')+'</p>'+
    (qHtml?'<div style="font-size:.82rem;font-weight:700;margin-bottom:8px;">Informations complémentaires</div>'+qHtml:'')+
    '<div style="font-size:.82rem;font-weight:700;margin:12px 0 8px;">Actions prévues ('+(plan.actions||[]).length+')</div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:.74rem;margin-bottom:14px;"><thead><tr><th style="text-align:left;padding:6px 8px;">#</th><th style="text-align:left;padding:6px 8px;">Type</th><th style="text-align:left;padding:6px 8px;">Brouillon</th></tr></thead><tbody>'+actRows+'</tbody></table>'+
    '<button type="button" class="btn btn-a" onclick="applyAiImportPlan()">✓ Appliquer ce plan au compte</button>'+
    '<button type="button" class="btn btn-b" style="margin-left:8px;" onclick="_importPlan=null;var p=document.getElementById(\'import-ai-preview\');if(p){p.style.display=\'none\';p.innerHTML=\'\';}">Annuler</button>';
  pv.style.display='block';
}

async function applyAiImportPlan(){
  if(!guardPerm('action:data_import','⛔ Import refusé pour votre rôle.'))return;
  if(!_importPlan||!Array.isArray(_importPlan.actions)){showToast('Aucun plan à appliquer — lancez d’abord l’analyse.','#c0392b');return;}
  var plan=JSON.parse(JSON.stringify(_importPlan));
  var inputs=document.querySelectorAll('.import-q-inp');
  for(var i=0;i<inputs.length;i++){
    var inp=inputs[i];
    var qid=inp.dataset.qid;
    var idx=parseInt(inp.dataset.idx,10);
    var path=inp.dataset.path;
    var v=inp.value.trim();
    if(!v)continue;
    var q=(plan.questions||[]).find(function(x){return x.id===qid;});
    if(q&&q.mergeInto&&typeof q.mergeInto.actionIndex==='number'&&plan.actions[q.mergeInto.actionIndex]){
      _importSetByPath(plan.actions[q.mergeInto.actionIndex], q.mergeInto.path||'draft.note', v);
    }
  }
  var cabByName={};
  var created=0,errors=[];
  for(var j=0;j<plan.actions.length;j++){
    var act=plan.actions[j];
    try{
      if(act.type==='create_cabinet'&&act.draft){
        var nm=String(act.draft.name||'').trim();
        if(!nm)continue;
        var ex=_importFindCabinetByName(nm);
        if(ex){cabByName[nm.toLowerCase()]=ex;continue;}
        if(cabinets.find(function(c){return String(c.name||'').toLowerCase()===nm.toLowerCase();})){cabByName[nm.toLowerCase()]=cabinets.find(function(c){return String(c.name||'').toLowerCase()===nm.toLowerCase();});continue;}
        var colors=['#1a4a7a','#2a6049','#5a3472','#c8410a','#7b3f00'];
        var col=colors[cabinets.length%colors.length];
        addCabinet(nm,col,String(act.draft.phone||'').trim(),String(act.draft.email||'').trim());
        var createdCab=cabinets.find(function(c){return String(c.name||'').toLowerCase()===nm.toLowerCase();});
        if(createdCab)cabByName[nm.toLowerCase()]=createdCab;
        created++;
      }else if(act.type==='create_bl'&&act.draft){
        var cname=String(act.draft.cabinetName||'').trim();
        var cab=cabByName[cname.toLowerCase()]||_importFindCabinetByName(cname);
        if(!cab){errors.push('BL sans cabinet : '+cname);continue;}
        createLegacyImportedBL(cab,act.draft);
        cabByName[cname.toLowerCase()]=cab;
        created++;
      }else if(act.type==='create_facture'&&act.draft){
        var cname2=String(act.draft.cabinetName||'').trim();
        var cab2=cabByName[cname2.toLowerCase()]||_importFindCabinetByName(cname2);
        if(!cab2){errors.push('Facture sans cabinet : '+cname2);continue;}
        createLegacyImportedFacture(cab2,act.draft);
        cabByName[cname2.toLowerCase()]=cab2;
        created++;
      }
    }catch(err){errors.push(String(err&&err.message||err));}
  }
  saveCabinets();saveBdl();saveDocs();
  scheduleSave();
  _importPlan=null;
  var pv=document.getElementById('import-ai-preview');if(pv){pv.style.display='none';pv.innerHTML='';}
  var st=document.getElementById('import-ai-status');if(st){st.textContent='Terminé.';st.style.color='#2a6049';}
  renderLivraisons();renderToInvoice();renderBillDocs();updateBillStats();renderCabList();
  reportAudit({action:'data_import_applied',target:String(created),meta:errors.length?errors.slice(0,5).join(' | '):''});
  showToast('✅ Import : '+created+' action(s) appliquée(s)'+(errors.length?' — '+errors.length+' avertissement(s)':'')+'.','#2a6049',7000);
  if(errors.length)console.warn('Import warnings',errors);
}

async function _markStepDelivered(portalId,caseId,stepId,blId){