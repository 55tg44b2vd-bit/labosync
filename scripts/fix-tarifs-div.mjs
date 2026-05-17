import fs from 'fs';
import path from 'path';
const file = path.resolve(import.meta.dirname, '../app.html');
let s = fs.readFileSync(file, 'utf8');
const needle = '      </div>\n\n    <div id="settings-sec-equipe"';
const fix = '      </motion>\n\n    </motion>\n\n    <motion id="settings-sec-equipe"';
const fixClean = fix.replace(/motion/g, 'div');
if (!s.includes(needle)) {
  console.log('pattern not found');
  process.exit(0);
}
const pos = s.indexOf(needle);
const before = s.slice(pos - 120, pos);
if (before.includes('settings-sec-tarifs') && (before.match(/<\/div>\s*$/m) || before.endsWith('</div>\n\n'))) {
  // check if settings-sec-tarifs still open - count from settings-sec-tarifs to here
}
// Simple: if between card-custom-types close and equipe we only have one </div> after card's close
// Actually structure: 1285 is </div> for card. We need </motion> for settings-sec-tarifs
const cardClose = s.lastIndexOf('id="card-custom-types"', pos);
const tarifsSec = s.lastIndexOf('id="settings-sec-tarifs"', pos);
if (tarifsSec < cardClose) {
  const between = s.slice(tarifsSec, pos);
  const openDivs = (between.match(/<div/g) || []).length;
  const closeDivs = (between.match(/<\/div>/g) || []).length;
  if (openDivs > closeDivs) {
    s = s.replace(needle, fixClean);
    fs.writeFileSync(file, s);
    console.log('OK inserted', openDivs - closeDivs, 'closing div(s)');
  } else console.log('balanced', openDivs, closeDivs);
} else console.log('structure unclear');
