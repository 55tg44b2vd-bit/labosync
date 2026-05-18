import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, '..', 'app.html');
let text = fs.readFileSync(appPath, 'utf8');

const D = 'di' + 'v';

text = text.replace(/<motion class="lab-hub-inner">/g, `<${D} class="lab-hub-inner">`);
text = text.replace(/<motion class="lab-hub-brand"/g, `<${D} class="lab-hub-brand"`);

const start = text.indexOf('<div id="lab-hub"');
if (start < 0) throw new Error('lab-hub not found');
const end = text.indexOf('<motion id="search-results"', start);
const end2 = end >= 0 ? end : text.indexOf(`<${D} id="search-results"`, start);
if (end2 < 0) throw new Error('search-results not found');

const headerChunk = text.slice(start, end2);
if (!headerChunk.includes('btn-drawer')) throw new Error('unexpected block');

const hubHtml = `<${D} id="lab-hub" role="dialog" aria-modal="true" aria-labelledby="lab-hub-title">
  <${D} class="lab-hub-inner">
    <${D} class="lab-hub-brand" id="lab-hub-title">Labo<span>sync</span></${D}>
    <p class="lab-hub-sub" id="lab-hub-sub">Choisissez votre espace de travail. La comptabilité et la production sont séparées pour plus de clarté et de sécurité.</p>
    <${D} class="lab-hub-grid">
      <button type="button" class="lab-hub-card lab-hub-card--admin" id="hub-enter-admin" onclick="enterWorkspace('admin')">
        <${D} class="lab-hub-card-icon">📋</${D}>
        <h3>Administratif</h3>
        <p>Saisir les travaux, bons de livraison, factures et cabinets. Réservé à la comptabilité.</p>
        <span class="lab-hub-card-tag">🔒 Code compta possible</span>
      </button>
      <button type="button" class="lab-hub-card lab-hub-card--prog" id="hub-enter-prog" onclick="enterWorkspace('prog')">
        <${D} class="lab-hub-card-icon">🔬</${D}>
        <h3>Programmation</h3>
        <p>Planifier les travaux saisis en administratif : techniciens, étapes, dates et créneaux coursier.</p>
        <span class="lab-hub-card-tag">Équipe &amp; planning</span>
      </button>
    </${D}>
    <p class="lab-hub-foot" id="lab-hub-foot">Les deux espaces partagent les mêmes données : un travail créé en administratif apparaît en programmation.</p>
  </${D}>
</${D}>
<${D} id="admin-pin-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-pin-title">
  <${D} id="admin-pin-box">
    <h3 id="admin-pin-title" style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">🔒 Espace administratif</h3>
    <p style="font-size:.8rem;color:#64748b;margin-bottom:16px;line-height:1.45;">Entrez le code comptabilité du laboratoire.</p>
    <${D} class="fl" style="margin-bottom:12px;">
      <label>Code (4 à 8 chiffres)</label>
      <input type="password" id="admin-pin-input" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="••••" style="font-size:1.2rem;letter-spacing:.25em;text-align:center;"/>
    </${D}>
    <p id="admin-pin-err" style="display:none;font-size:.78rem;color:#b91c1c;margin-bottom:10px;"></p>
    <${D} style="display:flex;gap:10px;flex-wrap:wrap;">
      <button type="button" class="btn btn-a" id="btn-admin-pin-submit" style="flex:1;">Valider</button>
      <button type="button" class="btn btn-b" id="btn-admin-pin-cancel">Retour</button>
    </${D}>
  </${D}>
</${D}>
<header>
  <${D} style="display:flex;align-items:center;gap:2px;">
    <button id="btn-drawer" onclick="toggleDrawer()" aria-label="Menu">☰</button>
    <h1 id="header-labname" onclick="goHome()" style="cursor:pointer;user-select:none;transition:opacity .15s;" onmouseover="this.style.opacity=.7" onmouseout="this.style.opacity=1" title="Retour à l'accueil">Labo<span>sync</span></h1>
    <span id="workspace-badge" style="display:none;margin-left:8px;">Administratif</span>
  </${D}>
  <${D} style="font-size:.62rem;color:var(--ink-soft);font-style:italic;margin-top:-4px;margin-bottom:2px;" data-i18n="header.tagline">Fait par des prothésistes pour des prothésistes</${D}>
  <${D} style="display:flex;align-items:center;gap:10px;">
    <${D} style="position:relative;">
      <input type="text" id="global-search" placeholder="🔍 Patient, dentiste, n° de travail…" autocomplete="off"
        style="font-family:'DM Mono',monospace;font-size:.78rem;padding:7px 12px;border:1.5px solid #e2e8f0;border-radius:7px;background:#f8fafc;color:#0f172a;outline:none;width:220px;">
    </${D}>
    <${D} class="hd-meta" id="hd-date"></${D}>
    <button id="btn-messages-hd" onclick="goMessages()" aria-label="Messagerie" title="Messagerie" style="position:relative;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:.78rem;font-weight:600;border-radius:20px;padding:5px 12px;cursor:pointer;display:flex;align-items:center;gap:5px;">💬 Messagerie<span id="hd-msg-badge" style="display:none;background:#e53935;color:#fff;border-radius:99px;padding:1px 7px;font-size:.65rem;font-weight:700;margin-left:2px;">●</span></button>
    <button type="button" id="btn-workspace-switch" onclick="showLabHub()" style="display:none;">↩ Espace</button>
    <${D} style="position:relative;">
      <button id="btn-account" onclick="toggleAccountMenu(event)" aria-label="Menu compte" title="Compte et paramètres" style="background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:1.05rem;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">⚙️</button>
      <${D} id="account-menu" style="display:none;position:absolute;right:0;top:calc(100% + 8px);min-width:220px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 8px 28px rgba(15,23,42,.12);z-index:1000;overflow:hidden;">
        <button class="account-item" onclick="toggleLang();closeAccountMenu();">🌐 <span>Changer de langue</span></button>
        <button class="account-item" onclick="localStorage.setItem('lb_env','mobile');window.location.href='labo-mobile.html';">📱 <span>Passer en vue mobile</span></button>
        <button class="account-item" onclick="goSettings();closeAccountMenu();">⚙️ <span>Paramètres</span></button>
        <button class="account-item" id="btn-quick-admin" style="display:none;" onclick="switchToAdminRole(true);closeAccountMenu();">🔓 <span>Revenir en mode admin</span></button>
        <button class="account-item" onclick="closeAccountMenu();replayOnboardingTour();">🧭 <span>Refaire le tour guidé</span></button>
        <${D} style="height:1px;background:#f1f5f9;margin:4px 0;"></${D}>
        <button class="account-item account-danger" onclick="authLogout();">⎋ <span>Déconnexion</span></button>
      </${D}>
    </${D}>
  </${D}>
</header>
`;

text = text.slice(0, start) + hubHtml + text.slice(end2);

// data-ws on drawer tabs
const tabReplacements = [
  ['data-pane="dashboard"', 'data-pane="dashboard" data-ws="both"'],
  ['data-pane="saisie"', 'data-pane="saisie" data-ws="both"'],
  ['data-pane="livraisons"', 'data-pane="livraisons" data-ws="admin"'],
  ['data-pane="facturation"', 'data-pane="facturation" data-ws="admin"'],
  ['data-pane="cabinets"', 'data-pane="cabinets" data-ws="both"'],
  ['data-pane="coursiers"', 'data-pane="coursiers" data-ws="both"'],
  ['data-pane="calendrier"', 'data-pane="calendrier" data-ws="prog"'],
  ['data-pane="stats"', 'data-pane="stats" data-ws="both"'],
  ['data-pane="historique"', 'data-pane="historique" data-ws="both"'],
  ['data-pane="impression"', 'data-pane="impression" data-ws="prog"'],
  ['data-pane="attente"', 'data-pane="attente" data-ws="prog"'],
  ['data-pane="equipe"', 'data-pane="equipe" data-ws="prog"'],
];
for (const [a, b] of tabReplacements) {
  if (!text.includes(b)) text = text.replace(a, b);
}

// saisie prog fields wrap
const progFields = `      <${D} class="fl" style="min-width:150px;"><label>📦 Date labo (coursier)</label><input type="date" id="saisie-ilab-delivery"`;
if (!text.includes('id="saisie-prog-fields-wrap"')) {
  text = text.replace(
    `    <${D} class="frow2" style="margin-top:10px;">\n      <${D} class="fl" style="flex:1;min-width:180px;"><label data-i18n="form.note">Note / instructions</label>`,
    `    <${D} id="saisie-prog-fields-wrap" class="frow2" style="margin-top:10px;display:none;">\n      <${D} class="fl" style="flex:1;min-width:180px;"><label data-i18n="form.note">Note / instructions</label>`
  );
  const anchor = `      <${D} class="fl" style="min-width:150px;"><label data-i18n="form.cabinet">🏥 Cabinet</label>`;
  const adminNoteRow = `    <${D} class="frow2" style="margin-top:10px;">\n      <${D} class="fl" style="flex:1;min-width:180px;"><label data-i18n="form.note">Note / instructions</label><input type="text" id="saisie-inote"`;
  if (text.includes(adminNoteRow)) {
    text = text.replace(adminNoteRow, `    <${D} class="frow2" style="margin-top:10px;">\n      <${D} class="fl" style="flex:1;min-width:180px;"><label data-i18n="form.note">Note / instructions</label><input type="text" id="saisie-inote"`);
  }
}

// courier banner
if (!text.includes('id="courier-ws-banner"')) {
  text = text.replace(
    `<${D} class="pane" id="pane-coursiers">\n  <${D} style="display:flex;`,
    `<${D} class="pane" id="pane-coursiers">\n  <${D} id="courier-ws-banner" role="status"></${D}>\n  <${D} style="display:flex;`
  );
}

// courier billing block
if (!text.includes('id="courier-billing-block"')) {
  text = text.replace(
    '  <${D} class="card" style="margin-top:18px;padding:16px 18px;">\n    <h3 style="font-size:.92rem;font-weight:700;margin:0 0 10px;">Relevés coursier (facturation)</h3>'.replace(/\$\{D\}/g, D),
    `  <${D} id="courier-billing-block" class="card" data-ws-only="admin" style="margin-top:18px;padding:16px 18px;">\n    <h3 style="font-size:.92rem;font-weight:700;margin:0 0 10px;">Relevés coursier (facturation)</h3>`
  );
}

// admin pin settings
const pinSettings = `      <${D} class="card" data-settings-req="role-admin" id="admin-pin-settings-card">
        <h2>🔐 Code espace administratif</h2>
        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:12px;">Protège l'accès comptabilité (factures, BL). 4 à 8 chiffres, vérifié côté serveur.</p>
        <${D} style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;max-width:480px;">
          <${D} class="fl" style="flex:1;min-width:140px;"><label>Nouveau code</label><input type="password" id="admin-pin-set" inputmode="numeric" maxlength="8" autocomplete="new-password"/></${D}>
          <${D} class="fl" style="flex:1;min-width:140px;"><label>Code actuel (si déjà défini)</label><input type="password" id="admin-pin-set-current" inputmode="numeric" maxlength="8" autocomplete="off"/></${D}>
          <button type="button" class="btn btn-a" id="btn-admin-pin-save">Enregistrer</button>
          <button type="button" class="btn btn-b" id="btn-admin-pin-clear">Supprimer le code</button>
        </${D}>
        <p id="admin-pin-set-msg" style="font-size:.74rem;color:var(--ink-soft);margin-top:8px;min-height:16px;"></p>
      </${D}>
`;
if (!text.includes('admin-pin-settings-card')) {
  text = text.replace(
    `      <${D} class="card" data-settings-req="role-admin">\n        <h2>🔐 Rôle utilisateur</h2>`,
    pinSettings + `      <${D} class="card" data-settings-req="role-admin">\n        <h2>🔐 Rôle utilisateur</h2>`
  );
}

// Fix any stray motion closing tags from earlier edits
text = text.replace(/<\/motion>/g, `</${D}>`);
text = text.replace(/<motion /g, `<${D} `);

fs.writeFileSync(appPath, text, 'utf8');
console.log('Patched app.html OK');
