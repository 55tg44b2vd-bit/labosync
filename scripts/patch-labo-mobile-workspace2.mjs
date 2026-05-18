import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');

const hubBlock = `<!-- ===== HUB ESPACES ===== -->
<div id="mobile-workspace-hub" role="dialog" aria-modal="true" aria-labelledby="mob-hub-title">
  <motion class="mob-hub-inner">
    <motion class="mob-hub-brand" id="mob-hub-title">Labo<span>sync</span></motion>
    <p class="mob-hub-sub">Choisissez votre espace. Même compte, mêmes données.</p>
    <motion class="mob-hub-cards">
      <button type="button" class="mob-hub-card mob-hub-card--admin" id="mob-hub-enter-admin">
        <motion class="mob-hub-card-icon">📋</motion>
        <h2>Administratif</h2>
        <p>Travaux, bons de livraison, factures.</p>
        <span class="mob-hub-tag">🔒 Code compta possible</span>
      </button>
      <button type="button" class="mob-hub-card mob-hub-card--prog" id="mob-hub-enter-prog">
        <motion class="mob-hub-card-icon">🔬</motion>
        <h2>Programmation</h2>
        <p>Planifier les travaux saisis en administratif.</p>
        <span class="mob-hub-tag">Équipe &amp; planning</span>
      </button>
    </motion>
    <p class="mob-hub-foot" id="mob-hub-foot"></p>
  </motion>
</motion>
<div id="mob-admin-pin-sheet" role="dialog" aria-modal="true">
  <motion class="mob-pin-sheet">
    <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">🔒 Espace administratif</h3>
    <p style="font-size:.8rem;color:var(--ink-soft);margin-bottom:16px;line-height:1.45;">Code comptabilité (4 à 8 chiffres).</p>
    <motion class="field"><label>Code</label><input type="password" id="mob-admin-pin-input" inputmode="numeric" maxlength="8" autocomplete="off" style="font-size:20px;letter-spacing:.2em;text-align:center;"/></motion>
    <p id="mob-admin-pin-err" style="display:none;color:var(--red);font-size:.78rem;margin-bottom:10px;"></p>
    <button type="button" class="btn btn-primary" id="mob-admin-pin-ok">Valider</button>
    <button type="button" class="btn btn-secondary" id="mob-admin-pin-cancel" style="margin-top:8px;">Retour</button>
  </motion>
</motion>
`;

const D = 'di' + 'v';
let hub = hubBlock.replace(/<\/?motion>/g, (m) => (m.startsWith('</') ? `</${D}>` : `<${D}`)).replace(/<motion /g, `<${D} `);

if (!t.includes('id="mobile-workspace-hub"')) {
  t = t.replace('<!-- ===== APP ===== -->\n<div id="app">', hub + '\n<!-- ===== APP ===== -->\n<div id="app">');
}

if (!t.includes('mob-workspace-badge')) {
  t = t.replace(
    '<div class="topbar-brand">Labo<span>sync</span></motion>',
    '<motion class="topbar-brand">Labo<span>sync</span> <span id="mob-workspace-badge" class="mob-ws-badge" style="display:none;">Administratif</span></motion>'
  );
  t = t.replace(/<motion /g, `<${D} `).replace(/<\/motion>/g, `</${D}>`);
}

if (!t.includes('btn-mob-workspace-switch')) {
  t = t.replace(
    '<button id="btn-topbar-profile"',
    '<button type="button" id="btn-mob-workspace-switch" style="display:none;">Espace</button>\n    <button id="btn-topbar-profile"'
  );
}

if (!t.includes('mob-home-ws-hint')) {
  t = t.replace(
    '<motion id="home-greeting" style="margin-bottom:14px;"></motion>',
    `<${D} id="home-greeting" style="margin-bottom:14px;"></${D}>\n      <p id="mob-home-ws-hint" style="font-size:.78rem;color:var(--ink-soft);margin:-8px 0 14px;line-height:1.4;"></p>`
  );
  t = t.replace(/<motion /g, `<${D} `).replace(/<\/motion>/g, `</${D}>`);
}

if (!t.includes('function hasPerm')) {
  t = t.replace(
    'let jobs=[], archive=[], cabinets=[], bdl=[], documents=[], tarifs=[];',
    `let _userRole=localStorage.getItem('lb_user_role')||'admin';
const _ROLE_PERMS={admin:['*'],production:['workspace:prog'],billing:['workspace:admin'],support:['workspace:admin']};
function hasPerm(key){const p=_ROLE_PERMS[_userRole]||[];return p.includes('*')||p.includes(key);}
function canAccessWorkspace(ws){if(hasPerm('*'))return true;if(ws==='admin')return hasPerm('workspace:admin');if(ws==='prog')return hasPerm('workspace:prog');return false;}
let jobs=[], archive=[], cabinets=[], bdl=[], documents=[], tarifs=[];`
  );
}

if (!t.includes('resolveMobileWorkspaceAfterBoot')) {
  t = t.replace(
    "initMobileApp();\n    if(typeof handleStripeConnectReturnMobile",
    "initMobileApp();\n    if(typeof resolveMobileWorkspaceAfterBoot==='function')setTimeout(function(){resolveMobileWorkspaceAfterBoot();},100);\n    if(typeof handleStripeConnectReturnMobile"
  );
}

if (!t.includes('applyMobileWorkspaceUi')) {
  t = t.replace(
    "_mobileInitDone=true;\n  document.getElementById('auth-screen').style.display='none';",
    "_mobileInitDone=true;\n  document.getElementById('auth-screen').style.display='none';\n  if(typeof applyMobileWorkspaceUi==='function')applyMobileWorkspaceUi('hub');"
  );
}

if (!t.includes('addMobileAdminJob')) {
  t = t.replace(
    "if(!items.length){toast('Ajoutez au moins un type','var(--red)');return;}\n    var totalNb=items.reduce",
    `if(!items.length){toast('Ajoutez au moins un type','var(--red)');return;}\n    var totalNb=items.reduce`
  );
  // insert after totalNb/lbl computed in qj-ok handler
  t = t.replace(
    "var lbl=totalNb>1?patient+' ('+totalNb+' éléments)':patient;\n    var tasks=[];",
    `var lbl=totalNb>1?patient+' ('+totalNb+' éléments)':patient;\n    var ws=typeof getWorkspace==='function'?getWorkspace():'admin';\n    if(ws==='admin'&&typeof addMobileAdminJob==='function'){\n      if(!addMobileAdminJob({patient:lbl,items:items,cabinet:cab,deliveryDate:delivery,note:note,urgent:urgent,missingItems:missingItems}))return;\n      overlay.remove();\n      toast('✅ Travail enregistré','var(--green)');\n      await saveData();\n      if(cab){var c2=cabinets.find(function(c){return c.id===cab;});if(c2)publishPortal(c2);}\n      renderAll();\n      return;\n    }\n    var tasks=[];`
  );
}

if (!t.includes('renderProgQueue')) {
  t = t.replace('  updateNavBadges();', '  updateNavBadges();\n  if(typeof renderProgQueue===\'function\')renderProgQueue();');
}

if (!t.includes('mob-travaux-title')) {
  t = t.replace('Travaux en cours <span id="mj-count"', '<span id="mob-travaux-title">Travaux en cours</span> <span id="mj-count"');
}

// fix any motion left
t = t.replace(/<motion /g, `<${D} `).replace(/<\/motion>/g, `</${D}>`);

fs.writeFileSync(p, t);
console.log('patch2 ok');
