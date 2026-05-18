/**
 * Vérifie que les fonctions Netlify n'importent pas de paquets absents de package.json.
 * Exécuté avant déploiement (npm run predeploy).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fnDir = path.join(root, 'netlify', 'functions');
const pkgPath = path.join(root, 'package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
const builtins = new Set([
  'assert',
  'buffer',
  'child_process',
  'crypto',
  'fs',
  'http',
  'https',
  'path',
  'stream',
  'url',
  'util',
  'zlib',
]);

const importRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const problems = [];

for (const name of fs.readdirSync(fnDir)) {
  if (!name.endsWith('.js')) continue;
  const file = path.join(fnDir, name);
  const src = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = importRe.exec(src))) {
    const mod = m[1];
    if (mod.startsWith('.') || mod.startsWith('/')) continue;
    if (builtins.has(mod)) continue;
    if (!deps[mod]) {
      problems.push({ file: name, module: mod });
    }
  }
}

if (problems.length) {
  console.error('Dépendances manquantes dans package.json :');
  problems.forEach(function (p) {
    console.error('  - ' + p.file + ' → require("' + p.module + '")');
  });
  console.error('\nAjoutez-les avec npm install ' + problems.map((p) => p.module).join(' ') + ' --save');
  process.exit(1);
}

console.log('verify-netlify-functions: OK (' + fs.readdirSync(fnDir).filter((f) => f.endsWith('.js')).length + ' fichiers)');
