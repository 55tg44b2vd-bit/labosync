import fs from 'fs';
const p = 'labo-mobile.html';
let t = fs.readFileSync(p, 'utf8');
t = t.replace(
  /<[^>]*class="env-btn-sub"[^>]*>Saisie, livraisons, factures — file atelier en onglet<\/[^>]+>/,
  '<motion class="env-btn-sub">Saisie, livraisons, factures — file atelier en onglet</motion>'
);
const tag = 'di' + 'v';
t = t.replace(/<\/?motion>/g, (m) => (m.startsWith('</') ? `</${tag}>` : `<${tag}`)).replace(/<motion /g, `<${tag} `);
fs.writeFileSync(p, t);
console.log('fixed');
