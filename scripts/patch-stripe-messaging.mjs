import fs from 'fs';
import path from 'path';

const file = path.resolve(import.meta.dirname, '../app.html');
let s = fs.readFileSync(file, 'utf8');

const stripeOldReal = `        <p style="font-size:.76rem;color:var(--ink-soft);margin-bottom:14px;">Permettez à vos cabinets dentaires de payer leurs factures en ligne. Chaque laboratoire renseigne sa propre clé secrète Stripe (compte du labo) : elle est enregistrée sur cet appareil pour générer les liens de paiement et n'est jamais visible côté dentiste. Vous pouvez aussi définir <code>STRIPE_SECRET_KEY</code> sur Netlify comme repli pour les appareils sans clé locale.</p>
        <div style="margin-bottom:12px;">
          <motion style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:5px;">Clé secrète Stripe</motion>
          <motion style="font-size:.68rem;color:var(--ink-soft);margin-bottom:6px;">Trouvez-la sur <strong>dashboard.stripe.com → Développeurs → Clés API → Clé secrète</strong></motion>
          <motion style="display:flex;gap:8px;align-items:center;">
            <input type="password" id="stripe-key-input" placeholder="sk_live_... ou sk_test_..." style="flex:1;font-family:monospace;font-size:.82rem;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);outline:none;"/>
            <button onclick="toggleStripeKeyVisibility()" style="background:none;border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;cursor:pointer;font-size:.85rem;" title="Afficher/masquer">👁️</button>
          </motion>
        </motion>
        <motion style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn btn-a" id="btn-stripe-save">💾 Enregistrer</button>
          <div id="stripe-status" style="font-size:.75rem;"></motion>
        </motion>`;

// Use div tags (file uses div, not motion)
const stripeOld = stripeOldReal.replace(/motion/g, 'div');

const stripeNew = `        <p style="font-size:.76rem;color:var(--ink-soft);margin-bottom:14px;">Connectez le compte Stripe de votre laboratoire en un clic. Les paiements des cabinets arrivent directement sur votre compte Stripe.</p>
        <div id="stripe-connect-status" style="font-size:.82rem;margin-bottom:14px;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--ink-soft);">Vérification du compte…</div>
        <motion style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
          <button type="button" class="btn btn-a" id="btn-stripe-connect" style="background:#635bff;border:none;min-width:200px;">Connecter mon compte Stripe</button>
          <button type="button" class="btn btn-b" id="btn-stripe-disconnect" style="display:none;">Déconnecter</button>
        </motion>
        <details style="font-size:.74rem;color:var(--ink-soft);border:1px solid var(--border);border-radius:10px;padding:10px 12px;">
          <summary style="cursor:pointer;font-weight:600;color:var(--ink);">Mode avancé : clé API manuelle</summary>
          <p style="margin:10px 0 8px;line-height:1.45;">Réservé au dépannage. Préférez la connexion Stripe ci-dessus.</p>
          <motion style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <input type="password" id="stripe-key-input" placeholder="sk_live_... ou sk_test_..." style="flex:1;font-family:monospace;font-size:.82rem;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);outline:none;"/>
            <button type="button" onclick="toggleStripeKeyVisibility()" style="background:none;border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;cursor:pointer;font-size:.85rem;" title="Afficher/masquer">👁️</button>
          </motion>
          <button type="button" class="btn btn-b" id="btn-stripe-save">Enregistrer la clé locale</button>
        </details>`;

const stripeNewClean = stripeNew.replace(/motion/g, 'div');

if (!s.includes(stripeOld)) throw new Error('stripe HTML block not found');
s = s.replace(stripeOld, stripeNewClean);

const oldJs = `function loadStripeKeyUI(){
  const inp=document.getElementById('stripe-key-input');
  if(!inp)return;
  inp.value='';
  const status=document.getElementById('stripe-status');
  if(status){
    status.innerHTML='<span style="color:var(--ink-soft);font-size:.72rem;">Configuration Stripe gérée côté serveur</span>';
  }
}

document.getElementById('btn-stripe-save').addEventListener('click',async function(){
  const msg=document.getElementById('stripe-msg');
  localStorage.removeItem('lb_stripe_key');
  msg.style.color='var(--ink-soft)';
  msg.textContent='La clé Stripe doit être configurée dans les variables serveur.';
  loadStripeKeyUI();
  setTimeout(function(){msg.textContent='';},4000);
});`;

const newJs = `function stripeConnectHeaders(){
  const h={'Content-Type':'application/json'};
  if(_cachedAccessToken)h.Authorization='Bearer '+_cachedAccessToken;
  return h;
}

async function loadStripeConnectUI(){
  const el=document.getElementById('stripe-connect-status');
  const btnConnect=document.getElementById('btn-stripe-connect');
  const btnDisc=document.getElementById('btn-stripe-disconnect');
  if(!el)return;
  if(!_cachedAccessToken){
    el.innerHTML='<span style="color:#c0392b;">Connectez-vous pour lier Stripe.</span>';
    return;
  }
  el.textContent='Vérification…';
  try{
    const resp=await fetch('/.netlify/functions/stripe-connect-status',{method:'POST',headers:stripeConnectHeaders(),body:'{}'});
    const data=await resp.json().catch(function(){return {};});
    if(!resp.ok){
      el.innerHTML='<span style="color:#c0392b;">'+(data.error||'Erreur Stripe ('+resp.status+')')+'</span>';
      return;
    }
    if(data.connected){
      el.innerHTML='<span style="color:#059669;font-weight:600;">✓ Compte Stripe connecté</span> · <code style="font-size:.7rem;">'+(data.stripeAccountId||'')+'</code>';
      if(btnDisc)btnDisc.style.display='inline-flex';
      if(btnConnect)btnConnect.style.display='none';
    }else{
      el.textContent='Aucun compte Stripe lié. Cliquez sur le bouton pour connecter votre compte.';
      if(btnDisc)btnDisc.style.display='none';
      if(btnConnect)btnConnect.style.display='inline-flex';
    }
  }catch(e){
    el.textContent='Réseau indisponible. Réessayez.';
  }
  loadStripeKeyUI();
}

function loadStripeKeyUI(){
  const inp=document.getElementById('stripe-key-input');
  if(inp){
    const saved=localStorage.getItem('lb_stripe_key')||'';
    if(saved)inp.value=saved;
  }
}

async function startStripeConnectDesktop(){
  if(!_cachedAccessToken){showToast('Connectez-vous d’abord','#c0392b');return;}
  const btn=document.getElementById('btn-stripe-connect');
  if(btn){btn.disabled=true;btn.textContent='Redirection…';}
  try{
    const resp=await fetch('/.netlify/functions/stripe-connect-start',{
      method:'POST',
      headers:stripeConnectHeaders(),
      body:JSON.stringify({appUrl:window.location.origin+window.location.pathname})
    });
    const data=await resp.json().catch(function(){return {};});
    if(!resp.ok||!data.url){
      showToast(data.error||'Connexion Stripe impossible','#c0392b');
      if(btn){btn.disabled=false;btn.textContent='Connecter mon compte Stripe';}
      return;
    }
    window.location.href=data.url;
  }catch(e){
    showToast('Erreur réseau','#c0392b');
    if(btn){btn.disabled=false;btn.textContent='Connecter mon compte Stripe';}
  }
}

async function disconnectStripeDesktop(){
  if(!confirm('Déconnecter le compte Stripe ?'))return;
  try{
    const resp=await fetch('/.netlify/functions/stripe-connect-disconnect',{method:'POST',headers:stripeConnectHeaders(),body:'{}'});
    if(!resp.ok){showToast('Déconnexion impossible','#c0392b');return;}
    showToast('Stripe déconnecté','#059669');
    loadStripeConnectUI();
  }catch(e){showToast('Erreur réseau','#c0392b');}
}

function handleStripeConnectReturnDesktop(){
  var sc,msg;
  try{
    var sp=new URLSearchParams(location.search||'');
    sc=sp.get('stripe_connect');
    msg=sp.get('stripe_connect_msg')||'';
  }catch(e){return;}
  if(!sc)return;
  history.replaceState({},'',location.pathname+(location.hash||''));
  if(sc==='success'){
    showToast('Compte Stripe connecté','#059669');
    loadStripeConnectUI();
  }else{
    showToast('Stripe : '+(msg||'erreur'),'#c0392b');
  }
}

async function republishAllPortals(){
  if(!currentUser||!_cachedAccessToken)return;
  for(const cab of cabinets){
    if(cab&&cab.portalId){
      try{await publishPortal(cab);}catch(e){console.warn('republish',cab.name,e);}
    }
  }
}

document.getElementById('btn-stripe-connect').addEventListener('click',startStripeConnectDesktop);
document.getElementById('btn-stripe-disconnect').addEventListener('click',disconnectStripeDesktop);

document.getElementById('btn-stripe-save').addEventListener('click',async function(){
  const msg=document.getElementById('stripe-msg');
  const key=(document.getElementById('stripe-key-input').value||'').trim();
  if(key&&!/^sk_(live|test)_/.test(key)){
    msg.style.color='#c0392b';
    msg.textContent='Clé invalide (doit commencer par sk_live_ ou sk_test_)';
    return;
  }
  if(key)localStorage.setItem('lb_stripe_key',key);
  else localStorage.removeItem('lb_stripe_key');
  msg.style.color='#059669';
  msg.textContent=key?'Clé locale enregistrée (secours). Utilisez Stripe Connect de préférence.':'Clé locale supprimée.';
  setTimeout(function(){msg.textContent='';},4000);
});`;

if (!s.includes(oldJs)) throw new Error('stripe JS block not found');
s = s.replace(oldJs, newJs);

if (!s.includes("if(id==='paiements'){loadStripeConnectUI();}")) {
  s = s.replace(
    '  _settingsSectionOpen=id;\n  try{sec.scrollIntoView',
    "  _settingsSectionOpen=id;\n  if(id==='paiements'){loadStripeConnectUI();}\n  try{sec.scrollIntoView"
  );
}

if (!s.includes('handleStripeConnectReturnDesktop')) {
  s = s.replace(
    "    _withTimeout(cloudRestore(true),18000,'cloudRestore').then(function(){\n      if(typeof render==='function')render();\n      refreshTechSelects();refreshTypeSelects();applyProgMode();\n    }).catch(function(e2){console.warn('cloudRestore',e2);});",
    `    try{handleStripeConnectReturnDesktop();}catch(eSc){}
    _withTimeout(cloudRestore(true),18000,'cloudRestore').then(function(){
      if(typeof render==='function')render();
      refreshTechSelects();refreshTypeSelects();applyProgMode();
      if(typeof renderMessagesPane==='function')renderMessagesPane();
      try{startChatBgPoll();}catch(eChat){}
      republishAllPortals().catch(function(e){console.warn('republishAllPortals',e);});
    }).catch(function(e2){console.warn('cloudRestore',e2);});`
  );
}

if (!s.includes('if(p.cabinets&&(p.cabinets.length')) {
  s = s.replace(
    '    if(p.cabinets)cabinets=p.cabinets;',
    '    if(p.cabinets&&(p.cabinets.length>0||!cabinets.length))cabinets=p.cabinets;'
  );
}

const msgPaneOld = `async function renderMessagesPane(){
  if(_isRenderingMessagesPane) return;
  _isRenderingMessagesPane = true;
  const el = document.getElementById('messages-cab-list');
  if(!cabinets.length){
    el.innerHTML = '<div class="empty">'+t('empty.cabinets')+'</div>';
    _isRenderingMessagesPane = false;
    return;
  }
  const withPortal=cabinets.filter(function(c){return c.portalId;});
  const withoutPortal=cabinets.filter(function(c){return !c.portalId;});
  el.innerHTML = withPortal.map(function(cab){`;

const msgPaneNew = `async function renderMessagesPane(){
  if(_isRenderingMessagesPane) return;
  _isRenderingMessagesPane = true;
  const el = document.getElementById('messages-cab-list');
  if(!el){_isRenderingMessagesPane=false;return;}
  if(!cabinets.length){
    el.innerHTML = '<div class="empty">'+t('empty.cabinets')+'</div><p style="text-align:center;font-size:.76rem;color:var(--ink-soft);margin-top:8px;">Ajoutez un cabinet dans <strong>Dentistes</strong>, puis publiez son portail.</p>';
    _isRenderingMessagesPane = false;
    return;
  }
  const withPortal=cabinets.filter(function(c){return c.portalId;});
  const withoutPortal=cabinets.filter(function(c){return !c.portalId;});
  if(!withPortal.length){
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--ink-soft);font-size:.84rem;line-height:1.5;">Aucun cabinet avec portail actif.<br/>Allez dans <strong>Dentistes</strong>, ouvrez chaque cabinet et <strong>publiez le portail</strong>.</div>';
  }else{
  el.innerHTML = withPortal.map(function(cab){`;

if (!s.includes(msgPaneOld)) throw new Error('renderMessagesPane header not found');
s = s.replace(msgPaneOld, msgPaneNew);

s = s.replace(
  `  }).join('');
  if(withoutPortal.length){
    el.innerHTML+=withoutPortal.map(function(cab){
      return '<div style="padding:12px 16px;border:1px dashed var(--border);border-radius:10px;margin-bottom:8px;font-size:.78rem;color:var(--ink-soft);">'
        +chatEscH(cab.name)+' — pas de portail (Paramètres → Dentistes → publier le portail).'
        +'</div>';
    }).join('');
  }
  await Promise.all(withPortal.map(async function(cab){`,
  `  }).join('');
  }
  if(withoutPortal.length){
    el.innerHTML+=withoutPortal.map(function(cab){
      return '<div style="padding:12px 16px;border:1px dashed var(--border);border-radius:10px;margin-bottom:8px;font-size:.78rem;color:var(--ink-soft);">'
        +chatEscH(cab.name)+' — pas de portail (Dentistes → publier le portail).'
        +'</div>';
    }).join('');
  }
  await Promise.all(withPortal.map(async function(cab){`
);

s = s.replace(
  `      if(!r.ok){
        _noteChatPollResult(cab.portalId,false);
        return;
      }`,
  `      if(!r.ok){
        _noteChatPollResult(cab.portalId,false);
        if(r.status===401)showToast('Messagerie : accès refusé pour '+cab.name+' — republiez le portail','#c0392b',5000);
        return;
      }`
);

s = s.replace(
  `    if(!r.ok){
      _noteChatPollResult(_chatPortalId,false);
      return;
    }`,
  `    if(!r.ok){
      _noteChatPollResult(_chatPortalId,false);
      if(r.status===401)showToast('Chat : accès refusé — republiez le portail du cabinet','#c0392b');
      else if(scrollToBottom)showToast('Impossible de charger le chat ('+r.status+')','#c0392b');
      return;
    }`
);

fs.writeFileSync(file, s);
console.log('OK');
