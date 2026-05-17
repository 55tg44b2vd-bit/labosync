import fs from 'fs';

const t = fs.readFileSync(
  'C:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl',
  'utf8'
);
const start = t.indexOf('function resetSettingsView');
const end = t.indexOf('function goMessages()', start);
let chunk = t.slice(start, end > start ? end : start + 4000);
chunk = chunk.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
fs.writeFileSync(
  'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/scripts/settings-nav-js.txt',
  chunk
);
console.log('written', chunk.length);
