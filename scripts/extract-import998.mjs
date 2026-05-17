import fs from 'fs';
const jsonl = 'c:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl';
const lines = fs.readFileSync(jsonl, 'utf8').split('\n');
const line = lines[997];
const o = JSON.parse(line);
let mega = '';
for (const c of o.message.content) {
  if (c.type === 'tool_use' && c.input?.new_string?.includes('function importAiPickFile')) {
    if (c.input.new_string.length > mega.length) mega = c.input.new_string;
  }
}
const start = mega.indexOf('/* ══════════════════════════════════════════\n   Import intelligent');
const i = start >= 0 ? start : mega.indexOf('var _importPlan');
let code = mega.slice(i);
const end = code.indexOf('\n// — File d\'attente');
if (end > 0) code = code.slice(0, end);
fs.writeFileSync(new URL('./recovered-import-full.js', import.meta.url), code);
console.log('len', code.length);
console.log((code.match(/function \w+/g) || []).join('\n'));
