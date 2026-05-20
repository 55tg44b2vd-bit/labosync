import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');
const D = 'di' + 'v';

if (t.includes('id="mob-lab-logo"')) {
  console.log('already ok');
  process.exit(0);
}

const needle =
  '    <' +
  D +
  ' class="topbar-brand">Labo<span>sync</span> <span id="mob-workspace-badge" class="mob-ws-badge" style="display:none;">Administratif</span></' +
  D +
  '>';

const repl =
  '    <' +
  D +
  ' class="topbar-brand-block">\n' +
  '      <img id="mob-lab-logo" class="topbar-lab-logo" alt="" style="display:none;"/>\n' +
  '      <' +
  D +
  ' class="topbar-title-wrap">\n' +
  '        <' +
  D +
  ' class="topbar-brand" id="mob-topbar-title">Labo<span>sync</span></' +
  D +
  '>\n' +
  '        <span id="mob-workspace-badge" class="mob-ws-badge" style="display:none;">Administratif</span>\n' +
  '      </' +
  D +
  '>\n' +
  '    </' +
  D +
  '>\n' +
  '    <span id="sync-dot" class="sync-dot" role="status" aria-label=""></span>';

if (!t.includes(needle)) {
  console.error('needle not found');
  process.exit(1);
}

t = t.replace(needle, repl);
t = t.replace(
  '    <' + D + ' class="topbar-sync" id="sync-status"></' + D + '>',
  '    <' + D + ' class="topbar-sync" id="sync-status" aria-live="polite"></' + D + '>'
);

fs.writeFileSync(p, t);
console.log('topbar fixed');
