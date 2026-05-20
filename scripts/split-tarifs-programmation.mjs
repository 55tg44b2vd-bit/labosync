import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const appPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
let s = readFileSync(appPath, 'utf8');

const start = s.indexOf('function renderCustomTypesList(){');
const end = s.indexOf('\nfunction _openTypeForm(', start);
if (start < 0 || end < 0) {
  console.error('renderCustomTypesList block not found');
  process.exit(1);
}

const newFn = `function _groupCustomTypesByCategory(){
  const cats={};const catOrder=[];
  customTypes.forEach(function(t){
    if(!cats[t.category]){cats[t.category]=[];catOrder.push(t.category);}
    cats[t.category].push(t);
  });
  return {cats:cats,catOrder:catOrder};
}
function renderTarifsList(){
  const el=document.getElementById('ct-list');if(!el)return;
  if(!customTypes.length){
    el.innerHTML='<div style="font-size:.78rem;color:var(--ink-soft);font-style:italic;padding:6px 0;">'+t('empty.types')+'</div>';
    return;
  }
  const g=_groupCustomTypesByCategory();
  let html='<motion.div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:6px;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-muted);"><span style="flex:1;">Travail</span><span style="width:100px;text-align:right;">Prix (€)</span></div>';
  g.catOrder.forEach(function(cat){
    html+='<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</div>';
    g.cats[cat].forEach(function(t){
      const prix=getTypeUnitPrice(t.id);
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border-soft);margin-bottom:3px;">'+
        '<div style="flex:1;font-weight:500;font-size:.84rem;">'+escHtml(t.label)+'</div>'+
        '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">'+
          '<input type="number" id="type-prix-'+t.id+'" min="0" step="0.01" value="'+(prix||'')+'" placeholder="0.00" title="Prix unitaire" onchange="saveTypePriceQuick(\\''+t.id+'\\')" style="width:80px;border:1.5px solid var(--border);border-radius:6px;background:var(--bg);font-family:monospace;font-size:.82rem;padding:5px 7px;color:var(--ink);text-align:right;outline:none;"/>'+
          '<span style="font-size:.75rem;color:var(--ink-soft);">€</span>'+
        '</div>'+
      '</div>';
    });
  });
  html+='<div style="display:flex;align-items:center;gap:10px;margin-top:12px;">'+
    '<button onclick="saveTypePrices()" style="background:#2a6049;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-family:monospace;font-size:.78rem;font-weight:500;cursor:pointer;">💾 Enregistrer les prix</button>'+
    '<span id="ct-prix-msg" style="font-size:.74rem;color:#2a6049;"></span>'+
  '</div>';
  el.innerHTML=html;
}
function renderProgTypesList(){
  const el=document.getElementById('prog-list');if(!el)return;
  if(!customTypes.length){
    el.innerHTML='<div style="font-size:.78rem;color:var(--ink-soft);font-style:italic;padding:6px 0;">'+t('empty.types')+'</div>';
    return;
  }
  const g=_groupCustomTypesByCategory();
  let html='';
  g.catOrder.forEach(function(cat){
    html+='<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:14px 0 4px;">'+cat+'</motion.div>';
    g.cats[cat].forEach(function(t){
      const stepsHtml=(t.steps||[]).map(function(s){
        const techLabel=s.sameAs!==null&&s.sameAs!==undefined?'🔗 ét.'+(s.sameAs+1):(!s.tech||s.tech==='auto')?'Auto':Array.isArray(s.tech)?s.tech.map(function(k){return TECHS[k]?TECHS[k].label:k;}).join(' / '):(TECHS[s.tech]?TECHS[s.tech].label:s.tech);
        return '<span style="font-size:.59rem;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:1px 6px;white-space:nowrap;">J+'+s.dayOffset+' '+s.label+' → '+techLabel+'</span>'+(t.stepsEmp?'<span style="font-size:.55rem;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:1px 5px;white-space:nowrap;">📡 emp</span>':'');
      }).join(' ');
      html+='<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border-soft);margin-bottom:3px;">'+
        '<div style="flex:1;">'+
          '<div style="font-weight:500;font-size:.84rem;">'+escHtml(t.label)+'</div>'+
          (stepsHtml?'<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px;">'+stepsHtml+'</div>':'<div style="margin-top:4px;font-size:.72rem;color:var(--ink-muted);font-style:italic;">Aucune étape — programmation manuelle uniquement</div>')+
        '</div>'+
        '<button onclick="editCustomType(\\''+t.id+'\\')" title="Modifier ce type" style="flex-shrink:0;background:none;border:1px solid var(--border);border-radius:5px;padding:2px 9px;cursor:pointer;font-size:.68rem;color:var(--ink-soft);">✏️ Modifier</button>'+
        '<button onclick="deleteCustomType(\\''+t.id+'\\')" title="Supprimer ce type" style="flex-shrink:0;background:none;border:1px solid #e0c8c8;border-radius:5px;padding:2px 9px;cursor:pointer;font-size:.68rem;color:#c0392b;">✕</button>'+
      '</div>';
    });
  });
  el.innerHTML=html;
}
function renderCustomTypesList(){
  renderTarifsList();
  renderProgTypesList();
}`;

const clean = newFn.replace(/<\/?motion\.div/g, (m) => m.replace('motion.', ''));
s = s.slice(0, start) + clean + s.slice(end);

const edits = [
  [
    `function editCustomType(id){
  const t=customTypes.find(function(c){return c.id===id;});
  if(!t)return;
  _openTypeForm(t.label,t.category,t.steps,t.stepsEmp,id);
  document.getElementById('ct-form').scrollIntoView({behavior:'smooth',block:'nearest'});
}`,
    `function editCustomType(id){
  const t=customTypes.find(function(c){return c.id===id;});
  if(!t)return;
  if(_settingsSectionOpen!=='programmation'&&typeof openSettingsSection==='function')openSettingsSection('programmation');
  _openTypeForm(t.label,t.category,t.steps,t.stepsEmp,id);
  document.getElementById('ct-form').scrollIntoView({behavior:'smooth',block:'nearest'});
}`,
  ],
  [
    `function showCustomTypeForm(){_openTypeForm('','',null,null,null);}`,
    `function showCustomTypeForm(){
  if(_settingsSectionOpen!=='programmation'&&typeof openSettingsSection==='function')openSettingsSection('programmation');
  _openTypeForm('','',null,null,null);
}`,
  ],
];

for (const [a, b] of edits) {
  if (!s.includes(a)) console.warn('skip edit:', a.slice(0, 40));
  else s = s.replace(a, b);
}

s = s.replace('Ouvrir « Prix des travaux »', 'Ouvrir « Tarifs »');
s = s.replace('Réglages → Prix des travaux', 'Réglages → Tarifs');
s = s.replace(
  "{target:'#card-custom-types',placement:'top',title:\"Indiquez le prix de chaque travail\"",
  "{target:'#card-tarifs',placement:'top',title:\"Indiquez le prix de chaque travail\""
);

writeFileSync(appPath, s);
console.log('OK');
