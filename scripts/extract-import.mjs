import fs from 'fs';
const p = new URL('../agent-transcripts-missing', import.meta.url);
const jsonl = 'c:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl';
const txt = fs.readFileSync(jsonl, 'utf8');
const marker = 'var _importPlan=null';
let best = '';
for (const line of txt.split('\n')) {
  if (!line.includes(marker)) continue;
  try {
    const o = JSON.parse(line);
    for (const c of o.message?.content || []) {
      const ns = c.input?.new_string || '';
      if (ns.includes(marker) && ns.length > best.length) best = ns;
    }
  } catch (_) {}
}
if (!best) {
  const idx = txt.indexOf(marker);
  const chunk = txt.slice(idx, idx + 150000);
  best = chunk.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
}
const start = best.indexOf('/* ══════════════════════════════════════════\n   Import intelligent');
const start2 = best.indexOf(marker);
const i = start >= 0 ? start : start2;
let code = best.slice(i);
const endMarkers = ['\n// — File d\'attente', '\nfunction saveQueue', '\n\n// — File'];
for (const em of endMarkers) {
  const e = code.indexOf(em);
  if (e > 0) code = code.slice(0, e);
}
const out = new URL('./recovered-import-clean.js', import.meta.url);
fs.writeFileSync(out, code);
const fns = [...code.matchAll(/function (\w+)/g)].map((m) => m[1]);
console.log('len', code.length, 'functions:', fns.join(', '));
