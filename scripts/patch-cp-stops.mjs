import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const appPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
let s = fs.readFileSync(appPath, 'utf8');

const FROM = [
  '    <motion class="frow" style="margin-bottom:10px;">',
].join('\n');
