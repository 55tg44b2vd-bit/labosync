import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), 'lab-workspace-mobile.js');
let t = fs.readFileSync(p, 'utf8');
t = t.replace(/<motion /g, '<div ');
t = t.replace(/<\/motion>/g, '</motion>');
const D = 'di' + 'v';
t = t.replace(/<\/motion>/g, '</' + D + '>');
fs.writeFileSync(p, t);
console.log('fixed mobile ws js');
