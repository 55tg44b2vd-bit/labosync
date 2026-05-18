import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');

const hub = `<!-- ===== HUB ESPACES ===== -->
<div id="mobile-workspace-hub" role="dialog" aria-modal="true" aria-labelledby="mob-hub-title">
  <motion class="mob-hub-inner">
    <motion class="mob-hub-brand" id="mob-hub-title">Labo<span>sync</span></motion>
    <p class="mob-hub-sub">Où voulez-vous aller ? Même compte, mêmes données.</p>
    <motion class="mob-hub-cards">
      <button type="button" class="mob-hub-card mob-hub-card--admin" id="mob-hub-enter-admin" aria-describedby="mob-hub-admin-desc">
        <motion class="mob-hub-card-icon" aria-hidden="true">📋</motion>
        <h2>Administratif</h2>
        <p id="mob-hub-admin-desc">Créer des travaux, bons de livraison et factures.</p>
        <span class="mob-hub-tag">Code compta possible</span>
      </button>
      <button type="button" class="mob-hub-card mob-hub-card--prog" id="mob-hub-enter-prog" aria-describedby="mob-hub-prog-desc">
        <motion class="mob-hub-card-icon" aria-hidden="true">🔬</motion>
        <h2>Programmation</h2>
        <p id="mob-hub-prog-desc">Planifier les travaux saisis en administratif.</p>
        <span class="mob-hub-tag">Équipe &amp; planning</span>
      </button>
    </motion>
    <p class="mob-hub-foot" id="mob-hub-foot"></p>
  </motion>
</motion>
<div id="mob-admin-pin-sheet" role="dialog" aria-modal="true" aria-labelledby="mob-pin-title">
  <motion class="mob-pin-sheet">
    <h3 id="mob-pin-title" style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">Code comptabilité</h3>
    <p style="font-size:.8rem;color:var(--ink-soft);margin-bottom:16px;line-height:1.45;">L'espace administratif est protégé. Entrez le code défini par votre responsable (4 à 8 chiffres).</p>
    <motion class="field"><label for="mob-admin-pin-input">Code</label><input type="password" id="mob-admin-pin-input" inputmode="numeric" maxlength="8" autocomplete="one-time-code" style="font-size:20px;letter-spacing:.2em;text-align:center;"/></motion>
    <p id="mob-admin-pin-err" role="alert" style="display:none;color:var(--red);font-size:.78rem;margin-bottom:10px;"></p>
    <button type="button" class="btn btn-primary" id="mob-admin-pin-ok">Valider</button>
    <button type="button" class="btn btn-secondary" id="mob-admin-pin-cancel" style="margin-top:8px;">Retour au choix d'espace</button>
  </motion>
</motion>
`;

const tag = 'di' + 'v';
const hubHtml = hub.replace(/<\/?motion>/g, (m) => (m[1] === '/' ? `</${tag}>` : `<${tag}`)).replace(/<motion /g, `<${tag} `);

if (!t.includes('id="mobile-workspace-hub"')) {
  t = t.replace('<!-- ===== APP ===== -->', hubHtml + '\n<!-- ===== APP ===== -->');
}

if (!t.includes('mob-workspace-badge')) {
  t = t.replace(
    '<div class="topbar-brand">Labo<span>sync</span></div>',
    '<div class="topbar-brand">Labo<span>sync</span> <span id="mob-workspace-badge" class="mob-ws-badge" style="display:none;">Administratif</span></motion>'
  );
  t = t.replace(/<\/motion>/g, `</${tag}>`);
}

if (!t.includes('btn-mob-workspace-switch')) {
  t = t.replace(
    '<button id="btn-topbar-profile"',
    '<button type="button" id="btn-mob-workspace-switch" style="display:none;" aria-label="Changer d\'espace">Espace</button>\n    <button id="btn-topbar-profile"'
  );
}

if (!t.includes('mob-home-ws-hint')) {
  t = t.replace(
    '<div id="home-greeting" style="margin-bottom:14px;"></div>',
    '<div id="home-greeting" style="margin-bottom:14px;"></div>\n      <p id="mob-home-ws-hint" style="font-size:.78rem;color:var(--ink-soft);margin:-8px 0 14px;line-height:1.4;"></p>'
  );
}

// initMobileApp: don't force app visible when hub
t = t.replace(
  "if(typeof applyMobileWorkspaceUi==='function')applyMobileWorkspaceUi(typeof getWorkspace==='function'?getWorkspace():'hub');\n  document.getElementById('app').style.display='flex';",
  "if(typeof applyMobileWorkspaceUi==='function'){applyMobileWorkspaceUi(typeof getWorkspace==='function'?getWorkspace():'hub');}else{document.getElementById('app').style.display='flex';}"
);

if (!t.includes('resolveMobileWorkspaceAfterBoot')) {
  t = t.replace(
    "try{lbMobHandleOpenDeepLink();}catch(eDl){}",
    "if(typeof resolveMobileWorkspaceAfterBoot==='function')resolveMobileWorkspaceAfterBoot();\n  try{lbMobHandleOpenDeepLink();}catch(eDl){}"
  );
}

t = t.replace(
  "document.getElementById('env-selector').classList.remove('on');\n    document.getElementById('app').style.display='flex';\n    initMobileApp();",
  "document.getElementById('env-selector').classList.remove('on');\n    initMobileApp();"
);

t = t.replace(
  "document.getElementById('env-selector').classList.remove('on');\n  document.getElementById('app').style.display='flex';\n  initMobileApp();",
  "document.getElementById('env-selector').classList.remove('on');\n  initMobileApp();"
);

if (!t.includes('addMobileAdminJob')) {
  t = t.replace(
    "var lbl=totalNb>1?patient+' ('+totalNb+' éléments)':patient;\n    var tasks=[];",
    "var lbl=totalNb>1?patient+' ('+totalNb+' éléments)':patient;\n    var ws=typeof getWorkspace==='function'?getWorkspace():'admin';\n    if(ws==='admin'&&typeof addMobileAdminJob==='function'){\n      if(!addMobileAdminJob({patient:lbl,items:items,cabinet:cab,deliveryDate:delivery,note:note,urgent:urgent,missingItems:missingItems}))return;\n      overlay.remove();\n      toast('✅ Travail enregistré','var(--green)');\n      await saveData();\n      if(cab){var c2=cabinets.find(function(c){return c.id===cab;});if(c2)publishPortal(c2);}\n      renderAll();\n      return;\n    }\n    var tasks=[];"
  );
}

// prog view copy
t = t.replace(
  '<div style="font-size:1.05rem;font-weight:700;">À programmer <span id="mob-prog-queue-cnt"',
  '<div style="font-size:1.05rem;font-weight:700;">File à programmer <span id="mob-prog-queue-cnt"'
);
t = t.replace(
  'Travaux saisis en administratif — un bouton pour lancer la programmation automatique.',
  'Chaque travail créé en <strong>Administratif</strong> apparaît ici. Touchez le bouton pour le planifier en un geste.'
);

fs.writeFileSync(p, t);
console.log('insert-mobile-hub ok');
