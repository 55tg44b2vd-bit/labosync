import fs from 'fs';

const p =
  'C:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl';
const lines = fs.readFileSync(p, 'utf8').split('\n');

function decodeNewString(line) {
  const idx = line.indexOf('"new_string":"');
  if (idx < 0) return '';
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
      if (n2 === '\\') {
        out += '\\';
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
  return out;
}

for (const n of [1243, 1344, 1351]) {
  const out = decodeNewString(lines[n - 1]);
  const i = out.indexOf('function openSettingsSection');
  if (i >= 0) {
    const end = out.indexOf('\nfunction ', i + 10);
    const slice = out.slice(i, end > i ? end : i + 1200);
    fs.writeFileSync(
      'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/scripts/settings-nav-js.txt',
      slice
    );
    console.log('line', n, 'len', slice.length);
    break;
  }
  console.log('line', n, 'no fn, len', out.length, out.slice(0, 80));
}
