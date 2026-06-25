#!/usr/bin/env node
/*
 * Assemble un dossier `deploy/` ne contenant QUE les fichiers publics du site.
 *
 * Pourquoi : le site est déployé en glissant un dossier dans Netlify Drop. Glisser tout le
 * dépôt exposait du code/outils/sauvegardes (.bak, .cjs, /tests, /docs, package.json…).
 * Ce script copie seulement ce qui doit être public, puis VÉRIFIE qu'aucun fichier référencé
 * par les pages ne manque.
 *
 * Usage :   npm run build:deploy        puis glissez le dossier  deploy/  dans Netlify Drop.
 *
 * Ce qui est inclus :
 *   - les pages .html de la racine (hors .bak)
 *   - les icônes .svg et les manifest*.json (PWA)
 *   - lb-env-routing.js (routage mobile/desktop)
 *   - netlify.toml (redirections + config)
 *   - vendor/ (librairies front, ex. supabase.min.js)
 *   - netlify/functions/ (fonctions serverless)
 *   - scripts/ : UNIQUEMENT les .js réellement chargés par les pages (détectés automatiquement)
 * Ce qui est exclu : node_modules, .git, tests, docs, supabase, *.bak, *.cjs, *.md, *.log,
 *   package*.json, deno.lock, .env*, et le reste de l'outillage.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'deploy');

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

// Copie récursive d'un dossier, en sautant les secrets/déchets éventuels.
function copyDir(rel) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const name = e.name;
    if (name === 'node_modules' || name.startsWith('.env') || /\.(log|bak)$/i.test(name)) continue;
    const r = path.join(rel, name);
    if (e.isDirectory()) n += copyDir(r);
    else { copyFile(r); n++; }
  }
  return n;
}

// 0) Repart d'un dossier propre
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1) Fichiers publics de la racine (allowlist par motif)
const rootFiles = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => e.name)
  .filter((name) => {
    if (/\.bak$/i.test(name)) return false;
    if (/\.html$/i.test(name)) return true;
    if (/\.svg$/i.test(name)) return true;
    if (/^manifest.*\.json$/i.test(name)) return true;
    if (name === 'lb-env-routing.js') return true;
    if (name === 'netlify.toml') return true;
    return false;
  });
rootFiles.forEach(copyFile);

// 1b) netlify.toml : RETIRER la commande de build pour le déploiement par glisser-déposer.
// Le dossier deploy/ est DÉJÀ construit (statique) et ne contient PAS les scripts d'outillage
// .cjs (create-deploy-backup, clean-push-artifacts, verify:functions). Si Netlify Drop lisait
// la commande de build, il échouerait sur « module not found ». On conserve tout le reste
// (functions, redirections, headers). La sauvegarde pré-déploiement reste lançable à la main
// via `npm run backup:deploy` avant de glisser le dossier.
(function stripBuildCommand() {
  const tomlPath = path.join(OUT, 'netlify.toml');
  if (!fs.existsSync(tomlPath)) return;
  let toml = fs.readFileSync(tomlPath, 'utf8');
  const before = toml;
  toml = toml.replace(/^[ \t]*command[ \t]*=[ \t]*".*"[ \t]*\r?\n/m, '');
  if (toml !== before) {
    fs.writeFileSync(tomlPath, toml);
    console.log('   • netlify.toml : commande de build retirée (déploiement statique par glisser-déposer)');
  }
})();

// 1c) Empreinte de build : tamponne window.LB_BUILD dans app.html + labo-mobile.html
// (copies deploy/) et écrit version.txt. Les pages comparent leur LB_BUILD à /version.txt :
// après un déploiement, les onglets ouverts proposent de recharger et convergent vers le
// même code → un onglet périmé ne peut plus réécraser en silence les réglages des autres.
const BUILD_ID = new Date().toISOString().replace(/[:.]/g, '-');
['app.html', 'labo-mobile.html'].forEach(function (f) {
  const p = path.join(OUT, f);
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(/window\.LB_BUILD\s*=\s*'[^']*'/, "window.LB_BUILD='" + BUILD_ID + "'");
  if (s !== before) fs.writeFileSync(p, s);
  else console.warn('⚠️  LB_BUILD introuvable dans ' + f + ' (détecteur de version non tamponné)');
});
fs.writeFileSync(path.join(OUT, 'version.txt'), BUILD_ID);
console.log('   • build ' + BUILD_ID + ' tamponné (LB_BUILD) + version.txt');

// 2) Dossiers publics
const nVendor = copyDir('vendor');
const nFns = copyDir(path.join('netlify', 'functions'));

// 3) scripts/ : seulement les .js référencés par les pages HTML
const htmlFiles = rootFiles.filter((n) => /\.html$/i.test(n));
const neededScripts = new Set();
const localRefs = new Set(); // toutes les références /xxx pour le validateur
htmlFiles.forEach((h) => {
  const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
  const re = /(?:src|href)=["'](\/[^"'?#]+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const p = m[1];
    localRefs.add(p);
    const sm = p.match(/^\/scripts\/(.+)$/);
    if (sm) neededScripts.add(sm[1]);
  }
});
let nScripts = 0;
neededScripts.forEach((f) => {
  const src = path.join(ROOT, 'scripts', f);
  if (fs.existsSync(src)) { copyFile(path.join('scripts', f)); nScripts++; }
  else console.warn('⚠️  Script référencé mais introuvable : /scripts/' + f);
});

// 4) Validateur : chaque référence locale /xxx d'une page doit exister dans deploy/
//    (on ignore les chemins servis par des redirections : /app, /login, etc., et les externes)
const ignorePrefixes = ['/app', '/login', '/connexion', '/cabinet', '/signup', '/admin', '/mobile', '/courier', '/favicon.ico'];
const missing = [];
localRefs.forEach((p) => {
  if (ignorePrefixes.some((ip) => p === ip || p.startsWith(ip + '?') || p.startsWith(ip + '/'))) return;
  if (p.endsWith('/')) return;
  if (!fs.existsSync(path.join(OUT, p))) {
    // tolère les .html servis via redirection (déjà copiés) ; ne signale que les vrais manquants
    if (fs.existsSync(path.join(ROOT, p))) missing.push(p);
  }
});

console.log('\n✅ deploy/ prêt');
console.log('   • ' + rootFiles.length + ' fichiers racine (html/svg/manifest/routing/netlify.toml)');
console.log('   • ' + nScripts + ' script(s) runtime depuis /scripts/');
console.log('   • ' + nVendor + ' fichier(s) vendor/ , ' + nFns + ' fichier(s) netlify/functions/');
if (missing.length) {
  console.log('\n⚠️  Références locales NON incluses (à vérifier) :');
  missing.forEach((p) => console.log('     ' + p));
  console.log('   → Dites-le-moi : on ajoutera ces fichiers à l\'allowlist.');
} else {
  console.log('   • Validateur : toutes les références locales des pages sont présentes. 👍');
}
console.log('\n👉 Glissez le dossier  deploy/  dans Netlify Drop (et plus jamais le dépôt entier).\n');
