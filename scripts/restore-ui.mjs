import fs from 'fs';
import { execSync } from 'child_process';

const root = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/';
const appPath = root + 'app.html';

function rep(oldStr, newStr, label) {
  let s = fs.readFileSync(appPath, 'utf8');
  if (!s.includes(oldStr)) {
    console.warn('SKIP', label);
    return false;
  }
  fs.writeFileSync(appPath, s.split(oldStr).join(newStr));
  console.log('OK', label);
  return true;
}

// Backup
fs.copyFileSync(appPath, root + 'app.html.pre-restore-ui.bak');
console.log('backup OK');

// 1) Settings hub HTML
execSync('node "' + root + 'scripts/recovered-_build_settings_pane.js"', { stdio: 'inherit' });

// 2) Apple-like drawer + cabinet/mobile tweaks
execSync('node "' + root + 'scripts/recovered-_apply_ux.js"', { stdio: 'inherit' });

// 3) Settings CSS
const css = fs.readFileSync(root + 'scripts/patch-settings-css.txt', 'utf8');
rep(
  '.migration-hero{background:linear-gradient(135deg,#f5f3ff 0%,#ede9fe 40%,#e0e7ff 100%);border:1px solid #c4b5fd;border-radius:14px;padding:18px 22px;margin-bottom:20px;box-shadow:0 4px 24px rgba(91,33,182,.08);}',
  css,
  'settings-css'
);

// 4) Settings navigation JS
const navJs = fs.readFileSync(root + 'scripts/settings-nav-js.txt', 'utf8');
let app = fs.readFileSync(appPath, 'utf8');
if (!app.includes('function resetSettingsView')) {
  app = app.replace(
    'function goSettings(){\n  const tab=document.querySelector(\'.tab[data-pane="parametres"]\');\n  if(tab){tab.click();return;}\n}',
    navJs.trim()
  );
  if (!app.includes('function resetSettingsView')) {
    app = app.replace('function goSettings(){', 'var _settingsSectionOpen=null;\n' + navJs.trim() + '\nfunction goSettingsLegacy(){');
    app = app.replace('function goSettingsLegacy(){', 'function goSettings(){');
  }
  fs.writeFileSync(appPath, app);
  console.log('OK settings-nav-js');
}

// 5) Ops CSS
if (!app.includes('.ops-toolbar')) {
  rep(
    '.livr-item-archived{opacity:.88;border-color:#e2e8f0 !important;}',
    fs.readFileSync(appPath, 'utf8').includes('.livr-item-archived')
      ? `.livr-item-archived{opacity:.88;border-color:#e2e8f0 !important;}
.ops-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;}
.ops-toolbar input[type=search],.ops-toolbar select{font-family:'Inter',sans-serif;font-size:.8rem;padding:8px 11px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);outline:none;}
.ops-toolbar input[type=search]{flex:1;min-width:160px;}
.ops-filter-summary{font-size:.74rem;color:var(--ink-soft);margin-left:auto;}
.livr-kpi-bar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
.livr-kpi-bar .kpi-chip{background:#fff;border:1px solid var(--border);border-radius:99px;padding:6px 12px;font-size:.76rem;font-weight:600;color:#334155;}
.livr-kpi-bar .kpi-chip strong{color:var(--accent);margin-right:4px;}
.jobs-table-wrap{max-height:min(62vh,720px);overflow:auto;border-radius:0 0 10px 10px;}
.jobs-table-wrap thead th{position:sticky;top:0;background:#f8fafc;z-index:2;box-shadow:0 1px 0 var(--border);}
.job-group-hd td{background:#f1f5f9;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#475569;padding:10px 12px !important;border-top:2px solid var(--border);}
.list-more-row{text-align:center;padding:12px;}
.list-more-btn{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:8px;padding:8px 16px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;}
.list-more-btn:hover{background:#dbeafe;}
.ops-hint{font-size:.74rem;color:var(--ink-soft);margin:-6px 0 12px;line-height:1.45;}`
      : '',
    'ops-css'
  );
}

// Re-read after CSS patch
app = fs.readFileSync(appPath, 'utf8');

// 6) Ops HTML toolbar
if (!app.includes('id="jobs-ops-toolbar"')) {
  rep(
    `  <!-- Travaux programmés -->
  <motion-div class="tbox" style="margin-top:16px;">`,
    `  <!-- Travaux programmés -->
  <p class="ops-hint" id="jobs-ops-hint">Par défaut, seuls les travaux <strong>à traiter</strong> s'affichent. Utilisez la recherche ou « Tout voir » pour les archives du jour.</p>
  <div class="ops-toolbar" id="jobs-ops-toolbar">
    <input type="search" id="jobs-search" placeholder="🔍 Code patient, type, note…" autocomplete="off"/>
    <select id="jobs-filter-mode" title="Filtre d'affichage">
      <option value="action">À traiter</option>
      <option value="today">Livraison / échéance aujourd'hui</option>
      <option value="week">Cette semaine</option>
      <option value="all">Tout voir</option>
    </select>
    <select id="jobs-filter-cab"><option value="">Tous les cabinets</option></select>
    <span class="ops-filter-summary" id="jobs-filter-summary"></span>
  </div>
  <div class="tbox" style="margin-top:16px;">`,
    'ops-html-1'
  );
  app = fs.readFileSync(appPath, 'utf8');
  if (!app.includes('id="jobs-ops-toolbar"')) {
    rep(
      `  <!-- Travaux programmés -->
  <motion-div class="tbox" style="margin-top:16px;">`,
      `  <!-- Travaux programmés -->
  <p class="ops-hint" id="jobs-ops-hint">Par défaut, seuls les travaux <strong>à traiter</strong> s'affichent. Utilisez la recherche ou « Tout voir » pour les archives du jour.</p>
  <div class="ops-toolbar" id="jobs-ops-toolbar">
    <input type="search" id="jobs-search" placeholder="🔍 Code patient, type, note…" autocomplete="off"/>
    <select id="jobs-filter-mode" title="Filtre d'affichage">
      <option value="action">À traiter</option>
      <option value="today">Livraison / échéance aujourd'hui</option>
      <option value="week">Cette semaine</option>
      <option value="all">Tout voir</option>
    </select>
    <select id="jobs-filter-cab"><option value="">Tous les cabinets</option></select>
    <span class="ops-filter-summary" id="jobs-filter-summary"></span>
  </div>
  <div class="tbox" style="margin-top:16px;">`,
      'ops-html-1b'
    );
  }
  rep(
    `  <!-- Travaux programmés -->
  <div class="tbox" style="margin-top:16px;">`,
    `  <!-- Travaux programmés -->
  <p class="ops-hint" id="jobs-ops-hint">Par défaut, seuls les travaux <strong>à traiter</strong> s'affichent. Utilisez la recherche ou « Tout voir » pour les archives du jour.</p>
  <div class="ops-toolbar" id="jobs-ops-toolbar">
    <input type="search" id="jobs-search" placeholder="🔍 Code patient, type, note…" autocomplete="off"/>
    <select id="jobs-filter-mode" title="Filtre d'affichage">
      <option value="action">À traiter</option>
      <option value="today">Livraison / échéance aujourd'hui</option>
      <option value="week">Cette semaine</option>
      <option value="all">Tout voir</option>
    </select>
    <select id="jobs-filter-cab"><option value="">Tous les cabinets</option></select>
    <span class="ops-filter-summary" id="jobs-filter-summary"></span>
  </motion-div>
  <div class="tbox" style="margin-top:16px;">`,
    'ops-html-2'
  );
  rep(
    `    <table><thead><tr><th data-i18n="th.patient">Code patient</th>`,
    `    <div class="jobs-table-wrap"><table><thead><tr><th data-i18n="th.patient">Code patient</th>`,
    'ops-table-wrap'
  );
  rep(
    `    <tbody id="jtbody"></tbody></table>
  </div>
</div>`,
    `    <tbody id="jtbody"></tbody></table></div>
  </div>
</div>`,
    'ops-table-close'
  );
}

// 7) Ops JS + renderTable
app = fs.readFileSync(appPath, 'utf8');
if (!app.includes('LB_OPS_PAGE')) {
  const opsHead = fs.readFileSync(root + 'scripts/patch-renderTable.txt', 'utf8');
  const rtStart = app.indexOf('// Rendu de la table des travaux');
  const rtEnd = app.indexOf('function updateCounts()', rtStart);
  if (rtStart < 0 || rtEnd < 0) {
    console.error('renderTable bounds not found');
    process.exit(1);
  }
  const oldRt = app.slice(rtStart, rtEnd);
  // Extract row loop body from old renderTable
  const forStart = oldRt.indexOf('[...jobs].reverse().forEach(j=>{');
  const forAlt = oldRt.indexOf('slice.forEach(j=>{');
  let bodyStart = forStart;
  if (forAlt >= 0 && (bodyStart < 0 || forAlt < bodyStart)) bodyStart = forAlt;
  const bodyEnd = oldRt.lastIndexOf('  });\n  tbody.innerHTML');
  const rowBody = bodyStart >= 0 && bodyEnd > bodyStart ? oldRt.slice(bodyStart, bodyEnd) : '';
  const newHead = opsHead.replace('slice.forEach(j=>{', rowBody ? 'slice.forEach(j=>{' : 'slice.forEach(j=>{');
  let newRt = opsHead;
  if (rowBody) {
    const partialEnd = newRt.indexOf('slice.forEach(j=>{');
    if (partialEnd >= 0) {
      newRt = newRt.slice(0, partialEnd) + rowBody + '\n  ' + fs.readFileSync(root + 'scripts/patch-renderTable-tail.txt', 'utf8');
    }
  } else {
    newRt = newRt + '\n' + oldRt.replace(/^\/\/ Rendu de la table[^\n]*\nfunction renderTable\(\)\{[\s\S]*?\[(\.\.\.)?jobs\][^\{]*\{/, '');
  }
  app = app.slice(0, rtStart) + newRt + app.slice(rtEnd);
  fs.writeFileSync(appPath, app);
  console.log('OK renderTable ops');
}

// 8) Event listeners for filters
app = fs.readFileSync(appPath, 'utf8');
if (!app.includes("getElementById('jobs-search')")) {
  rep(
    "document.addEventListener('DOMContentLoaded',function(){",
    "document.addEventListener('DOMContentLoaded',function(){\n  ['jobs-search','jobs-filter-mode','jobs-filter-cab'].forEach(function(id){\n    var el=document.getElementById(id);\n    if(el){el.addEventListener('input',function(){if(id==='jobs-search')_resetOpsLimits();renderTable();});el.addEventListener('change',function(){_resetOpsLimits();renderTable();});}\n  });",
    'ops-listeners'
  );
}

// fix motion-div typos
execSync('node "' + root + 'scripts/fix-tag.js"', { stdio: 'inherit' });

console.log('restore-ui done');
