import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const D = 'di' + 'v';
const appPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
let s = fs.readFileSync(appPath, 'utf8');
const needle = "    '<" + D + " style=\"font-weight:500;font-size:.82rem;margin-bottom:6px;\">'+statusMsg+'</" + D + ">'+";
const i = s.indexOf(needle);
if (i < 0) {
  console.error('needle missing');
  process.exit(1);
}
const end = s.indexOf('stepsHTML+', i);
const endLine = s.indexOf('\n', end) + 1;
const mid =
  `    (showPlanStatus?'<${D} style="font-weight:500;font-size:.82rem;margin-bottom:6px;">'+statusMsg+'</${D}>':'')+\n` +
  `    (showPlanStatus?'<${D} class="sv-progress-bar"><${D} class="sv-progress-fill" style="width:'+pct+'%;"></${D}></${D}>'+stepsHTML:'')+\n`;
s = s.slice(0, i) + mid + s.slice(endLine);
fs.writeFileSync(appPath, s);
console.log('suivi OK');
