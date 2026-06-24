/* Régression : PERTE DES TECHNICIENS DES TYPES (customTypes).
 *
 * Ce test extrait et exécute le VRAI code de fusion expédié dans app.html ET
 * labo-mobile.html (pas une réimplémentation — pour qu'il ne puisse pas dériver),
 * puis rejoue le scénario multi-appareils qui effaçait les techniciens :
 *   1. le desktop affecte des techniciens à un type ;
 *   2. un autre poste / le mobile porte une copie « Auto » (voire édite un prix) ;
 *   3. synchros croisées (sauvegardes + rechargements).
 * Invariant vérifié à CHAQUE étape : les techniciens assignés ne sont JAMAIS effacés
 * par un changement de prix ou par une synchro, tout en honorant un passage volontaire
 * en « Auto » via l'éditeur (techRev plus récent) et les suppressions de types.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// Charge un intervalle de fonctions d'un fichier HTML dans un bac à sable isolé.
function loadFns(file, startMarker, endMarker) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const i = html.indexOf(startMarker);
  const j = html.indexOf(endMarker, i + startMarker.length);
  assert.ok(i >= 0 && j > i, 'Extraction impossible dans ' + file + ' (marqueurs introuvables — le code a bougé ?)');
  const code = html.slice(i, j);
  const sandbox = {
    Date, Math, Object, Array, JSON, isNaN, String, Boolean,
    _readDeletedRecs: () => ({}),
    _mobReadDelRecs: () => ({}),
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox;
}

// Le code desktop : de _ctRevTime jusqu'à saveJobs (couvre stamps + merge).
const DESKTOP = loadFns('app.html', 'function _ctRevTime(ct){', '\nfunction saveJobs(');
// Le code mobile : de _ctRevTime jusqu'à _mobileCountsFrom.
const MOBILE = loadFns('labo-mobile.html', 'function _ctRevTime(ct){', 'function _mobileCountsFrom(');

// Vérifie que les deux apps exposent bien la fusion par type.
['_mergeCustomTypesByType', '_mergeOneType', '_overlayStepTechs', '_ctTechRevTime'].forEach(function (fn) {
  assert.strictEqual(typeof DESKTOP[fn], 'function', 'app.html doit exposer ' + fn);
  assert.strictEqual(typeof MOBILE[fn], 'function', 'labo-mobile.html doit exposer ' + fn);
});

// Fabrique un type avec techniciens par étape.
function mkType(techs, opts) {
  opts = opts || {};
  return {
    id: 'inlay_then_crown',
    label: 'Inlay core + Couronne',
    category: 'Couronnes',
    prix: opts.prix || 0,
    steps: [
      { label: 'Inlay core', tech: techs[0], dayOffset: 1 },
      { label: 'Modélisation couronne zircone', tech: techs[1], dayOffset: 2 },
      { label: 'Glaçage couronne zircone', tech: techs[2], dayOffset: 3 },
    ],
    _rev: opts.rev || null,
    _techRev: opts.techRev || null,
  };
}
function techsOf(ct) { return ct ? ct.steps.map(function (s) { return s.tech; }) : null; }
const AUTO = ['auto', 'auto', 'auto'];
const TEAM = ['marie', 'tom', 'jc'];

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('  ✓ ' + name); }

// ── Le scénario « cauchemar de Tom », rejoué sur les DEUX moteurs ──────────────
[['DESKTOP', DESKTOP], ['MOBILE', MOBILE]].forEach(function (pair) {
  const tag = pair[0];
  const M = pair[1];
  const merge = function (local, remote) { return M._mergeCustomTypesByType(local, remote, {}); };
  const one = function (id, list) { return list.find(function (c) { return c.id === id; }); };

  t(tag + ' : une copie Auto (prix édité, _rev plus récent) n\'efface pas les techniciens', function () {
    const serverTechs = mkType(TEAM, { rev: '2026-06-20T10:00:00Z', techRev: '2026-06-20T10:00:00Z' });
    const otherAutoPrice = mkType(AUTO, { rev: '2026-06-24T10:00:00Z', techRev: '2026-06-20T10:00:00Z', prix: 90 });
    const merged = one('inlay_then_crown', merge([otherAutoPrice], [serverTechs]));
    assert.deepStrictEqual(techsOf(merged), TEAM, 'les techniciens doivent survivre');
    assert.strictEqual(merged.prix, 90, 'le nouveau prix doit être conservé');
  });

  t(tag + ' : anciennes données (sans _techRev) protégées par le filet « plus de techniciens »', function () {
    const serverTechs = mkType(TEAM, { rev: '2026-06-20T10:00:00Z' });
    const autoNewer = mkType(AUTO, { rev: '2026-06-24T10:00:00Z', prix: 90 });
    delete serverTechs._techRev; delete autoNewer._techRev;
    const merged = one('inlay_then_crown', merge([autoNewer], [serverTechs]));
    assert.deepStrictEqual(techsOf(merged), TEAM);
  });

  t(tag + ' : passage volontaire en Auto via l\'éditeur (techRev plus récent) est respecté', function () {
    const oldTechs = mkType(TEAM, { rev: '2026-06-20T10:00:00Z', techRev: '2026-06-20T10:00:00Z' });
    const cleared = mkType(['auto', 'tom', 'jc'], { rev: '2026-06-25T10:00:00Z', techRev: '2026-06-25T10:00:00Z' });
    const merged = one('inlay_then_crown', merge([cleared], [oldTechs]));
    assert.deepStrictEqual(techsOf(merged), ['auto', 'tom', 'jc'], 'le retrait volontaire de marie doit tenir');
  });

  t(tag + ' : un type supprimé après sa dernière édition ne ressuscite pas', function () {
    const ct = mkType(TEAM, { rev: '2026-06-20T10:00:00Z', techRev: '2026-06-20T10:00:00Z' });
    const delMap = { ctypes: { inlay_then_crown: '2026-06-25T10:00:00Z' } };
    const res = M._mergeCustomTypesByType([ct], [ct], delMap);
    assert.strictEqual(res.length, 0);
  });
});

// ── Round-trip complet desktop ↔ serveur ↔ mobile ─────────────────────────────
t('ROUND-TRIP : desktop pose les techs → mobile pousse Auto → re-synchro : techs intacts', function () {
  const dMerge = function (l, r) { return DESKTOP._mergeCustomTypesByType(l, r, {}); };
  const mMerge = function (l, r) { return MOBILE._mergeCustomTypesByType(l, r, {}); };
  const get = function (list) { return list.find(function (c) { return c.id === 'inlay_then_crown'; }); };

  // État initial : serveur en Auto (config d'usine).
  let server = [mkType(AUTO, { rev: '2026-06-01T08:00:00Z' })];

  // 1) Desktop affecte les techniciens (via l'éditeur → _stampType avec prev).
  const prev = mkType(AUTO, { rev: '2026-06-01T08:00:00Z' });
  let dLocal = DESKTOP._stampType(mkType(TEAM, { prix: 120 }), prev); // techs changés → _techRev posé
  assert.ok(dLocal._techRev, 'l\'édition des techs doit poser _techRev');
  // Sauvegarde desktop = merge(payload local, serveur) avant upsert.
  server = dMerge([dLocal], server);
  assert.deepStrictEqual(techsOf(get(server)), TEAM, 'serveur après save desktop = techs');

  // 2) Mobile a une copie Auto périmée et SAUVEGARDE (sans avoir rechargé).
  const mLocalStale = mkType(AUTO, { rev: '2026-06-10T09:00:00Z', prix: 0 });
  server = mMerge([mLocalStale], server); // garde-fou d'upsert mobile
  assert.deepStrictEqual(techsOf(get(server)), TEAM, 'mobile ne doit pas écraser les techs du serveur');

  // 3) Desktop édite un PRIX (→ _stampTypeMeta : _rev bumpé, _techRev intact) puis sauvegarde.
  dLocal = get(dMerge([dLocal], server)); // desktop recharge l'état serveur
  DESKTOP._stampTypeMeta(dLocal); dLocal.prix = 145;
  server = dMerge([dLocal], server);
  assert.deepStrictEqual(techsOf(get(server)), TEAM, 'un changement de prix ne doit pas effacer les techs');
  assert.strictEqual(get(server).prix, 145, 'le nouveau prix doit être présent');

  // 4) Mobile recharge : il adopte les techs du serveur.
  const mAfter = mMerge([mkType(AUTO, { rev: '2026-06-10T09:00:00Z' })], server);
  assert.deepStrictEqual(techsOf(get(mAfter)), TEAM, 'mobile doit recevoir les techs au rechargement');
});

console.log('\n✓ customtypes-merge : ' + passed + ' tests OK (techniciens des types protégés sur desktop ET mobile)');
