import fs from 'fs';
const jsonl = 'c:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl';
const txt = fs.readFileSync(jsonl, 'utf8');
const needles = [
  'function importAiPickFile',
  'function runAiImportAnalyze',
  'function renderImportPlanPreview',
  'function importApplyPlan',
  'function applyImportPlan',
  'function importMergeAnswers',
];
const parts = [];
for (const needle of needles) {
  let best = '';
  for (const line of txt.split('\n')) {
    if (!line.includes(needle.slice(9))) continue;
    try {
      const o = JSON.parse(line);
      for (const c of o.message?.content || []) {
        const ns = c.input?.new_string || '';
        if (ns.includes(needle) && ns.length > best.length) best = ns;
      }
    } catch (_) {}
  }
  if (best) {
    const i = best.indexOf(needle.replace('function ', 'function '));
    const j = best.indexOf('function ', i + 20);
    const chunk = j > i ? best.slice(best.indexOf('function import') >= 0 ? best.lastIndexOf('\n', i) : i, j) : best;
    parts.push({ needle, len: best.length });
  } else parts.push({ needle, len: 0 });
}
console.log(parts);

// extract largest block containing renderImportPlanPreview
let mega = '';
for (const line of txt.split('\n')) {
  if (!line.includes('renderImportPlanPreview')) continue;
  try {
    const o = JSON.parse(line);
    for (const c of o.message?.content || []) {
      const ns = c.input?.new_string || '';
      if (ns.includes('renderImportPlanPreview') && ns.length > mega.length) mega = ns;
    }
  } catch (_) {}
}
if (mega) {
  const start = mega.indexOf('function importAiPickFile');
  const start2 = mega.indexOf('var _importPlan');
  const i = start >= 0 ? start : start2;
  let code = mega.slice(i >= 0 ? i : 0);
  const end = code.indexOf('\n// — File d\'attente');
  if (end > 0) code = code.slice(0, end);
  fs.writeFileSync(new URL('./recovered-import-part2.js', import.meta.url), code);
  console.log('part2 len', code.length, (code.match(/function \w+/g) || []).join(', '));
}
