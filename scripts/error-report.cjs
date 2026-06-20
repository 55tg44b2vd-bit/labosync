#!/usr/bin/env node
/*
 * Rapport des erreurs clients réelles de LaboSync.
 *
 * Lit le dashboard d'erreurs déjà alimenté par log-client-error / _error-dashboard
 * (table Supabase labo_data, lignes `err_*`) et affiche les bugs réellement
 * rencontrés par les utilisateurs, regroupés par fréquence.
 *
 * Usage :
 *   SUPABASE_SERVICE_KEY=xxxx node scripts/error-report.cjs
 *   node scripts/error-report.cjs --limit 800 --json
 *
 * Codes de sortie : 0 = aucune erreur sur 24 h · 1 = des erreurs existent · 2 = config manquante.
 * Pensé pour être lançable à la main ou via une tâche planifiée (cron / GitHub Actions / Netlify scheduled fn).
 */
const fs = require('fs');
const path = require('path');
const { readErrorDashboard } = require('../netlify/functions/_error-dashboard.js');

// Charge un fichier .env minimal (KEY=VALUE) si la variable n'est pas déjà dans l'environnement.
function loadEnvFile(file) {
  try {
    const full = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(full)) return;
    fs.readFileSync(full, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) return;
      const key = m[1];
      let val = m[2].replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    });
  } catch (_) { /* ignore */ }
}
['.env', 'netlify/.env', '.env.local'].forEach(loadEnvFile);

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function bar(count, max, width) {
  const n = max > 0 ? Math.round((count / max) * width) : 0;
  return '█'.repeat(n) + ' '.repeat(Math.max(0, width - n));
}

function printList(title, items) {
  console.log('\n' + title);
  if (!items || !items.length) { console.log('  (aucun)'); return; }
  const max = items[0].count;
  items.forEach((it) => {
    const c = String(it.count).padStart(4, ' ');
    console.log('  ' + c + '  ' + bar(it.count, max, 16) + '  ' + String(it.key).replace(/\s+/g, ' ').slice(0, 90));
  });
}

(async () => {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('❌ SUPABASE_SERVICE_KEY manquant.');
    console.error('   Renseignez la variable (ou un fichier .env / netlify/.env) puis relancez :');
    console.error('   SUPABASE_SERVICE_KEY=xxxx node scripts/error-report.cjs');
    process.exit(2);
  }

  const limit = Math.min(1000, parseInt(arg('limit', '500'), 10) || 500);
  const threshold = parseInt(arg('threshold', '20'), 10) || 20;
  const asJson = process.argv.includes('--json');

  let dash;
  try {
    dash = await readErrorDashboard(key, { limit, threshold });
  } catch (e) {
    console.error('❌ Lecture du dashboard impossible :', e.message);
    process.exit(2);
  }

  if (asJson) {
    console.log(JSON.stringify(dash, null, 2));
    process.exit(dash.summary.total24h > 0 ? 1 : 0);
  }

  const s = dash.summary;
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' 📊 Rapport erreurs LaboSync — ' + new Date().toLocaleString('fr-FR'));
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Dernière heure : ' + s.lastHour + '   ·   24 h : ' + s.total24h +
    '   ·   seuil alerte : ' + s.threshold + '   ·   état : ' +
    (s.status === 'alert' ? '🔴 ALERTE' : '🟢 ok'));

  printList('🔁 Messages d\'erreur les plus fréquents (24 h) :', s.messages);
  printList('📄 Pages les plus touchées (24 h) :', s.pages);
  printList('📱 Applications (24 h) :', s.apps);

  console.log('\n🕒 Dernières erreurs :');
  if (!dash.recent.length) {
    console.log('  (aucune)');
  } else {
    dash.recent.slice(0, 12).forEach((r) => {
      const when = r.at ? new Date(r.at).toLocaleString('fr-FR') : '?';
      console.log('  • [' + when + '] ' + (r.app || '?') + ' ' + (r.page || '') +
        '\n      ' + String(r.message || '').replace(/\s+/g, ' ').slice(0, 160) +
        (r.userId ? '  (user ' + r.userId.slice(0, 8) + '…)' : ''));
    });
  }
  console.log('');

  process.exit(s.total24h > 0 ? 1 : 0);
})().catch((e) => {
  console.error('Erreur inattendue :', e && e.message ? e.message : e);
  process.exit(2);
});
