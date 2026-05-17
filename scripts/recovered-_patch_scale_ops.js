const fs = require('fs');
const p = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let h = fs.readFileSync(p, 'utf8');

// CSS
if (!h.includes('.ops-toolbar')) {
  h = h.replace(
    '.livr-item-archived{opacity:.88;border-color:#e2e8f0 !important;}',
    `.livr-item-archived{opacity:.88;border-color:#e2e8f0 !important;}
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
  );
}

// HTML jobs toolbar
if (!h.includes('id="jobs-ops-toolbar"')) {
  h = h.replace(
    '  <div class="tbox" style="margin-top:16px;">\n    <motion-div class="tbox-hd">',
    '  <div class="tbox" style="margin-top:16px;">\n    <div class="tbox-hd">'
  );
  // fix if motion-div was introduced - grep and fix later
  h = h.replace(
    `  <!-- Travaux programmés -->
  <div class="tbox" style="margin-top:16px;">
    <motion-div class="tbox-hd">`,
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
  <div class="tbox" style="margin-top:16px;">
    <div class="tbox-hd">`
  );
  h = h.replace(
    `    <table><thead><tr><th data-i18n="th.patient">Code patient</th>`,
    `    <div class="jobs-table-wrap"><table><thead><tr><th data-i18n="th.patient">Code patient</th>`
  );
  h = h.replace(
    `    <tbody id="jtbody"></tbody></table>
  </div>
</motion-div>`,
    `    <tbody id="jtbody"></tbody></table></motion-div>
  </div>
</motion-div>`
  );
}

// Simpler HTML patch without motion-div mistakes
if (!h.includes('id="jobs-ops-toolbar"')) {
  const needle = `  <!-- Travaux programmés -->
  <div class="tbox" style="margin-top:16px;">
    <motion-div class="tbox-hd">
      <motion-div class="stitle" id="jobs-section-title"`;
  // read file and do manual
}

console.log('jobs toolbar', h.includes('id="jobs-ops-toolbar"'));
