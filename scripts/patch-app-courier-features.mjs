import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'app.html');
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('buildMapsDirectionsUrl')) {
  s = s.replace(
    'function missionStopsList(m){',
    `let _cpDragIdx=null;
let _labCourierNotifySnap=null;

function buildMapsDirectionsUrl(stops){
  const addrs=(stops||[]).map(function(s){
    return String(s.cabAddress||s.cabName||'').trim();
  }).filter(Boolean);
  if(!addrs.length)return '';
  const enc=function(a){return encodeURIComponent(a);};
  if(addrs.length===1)return 'https://www.google.com/maps/dir/?api=1&destination='+enc(addrs[0])+'&travelmode=driving';
  const origin=enc(addrs[0]);
  const dest=enc(addrs[addrs.length-1]);
  let url='https://www.google.com/maps/dir/?api=1&origin='+origin+'&destination='+dest+'&travelmode=driving';
  if(addrs.length>2)url+='&waypoints='+addrs.slice(1,-1).map(enc).join('|');
  return url;
}

function labCourierNotify(title,body,tag){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  if(document.visibilityState==='visible')return;
  try{new Notification(title||'Labosync',{body:body,tag:tag||'labosync-lab-courier',icon:'/icon.svg'});}catch(e){}
}

function notifyLabCourierMissionChanges(all){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const snap={};
  (all||[]).forEach(function(m){snap[m.id]=m.status;});
  if(!_labCourierNotifySnap){_labCourierNotifySnap=snap;return;}
  (all||[]).forEach(function(m){
    const prev=_labCourierNotifySnap[m.id];
    const title=(missionStopsList(m)[0]&&missionStopsList(m)[0].cabName)||'Course';
    if(prev==='offered'&&m.status==='accepted')labCourierNotify('Course acceptée','Le coursier a pris en charge la course.','lab-accept-'+m.id);
    if(prev&&['accepted','en_route'].includes(prev)&&m.status==='completed')labCourierNotify('Course terminée',title,'lab-done-'+m.id);
  });
  _labCourierNotifySnap=snap;
}

function updateCpMapsPreviewBtn(){
  const btn=document.getElementById('btn-cp-maps-preview');
  if(!btn)return;
  const addrs=collectCpStopsPayload().map(function(s){return s.cabAddress||s.cabName;}).filter(Boolean);
  btn.style.display=addrs.length?'':'none';
}

function missionStopsList(m){`
  );
}

if (!s.includes('cp-stop-row cp-dragging')) {
  s = s.replace(
    `    return '<div class="cp-stop-row" data-idx="'+idx+'" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<motion style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);">Arrêt '+(idx+1)+'</span>'+
        (canRemove?'<button type="button" class="btn btn-b cp-stop-rm" data-idx="'+idx+'" style="font-size:.68rem;padding:2px 8px;">Retirer</button>':'')+
      '</div>'+`,
    `    return '<div class="cp-stop-row" data-idx="'+idx+'" draggable="true" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;">'+
        '<span class="cp-drag-handle" title="Glisser pour réordonner" style="cursor:grab;user-select:none;font-size:1rem;line-height:1;color:var(--ink-soft);">⠿</span>'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);flex:1;">Arrêt '+(idx+1)+'</span>'+
        (canRemove?'<button type="button" class="btn btn-b cp-stop-rm" data-idx="'+idx+'" style="font-size:.68rem;padding:2px 8px;">Retirer</button>':'')+
      '</div>'+`
  );
  // fix if motion wasn't in file
  if (s.includes('cp-drag-handle')) {
    // ok
  } else {
    s = s.replace(
      `    return '<motion class="cp-stop-row" data-idx="'+idx+'" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);">Arrêt '+(idx+1)+'</span>'+`,
      `    return '<div class="cp-stop-row" data-idx="'+idx+'" draggable="true" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;">'+
        '<span class="cp-drag-handle" title="Glisser pour réordonner" style="cursor:grab;user-select:none;font-size:1rem;line-height:1;color:var(--ink-soft);">⠿</span>'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);flex:1;">Arrêt '+(idx+1)+'</span>'+`
    );
  }

  const renderCpEnd = `  el.querySelectorAll('.cp-stop-rm').forEach(function(btn){
    btn.addEventListener('click',function(){
      const i=parseInt(btn.dataset.idx,10);
      if(_cpStops.length>1&&!isNaN(i)){_cpStops.splice(i,1);renderCpStops();}
    });
  });
}`;

  s = s.replace(
    renderCpEnd,
    `  el.querySelectorAll('.cp-stop-rm').forEach(function(btn){
    btn.addEventListener('click',function(){
      const i=parseInt(btn.dataset.idx,10);
      if(_cpStops.length>1&&!isNaN(i)){_cpStops.splice(i,1);renderCpStops();}
    });
  });
  el.querySelectorAll('.cp-stop-row').forEach(function(row){
    row.addEventListener('dragstart',function(e){
      _cpDragIdx=parseInt(row.dataset.idx,10);
      row.classList.add('cp-dragging');
      if(e.dataTransfer)e.dataTransfer.effectAllowed='move';
    });
    row.addEventListener('dragend',function(){
      row.classList.remove('cp-dragging');
      el.querySelectorAll('.cp-stop-row').forEach(function(r){r.classList.remove('cp-drag-over');});
      _cpDragIdx=null;
    });
    row.addEventListener('dragover',function(e){
      e.preventDefault();
      row.classList.add('cp-drag-over');
      if(e.dataTransfer)e.dataTransfer.dropEffect='move';
    });
    row.addEventListener('dragleave',function(){row.classList.remove('cp-drag-over');});
    row.addEventListener('drop',function(e){
      e.preventDefault();
      row.classList.remove('cp-drag-over');
      const toIdx=parseInt(row.dataset.idx,10);
      if(_cpDragIdx==null||isNaN(toIdx)||_cpDragIdx===toIdx)return;
      const item=_cpStops.splice(_cpDragIdx,1)[0];
      _cpStops.splice(toIdx,0,item);
      renderCpStops();
    });
  });
  updateCpMapsPreviewBtn();
}`
  );
}

if (!s.includes('function missionStopsSummaryHtml')) {
  // noop
}

s = s.replace(
  `function missionStopsList(m){
  if(Array.isArray(m.stops)&&m.stops.length)return m.stops;
  if(m.cabName)return[{type:m.type==='delivery'?'delivery':'pickup',cabId:m.cabId||'',cabName:m.cabName,cabPhone:m.cabPhone||'',cabAddress:m.cabAddress||''}];
  return [];
}

function missionStopsSummaryHtml(m){
  const stops=missionStopsList(m);
  if(stops.length<=1){
    const s=stops[0]||m;
    return (s.type==='delivery'?'📦 Livraison':'📥 Récupération')+' · '+escH(s.cabName||m.cabName||'');
  }
  return stops.map(function(s,idx){
    return '<div style="font-size:.76rem;padding:2px 0;">'+(idx+1)+'. '+(s.type==='delivery'?'📦':'📥')+' '+escH(s.cabName)+'</div>';
  }).join('');
}`,
  `function missionStopsList(m){
  if(Array.isArray(m.stops)&&m.stops.length){
    return m.stops.slice().sort(function(a,b){return(a.order||0)-(b.order||0);});
  }
  if(m.cabName)return[{type:m.type==='delivery'?'delivery':'pickup',cabId:m.cabId||'',cabName:m.cabName,cabPhone:m.cabPhone||'',cabAddress:m.cabAddress||'',status:m.status==='completed'?'done':'pending'}];
  return [];
}

function missionStopsSummaryHtml(m){
  const stops=missionStopsList(m);
  if(stops.length<=1){
    const s0=stops[0]||m;
    const mark=s0.status==='done'?' ✓':'';
    return (s0.type==='delivery'?'📦 Livraison':'📥 Récupération')+' · '+escH(s0.cabName||m.cabName||'')+mark;
  }
  return stops.map(function(s,idx){
    const mark=s.status==='done'?' <span style="color:#2a6049;font-weight:700;">✓</span>':' <span style="color:var(--ink-soft);">○</span>';
    return '<div style="font-size:.76rem;padding:2px 0;">'+(idx+1)+'. '+(s.type==='delivery'?'📦':'📥')+' '+escH(s.cabName)+mark+'</div>';
  }).join('');
}`
);

if (!s.includes('btn-cp-maps-preview')) {
  s = s.replace(
    '<button type="button" class="btn btn-b" id="btn-cp-add-stop"',
    '<button type="button" class="btn btn-b" id="btn-cp-maps-preview" style="width:100%;font-size:.78rem;padding:8px 12px;margin-bottom:8px;display:none;">🗺️ Aperçu itinéraire dans Maps</button>\n    <button type="button" class="btn btn-b" id="btn-cp-add-stop"'
  );
}

if (!s.includes("btn-cp-maps-preview')?.addEventListener")) {
  s = s.replace(
    `document.getElementById('btn-cp-add-stop')?.addEventListener('click',function(){
  _cpStops.push({type:'pickup',cabId:'',address:'',phone:''});
  renderCpStops();
});`,
    `document.getElementById('btn-cp-add-stop')?.addEventListener('click',function(){
  _cpStops.push({type:'pickup',cabId:'',address:'',phone:''});
  renderCpStops();
});
document.getElementById('btn-cp-maps-preview')?.addEventListener('click',function(){
  const url=buildMapsDirectionsUrl(collectCpStopsPayload());
  if(url)window.open(url,'_blank','noopener');
  else showToast('Ajoutez au moins une adresse pour l\'itinéraire.','#c0392b');
});
if('Notification' in window&&Notification.permission==='default'){
  try{Notification.requestPermission();}catch(e){}
}`
  );
}

if (!s.includes('notifyLabCourierMissionChanges')) {
  s = s.replace(
    `    _courierMissionsSummary=all;
    updateCourierNavBadge(all);`,
    `    _courierMissionsSummary=all;
    updateCourierNavBadge(all);
    notifyLabCourierMissionChanges(all);`
  );
}

// Fix renderCpStops row if patch missed - read and fix cp-stop-row
if (!s.includes('cp-drag-handle')) {
  s = s.replace(
    `return '<div class="cp-stop-row" data-idx="'+idx+'" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);">Arrêt '+(idx+1)+'</span>'+`,
    `return '<motion class="cp-stop-row" data-idx="'+idx+'" draggable="true" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;">'+
        '<span class="cp-drag-handle" title="Glisser pour réordonner" style="cursor:grab;user-select:none;font-size:1rem;line-height:1;color:var(--ink-soft);">⠿</span>'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);flex:1;">Arrêt '+(idx+1)+'</span>'+`
  );
  s = s.replace(/<motion class="cp-stop-row"/g, '<div class="cp-stop-row"');
}

fs.writeFileSync(p, s);
console.log('app.html OK');
