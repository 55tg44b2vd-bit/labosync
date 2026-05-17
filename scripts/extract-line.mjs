import fs from 'fs';

const p =
  'C:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const n = parseInt(process.argv[2] || '1242', 10) - 1;
const line = lines[n];
if (!line) {
  console.error('no line');
  process.exit(1);
}
const idx = line.indexOf('"new_string":"');
if (idx < 0) {
  console.log(line.slice(0, 500));
  process.exit(1);
}
let j = idx + '"new_string":"'.length;
let out = '';
while (j < line.length) {
  const ch = line[j];
  if (ch === '\\') {
    const n2 = line[j + 1];
    if (n2 === 'n') {
      out += '\n';
      j += 2;
      continue;
    }
    if (n2 === 't') {
      out += '\t';
      j += 2;
      continue;
    }
    if (n2 === '"') {
      out += '"';
      j += 2;
      continue;
    }
    if (n2 === 'n') {
      out += '\n';
      j += 2;
      continue;
    }
    out += ch;
    j++;
    continue;
  }
  if (ch === '"') break;
  out += ch;
  j++;
}
fs.writeFileSync(process.argv[3] || 'scripts/extracted-patch.txt', out);
console.log('len', out.length);
