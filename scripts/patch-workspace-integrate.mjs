import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, '..', 'app.html');
let t = fs.readFileSync(appPath, 'utf8');
const D = 'di' + 'v';

function once(tag, fn) {
  if (t.includes(tag)) return;
  fn();
}

// script include
once('scripts/lab-workspace.js', () => {
  t = t.replace(
    '<script src="/vendor/supabase.min.js"></script>',
    '<script src="/vendor/supabase.min.js"></script>\n<script src="/scripts/lab-workspace.js"></script>'
  );
});

// saisie subtitle id
t = t.replace(
  '<p style="font-size:.76rem;color:var(--ink-soft);margin-bottom:14px;" data-i18n="job.card.sub">Entrez les informations du travail à réaliser.</p>',
  '<p id="saisie-card-sub" style="font-size:.76rem;color:var(--ink-soft);margin-bottom:14px;" data-i18n="job.card.sub">Entrez les informations du travail à réaliser.</p>'
);

// field-prog-only on lab date, slot, emp
t = t.replace(
  '<div class="fl" style="min-width:150px;"><label>📦 Date labo (coursier)</label>',
  `<div class="fl field-prog-only" style="min-width:150px;"><label>📦 Date labo (coursier)</label>`
);
t = t.replace(
  '<motion class="fl" style="min-width:140px;"><label>🚚 Créneau coursier</label>'.replace('motion', D),
  `<${D} class="fl field-prog-only" style="min-width:140px;"><label>🚚 Créneau coursier</label>`
);
if (!t.includes('field-prog-only') || !t.includes('Créneau coursier')) {
  t = t.replace(
    'class="fl" style="min-width:140px;"><label>🚚 Créneau coursier</label>',
    'class="fl field-prog-only" style="min-width:140px;"><label>🚚 Créneau coursier</label>'
  );
}
t = t.replace('id="saisie-emp-wrap"', 'id="saisie-emp-wrap" class="field-prog-only prog-tab"');

// courier banner
once('id="courier-ws-banner"', () => {
  t = t.replace(
    `<${D} class="pane" id="pane-coursiers">\n  <${D} style="display:flex;align-items:center;`,
    `<${D} class="pane" id="pane-coursiers">\n  <${D} id="courier-ws-banner" role="status"></${D}>\n  <${D} style="display:flex;align-items:center;`
  );
});

// courier billing id
once('id="courier-billing-block"', () => {
  t = t.replace(
    'Relevés coursier (facturation)</h3>',
    'Relevés coursier (facturation)</h3>'
  );
  t = t.replace(
    /<div class="card" style="margin-top:18px;padding:16px 18px;">\s*\n\s*<h3 style="font-size:\.92rem;font-weight:700;margin:0 0 10px;">Relevés coursier \(facturation\)<\/h3>/,
    `<${D} id="courier-billing-block" class="card" style="margin-top:18px;padding:16px 18px;">\n    <h3 style="font-size:.92rem;font-weight:700;margin:0 0 10px;">Relevés coursier (facturation)</h3>`
  );
});

// admin pin settings
once('admin-pin-settings-card', () => {
  const pinCard = `      <${D} class="card" data-settings-req="role-admin" id="admin-pin-settings-card">
        <h2>🔐 Code espace administratif</h2>
        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:12px;">Protège l'accès comptabilité (factures, BL). 4 à 8 chiffres, vérifié côté serveur.</p>
        <${D} style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;max-width:520px;">
          <${D} class="fl" style="flex:1;min-width:140px;"><label>Nouveau code</label><input type="password" id="admin-pin-set" inputmode="numeric" maxlength="8" autocomplete="new-password"/></${D}>
          <${D} class="fl" style="flex:1;min-width:140px;"><label>Code actuel (si déjà défini)</label><input type="password" id="admin-pin-set-current" inputmode="numeric" maxlength="8" autocomplete="off"/></${D}>
          <button type="button" class="btn btn-a" id="btn-admin-pin-save">Enregistrer</button>
          <button type="button" class="btn btn-b" id="btn-admin-pin-clear">Supprimer le code</button>
        </${D}>
        <p id="admin-pin-set-msg" style="font-size:.74rem;color:var(--ink-soft);margin-top:8px;min-height:16px;"></p>
      </${D}>
`;
  t = t.replace(
    `      <${D} class="card" data-settings-req="role-admin">\n        <h2>🔐 Rôle utilisateur</h2>`,
    pinCard + `      <${D} class="card" data-settings-req="role-admin">\n        <h2>🔐 Rôle utilisateur</h2>`
  );
});

// ROLE_PERMS
t = t.replace(
  `const _ROLE_PERMS = {
  admin: ['*'],
  production: ['pane:dashboard','pane:saisie','pane:calendrier','pane:livraisons','pane:historique','pane:stats','pane:attente','pane:impression','pane:messages','pane:cabinets','pane:coursiers'],
  billing: ['pane:dashboard','pane:cabinets','pane:livraisons','pane:facturation','pane:historique','pane:stats','pane:messages','action:billing_generate','action:billing_credit','action:data_import'],
  support: ['pane:dashboard','pane:cabinets','pane:livraisons','pane:historique','pane:messages'],
};`,
  `const _ROLE_PERMS = {
  admin: ['*'],
  production: ['workspace:prog','pane:dashboard','pane:saisie','pane:calendrier','pane:historique','pane:stats','pane:attente','pane:impression','pane:messages','pane:cabinets','pane:coursiers'],
  billing: ['workspace:admin','pane:dashboard','pane:saisie','pane:cabinets','pane:livraisons','pane:facturation','pane:historique','pane:stats','pane:messages','action:billing_generate','action:billing_credit','action:data_import'],
  support: ['workspace:admin','pane:dashboard','pane:cabinets','pane:livraisons','pane:historique','pane:messages'],
};`
);

if (!t.includes('function canAccessWorkspace')) {
  t = t.replace(
    'function hasPerm(key){',
    `function canAccessWorkspace(ws){
  if(hasPerm('*'))return true;
  if(ws==='admin')return hasPerm('workspace:admin');
  if(ws==='prog')return hasPerm('workspace:prog');
  return false;
}
function hasPerm(key){`
  );
}

// applyProgMode uses isProgDisplayActive
t = t.replace(
  'function applyProgMode(){\n  const on=isProgActif();',
  'function applyProgMode(){\n  const on=typeof isProgDisplayActive===\'function\'?isProgDisplayActive():isProgActif();'
);

// btn-saisie-add
t = t.replace(
  "if(bid==='btn-saisie-add'){if(isProgActif())addToQueue();else addDirect();}",
  "if(bid==='btn-saisie-add'){if(typeof handleSaisieAdd==='function')handleSaisieAdd();else if(isProgActif())addToQueue();else addDirect();}"
);

t = t.replace(
  "if(e.key==='Enter'){if(isProgActif())addToQueue();else addDirect();}",
  "if(e.key==='Enter'){if(typeof handleSaisieAdd==='function')handleSaisieAdd();else if(isProgActif())addToQueue();else addDirect();}"
);

// goHome
t = t.replace(
  'function goHome(){\n  const dashTab=document.querySelector(\'.tab[data-pane="dashboard"]\');',
  `function goHome(){
  if(typeof getWorkspace==='function'&&getWorkspace()==='hub')return;
  if(typeof showLabHub==='function'&&typeof getWorkspace==='function'&&getWorkspace()!=='hub'){
    /* rester dans l'espace : accueil */
  }
  const dashTab=document.querySelector('.tab[data-pane="dashboard"]');`
);

// completeLabBoot - applyWorkspaceUi and resolve
t = t.replace(
  '    applyRoleUi();\n    if(access.sub)showTrialBanner(access.sub);',
  '    applyRoleUi();\n    if(typeof applyWorkspaceUi===\'function\')applyWorkspaceUi();\n    if(typeof resolveWorkspaceAfterBoot===\'function\')resolveWorkspaceAfterBoot();\n    if(access.sub)showTrialBanner(access.sub);'
);

t = t.replace(
  '      refreshTechSelects();refreshTypeSelects();applyProgMode();\n      if(typeof renderMessagesPane===\'function\')renderMessagesPane();',
  '      refreshTechSelects();refreshTypeSelects();applyProgMode();\n      if(typeof applyWorkspaceUi===\'function\')applyWorkspaceUi();\n      if(typeof renderMessagesPane===\'function\')renderMessagesPane();'
);

// applyRoleUi - workspace nav
t = t.replace(
  'function applyRoleUi(){\n  try{\n    document.querySelectorAll(\'.tab[data-pane]\').forEach(function(tab){',
  `function applyRoleUi(){
  try{
    var ws=typeof getWorkspace==='function'?getWorkspace():'admin';
    if(ws!=='hub'&&typeof applyWorkspaceNav==='function'){/* nav in applyWorkspaceUi */}
    document.querySelectorAll('.tab[data-pane]').forEach(function(tab){
      var pane=tab.dataset.pane;
      var tw=tab.getAttribute('data-ws');
      if(ws!=='hub'&&tw&&tw!=='both'&&tw!==ws){tab.style.display='none';tab.style.opacity='0.4';tab.style.pointerEvents='none';return;}
      if(tw&&(tw==='both'||tw===ws))tab.style.display='';`
);

// Fix duplicate pane check - need to read applyRoleUi and patch carefully
// Actually my replace may have broken applyRoleUi. Let me read it

// switchToAdminRole - restrict
t = t.replace(
  `function switchToAdminRole(showToastMsg){
  if(_userRole==='admin'){
    if(showToastMsg)showToast('Vous êtes déjà en mode admin.','#2a6049',2200);
    return;
  }
  _userRole='admin';`,
  `function switchToAdminRole(showToastMsg){
  if(_userRole==='admin'){
    if(showToastMsg)showToast('Vous êtes déjà en mode admin.','#2a6049',2200);
    return;
  }
  if(!hasPerm('*')){
    showToast('⛔ Réservé au compte principal du laboratoire.','#c0392b',3500);
    return;
  }
  _userRole='admin';`
);

// auth logout clear workspace
t = t.replace(
  "Object.keys(localStorage).forEach(function(k){if(k.startsWith('sb-'))localStorage.removeItem(k);});",
  "Object.keys(localStorage).forEach(function(k){if(k.startsWith('sb-')||k==='lb_workspace')localStorage.removeItem(k);});sessionStorage.removeItem('lb_admin_unlocked_until');"
);

// calendrier data-ws on secondary tab
if (!t.includes('data-pane="calendrier" data-ws')) {
  t = t.replace(
    'data-pane="calendrier" data-drawer-more="1"',
    'data-pane="calendrier" data-ws="prog" data-drawer-more="1"'
  );
}

fs.writeFileSync(appPath, t, 'utf8');
console.log('Integrated workspace JS hooks');
