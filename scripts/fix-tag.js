const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app.html');
let s = fs.readFileSync(file, 'utf8');
const re = /motion-div/g;
const count = (s.match(re) || []).length;
s = s.replace(re, 'div');
fs.writeFileSync(file, s, 'utf8');
console.log('fixed', count, 'occurrences');
