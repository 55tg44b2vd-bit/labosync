import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

function patchApp() {
  const file = path.join(root, 'app.html');
  let s = fs.readFileSync(file, 'utf8');

  s = s.replace(/function _debugAuditLog\([^)]*\)\{[\s\S]*?\/\/ #endregion\n\}/, 'function _debugAuditLog(){}\n');
  s = s.replace(/\s*fetch\('http:\/\/127\.0\.0\.1:7687\/ingest\/[^']+',\{method:'POST'[\s\S]*?\}\)\.catch\(\(\)=>\{\}\);/g, '');

  if (!s.includes('function _portalApiHeaders')) {
    s = s.replace(
      'let _cachedAccessToken = \'\';',
      `let _cachedAccessToken = '';
function _supabaseAuthHeaders(extra){
  const h={apikey:SB_KEY};
  if(_cachedAccessToken)h.Authorization='Bearer '+_cachedAccessToken;
  return Object.assign(h,extra||{});
}
function _portalApiHeaders(extra){
  const h={'Content-Type':'application/json'};
  if(_cachedAccessToken)h.Authorization='Bearer '+_cachedAccessToken;
  return Object.assign(h,extra||{});
}
function _aiApiHeaders(extra){
  return _portalApiHeaders(extra);
}`
    );
  }

  s = s.replace(
    `async function _fetchOrdersForCab(portalId){
  if(!portalId)return [];
  try{
    const r=await _fetchWithTimeout(SB_URL+'/rest/v1/labo_data?id=eq.orders_'+portalId+'&select=data',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
    },15000);`,
    `async function _fetchOrdersForCab(portalId){
  if(!portalId)return [];
  const token=_cachedAccessToken;
  if(!token)return [];
  try{
    const r=await _fetchWithTimeout(SB_URL+'/rest/v1/labo_data?id=eq.orders_'+portalId+'&select=data',{
      headers:_supabaseAuthHeaders()
    },15000);`
  );

  s = s.replace(
    `async function _writeOrdersForCab(portalId,list){
  if(!portalId)return;
  try{
    await _fetchWithTimeout(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({id:'orders_'+portalId,data:{list:list,portalId:portalId},updated_at:new Date().toISOString()})
    },20000);`,
    `async function _writeOrdersForCab(portalId,list){
  if(!portalId||!_cachedAccessToken||!currentUser)return;
  try{
    await _fetchWithTimeout(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:_supabaseAuthHeaders({'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'}),
      body:JSON.stringify({id:'orders_'+portalId,data:{list:list,portalId:portalId,labUserId:currentUser.id},updated_at:new Date().toISOString()})
    },20000);`
  );

  s = s.replace(
    `  const rowId='suivi_'+(job.trackCode||job.id);
  // Try PATCH first, then POST if not found
  const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+rowId,{
    method:'PATCH',
    headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=minimal'},
    body:JSON.stringify({data:payload,updated_at:new Date().toISOString()})
  });
  if(r.status===404||!r.ok){
    await fetch(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=minimal'},
      body:JSON.stringify({id:rowId,data:payload,updated_at:new Date().toISOString()})
    });
  }`,
    `  const rowId='suivi_'+(job.trackCode||job.id);
  const token=_cachedAccessToken;
  if(!token)return rowId;
  if(currentUser)payload.labUserId=currentUser.id;
  const authH=_supabaseAuthHeaders({'Content-Type':'application/json','Prefer':'return=minimal'});
  const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+rowId,{
    method:'PATCH',
    headers:authH,
    body:JSON.stringify({data:payload,updated_at:new Date().toISOString()})
  });
  if(r.status===404||!r.ok){
    await fetch(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:authH,
      body:JSON.stringify({id:rowId,data:payload,updated_at:new Date().toISOString()})
    });
  }`
  );

  s = s.replace(
    `    portalId:cab.portalId,
    laboName:localStorage.getItem('lb_name')||'Laboratoire Dentaire',`,
    `    portalId:cab.portalId,
    labUserId:currentUser?currentUser.id:null,
    laboName:localStorage.getItem('lb_name')||'Laboratoire Dentaire',`
  );

  s = s.replace(
    /fetch\('\/\.netlify\/functions\/ai-chat',\{[\s\S]*?headers:\{'Content-Type':'application\/json'\}/g,
    "fetch('/.netlify/functions/ai-chat',{method:'POST',headers:_aiApiHeaders()"
  );
  s = s.replace(
    /fetch\('\/\.netlify\/functions\/ai-chat',\{\s*method:'POST',\s*headers:\{'Content-Type':'application\/json'\}/g,
    "fetch('/.netlify/functions/ai-chat',{method:'POST',headers:_aiApiHeaders()"
  );

  s = s.replace(
    `    const r = await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(_chatPortalId));`,
    `    const r = await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(_chatPortalId),{headers:_portalApiHeaders()});`
  );
  s = s.replace(
    `    const r = await fetch('/.netlify/functions/portal',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });`,
    `    const r = await fetch('/.netlify/functions/portal',{
      method:'POST',
      headers:_portalApiHeaders(),
      body:JSON.stringify(body)
    });`
  );
  s = s.replace(
    /fetch\('\/\.netlify\/functions\/portal\?type=chat&portalId='\+encodeURIComponent\(cab\.portalId\)\)/g,
    "fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(cab.portalId),{headers:_portalApiHeaders()})"
  );

  fs.writeFileSync(file, s);
  console.log('app.html patched');
}

function patchCabinet() {
  const file = path.join(root, 'cabinet.html');
  let s = fs.readFileSync(file, 'utf8');

  if (!s.includes('sessionPortalToken')) {
    s = s.replace(
      'let sessionPortalId = null;',
      'let sessionPortalId = null;\nlet sessionPortalToken = null;'
    );
    s = s.replace(
      'function _debugAuditLogCab(hypothesisId,message,data){\n  // debug instrumentation removed\n}',
      `function _portalCabHeaders(extra){
  const h={'Content-Type':'application/json'};
  if(sessionPortalToken)h['X-Portal-Token']=sessionPortalToken;
  return Object.assign(h,extra||{});
}
function _debugAuditLogCab(){}

async function _fetchPortalOrders(){
  if(!sessionPortalId) return [];
  const r = await fetch('/.netlify/functions/portal?type=orders&portalId='+encodeURIComponent(sessionPortalId),{headers:_portalCabHeaders()});
  if(!r.ok) throw new Error('Chargement commandes impossible');
  const rows = await r.json();
  return (rows[0]&&rows[0].data&&rows[0].data.list)?rows[0].data.list:[];
}

async function _savePortalOrders(list){
  if(!sessionPortalId) throw new Error('Session expirée');
  const r = await fetch('/.netlify/functions/portal',{
    method:'POST',
    headers:_portalCabHeaders(),
    body:JSON.stringify({action:'orders',portalId:sessionPortalId,list:list,cabId:portalData&&portalData.cabId?portalData.cabId:null})
  });
  if(!r.ok){
    const err = await r.json().catch(function(){return {};});
    throw new Error(err.error||'Enregistrement impossible');
  }
}`
    );
  }

  s = s.replace(
    `      if(s.portalId && s.portalData && s.expiry > Date.now()){
        portalData = s.portalData;
        portalData._updatedAt = s.updatedAt || null;
        sessionPortalId = s.portalId;
        showPortal();`,
    `      if(s.portalId && s.portalData && s.expiry > Date.now()){
        portalData = s.portalData;
        portalData._updatedAt = s.updatedAt || null;
        sessionPortalId = s.portalId;
        sessionPortalToken = s.portalToken || null;
        showPortal();`
  );

  s = s.replace(
    `    sessionPortalId = payload.portalId || portalId;
    _debugAuditLogCab('H5','Cabinet loadPortal success',{portalId:sessionPortalId,hasPortalData:!!portalData});
    // Save session (4h expiry) avec snapshot sanitizé
    sessionStorage.setItem('ls_portal_session', JSON.stringify({
      portalId: sessionPortalId,
      portalData: portalData,
      updatedAt: payload.updatedAt || null,
      expiry: Date.now() + 4*3600*1000
    }));`,
    `    sessionPortalId = payload.portalId || portalId;
    sessionPortalToken = payload.portalToken || null;
    sessionStorage.setItem('ls_portal_session', JSON.stringify({
      portalId: sessionPortalId,
      portalToken: sessionPortalToken,
      portalData: portalData,
      updatedAt: payload.updatedAt || null,
      expiry: Date.now() + 4*3600*1000
    }));`
  );

  s = s.replace(
    `      sessionStorage.setItem('ls_portal_session', JSON.stringify({
        portalId: sessionPortalId,
        portalData: portalData,
        updatedAt: portalData._updatedAt || null,
        expiry: Date.now() + 4*3600*1000
      }));`,
    `      sessionStorage.setItem('ls_portal_session', JSON.stringify({
        portalId: sessionPortalId,
        portalToken: sessionPortalToken,
        portalData: portalData,
        updatedAt: portalData._updatedAt || null,
        expiry: Date.now() + 4*3600*1000
      }));`
  );

  s = s.replace(
    `async function _loadCabinetOrders(){
  if(_portalOrdersCache)return _portalOrdersCache;
  try{
    const sb=supabase.createClient(SB_URL,SB_ANON);
    const{data:rows}=await sb.from('labo_data').select('data').eq('id','orders_'+sessionPortalId);
    _portalOrdersCache=(rows&&rows[0]&&rows[0].data&&rows[0].data.list)?rows[0].data.list:[];
  }catch(e){_portalOrdersCache=[];}
  return _portalOrdersCache;
}`,
    `async function _loadCabinetOrders(){
  if(_portalOrdersCache)return _portalOrdersCache;
  try{
    _portalOrdersCache=await _fetchPortalOrders();
  }catch(e){_portalOrdersCache=[];}
  return _portalOrdersCache;
}`
  );

  s = s.replace(
    `  try{
    const sb=supabase.createClient(SB_URL,SB_ANON);
    const{data:rows}=await sb.from('labo_data').select('data').eq('id','orders_'+sessionPortalId);
    const existing=(rows&&rows[0]&&rows[0].data&&rows[0].data.list)?rows[0].data.list:[];
    existing.unshift(newCase);
    await sb.from('labo_data').upsert({id:'orders_'+sessionPortalId,data:{list:existing,portalId:sessionPortalId,cabId:portalData.cabId},updated_at:now});
    _clearDraft();`,
    `  try{
    const existing=await _fetchPortalOrders();
    existing.unshift(newCase);
    await _savePortalOrders(existing);
    _clearDraft();`
  );

  s = s.replace(
    `  try{
    const sb=supabase.createClient(SB_URL,SB_ANON);
    const{data:rows}=await sb.from('labo_data').select('data').eq('id','orders_'+sessionPortalId);
    const list=(rows&&rows[0]&&rows[0].data&&rows[0].data.list)?rows[0].data.list:[];
    const idx=list.findIndex(function(x){return x.id===caseId;});
    if(idx<0){showToast('Cas introuvable','#c2410c');return;}
    _migrateOrderToCase(list[idx]);
    const stepId='step_'+Date.now()+'_'+Math.random().toString(36).substr(2,5);
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
    });
    list[idx].updatedAt=now;
    await sb.from('labo_data').upsert({id:'orders_'+sessionPortalId,data:{list:list,portalId:sessionPortalId,cabId:portalData.cabId},updated_at:now});
    _portalOrdersCache=null;`,
    `  try{
    const list=await _fetchPortalOrders();
    const idx=list.findIndex(function(x){return x.id===caseId;});
    if(idx<0){showToast('Cas introuvable','#c2410c');return;}
    _migrateOrderToCase(list[idx]);
    const stepId='step_'+Date.now()+'_'+Math.random().toString(36).substr(2,5);
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
    });
    list[idx].updatedAt=now;
    await _savePortalOrders(list);
    _portalOrdersCache=null;`
  );

  s = s.replace(
    `    try{
      const sb=supabase.createClient(SB_URL,SB_ANON);
      const{data:rows}=await sb.from('labo_data').select('data').eq('id','orders_'+sessionPortalId);
      list=(rows&&rows[0]&&rows[0].data&&rows[0].data.list)?rows[0].data.list:[];
      list.forEach(_migrateOrderToCase);
      _portalOrdersCache=list;
    }catch(e){el.innerHTML='<motion class="empty-state">Erreur de chargement : '+esc(e.message)+'</motion>';return;}`,
    `    try{
      list=await _fetchPortalOrders();
      list.forEach(_migrateOrderToCase);
      _portalOrdersCache=list;
    }catch(e){el.innerHTML='<div class="empty-state">Erreur de chargement : '+esc(e.message)+'</motion>';return;}`
  );

  // fix typo if motion slipped
  s = s.replace("'</motion>';return;}", "'</motion>';return;}").replace('</motion>', '</div>');

  s = s.replace(
    `    const sbPortal = supabase.createClient(SB_URL, SB_ANON);
    const { data: rows } = await sbPortal.from('labo_data').select('data,updated_at').eq('id','portal_'+sessionPortalId);
    if(!rows||!rows.length) return;
    const newUpdatedAt = rows[0].updated_at;`,
    `    const r = await fetch('/.netlify/functions/portal?portalId='+encodeURIComponent(sessionPortalId),{headers:_portalCabHeaders()});
    if(!r.ok) return;
    const rows = await r.json();
    if(!rows||!rows.length) return;
    const newUpdatedAt = rows[0].updated_at;`
  );

  s = s.replace(
    `    const r = await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(sessionPortalId));`,
    `    const r = await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(sessionPortalId),{headers:_portalCabHeaders()});`
  );
  s = s.replace(
    `    const r = await fetch('/.netlify/functions/portal',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });`,
    `    const r = await fetch('/.netlify/functions/portal',{
      method:'POST',
      headers:_portalCabHeaders(),
      body:JSON.stringify(body)
    });`
  );
  s = s.replace(
    `  fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(sessionPortalId))`,
    `  fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(sessionPortalId),{headers:_portalCabHeaders()})`
  );

  s = s.replace(
    `    sessionStorage.removeItem('ls_portal_session');`,
    `    sessionPortalToken=null;
    sessionStorage.removeItem('ls_portal_session');`
  );

  fs.writeFileSync(file, s);
  console.log('cabinet.html patched');
}

function patchMobile() {
  const file = path.join(root, 'labo-mobile.html');
  let s = fs.readFileSync(file, 'utf8');

  s = s.replace(
    `async function _fetchOrdersForCabMobile(portalId){
  if(!portalId)return [];
  try{
    var r=await _fetchWithTimeoutMobile(SB_URL+'/rest/v1/labo_data?id=eq.orders_'+portalId+'&select=data',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
    },15000);`,
    `async function _fetchOrdersForCabMobile(portalId){
  if(!portalId||!_token)return [];
  try{
    var r=await _fetchWithTimeoutMobile(SB_URL+'/rest/v1/labo_data?id=eq.orders_'+portalId+'&select=data',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+_token}
    },15000);`
  );

  s = s.replace(
    `      body:JSON.stringify({id:'orders_'+portalId,data:{list:list,portalId:portalId},updated_at:new Date().toISOString()})`,
    `      body:JSON.stringify({id:'orders_'+portalId,data:{list:list,portalId:portalId,labUserId:_userId||null},updated_at:new Date().toISOString()})`
  );

  s = s.replace(
    /fetch\('\/\.netlify\/functions\/ai-chat',\{[\s\S]*?headers:\{'Content-Type':'application\/json'\}/g,
    "fetch('/.netlify/functions/ai-chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+_token}"
  );

  fs.writeFileSync(file, s);
  console.log('labo-mobile.html patched');
}

patchApp();
patchCabinet();
patchMobile();
