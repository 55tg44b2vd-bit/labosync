import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
const D = 'di' + 'v';
let t = fs.readFileSync(p, 'utf8');

// scripts
if (!t.includes('lab-workspace.js')) {
  t = t.replace(
    '<script src="/vendor/supabase.min.js"></script>',
    '<script src="/vendor/supabase.min.js"></script>\n<script src="/scripts/lab-workspace.js"></script>\n<script src="/scripts/lab-workspace-mobile.js"></script>'
  );
}

// CSS hub mobile
if (!t.includes('#mobile-workspace-hub')) {
  t = t.replace(
    '.env-selector p{color:rgba(255,255,255,.6);',
    `/* ── Hub espaces mobile ── */
#mobile-workspace-hub{position:fixed;inset:0;z-index:200;background:linear-gradient(160deg,#f8fafc 0%,#eff6ff 50%,#f1f5f9 100%);display:none;flex-direction:column;padding:calc(20px + env(safe-area-inset-top)) 18px calc(20px + env(safe-area-inset-bottom));overflow-y:auto;}
.mob-hub-inner{max-width:420px;margin:0 auto;width:100%;flex:1;display:flex;flex-direction:column;justify-content:center;}
.mob-hub-brand{font-size:1.45rem;font-weight:800;text-align:center;margin-bottom:6px;}
.mob-hub-brand span{color:var(--accent);}
.mob-hub-sub{font-size:.88rem;color:var(--ink-soft);text-align:center;line-height:1.5;margin-bottom:24px;}
.mob-hub-cards{display:flex;flex-direction:column;gap:14px;}
.mob-hub-card{width:100%;text-align:left;background:var(--surface);border:2px solid var(--border);border-radius:16px;padding:20px 18px;cursor:pointer;min-height:88px;box-shadow:var(--shadow);font-family:inherit;color:inherit;}
.mob-hub-card:active{transform:scale(.98);}
.mob-hub-card--admin{border-color:#fde047;background:linear-gradient(135deg,#fff 0%,#fefce8 100%);}
.mob-hub-card--prog{border-color:#bfdbfe;background:linear-gradient(135deg,#fff 0%,#eff6ff 100%);}
.mob-hub-card--disabled{opacity:.5;pointer-events:none;}
.mob-hub-card-icon{font-size:1.8rem;margin-bottom:8px;}
.mob-hub-card h2{font-size:1.05rem;font-weight:700;margin-bottom:6px;}
.mob-hub-card p{font-size:.82rem;color:var(--ink-soft);line-height:1.45;margin:0;}
.mob-hub-tag{display:inline-block;margin-top:12px;font-size:.65rem;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:99px;background:#f1f5f9;color:#64748b;}
.mob-hub-foot{font-size:.72rem;color:var(--ink-soft);text-align:center;margin-top:20px;line-height:1.45;}
.mob-ws-badge{font-size:.62rem;font-weight:700;padding:3px 9px;border-radius:99px;background:#fef3c7;color:#92400e;margin-left:6px;vertical-align:middle;}
.mob-ws-badge--prog{background:#dbeafe;color:#1d4ed8;}
#mob-admin-pin-sheet{position:fixed;inset:0;z-index:300;background:rgba(15,23,42,.5);display:none;align-items:flex-end;justify-content:center;}
.mob-pin-sheet{background:var(--surface);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px calc(24px + env(safe-area-inset-bottom));}
#btn-mob-workspace-switch{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:.7rem;font-weight:600;color:var(--ink-soft);cursor:pointer;min-height:36px;}
.env-selector p{color:rgba(255,255,255,.6);`
  );
}

// hub HTML before #app
if (!t.includes('mobile-workspace-hub')) {
  t = t.replace(
    '<!-- ===== APP ===== -->\n<' + D + ' id="app">',
    `<!-- ===== HUB ESPACES ===== -->
<${D} id="mobile-workspace-hub" role="dialog" aria-modal="true" aria-labelledby="mob-hub-title">
  <${D} class="mob-hub-inner">
    <${D} class="mob-hub-brand" id="mob-hub-title">Labo<span>sync</span></${D}>
    <p class="mob-hub-sub">Choisissez votre espace. Même compte, mêmes données.</p>
    <${D} class="mob-hub-cards">
      <button type="button" class="mob-hub-card mob-hub-card--admin" id="mob-hub-enter-admin">
        <${D} class="mob-hub-card-icon">📋</${D}>
        <h2>Administratif</h2>
        <p>Travaux, bons de livraison, factures.</p>
        <span class="mob-hub-tag">🔒 Code compta possible</span>
      </button>
      <button type="button" class="mob-hub-card mob-hub-card--prog" id="mob-hub-enter-prog">
        <${D} class="mob-hub-card-icon">🔬</${D}>
        <h2>Programmation</h2>
        <p>Planifier les travaux saisis en administratif.</p>
        <span class="mob-hub-tag">Équipe &amp; planning</span>
      </button>
    </${D}>
    <p class="mob-hub-foot" id="mob-hub-foot"></p>
  </${D}>
</${D}>
<${D} id="mob-admin-pin-sheet" role="dialog" aria-modal="true">
  <${D} class="mob-pin-sheet">
    <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">🔒 Espace administratif</h3>
    <p style="font-size:.8rem;color:var(--ink-soft);margin-bottom:16px;line-height:1.45;">Code comptabilité du laboratoire (4 à 8 chiffres).</p>
    <${D} class="field"><label>Code</label><input type="password" id="mob-admin-pin-input" inputmode="numeric" maxlength="8" autocomplete="off" style="font-size:20px;letter-spacing:.2em;text-align:center;"/></${D}>
    <p id="mob-admin-pin-err" style="display:none;color:var(--red);font-size:.78rem;margin-bottom:10px;"></p>
    <button type="button" class="btn btn-primary" id="mob-admin-pin-ok">Valider</button>
    <button type="button" class="btn btn-secondary" id="mob-admin-pin-cancel" style="margin-top:8px;">Retour</button>
  </${D}>
</${D}>
<!-- ===== APP ===== -->
<${D} id="app">`
  );
}

// topbar badge + switch
if (!t.includes('mob-workspace-badge')) {
  t = t.replace(
    '<${D} class="topbar-brand">Labo<span>sync</span></${D}>'.replace(/<\$\{D\}>/g, '<' + D + '>').replace(/<\/\$\{D\}>/g, '</' + D + '>'),
    `<${D} class="topbar-brand">Labo<span>sync</span> <span id="mob-workspace-badge" class="mob-ws-badge" style="display:none;">Administratif</span></${D}>`
  );
  if (!t.includes('mob-workspace-badge')) {
    t = t.replace(
      '<div class="topbar-brand">Labo<span>sync</span></motion>',
      '<div class="topbar-brand">Labo<span>sync</span> <span id="mob-workspace-badge" class="mob-ws-badge" style="display:none;">Administratif</span></div>'
    );
  }
}
if (!t.includes('btn-mob-workspace-switch')) {
  t = t.replace(
    '<button id="btn-topbar-profile"',
    '<button type="button" id="btn-mob-workspace-switch" style="display:none;">Espace</button>\n    <button id="btn-topbar-profile"'
  );
}

// home hint
if (!t.includes('mob-home-ws-hint')) {
  t = t.replace(
    '<div id="home-greeting" style="margin-bottom:14px;"></motion>',
    '<div id="home-greeting" style="margin-bottom:14px;"></div>\n      <p id="mob-home-ws-hint" style="font-size:.78rem;color:var(--ink-soft);margin:-8px 0 14px;line-height:1.4;"></p>'
  );
  t = t.replace('</motion>', '</' + D + '>');
  t = t.replace(/<motion /g, '<' + D + ' ');
}

// view-prog
if (!t.includes('view-prog')) {
  t = t.replace(
    '    <!-- ── TRAVAUX (feed pur) ── -->',
    `    <!-- ── PROGRAMMATION ── -->
    <${D} class="view" id="view-prog">
      <${D} style="margin-bottom:14px;">
        <${D} style="font-size:1.05rem;font-weight:700;">À programmer <span id="mob-prog-queue-cnt" style="color:var(--accent);"></span></${D}>
        <p style="font-size:.78rem;color:var(--ink-soft);margin-top:4px;line-height:1.45;">Travaux saisis en administratif — un bouton pour lancer la programmation automatique.</p>
      </${D}>
      <${D} id="mob-prog-queue"></${D}>
    </${D}>

    <!-- ── TRAVAUX (feed pur) ── -->`
  );
}

// travaux title id
if (!t.includes('mob-travaux-title')) {
  t = t.replace(
    '<div style="font-size:1.05rem;font-weight:700;color:var(--ink);">Travaux en cours',
    '<div id="mob-travaux-title" style="font-size:1.05rem;font-weight:700;color:var(--ink);">Travaux en cours'
  );
}

// bottom nav prog tab
if (!t.includes('data-view="prog"')) {
  t = t.replace(
    '<button class="nav-item" data-view="livraisons"',
    '<button class="nav-item" data-view="prog" id="nav-prog" style="display:none;"><span class="nav-icon">🔬</span>À prog.</button>\n    <button class="nav-item" data-view="livraisons"'
  );
}

// roles - before var jobs
if (!t.includes('workspace:admin')) {
  t = t.replace(
    'let jobs=[],bdl=[],documents=[],cabinets=[],tarifs=[],syns={},scanHist=[];',
    `let _userRole=localStorage.getItem('lb_user_role')||'admin';
const _ROLE_PERMS={
  admin:['*'],
  production:['workspace:prog','pane:home','pane:travaux','pane:messages'],
  billing:['workspace:admin','pane:home','pane:travaux','pane:livraisons','pane:docs','pane:messages'],
  support:['workspace:admin','pane:home','pane:messages']
};
function hasPerm(key){const p=_ROLE_PERMS[_userRole]||[];return p.includes('*')||p.includes(key);}
function canAccessWorkspace(ws){if(hasPerm('*'))return true;if(ws==='admin')return hasPerm('workspace:admin');if(ws==='prog')return hasPerm('workspace:prog');return false;}
let jobs=[],bdl=[],documents=[],cabinets=[],tarifs=[],syns={},scanHist=[];`
  );
}

// initMobileApp - workspace after load
if (!t.includes('resolveMobileWorkspaceAfterBoot')) {
  t = t.replace(
    "document.getElementById('app').style.display='flex';\n    initMobileApp();",
    "document.getElementById('app').style.display='flex';\n    initMobileApp();\n    if(typeof resolveMobileWorkspaceAfterBoot==='function')resolveMobileWorkspaceAfterBoot();"
  );
}

// initMobileApp - don't show app until workspace chosen - actually hub shows instead
t = t.replace(
  /async function initMobileApp\(\)\{[\s\S]*?document\.getElementById\('auth-screen'\)\.style\.display='none';/,
  function (m) {
    return m.replace(
      "document.getElementById('auth-screen').style.display='none';",
      "document.getElementById('auth-screen').style.display='none';\n  if(typeof applyMobileWorkspaceUi==='function')applyMobileWorkspaceUi(typeof getWorkspace==='function'?getWorkspace():'hub');"
    );
  }
);

// openQuickJobSheet - admin job path
if (!t.includes('addMobileAdminJob')) {
  t = t.replace(
    `    var tasks=[];\n    if(localStorage.getItem('lb_prog_actif')==='1'){\n      items.forEach(function(it){tasks=tasks.concat(buildTasksMobile(it.type));});\n    }\n    var job={`,
    `    var ws=typeof getWorkspace==='function'?getWorkspace():'admin';\n    if(ws==='admin'&&typeof addMobileAdminJob==='function'){\n      var ok=addMobileAdminJob({patient:lbl,items:items,cabinet:cab,deliveryDate:delivery,note:note,urgent:urgent,missingItems:missingItems});\n      if(!ok)return;\n      overlay.remove();\n      toast('✅ Travail enregistré','var(--green)');\n      await saveData();\n      if(cab){var cabObj=cabinets.find(function(c){return c.id===cab;});if(cabObj)publishPortal(cabObj);}\n      renderAll();\n      return;\n    }\n    var tasks=[];\n    if(localStorage.getItem('lb_prog_actif')==='1'){\n      items.forEach(function(it){tasks=tasks.concat(buildTasksMobile(it.type));});\n    }\n    var job={`
  );
}

// logout session unlock
t = t.replace(
  "if(k.indexOf('lb_')===0&&k.indexOf('lb_onb_')!==0)localStorage.removeItem(k);",
  "if(k.indexOf('lb_')===0&&k.indexOf('lb_onb_')!==0)localStorage.removeItem(k);\n      if(k==='lb_workspace')localStorage.removeItem(k);"
);
t = t.replace(
  '_purgeLaboStorageLogoutMobile',
  '_purgeLaboStorageLogoutMobile'
);
if (!t.includes('lb_admin_unlocked')) {
  t = t.replace(
    '}catch(e){}\n}\n\nfunction _doLogout()',
    `}catch(e){}\n  try{sessionStorage.removeItem('lb_admin_unlocked_until');}catch(e2){}\n}\n\nfunction _doLogout()`
  );
}

// renderAll includes prog queue
if (!t.includes('renderProgQueue')) {
  t = t.replace(
    '  updateNavBadges();',
    '  updateNavBadges();\n  if(typeof renderProgQueue===\'function\')renderProgQueue();'
  );
}

// auth subtitle
t = t.replace(
  '<p>Version mobile — Facturation</p>',
  '<p>Version mobile — Laboratoire</p>'
);

fs.writeFileSync(p, t, 'utf8');
console.log('patched labo-mobile.html');
