import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'courier.html');
const lines = fs.readFileSync(p, 'utf8').split(/\n/);

let start = lines.findIndex((l) => l.trim().startsWith('const addr=m.cabAddress'));
if (start < 0) {
  console.error('block not found');
  process.exit(1);
}

let end = start;
while (end < lines.length && !lines[end].trim().startsWith("'<motion class=\"mcard-lab\"")) {
  end++;
}
// fix: look for mcard-lab
end = start;
while (end < lines.length && !lines[end].includes('mcard-lab')) {
  end++;
}

const replacement = [
  '  const stops=missionStops(m);',
  "  const headType=stops.length>1?'multi':(stops[0]&&stops[0].type)||m.type;",
  "  const notes=m.notes?'<div style=\"margin-top:6px;font-style:italic;\">'+esc(m.notes)+'</div>':'';",
  "  return '<div class=\"mcard'+pulse+'\" data-mid=\"'+esc(m.id)+'\">'+",
  "    '<div class=\"mcard-type '\"+(headType==='delivery'?'delivery':'pickup')+'\">'+",
  "      (stops.length>1?'🛵 Course multi-arrêts':typeIcon(headType)+' '+typeLabel(headType))+'</div>'+",
  "    '<div class=\"mcard-title\">'+missionTitle(m)+'</div>'+",
  "    '<div class=\"mcard-sub\">'+fmtWhen(m.createdAt)+missionStopsHtml(m)+notes+'</div>'+",
];


lines.splice(start, end - start, ...replacement);
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('patched lines', start, end);
