import fs from 'fs';

const p =
  'C:/Users/tomgo/.cursor/projects/c-Users-tomgo-OneDrive-Bureau-labosync-Copie/agent-transcripts/5f23a168-edae-4d7e-9ef0-ecffe7652330/5f23a168-edae-4d7e-9ef0-ecffe7652330.jsonl';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const keys = ['_apply_ux.js', '_patch_ux_apple.js', '_patch_scale_ops.js', '_build_settings_pane.js'];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const key of keys) {
    if (!line.includes(key) || !line.includes('"Write"')) continue;
    const idx = line.indexOf('"contents":"');
    if (idx < 0) continue;
    let j = idx + '"contents":"'.length;
    let out = '';
    while (j < line.length) {
      const ch = line[j];
      if (ch === '\\') {
        const n = line[j + 1];
        if (n === 'n') {
          out += '\n';
          j += 2;
          continue;
        }
        if (n === 't') {
          out += '\t';
          j += 2;
          continue;
        }
        if (n === '"') {
          out += '"';
          j += 2;
          continue;
        }
        if (n === '\\') {
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
    const outPath = `c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/scripts/recovered-${key}`;
    fs.writeFileSync(outPath, out);
    console.log('recovered', key, 'line', i + 1, 'len', out.length, '->', outPath);
  }
}
