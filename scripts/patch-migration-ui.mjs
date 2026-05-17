import fs from 'fs';
const app = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let s = fs.readFileSync(app, 'utf8');

const newBlock = `    <motion id="settings-sec-migration" class="settings-section">
      <motion class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Importer des données</h2>
        <span class="settings-topbar-spacer"></span>
      </motion>
      <motion class="migration-hero" style="margin-bottom:16px;">
        <p style="margin:0;font-size:.9rem;color:#5b21b6;line-height:1.55;">Vous changez de logiciel ? Importez une fois vos dentistes, bons de livraison et factures. Ensuite, vous n’aurez plus besoin de cette page.</p>
      </motion>
      <motion class="card import-simple-card" style="max-width:720px;border-left:4px solid #7c3aed;">
        <h2 style="margin-top:0;font-size:1.05rem;">En 3 étapes</h2>
        <ol style="font-size:.88rem;color:var(--ink);line-height:1.65;margin:0 0 20px;padding-left:1.2rem;">
          <li><strong>Déposez</strong> le fichier exporté par votre ancien logiciel (ou collez un tableau).</li>
          <li><strong>Vérifiez</strong> le résumé proposé par Labosync.</li>
          <li><strong>Validez</strong> — rien n’est enregistré tant que vous n’avez pas confirmé.</li>
        </ol>
        <select id="import-ai-mode" aria-hidden="true" tabindex="-1" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;"><option value="auto" selected>auto</option></select>
        <label class="import-file-zone" for="import-ai-file">
          <span class="import-file-zone-icon">📁</span>
          <span class="import-file-zone-title">Choisir un fichier</span>
          <span class="import-file-zone-hint">Export Excel, liste de factures, fichier de votre ancien labo… Labosync reconnaît le format automatiquement.</span>
        </label>
        <input type="file" id="import-ai-file" class="import-file-input" accept=".csv,.txt,.tsv,.xls,.xlsx,.xml,.pdf" onchange="importAiPickFile(this)"/>
        <details style="margin:14px 0;font-size:.82rem;">
          <summary style="cursor:pointer;font-weight:600;color:var(--ink);">Ou collez un tableau copié depuis Excel</summary>
          <textarea id="import-ai-raw" placeholder="Collez ici les lignes copiées depuis un tableur (Ctrl+V)…" rows="8" style="width:100%;box-sizing:border-box;font-size:.88rem;padding:12px;margin-top:10px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);color:var(--ink);outline:none;resize:vertical;font-family:inherit;"></textarea>
        </details>
        <button type="button" class="btn btn-a" id="btn-import-prepare" onclick="runImportPrepare()" style="width:100%;padding:14px;font-size:.92rem;">Préparer l’import</button>
        <p style="font-size:.74rem;color:var(--ink-soft);margin:10px 0 0;line-height:1.45;">Formats courants : tableur, export de factures, liste de travaux. En cas de doute, déposez le fichier tel quel.</p>
        <motion id="import-ai-status" style="font-size:.82rem;margin-top:14px;min-height:20px;color:var(--ink-soft);"></motion>
        <motion id="import-ai-preview" style="display:none;margin-top:16px;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg);"></motion>
      </motion>
    </motion>`;

const fixed = newBlock.replace(/<motion /g, '<div ').replace(/<\/motion>/g, '</div>');

const start = s.indexOf('    <div id="settings-sec-migration"');
const end = s.indexOf('    <div id="settings-sec-paiements"');
if (start < 0 || end < 0) {
  console.error('markers not found');
  process.exit(1);
}
s = s.slice(0, start) + fixed + '\n\n' + s.slice(end);

s = s.replace(
  'Migration depuis un autre logiciel (CSV, Factur-X…)',
  'Reprendre vos dossiers depuis un autre logiciel'
);

const css = `
.import-simple-card{position:relative;}
.import-file-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}
.import-file-zone{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:28px 20px;border:2px dashed #c4b5fd;border-radius:14px;background:#faf5ff;cursor:pointer;transition:border-color .15s,background .15s;}
.import-file-zone:hover{border-color:#7c3aed;background:#f5f3ff;}
.import-file-zone-icon{font-size:2rem;line-height:1;}
.import-file-zone-title{font-size:1rem;font-weight:700;color:var(--ink);}
.import-file-zone-hint{font-size:.78rem;color:var(--ink-soft);line-height:1.45;max-width:420px;}
.import-preview-lead{font-size:.88rem;color:var(--ink);line-height:1.55;margin:0 0 14px;padding:12px 14px;background:#fff;border:1px solid #ddd6fe;border-radius:10px;}
.import-preview-stats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
.import-stat{background:#fff;border:1px solid var(--border);border-radius:999px;padding:6px 12px;font-size:.78rem;font-weight:600;color:var(--ink);}
`;

if (!s.includes('.import-file-zone{')) {
  s = s.replace('.migration-hero{background:', css + '\n.migration-hero{background:');
}

const bundle = fs.readFileSync(new URL('./lab-import-bundle.js', import.meta.url), 'utf8');
const marker = '// — File d\'attente de programmation (queue)';
if (!s.includes('function runImportPrepare')) {
  s = s.replace(marker, bundle + '\n\n' + marker);
}

s = s.replace(
  "billing: ['pane:dashboard','pane:cabinets','pane:livraisons','pane:facturation','pane:historique','pane:stats','pane:messages','action:billing_generate','action:billing_credit'],",
  "billing: ['pane:dashboard','pane:cabinets','pane:livraisons','pane:facturation','pane:historique','pane:stats','pane:messages','action:billing_generate','action:billing_credit','action:data_import'],"
);

fs.writeFileSync(app, s);
console.log('patched app.html');
