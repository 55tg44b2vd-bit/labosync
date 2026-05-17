const fs = require('fs');
const p = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let h = fs.readFileSync(p, 'utf8');
const div = String.fromCharCode(100, 105, 118);
const from = "return '<motion class=\"print-wrap lab-sheet-sheet\"";
const to = "return '<" + div + " class=\"print-wrap lab-sheet-sheet\"";
if (!h.includes(from)) {
  console.error('pattern not found');
  process.exit(1);
}
h = h.replace(from, to);
fs.writeFileSync(p, h);
console.log('OK');
