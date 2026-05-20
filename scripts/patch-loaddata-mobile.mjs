import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');

if (!t.includes('setMobSyncUi')) {
  t = t.replace(
    '/* ── DATA SYNC ── */\nvar _isBackgroundPoll=false;',
    `/* ── DATA SYNC ── */\nvar _isBackgroundPoll=false;\nvar _syncErrShownAt=0;
function setMobSyncUi(state){
  var dot=document.getElementById('sync-dot');
  if(dot){
    dot.className='sync-dot'+(state==='ok'?' sync-dot--ok':state==='busy'?' sync-dot--busy':state==='err'?' sync-dot--err':'');
    dot.setAttribute('aria-label',state==='ok'?'Données à jour':state==='busy'?'Synchronisation…':state==='err'?'Connexion limitée':'');
  }
}
function updateMobTopbarBranding(){
  if(typeof global.updateMobTopbarBranding==='function'){global.updateMobTopbarBranding();return;}
}`
  );

  t = t.replace(
    "if(sync&&!_isBackgroundPoll)sync.textContent='⏳ Sync…';",
    "if(!_isBackgroundPoll)setMobSyncUi('busy');"
  );
  t = t.replace(
    `    if(!rows||!rows.length||!rows[0]||!rows[0].data){
      if(sync)sync.textContent='Aucune donnée';
      return;
    }`,
    `    if(!r.ok)throw new Error('HTTP '+r.status);
    if(!rows||!rows.length||!rows[0]){
      setMobSyncUi('ok');
      renderAll();
      return;
    }
    if(!rows[0].data)rows[0].data={version:2,jobs:[],cabinets:[],queue:[],documents:[]};`
  );

  t = t.replace(
    "if(p.laboName)localStorage.setItem('lb_name',p.laboName);",
    "if(p.laboName)localStorage.setItem('lb_name',p.laboName);\n    if(p.laboLogo)localStorage.setItem('lb_logo',p.laboLogo);\n    else if(p.laboLogo===null)localStorage.removeItem('lb_logo');\n    if(typeof updateMobTopbarBranding==='function')updateMobTopbarBranding();"
  );

  t = t.replace(
    "if(sync)sync.textContent='✓ '+hhmm;",
    "setMobSyncUi('ok');"
  );

  t = t.replace(
    "if(sync)sync.textContent='❌ Erreur sync';",
    `setMobSyncUi('err');
    if(Date.now()-_syncErrShownAt>60000){_syncErrShownAt=Date.now();toast('Connexion limitée — réessayez dans un instant','#d97706',4000);}`
  );

  t = t.replace(
    "if(sync)sync.textContent='💾 Sauvegarde…';",
    "setMobSyncUi('busy');"
  );

  t = t.replace(
    /if\(sync\)sync\.textContent='✓ '\+hhmm;/g,
    "setMobSyncUi('ok');"
  );

  t = t.replace(
    "if(sync)sync.textContent='❌ Erreur';",
    `setMobSyncUi('err');
    toast('Sauvegarde impossible','var(--red)');`
  );

  t = t.replace(
    'laboName:localStorage.getItem(\'lb_name\')||\'\',',
    `laboName:localStorage.getItem('lb_name')||'',
      laboLogo:localStorage.getItem('lb_logo')||'',`
  );
}

fs.writeFileSync(p, t);
console.log('patch-loaddata', t.includes('setMobSyncUi') ? 'ok' : 'fail');
