import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');

if (!t.includes('addMobileAdminJob')) {
  t = t.replace(
    /var lbl=totalNb>1\?patient\+' \('\+totalNb\+' éléments\)':patient;\r?\n    var tasks=\[\];/,
    `var lbl=totalNb>1?patient+' ('+totalNb+' éléments)':patient;
    var ws=typeof getWorkspace==='function'?getWorkspace():'admin';
    if(ws==='admin'&&typeof addMobileAdminJob==='function'){
      if(!addMobileAdminJob({patient:lbl,items:items,cabinet:cab,deliveryDate:delivery,note:note,urgent:urgent,missingItems:missingItems}))return;
      overlay.remove();
      toast('✅ Travail enregistré','var(--green)');
      await saveData();
      if(cab){var c2=cabinets.find(function(c){return c.id===cab;});if(c2)publishPortal(c2);}
      renderAll();
      return;
    }
    var tasks=[];`
  );
}

t = t.replace(
  /if\(typeof applyMobileWorkspaceUi==='function'\)applyMobileWorkspaceUi\(typeof getWorkspace==='function'\?getWorkspace\(\):'hub'\);\r?\n  document\.getElementById\('app'\)\.style\.display='flex';/,
  "if(typeof applyMobileWorkspaceUi==='function'){applyMobileWorkspaceUi(typeof getWorkspace==='function'?getWorkspace():'hub');}else{document.getElementById('app').style.display='flex';}"
);

t = t.replace(
  /document\.getElementById\('auth-screen'\)\.style\.display='none';\r?\n    document\.getElementById\('env-selector'\)\.classList\.remove\('on'\);\r?\n    document\.getElementById\('app'\)\.style\.display='flex';\r?\n    initMobileApp\(\);/,
  "document.getElementById('auth-screen').style.display='none';\n    document.getElementById('env-selector').classList.remove('on');\n    initMobileApp();"
);

const mobJs = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'lab-workspace-mobile.js');
let m = fs.readFileSync(mobJs, 'utf8');
if (!m.includes("getElementById('btn-mob-workspace-switch')")) {
  m = m.replace(
    'function updateMobileTopbar(ws) {\n    var brand = document.querySelector',
    `function updateMobileTopbar(ws) {
    var sw = document.getElementById('btn-mob-workspace-switch');
    if (sw) sw.style.display = ws !== 'hub' ? '' : 'none';
    var brand = document.querySelector`
  );
  fs.writeFileSync(mobJs, m);
}

fs.writeFileSync(p, t);
console.log('fix-mobile-final ok', t.includes('addMobileAdminJob') ? '+admin job' : '-admin job');
