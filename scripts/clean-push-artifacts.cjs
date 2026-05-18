/**
 * Retire les fichiers Web Push retirés du produit (évite l'échec Netlify si un ancien
 * déploiement ou un upload manuel les réintroduit).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const remove = [
  'netlify/functions/_push.js',
  'netlify/functions/push-config.js',
  'netlify/functions/push-subscribe.js',
  'netlify/functions/push-test.js',
  'lb-push.js',
  'sw.js',
];

let n = 0;
remove.forEach(function (rel) {
  const p = path.join(root, rel);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('clean-push-artifacts: supprimé ' + rel);
    n++;
  }
});

if (!n) console.log('clean-push-artifacts: rien à supprimer');
