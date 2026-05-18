import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
const D = 'di' + 'v';
let t = fs.readFileSync(p, 'utf8');
const broken = '<motion id="courier-ws-banner" role="status"></' + D + '>';
const fixed = '<' + D + ' id="courier-ws-banner" role="status"></' + D + '>';
if (t.includes(broken)) t = t.replace(broken, fixed);
t = t.replace(/<motion /g, '<' + D + ' ');
t = t.replace(/<\/motion>/g, '</' + D + '>');
fs.writeFileSync(p, t);
console.log('fixed');
