import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const D = 'div';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = path.join(root, 'courier.html');
let s = fs.readFileSync(p, 'utf8');

function replaceBlock(startMarker, endMarker, replacement) {
  const start = s.indexOf(startMarker);
  const end = s.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Block not found: ${startMarker}`);
  s = s.slice(0, start) + replacement + s.slice(end);
}

const missionStopsHtml = `function missionStopsHtml(m,mode){
  const stops=missionStops(m);
  const interactive=mode==='active'&&['accepted','en_route'].includes(m.status);
  function stopRow(s,idx){
    const done=s.status==='done';
    const addr=s.cabAddress?'<${D} style="font-size:.72rem;color:var(--ink-soft);">📍 '+esc(s.cabAddress)+'</${D}>':'';
    const phone=s.cabPhone?'<${D} style="font-size:.72rem;">📞 '+esc(s.cabPhone)+'</${D}>':'';
    const action=interactive
      ?(done
        ?'<span style="font-size:.72rem;font-weight:700;color:var(--green);white-space:nowrap;">✓ Fait</span>'
        :'<button type="button" class="btn btn-green mcard-stop-done" data-act="complete_stop" data-id="'+esc(m.id)+'" data-stop-id="'+esc(s.id||'')+'" data-stop-idx="'+idx+'">✓ Fait</button>')
      :(done?'<span style="font-size:.7rem;color:var(--green);">✓</span>':'');
    return '<${D} class="mcard-stop'+(done?' done':'')+'">'+
      '<${D} class="mcard-stop-row">'+
        '<${D} class="mcard-stop-main"><span class="mcard-stop-num">'+(idx+1)+'.</span>'+
          typeIcon(s.type)+' <b>'+typeLabel(s.type)+'</b> — '+esc(s.cabName)+addr+phone+
        '</${D}>'+action+
      '</${D}></${D}>';
  }
  if(stops.length<=1){
    const s0=stops[0]||m;
    if(stops.length)return stopRow(s0,0);
    const addr=m.cabAddress?'<${D} style="margin-top:4px;">📍 '+esc(m.cabAddress)+'</${D}>':'';
    const phone=m.cabPhone?'<${D}>📞 '+esc(m.cabPhone)+'</${D}>':'';
    return addr+phone;
  }
  return '<${D} class="mcard-stops">'+stops.map(stopRow).join('')+'</${D}>';
}

function fmtWhen(iso){`;

const missionCard = `function missionCard(m,mode){
  const pulse=m.status==='offered'?' offer-pulse':'';
  const stops=missionStops(m);
  const prog=stopsProgress(stops);
  const pendingStops=stops.filter(function(x){return x.status!=='done';}).length;
  let actions='';
  if(mode==='offered'){
    actions='<${D} class="mcard-actions">'+
      '<button type="button" class="btn btn-green" data-act="accept" data-id="'+esc(m.id)+'">✓ Accepter</button>'+
      '<button type="button" class="btn btn-secondary" data-act="decline" data-id="'+esc(m.id)+'">Refuser</button>'+
    '</${D}>';
  }else if(mode==='active'){
    if(m.status==='accepted'&&pendingStops===stops.length){
      actions='<${D} class="mcard-actions"><button type="button" class="btn btn-orange" data-act="en_route" data-id="'+esc(m.id)+'">🚗 En route</button></${D}>';
    }else if(m.status==='en_route'&&stops.length===1&&pendingStops){
      actions='<${D} class="mcard-actions"><button type="button" class="btn btn-green" data-act="complete_stop" data-id="'+esc(m.id)+'" data-stop-id="'+esc(stops[0].id||'')+'" data-stop-idx="0">✓ Terminer</button></${D}>';
    }
  }
  const headType=stops.length>1?'multi':(stops[0]&&stops[0].type)||m.type;
  const notes=m.notes?'<${D} style="margin-top:6px;font-style:italic;">'+esc(m.notes)+'</${D}>':'';
  const progHtml=(mode==='active'&&stops.length>1&&prog.total>0)
    ?'<${D} class="mcard-progress">'+prog.done+'/'+prog.total+' arrêt'+(prog.total>1?'s':'')+' effectué'+(prog.done>1?'s':'')+'</${D}>':'';
  const mapsUrl=(mode==='active'&&['accepted','en_route'].includes(m.status))?buildMapsDirectionsUrl(stops):'';
  const mapsHtml=mapsUrl?'<a href="'+mapsUrl+'" target="_blank" rel="noopener noreferrer" class="btn-maps">🗺️ Ouvrir dans Maps</a>':'';
  return '<${D} class="mcard'+pulse+'" data-mid="'+esc(m.id)+'">'+
    '<${D} class="mcard-type '+(headType==='delivery'?'delivery':'pickup')+'">'+
      (stops.length>1?'🛵 Course multi-arrêts':typeIcon(headType)+' '+typeLabel(headType))+'</${D}>'+
    '<${D} class="mcard-title">'+missionTitle(m)+'</${D}>'+
    '<${D} class="mcard-sub">'+fmtWhen(m.createdAt)+progHtml+missionStopsHtml(m,mode)+mapsHtml+notes+'</${D}>'+
    '<${D} class="mcard-lab">'+esc(m.labName)+'</${D}>'+
    actions+
  '</${D}>';
}

function renderAll(){`;

replaceBlock('function missionStopsHtml(m){', 'function fmtWhen(iso){', missionStopsHtml);
replaceBlock('function missionCard(m,mode){', 'function renderAll(){', missionCard);

if (!s.includes('_missionNotifySnap')) {
  s = s.replace('let _pollTimer=null;', 'let _pollTimer=null;\nlet _missionNotifySnap=null;');
  s = s.replace(
    `async function notifyIfNeeded(){
  if(!('Notification' in window))return;
  if(Notification.permission==='granted'){
    const n=_missions.filter(function(m){return m.status==='offered';});
    if(n.length) new Notification('Labosync Coursier',{body:n.length+' nouvelle(s) demande(s)',icon:'/icon.svg'});
  }
}`,
    `function courierNotify(title,body,tag){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  if(document.visibilityState==='visible')return;
  try{new Notification(title||'Labosync Coursier',{body:body,tag:tag||'labosync-courier',icon:'/icon.svg'});}catch(e){}
}
function buildMissionNotifySnap(list){
  const snap={};
  (list||[]).forEach(function(m){
    const p=stopsProgress(missionStops(m));
    snap[m.id]={status:m.status,done:p.done,total:p.total,title:missionTitle(m)};
  });
  return snap;
}
function notifyIfNeeded(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const snap=buildMissionNotifySnap(_missions);
  if(!_missionNotifySnap){_missionNotifySnap=snap;return;}
  Object.keys(snap).forEach(function(id){
    const cur=snap[id],prev=_missionNotifySnap[id];
    if(!prev&&cur.status==='offered')courierNotify('Nouvelle course',cur.title,'courier-offer-'+id);
    if(prev&&prev.status!=='completed'&&cur.status==='completed')courierNotify('Course terminée',cur.title,'courier-done-'+id);
  });
  _missionNotifySnap=snap;
}`
  );
  if (!s.includes("act==='complete_stop'")) {
    s = s.replace(
      `    else if(act==='complete'){await api('setMissionStatus',{missionId:id,status:'completed'});toast('Mission terminée ✓');}`,
      `    else if(act==='complete_stop'){
      const body={missionId:id,stopId:btn.dataset.stopId||''};
      const idx=parseInt(btn.dataset.stopIdx,10);
      if(Number.isFinite(idx))body.stopIndex=idx;
      const j=await api('completeStop',body);
      toast(j.mission&&j.mission.status==='completed'?'Course terminée ✓':'Arrêt validé');
    }
    else if(act==='complete'){await api('setMissionStatus',{missionId:id,status:'completed'});toast('Mission terminée ✓');}`
    );
  }
}

fs.writeFileSync(p, s);
console.log('courier.html OK');
