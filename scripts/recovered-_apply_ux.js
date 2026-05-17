const fs = require('fs');
const root = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/';

function rep(file, oldStr, newStr, label) {
  const fp = root + file;
  let s = fs.readFileSync(fp, 'utf8');
  if (!s.includes(oldStr)) {
    console.warn('SKIP', file, label);
    return false;
  }
  fs.writeFileSync(fp, s.split(oldStr).join(newStr));
  console.log('OK', file, label);
  return true;
}

const drawerNew = [
  '  <div class="drawer-body">',
  '    <button class="mode-btn on" data-mode="labo" style="display:none;"><span class="mode-icon">🔬</span> <span data-i18n="mode.labo">Laboratoire</span></button>',
  '    <div class="drawer-nav-label">Principal</div>',
  '    <motion-div id="tabs-labo" class="drawer-nav-main">',
  '      <div class="drawer-tab-wrap"><button type="button" class="tab on" data-pane="dashboard"><span class="drawer-tab-title">Accueil</span><span class="drawer-tab-sub">À faire aujourd\'hui</span></button></div>',
  '      <div class="drawer-tab-wrap"><button type="button" class="tab" data-pane="saisie"><span class="drawer-tab-title">Travaux</span><span class="drawer-tab-sub">En cours · <span class="queue-badge" id="queue-badge-tab">0</span></span></button></div>',
  '      <div class="drawer-tab-wrap"><button type="button" class="tab" data-pane="livraisons"><span class="drawer-tab-title">Livraisons</span><span class="drawer-tab-sub">Bons de livraison</span></button></div>',
  '      <div class="drawer-tab-wrap"><button type="button" class="tab" data-pane="facturation"><span class="drawer-tab-title">Factures</span><span class="drawer-tab-sub">Facturation cabinets</span></button></div>',
  '      <div class="drawer-tab-wrap"><button type="button" class="tab drawer-tab-messages" data-drawer-messages="1"><span class="drawer-tab-title">Messages</span><span class="drawer-tab-sub">Discussions <span id="msg-mode-badge" style="display:none;background:#e53935;color:#fff;border-radius:99px;padding:1px 6px;font-size:.6rem;">●</span></span></button></div>',
  '    </div>',
  '    <div id="tabs-fact" style="display:none !important;">',
  '      <button class="tab" data-pane="cabinets">Dentistes</button>',
  '      <button class="tab" data-pane="calendrier">Planning</button>',
  '    </div>',
  '    <div id="drawer-nav-secondary" style="display:none;">',
  '      <button type="button" class="tab" data-pane="cabinets" data-drawer-more="1"><span class="drawer-tab-title">Dentistes</span><span class="drawer-tab-sub">Cabinets et portails</span></button>',
  '      <button type="button" class="tab" data-pane="calendrier" data-drawer-more="1"><span class="drawer-tab-title">Planning</span><span class="drawer-tab-sub">Calendrier</span></button>',
  '      <button type="button" class="tab" data-pane="stats" data-drawer-more="1"><span class="drawer-tab-title">Statistiques</span><span class="drawer-tab-sub">Chiffres</span></button>',
  '      <button type="button" class="tab" data-pane="historique" data-drawer-more="1"><span class="drawer-tab-title">Historique</span><span class="drawer-tab-sub">Archives</span></button>',
  '      <button type="button" class="tab prog-tab" data-pane="impression" data-drawer-more="1" style="display:none;">Impression</button>',
  '      <button type="button" class="tab prog-tab" data-pane="attente" id="tab-attente" data-drawer-more="1" style="display:none;">En attente <span id="attente-badge" style="display:none;background:#e67e22;color:#fff;border-radius:99px;padding:1px 7px;font-size:.65rem;">0</span></button>',
  '      <button type="button" class="tab prog-tab" data-pane="equipe" data-drawer-more="1" style="display:none;">Équipe</button>',
  '    </div>',
  '    <span class="prog-tab" id="prog-separator" style="display:none;"></span>',
  '    <button class="mode-btn drawer-standalone" data-mode="messages" id="mode-btn-messages" style="display:none !important;"><span class="mode-icon">💬</span> Messages</button>',
  '    <button class="tab" data-pane="adminconsole" id="tab-adminconsole" style="display:none;">Admin</button>',
  '    <button class="tab" data-pane="parametres" id="tab-parametres-nav" style="display:none !important;">Paramètres</button>',
  '    <div class="drawer-footer">',
  '      <button type="button" class="drawer-btn-more" onclick="openDrawerMore()">⋯ Plus d\'options</button>',
  '      <button type="button" class="drawer-btn-settings" onclick="drawerOpenSettings()">⚙️ Réglages</button>',
  '    </div>',
  '  </div>',
  '</aside>',
  '<div id="drawer-more-overlay" onclick="if(event.target===this)closeDrawerMore()">',
  '  <div id="drawer-more-sheet" onclick="event.stopPropagation()">',
  '    <div class="drawer-more-title">Plus</div>',
  '    <div class="drawer-more-sub">Planning, dentistes, statistiques…</div>',
  '    <div class="drawer-more-grid" id="drawer-more-grid"></div>',
  '    <button type="button" class="btn btn-b" style="width:100%;margin-top:14px;" onclick="closeDrawerMore()">Fermer</button>',
  '  </div>',
  '</div>',
].join('\n').replace(/motion-div/g, 'div');

{
  let app = fs.readFileSync(root + 'app.html', 'utf8');
  const start = app.indexOf('  <div class="drawer-body">');
  const end = app.indexOf('</aside>\n<div class="wrap">', start);
  if (start < 0 || end < 0) {
    console.error('drawer not found', start, end);
    process.exit(1);
  }
  app = app.slice(0, start) + drawerNew + app.slice(end);
  fs.writeFileSync(root + 'app.html', app);
  console.log('OK drawer');
}

rep('app.html', '/* Mode-btn inside drawer : section header style */', `/* Drawer nav */
.drawer-nav-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;padding:8px 12px 4px;}
.drawer-tab-wrap .tab{flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;height:auto;min-height:44px;}
.drawer-tab-title{font-size:.84rem;font-weight:600;}
.drawer-tab-sub{font-size:.68rem;color:#94a3b8;}
.drawer-tab-wrap .tab.on .drawer-tab-sub{color:rgba(255,255,255,.82);}
.drawer-footer{margin-top:auto;padding:10px 8px 12px;border-top:1px solid #f1f5f9;}
.drawer-btn-more,.drawer-btn-settings{width:100%;text-align:left;padding:10px 12px;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;}
.drawer-btn-more{border:1px dashed #cbd5e1;background:#f8fafc;color:#475569;margin-bottom:6px;}
.drawer-btn-settings{border:none;background:transparent;color:#475569;}
.drawer-btn-settings:hover,.drawer-btn-more:hover{background:#f1f5f9;}
#drawer-more-overlay{position:fixed;inset:0;background:rgba(15,23,42,.4);z-index:9000;opacity:0;pointer-events:none;transition:opacity .2s;}
#drawer-more-overlay.on{opacity:1;pointer-events:auto;}
#drawer-more-sheet{position:fixed;left:0;bottom:0;right:0;max-width:440px;margin:0 auto;background:#fff;border-radius:16px 16px 0 0;padding:16px 14px calc(16px + env(safe-area-inset-bottom));z-index:9001;transform:translateY(100%);transition:transform .28s ease;}
#drawer-more-overlay.on #drawer-more-sheet{transform:translateY(0);}
.drawer-more-title{font-weight:800;font-size:1rem;}
.drawer-more-sub{font-size:.76rem;color:#64748b;margin:8px 0 14px;}
.drawer-more-grid .tab{justify-content:flex-start;}
/* Mode-btn inside drawer : section header style */`, 'css');

rep('app.html', 'function closeDrawer(){', `function openDrawerMore(){
  var grid=document.getElementById('drawer-more-grid');
  var sec=document.getElementById('drawer-nav-secondary');
  if(grid&&sec&&!grid.dataset.built){
    sec.querySelectorAll('.tab[data-drawer-more]').forEach(function(btn){
      if(btn.style.display==='none')return;
      var wrap=document.createElement('div');
      wrap.className='drawer-tab-wrap';
      var b=btn.cloneNode(true);
      b.onclick=function(){closeDrawerMore();closeDrawer();var p=b.dataset.pane;var t=document.querySelector('.tab[data-pane="'+p+'"]');if(t)t.click();};
      wrap.appendChild(b);
      grid.appendChild(wrap);
    });
    grid.dataset.built='1';
  }
  var o=document.getElementById('drawer-more-overlay');
  if(o)o.classList.add('on');
}
function closeDrawerMore(){var o=document.getElementById('drawer-more-overlay');if(o)o.classList.remove('on');}
function drawerOpenSettings(){closeDrawerMore();closeDrawer();goSettings();}
document.addEventListener('click',function(e){
  var m=e.target.closest&&e.target.closest('.drawer-tab-messages');
  if(m){e.preventDefault();closeDrawer();goMessages();}
});
function closeDrawer(){`, 'js');

rep('app.html', 'placeholder="🔍 Code patient, code travail..."', 'placeholder="🔍 Patient, dentiste, n° de travail…"', 'search');
rep('app.html', '📥 À traiter en priorité', "À faire aujourd'hui", 'dash');
rep('app.html', 'return !labName||cabs.length===0||tar.length>0;', 'return !labName||cabs.length===0;', 'onb1');
rep('app.html', '    if(labName&&cabs.length>0&&tar.length>0){', '    if(labName&&cabs.length>0){', 'onb2');
rep('app.html', '    const tar=Array.isArray(tarifs)?tarifs:[];\n', '', 'onb3');
rep('app.html', '    startOnboardingTour();\n    return;', '    step=2;\n    render();\n    return;', 'onb4');
rep('app.html', '        setTimeout(startOnboardingTour,250);', '        step=2;\n        render();', 'onb5');
rep('app.html', 'Étape 2 sur 2 · Configuration', 'Étape 2 sur 2 · Premier dentiste', 'onb6');
rep('app.html', '<button id="onb-finish" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Terminer</button>', '<button id="onb-finish" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Aller à l\'accueil</button>', 'onb7');
rep('app.html', `      document.getElementById('onb-go-tarifs').onclick=function(){
        close(true);
        const tab=document.querySelector('.tab[data-pane="parametres"]');if(tab)tab.click();
        // Scroll vers la section tarifs après le rendu
        setTimeout(function(){
          const el=document.getElementById('tarif-list')||document.querySelector('[id*="tarif"]');
          if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});
        },200);
      };`, '', 'onb8');

rep('app.html', `        <button type="button" class="settings-row" onclick="openSettingsSection('compte')">
          <span class="settings-row-icon">👤</span>
          <span class="settings-row-body"><span class="settings-row-title">Compte et abonnement</span><span class="settings-row-desc">Nom du labo, formule Labosync, rôle</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </motion-div>
      <div class="settings-group" data-settings-group="labo">`.replace('motion-div', 'motion-div').replace(/<\/?motion-div>/g, (m) => m.includes('/') ? '</motion-div>' : '<motion-div>').replace(/motion-div/g, 'div'),
`        <button type="button" class="settings-row" onclick="openSettingsSection('compte')">
          <span class="settings-row-icon">👤</span>
          <span class="settings-row-body"><span class="settings-row-title">Compte et abonnement</span><span class="settings-row-desc">Nom du labo, formule Labosync, rôle</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
        <button type="button" class="settings-row" onclick="startOnboardingTour()">
          <span class="settings-row-icon">🧭</span>
          <span class="settings-row-body"><span class="settings-row-title">Visite guidée</span><span class="settings-row-desc">Revoir les écrans (optionnel)</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </div>
      <div class="settings-group" data-settings-group="labo">`, 'tour');

rep('app.html', 'function _maybeDeepLinkAdminPane(){', `function _maybeOpenSettingsFromUrl(){
  try{
    var sp=new URLSearchParams(location.search||'');
    if(sp.get('settings')==='1'){
      history.replaceState({},'',location.pathname);
      setTimeout(function(){goSettings();},500);
    }
  }catch(e){}
}
function _maybeDeepLinkAdminPane(){`, 'url');

rep('app.html', "  if(id==='paiements'){loadStripeConnectUI();loadStripeKeyUI();}", "  if(id==='paiements'){loadStripeConnectUI();loadStripeKeyUI();}\n  if(id==='tarifs'){if(typeof renderTarifs==='function')renderTarifs();if(typeof renderTarifTypeSel==='function')renderTarifTypeSel();}", 'tarifs');

{
  let app = fs.readFileSync(root + 'app.html', 'utf8');
  const i0 = app.indexOf('    <!-- Tarifs par défaut -->');
  const i1 = app.indexOf('  <!-- Liste des documents -->', i0);
  if (i0 >= 0 && i1 >= 0) {
    const editor = app.slice(i0, i1);
    const secStart = app.indexOf('    <div id="settings-sec-tarifs"');
    const secEnd = app.indexOf('    <div id="settings-sec-equipe"', secStart);
    if (secStart >= 0 && secEnd >= 0 && !app.slice(secStart, secEnd).includes('id="tarif-list"')) {
      const ins = app.lastIndexOf('    </div>', secEnd - 10);
      const moved = editor.replace('margin:0;', 'margin-top:18px;').replace('🏷️ ', '');
      app = app.slice(0, ins) + '\n' + moved + app.slice(ins);
    }
    const link = `    <!-- Tarifs : Réglages -->
    <div class="card" id="tarif-card" style="margin:0;">
      <h2>Tarifs</h2>
      <p style="font-size:.8rem;color:var(--ink-soft);margin-bottom:14px;line-height:1.5;">Un seul endroit pour vos prix : <strong>Réglages → Types de travaux et tarifs</strong>.</p>
      <button type="button" class="btn btn-a" onclick="goSettings();setTimeout(function(){openSettingsSection('tarifs');},200);">Gérer les tarifs</button>
    </div>
`;
    app = app.slice(0, i0) + link + app.slice(i1);
    fs.writeFileSync(root + 'app.html', app);
    console.log('OK tarif');
  } else console.warn('SKIP tarif');
}

rep('cabinet.html', '    <!-- Tabs -->\n    <motion-div class="tabs">'.replace('motion-div', 'div'), `    <div class="portal-hero-cta" style="margin-bottom:16px;">
      <button type="button" class="portal-btn-new-order" onclick="openPortalTab('neworder')">+ Nouvelle commande</button>
      <p class="portal-hero-hint">Le labo reçoit votre fiche en quelques minutes</p>
    </div>
    <!-- Tabs -->
    <div class="tabs portal-tabs-simple">`.replace('motion-div', 'div'), 'cab-cta');

rep('cabinet.html', '.tabs{display:flex;gap:4px;background:rgba(28,23,20,.06);border-radius:12px;padding:4px;width:fit-content;margin-bottom:24px;}',
`.tabs{display:flex;gap:4px;background:rgba(28,23,20,.06);border-radius:12px;padding:4px;width:fit-content;margin-bottom:24px;}
.portal-btn-new-order{width:100%;padding:16px 20px;font-size:1.05rem;font-weight:700;border-radius:14px;background:var(--accent);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,.35);}
.portal-btn-new-order:hover{background:var(--accent-hover);}
.portal-hero-hint{font-size:.76rem;color:var(--ink-soft);margin:10px 0 0;text-align:center;}
.portal-tabs-simple .tab{font-size:.82rem;padding:8px 14px;}
@media(max-width:640px){.portal-tabs-simple{flex-wrap:wrap;width:100%;}.portal-tabs-simple .tab{flex:1;min-width:0;text-align:center;font-size:.76rem;padding:8px 6px;}}`, 'cab-css');

rep('cabinet.html', `<button class="tab on" data-ptab="bls">📋 Mes bons de livraison</button>
      <button class="tab" data-ptab="orders">📝 Mes commandes en cours</button>
      <button class="tab" data-ptab="neworder" style="background:#dbeafe;color:#1d4ed8;border:1.5px solid #3b82f6;">+ Nouvelle commande</button>
      <button class="tab" data-ptab="factures">💰 Mes factures</button>
      <button class="tab" data-ptab="messages" id="tab-messages">💬 Messages`, `<button class="tab on" data-ptab="orders">Commandes</button>
      <button class="tab" data-ptab="bls">Livraisons</button>
      <button class="tab" data-ptab="factures">Factures</button>
      <button class="tab" data-ptab="messages" id="tab-messages">Messages`, 'cab-tabs');

rep('cabinet.html', 'function openPortalTab(id){\n  const btn=document.querySelector', 'function openPortalTab(id){\n  document.querySelectorAll(\'.portal-tabs-simple .tab\').forEach(function(t){t.classList.toggle(\'on\',t.dataset.ptab===id);});\n  const btn=document.querySelector', 'cab-open');
rep('cabinet.html', "showToast('👋 Bienvenue ! Commencez par \"Mes commandes\", puis \"Mes factures\".');", "showToast('👋 Bienvenue ! Appuyez sur « Nouvelle commande » pour envoyer une fiche au labo.');", 'cab-hint');
rep('cabinet.html', "{n:1,lbl:'Code patient'}", "{n:1,lbl:'Patient'}", 's1');
rep('cabinet.html', "{n:2,lbl:'Travail'}", "{n:2,lbl:'Prothèse'}", 's2');
rep('cabinet.html', "{n:4,lbl:'Notes'}", "{n:4,lbl:'Envoi'}", 's4');
rep('cabinet.html', 'Informations patient', 'Qui est le patient ?', 'st1');
rep('cabinet.html', 'Étape 1 sur 4 — Code patient et coordonnées.', 'Code interne uniquement (RGPD).', 'st1d');
rep('cabinet.html', '    <div id="ptab-bls">', '    <div id="ptab-bls" style="display:none;">', 'bls');
rep('cabinet.html', '    <div id="ptab-orders" style="display:none;">', '    <div id="ptab-orders">', 'orders');

rep('labo-mobile.html', `onclick="closeProfileSheet();var cab=cabinets&&cabinets[0];if(cab){showView('cabinets');}"`, `onclick="closeProfileSheet();showView('home');"`, 'm1');
rep('labo-mobile.html', '<span style="font-size:.94rem;font-weight:500;">Statistiques</span>', '<span style="font-size:.94rem;font-weight:500;">Résumé du jour</span>', 'm2');
rep('labo-mobile.html', '<span style="font-size:.94rem;font-weight:500;">Passer en mode bureau</span>', '<span style="font-size:.94rem;font-weight:500;">Réglages complets (bureau)</span>', 'm3');

rep('app.html', 'try{_maybeDeepLinkAdminPane();}catch(e){console.warn(\'admin deeplink\',e);}', 'try{_maybeOpenSettingsFromUrl();}catch(e){}\n            try{_maybeDeepLinkAdminPane();}catch(e){console.warn(\'admin deeplink\',e);}', 'deeplink');

console.log('done');
