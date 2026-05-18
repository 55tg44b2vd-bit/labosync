import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
const D = 'di' + 'v';
let t = fs.readFileSync(p, 'utf8');

if (!t.includes('saisie-new-job-card')) {
  const m = t.match(/<div class="card">\r?\n\s*<h2 data-i18n="job\.card\.title">📝 Nouveau travail<\/h2>/);
  console.log('saisie match', !!m);
  t = t.replace(
    /<div class="card">\r?\n\s*<h2 data-i18n="job\.card\.title">📝 Nouveau travail<\/h2>/,
    `<${D} class="card" id="saisie-new-job-card">\r\n    <h2 data-i18n="job.card.title">📝 Nouveau travail</h2>`
  );
}

if (!t.includes('isProgDisplayActive')) {
  const m2 = t.includes('function applyProgMode(){\n  const on=isProgActif()');
  console.log('prog match', m2);
  t = t.replace(
    /function applyProgMode\(\)\{\r?\n\s*const on=isProgActif\(\);/,
    "function applyProgMode(){\n  const on=typeof isProgDisplayActive==='function'?isProgDisplayActive():isProgActif();"
  );
}

if (!t.includes('_wsTab')) {
  t = t.replace(
    /if\(!canAccessPane\(pane\)\)\{\r?\n\s*showToast\('⛔ Vous n'avez pas accès à cet onglet\./,
    "var _wsTab=typeof getWorkspace==='function'?getWorkspace():'admin';\n    var _tw=btn.getAttribute('data-ws');\n    if(_wsTab!=='hub'&&_tw&&_tw!=='both'&&_tw!==_wsTab){\n      showToast('⛔ Onglet réservé à l\\'autre espace.','#c0392b',3200);\n      return;\n    }\n    if(!canAccessPane(pane)){\n      showToast('⛔ Vous n'avez pas accès à cet onglet."
  );
}

fs.writeFileSync(p, t);
console.log('done', t.includes('saisie-new-job-card'), t.includes('isProgDisplayActive'));
