import fs from 'fs';
import path from 'path';

const file = path.resolve(import.meta.dirname, '../app.html');
let s = fs.readFileSync(file, 'utf8');

// Remove duplicate "Tarifs par défaut" card in settings
s = s.replace(
  /\n    <!-- Tarifs par défaut -->\n    <div class="card" id="tarif-card" style="margin-top:18px;">[\s\S]*?    <\/motion>\n  <\/div>\n\n    <\/motion>/,
  '\n    </motion>'
);
s = s.replace(
  /\n    <!-- Tarifs par défaut -->\n    <div class="card" id="tarif-card" style="margin-top:18px;">[\s\S]*?      <\/div>\n    <\/motion>\n  <\/div>/,
  ''
);
// Try exact match from file
const tarifBlock = `
    <!-- Tarifs par défaut -->
    <motion class="card" id="tarif-card" style="margin-top:18px;">`;
if (s.includes('<!-- Tarifs par défaut -->')) {
  const i = s.indexOf('    <!-- Tarifs par défaut -->');
  const j = s.indexOf('    </motion>\n\n    </motion>', i);
  if (j > i) {
    // find closing of settings-sec-tarifs inner - actually structure is:
    // </motion> for tarif-card, then </motion> for settings-sec-tarifs
    const end = s.indexOf('    <div id="settings-sec-equipe"', i);
    if (end > i) s = s.slice(0, i) + s.slice(end);
  }
}

// Fix with div tags
const start = s.indexOf('    <!-- Tarifs par défaut -->');
const end = s.indexOf('    <motion id="settings-sec-equipe"');
if (start >= 0) {
  const endDiv = s.indexOf('    <div id="settings-sec-equipe"', start);
  if (endDiv >= 0) s = s.slice(0, start) + s.slice(endDiv);
}

// Update types card intro
s = s.replace(
  '<h2 data-i18n="h2.settings.types">🔧 Types de travaux &amp; tarifs</h2>\n        <p data-i18n="desc.types" style="font-size:.76rem;color:var(--ink-soft);margin-bottom:16px;">Gérez vos types de travaux et leur prix unitaire. Le prix est automatiquement proposé lors de la création d\'un bon de livraison.</p>',
  '<h2 data-i18n="h2.settings.types">💰 Prix de vos travaux</h2>\n        <p data-i18n="desc.types" style="font-size:.76rem;color:var(--ink-soft);margin-bottom:12px;line-height:1.5;">Indiquez le <strong>prix en euros</strong> de chaque type de travail (couronne, inlay, facette…). Ce prix sera proposé automatiquement sur les bons de livraison et les factures.</p>\n        <p style="font-size:.7rem;color:var(--ink-muted);margin-bottom:14px;padding:10px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">💡 Utilisez <strong>✏️ Modifier</strong> uniquement pour changer le nom, la catégorie ou les étapes de programmation (optionnel).</p>'
);

s = s.replace(
  '<h2>Types et tarifs</h2>',
  '<h2>Prix des travaux</h2>'
);

s = s.replace(
  '<span class="settings-row-title">Types de travaux et tarifs</span><span class="settings-row-desc">Catalogue, prix, étapes de programmation</span>',
  '<span class="settings-row-title">Prix des travaux</span><span class="settings-row-desc">Un prix par type (couronne, inlay, facette…)</span>'
);

// i18n
s = s.replace(
  "'desc.types':'Gérez vos types de travaux et leur prix unitaire. Le prix est automatiquement proposé lors de la création d\\'un bon de livraison.',",
  "'desc.types':'Indiquez le prix en euros de chaque type de travail. Ce prix est proposé sur les bons de livraison et les factures.',"
);

// Helpers after syncCustomTypesToTL
const anchor = 'syncCustomTypesToTL();\n\n// Reconstruit les selects';
const helpers = `syncCustomTypesToTL();

function getTypeUnitPrice(typeId){
  if(!typeId)return 0;
  const ct=customTypes.find(function(c){return c.id===typeId;});
  if(ct&&ct.prix!=null&&!isNaN(Number(ct.prix)))return Number(ct.prix);
  const tr=tarifs.find(function(t){return t.types&&t.types.includes(typeId);});
  return tr?Number(tr.prix)||0:0;
}

function migrateTarifsToCustomTypes(){
  let changed=false;
  customTypes.forEach(function(ct){
    if(ct.prix!=null&&Number(ct.prix)>0)return;
    const tr=tarifs.find(function(t){return t.types&&t.types.includes(ct.id);});
    if(tr&&tr.prix!=null){ct.prix=Number(tr.prix)||0;changed=true;}
  });
  if(changed)saveCustomTypes();
}

function syncTarifsFromCustomTypes(){
  customTypes.forEach(function(ct){
    const prix=Number(ct.prix)||0;
    const idx=tarifs.findIndex(function(t){return t.types&&t.types.includes(ct.id);});
    if(prix>0){
      const row={label:ct.label,prix,types:[ct.id]};
      if(idx>=0)tarifs[idx]=Object.assign({},tarifs[idx],row);
      else tarifs.push(Object.assign({id:'tp_'+ct.id},row));
    }else if(idx>=0){tarifs.splice(idx,1);}
  });
  saveTarifs();
}

migrateTarifsToCustomTypes();

// Reconstruit les selects`;

if (!s.includes('function getTypeUnitPrice')) {
  s = s.replace(anchor, helpers);
}

// renderCustomTypesList - use getTypeUnitPrice and clearer header
s = s.replace(
  `      const existingTarif=tarifs.find(function(tr){return tr.types&&tr.types.includes(t.id);});
      const prix=existingTarif?existingTarif.prix:0;`,
  `      const prix=getTypeUnitPrice(t.id);`
);

s = s.replace(
  `  let html='';
  catOrder.forEach(function(cat){
    html+='<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:10px 0 4px;">'+cat+'</div>';`,
  `  let html='<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:6px;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-muted);"><span style="flex:1;">Travail</span><span style="width:100px;text-align:right;">Prix (€)</span><span style="width:72px;"></span></div>';
  catOrder.forEach(function(cat){
    html+='<motion style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</motion>'.replace(/motion/g,'motion');`
);
s = s.replace(
  `html+='<motion style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</motion>'.replace(/motion/g,'motion');`,
  `html+='<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</motion>';`
);
// fix botched replace
s = s.replace(
  `html+='<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</motion>';`,
  `html+='<motion style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</motion>';`
);
s = s.split("'+cat+'</motion>'").join("'+cat+'</div>'");
s = s.split('<motion style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">').join('<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">');

s = s.replace(
  `'<input type="number" id="type-prix-'+t.id+'" min="0" step="0.01" value="'+(prix||'')+'" placeholder="0.00" title="Prix unitaire BDL" style="width:80px;`,
  `'<input type="number" id="type-prix-'+t.id+'" min="0" step="0.01" value="'+(prix||'')+'" placeholder="0.00" title="Prix unitaire" onchange="saveTypePriceQuick(\\''+t.id+'\\')" style="width:80px;`
);

// saveTypePrices
s = s.replace(
  `function saveTypePrices(){
  customTypes.forEach(function(ct){
    const input=document.getElementById('type-prix-'+ct.id);
    if(!input)return;
    const prix=parseFloat(input.value)||0;
    const idx=tarifs.findIndex(function(t){return t.types&&t.types.includes(ct.id);});
    if(prix>0){
      if(idx>=0){tarifs[idx].prix=prix;tarifs[idx].label=ct.label;}
      else{tarifs.push({id:String(Date.now())+ct.id,label:ct.label,prix:prix,types:[ct.id]});}
    } else {
      if(idx>=0)tarifs.splice(idx,1);
    }
  });
  saveTarifs();
  const msg=document.getElementById('ct-prix-msg')||document.getElementById('type-prices-msg');
  if(msg){msg.textContent=t('toast.prices_saved');setTimeout(function(){msg.textContent='';},2500);}
}`,
  `function saveTypePriceQuick(typeId){
  const input=document.getElementById('type-prix-'+typeId);
  const ct=customTypes.find(function(c){return c.id===typeId;});
  if(!input||!ct)return;
  ct.prix=parseFloat(input.value)||0;
  saveCustomTypes();
  syncTarifsFromCustomTypes();
}

function saveTypePrices(){
  customTypes.forEach(function(ct){
    const input=document.getElementById('type-prix-'+ct.id);
    if(!input)return;
    ct.prix=parseFloat(input.value)||0;
  });
  saveCustomTypes();
  syncTarifsFromCustomTypes();
  renderCustomTypesList();
  const msg=document.getElementById('ct-prix-msg');
  if(msg){msg.textContent=t('toast.prices_saved');setTimeout(function(){msg.textContent='';},2500);}
}`
);

// _findTarif
s = s.replace(
  `function _findTarif(typeId){
  if(!Array.isArray(tarifs))return null;
  return tarifs.find(function(t){return t.types&&t.types.includes(typeId);});
}`,
  `function _findTarif(typeId){
  if(!typeId)return null;
  const ct=customTypes.find(function(c){return c.id===typeId;});
  const prix=getTypeUnitPrice(typeId);
  if(!ct&&!prix)return null;
  return{label:ct?ct.label:(TYPE_LABELS[typeId]||typeId),prix: prix,types:[typeId]};
}`
);

// Remove renderTypePrices dead function
s = s.replace(/\nfunction renderTypePrices\(\)\{[\s\S]*?\n\}\n\nfunction saveTypePrices/, '\nfunction saveTypePriceQuick_PLACEHOLDER\nfunction saveTypePrices');
s = s.replace(/\nfunction saveTypePriceQuick_PLACEHOLDER\n/, '\n');

// openSettingsSection
s = s.replace(
  "  if(id==='paiements'){loadStripeConnectUI();}\n  try{sec.scrollIntoView",
  "  if(id==='paiements'){loadStripeConnectUI();}\n  if(id==='tarifs'){renderCustomTypesList();}\n  try{sec.scrollIntoView"
);

// facturation pane - drop renderTarifs
s = s.replace(
  "if(pane==='facturation'){renderToInvoice();renderToInvoice();renderBillDocs();updateBillStats();renderTarifs();syncBillCab();renderTarifTypeSel();}",
  "if(pane==='facturation'){renderToInvoice();renderToInvoice();renderBillDocs();updateBillStats();syncBillCab();}"
);

// btn-tarif-add guard
s = s.replace(
  "document.getElementById('btn-tarif-add').addEventListener('click',function(){",
  "var _btnTarifAdd=document.getElementById('btn-tarif-add');if(_btnTarifAdd)_btnTarifAdd.addEventListener('click',function(){"
);

// Onboarding phase 4
s = s.replace(
  `  // ─── PHASE 4 : PREMIER PRIX (main dans la main) ────────────────────────
  {target:null,title:"Direction : la facturation",
   body:"Les prix sont configurés dans l'onglet « Mes factures », tout en bas de la page. Cliquez sur « Allons-y » et je vous y emmène.",
   nextLabel:"Allons-y →",
   onNext:function(){
     var t=document.querySelector('.tab[data-pane="facturation"]');if(t)t.click();
     setTimeout(function(){var el=document.getElementById('tarif-card')||document.getElementById('tarif-label');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});},350);
   }},
  {target:'#tarif-card',placement:'top',title:"Renseignez votre premier prix",
   body:"Voici la section des prix. Le formulaire en bas vous permet d'ajouter une prestation et son tarif.\\n\\n• Prestation — par exemple « Couronne céramo-métallique »\\n• Prix (€) — par exemple 120\\n\\nQuand c'est rempli, cliquez sur Suivant. Vous pouvez aussi cliquer directement sur « + Ajouter » si vous préférez.",
   nextLabel:"Suivant : valider →",
   skipNextIfClicked:'#btn-tarif-add'},
  {target:'#btn-tarif-add',placement:'left',title:"Enregistrez ce prix",
   body:"Cliquez maintenant sur le bouton « + Ajouter » pour enregistrer cette prestation.\\n\\nAllez-y, je vous attends !",
   waitForClick:true},`,
  `  // ─── PHASE 4 : PREMIER PRIX ───────────────────────────────────────────
  {target:null,title:"Vos prix de travaux",
   body:"Chaque type (couronne, inlay, facette…) a un prix. On les configure dans Réglages → Prix des travaux.",
   nextLabel:"Allons-y →",
   onNext:function(){
     if(typeof goSettings==='function')goSettings();
     setTimeout(function(){if(typeof openSettingsSection==='function')openSettingsSection('tarifs');},400);
   }},
  {target:'#card-custom-types',placement:'top',title:"Indiquez le prix de chaque travail",
   body:"Dans la colonne de droite, saisissez le prix en euros pour chaque ligne (ex. 120 pour une couronne).\\n\\nPuis cliquez sur « Enregistrer les prix » en bas de la liste.",
   nextLabel:"Compris →"},`
);

fs.writeFileSync(file, s);
console.log('OK patch-unify-tarifs');
