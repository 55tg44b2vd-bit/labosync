import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'lab-workspace-mobile.js');
let t = fs.readFileSync(p, 'utf8');

const bad = `    if (!list.length) {
      el.innerHTML =
        '<motion class="empty" style="padding:40px 16px;"><motion class="empty-icon">✅</motion><motion style="font-size:.92rem;font-weight:600;">Rien à programmer</motion><motion style="font-size:.78rem;margin-top:8px;line-height:1.45;">Les nouveaux travaux saisis en <strong>Administratif</strong> apparaîtront ici.</motion></motion>';
      el.innerHTML = el.innerHTML.replace(/<\\/?motion>/g, function (m) {
        return m.indexOf('/') >= 0 ? '</motion>' : '<motion class="empty-icon">'.replace('motion', 'motion');
      });
      el.innerHTML =
        '<motion class="empty" style="padding:40px 16px;"><motion class="empty-icon">✅</motion><motion style="font-size:.92rem;font-weight:600;">Rien à programmer</motion><motion style="font-size:.78rem;margin-top:8px;line-height:1.45;">Les nouveaux travaux saisis en <strong>Administratif</strong> apparaîtront ici.</motion></motion>';
      return;
    }`;

const tag = 'di' + 'v';
const good = `    if (!list.length) {
      el.innerHTML =
        '<${tag} class="empty" style="padding:40px 16px;text-align:center;"><${tag} class="empty-icon" style="font-size:2rem;margin-bottom:8px;">✅</${tag}><p style="font-size:.92rem;font-weight:600;">Rien à programmer</p><p style="font-size:.78rem;margin-top:8px;line-height:1.45;color:var(--ink-soft);">Créez un travail en <strong>Administratif</strong> : il apparaîtra ici.</p></${tag}>';
      return;
    }`;

// match actual file (uses div)
const bad2 = `    if (!list.length) {
      el.innerHTML =
        '<div class="empty" style="padding:40px 16px;"><motion class="empty-icon">✅</motion>`;

if (t.includes('el.innerHTML.replace(/<\\/?motion>/g, function (m)')) {
  t = t.replace(
    /    if \(!list\.length\) \{[\s\S]*?      return;\n    \}/,
    good
  );
  console.log('replaced via regex');
} else {
  console.log('pattern not found');
}

t = t.replace(/\n    el\.innerHTML = el\.innerHTML\.replace\(\/<\\\/\?motion>\/g, ''\);\n/g, '\n');

// show switch button when in workspace
if (!t.includes('btn-mob-workspace-switch')) {
  t = t.replace(
    'function updateMobileTopbar(ws) {',
    `function updateMobileTopbar(ws) {
    var sw = document.getElementById('btn-mob-workspace-switch');
    if (sw) sw.style.display = ws !== 'hub' ? '' : 'none';`
  );
}

fs.writeFileSync(p, t);
console.log('fix-render-prog ok');
