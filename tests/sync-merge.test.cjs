/* Tests unitaires de la logique de fusion multi-poste (factures/BL).
 * Reproduit les algorithmes de LabMultiPoste.mergeRecords + filtrage des suppressions
 * (app.html) et vérifie : création concurrente, édition par récence, anti-résurrection. */
const assert = require('assert');

// ── Algorithmes (identiques au runtime) ──────────────────────────────────────
function recordKey(item){return item&&typeof item==='object'?String(item.id||item.jobId||item.trackCode||''):'';}
function recordTime(item){if(!item)return 0;var raw=item.updatedAt||item.modifiedAt||item.createdAt||item.savedAt||0;var t=new Date(raw).getTime();return isNaN(t)?0:t;}
function mergeRecords(localArr,remoteArr){
  var map=Object.create(null);
  function put(item){var k=recordKey(item);if(!k)return;var prev=map[k];if(!prev||recordTime(item)>=recordTime(prev))map[k]=item;}
  (remoteArr||[]).forEach(put);(localArr||[]).forEach(put);
  return Object.keys(map).map(function(k){return map[k];});
}
function filterDeleted(list,type,map){var sub=((map||{})[type])||{};return (list||[]).filter(function(r){return r&&!sub[String(r.id)];});}
function mergeDeleted(local,remote){
  local=JSON.parse(JSON.stringify(local||{}));
  Object.keys(remote||{}).forEach(function(ty){if(!local[ty])local[ty]={};var rs=remote[ty]||{};Object.keys(rs).forEach(function(id){var lt=local[ty][id]?new Date(local[ty][id]).getTime():0,rt=new Date(rs[id]).getTime();if((rt&&!lt)||rt>lt)local[ty][id]=rs[id];});});
  return local;
}
function mergeTyped(localArr,remoteArr,type,del){return filterDeleted(mergeRecords(localArr,remoteArr),type,del);}

let passed=0;
function t(name,fn){fn();passed++;console.log('  ✓ '+name);}

// 1) Création concurrente : A crée f1, B crée f2 → union des deux (rien perdu)
t('création concurrente → union', function(){
  const A=[{id:'f1',num:'F1',createdAt:'2026-06-22T10:00:00Z'}];
  const B=[{id:'f2',num:'F2',createdAt:'2026-06-22T10:00:05Z'}];
  const m=mergeTyped(B,A,'docs',{});
  const ids=m.map(function(x){return x.id;}).sort();
  assert.deepStrictEqual(ids,['f1','f2']);
});

// 2) Édition concurrente du même doc → la version la plus récente (updatedAt) gagne
t('édition concurrente → récence gagne', function(){
  const remote=[{id:'f1',status:'envoye',updatedAt:'2026-06-22T11:00:00Z'}];
  const local =[{id:'f1',status:'paye',  updatedAt:'2026-06-22T11:05:00Z'}];
  const m=mergeTyped(local,remote,'docs',{});
  assert.strictEqual(m.length,1);
  assert.strictEqual(m[0].status,'paye'); // local plus récent
});
t('édition concurrente → distant plus récent gagne', function(){
  const remote=[{id:'f1',status:'paye',  updatedAt:'2026-06-22T12:00:00Z'}];
  const local =[{id:'f1',status:'envoye',updatedAt:'2026-06-22T11:00:00Z'}];
  const m=mergeTyped(local,remote,'docs',{});
  assert.strictEqual(m[0].status,'paye'); // distant plus récent
});

// 3) Suppression : A supprime f1 (marqué), B l'a encore → fusion ne le ressuscite pas
t('suppression → pas de résurrection', function(){
  const del=mergeDeleted({},{docs:{f1:'2026-06-22T13:00:00Z'}});
  const local =[{id:'f1',num:'F1',createdAt:'2026-06-22T10:00:00Z'},{id:'f2',num:'F2'}];
  const remote=[{id:'f1',num:'F1',createdAt:'2026-06-22T10:00:00Z'},{id:'f2',num:'F2'}];
  const m=mergeTyped(local,remote,'docs',del);
  const ids=m.map(function(x){return x.id;}).sort();
  assert.deepStrictEqual(ids,['f2']); // f1 supprimée reste supprimée
});

// 4) Fusion des maps de suppression (union, ts le plus récent)
t('fusion des suppressions (union)', function(){
  const a={docs:{f1:'2026-06-22T13:00:00Z'}};
  const b={docs:{f2:'2026-06-22T14:00:00Z'},bdl:{b1:'2026-06-22T09:00:00Z'}};
  const m=mergeDeleted(a,b);
  assert.deepStrictEqual(Object.keys(m.docs).sort(),['f1','f2']);
  assert.strictEqual(m.bdl.b1,'2026-06-22T09:00:00Z');
});

// 5) Scénario réel : A facture + B BL en simultané, puis chacun re-fusionne
t('A facture pendant B BL → aucun ne perd son travail', function(){
  // état serveur initial vide ; A ajoute une facture, B ajoute un BL
  const aDocs=[{id:'fA',num:'FA',createdAt:'2026-06-22T10:00:00Z'}];
  const bBls =[{id:'blB',num:'BLB',createdAt:'2026-06-22T10:00:01Z'}];
  // A sauvegarde -> serveur a docs=[fA], bdl=[]
  // B re-fusionne avant sa sauvegarde : ses bdl + docs serveur
  const bDocsAfterMerge=mergeTyped([],aDocs,'docs',{}); // B récupère la facture de A
  const bBlsAfterMerge =mergeTyped(bBls,[],'bdl',{});
  assert.deepStrictEqual(bDocsAfterMerge.map(function(x){return x.id;}),['fA']);
  assert.deepStrictEqual(bBlsAfterMerge.map(function(x){return x.id;}),['blB']);
});

// ── Fusion de la config des types PAR TYPE (anti-perte des techniciens) ───────
// Reproduit _mergeCustomTypesByType (app.html).
function ctRev(ct){var t=ct&&ct._rev?new Date(ct._rev).getTime():0;return isNaN(t)?0:t;}
function ctTechCount(ct){
  if(!ct||!Array.isArray(ct.steps))return 0;
  return ct.steps.reduce(function(n,s){
    if(!s)return n;
    if(s.sameAs!==null&&s.sameAs!==undefined)return n+1;
    if(s.tech&&s.tech!=='auto'&&!(Array.isArray(s.tech)&&!s.tech.length))return n+1;
    return n;
  },0);
}
function mergeCustomTypesByType(localArr,remoteArr,delMap){
  var sub=((delMap||{})['ctypes'])||{};
  var map=Object.create(null);
  function pick(a,b){
    if(!a)return b;if(!b)return a;
    var ra=ctRev(a),rb=ctRev(b);
    if(ra!==rb)return ra>rb?a:b;
    var ta=ctTechCount(a),tb=ctTechCount(b);
    if(ta!==tb)return ta>tb?a:b;
    return a;
  }
  (remoteArr||[]).forEach(function(ct){if(ct&&ct.id)map[ct.id]=ct;});
  (localArr||[]).forEach(function(ct){if(ct&&ct.id)map[ct.id]=pick(ct,map[ct.id]);});
  return Object.keys(map).filter(function(id){
    var delTs=sub[id]?new Date(sub[id]).getTime():0;
    if(!delTs)return true;
    return ctRev(map[id])>delTs;
  }).map(function(id){return map[id];});
}

// 6) Le poste qui a édité les techniciens NE perd pas ses affectations face à un poste « tout Auto »
t('config types : techniciens conservés malgré une config Auto concurrente', function(){
  const edited=[{id:'crown',label:'Couronne',_rev:'2026-06-23T10:00:00Z',steps:[{label:'Modélisation',tech:'tom',dayOffset:1},{label:'Glaçage',tech:'marie',dayOffset:2}]}];
  const autoStale=[{id:'crown',label:'Couronne',steps:[{label:'Modélisation',tech:'auto',dayOffset:1},{label:'Glaçage',tech:'auto',dayOffset:2}]}];
  // distant = config éditée (récente), local = config périmée Auto → la fusion garde les techs
  const m1=mergeCustomTypesByType(autoStale,edited,{});
  assert.strictEqual(m1[0].steps[0].tech,'tom');
  // et symétriquement (local édité, distant Auto sans _rev) : techs conservés via le filet de comptage
  const autoNoRev=[{id:'crown',label:'Couronne',steps:[{label:'Modélisation',tech:'auto',dayOffset:1}]}];
  const editedNoRev=[{id:'crown',label:'Couronne',steps:[{label:'Modélisation',tech:'tom',dayOffset:1}]}];
  const m2=mergeCustomTypesByType(editedNoRev,autoNoRev,{});
  assert.strictEqual(m2[0].steps[0].tech,'tom');
});

// 7) Récence par type : édition plus récente d'un type gagne, les autres types sont préservés (union)
t('config types : édition récente gagne, union des types préservée', function(){
  const local =[{id:'a',label:'A',_rev:'2026-06-23T09:00:00Z',steps:[{label:'s',tech:'tom',dayOffset:1}]},
                {id:'b',label:'B',_rev:'2026-06-23T08:00:00Z',steps:[]}];
  const remote=[{id:'a',label:'A',_rev:'2026-06-23T11:00:00Z',steps:[{label:'s',tech:'marie',dayOffset:1}]},
                {id:'c',label:'C',_rev:'2026-06-23T07:00:00Z',steps:[]}];
  const m=mergeCustomTypesByType(local,remote,{});
  const byId={};m.forEach(function(x){byId[x.id]=x;});
  assert.deepStrictEqual(Object.keys(byId).sort(),['a','b','c']);   // union : aucun type perdu
  assert.strictEqual(byId.a.steps[0].tech,'marie');                 // a : version distante plus récente
});

// 8) Suppression d'un type : pas de résurrection (sauf ré-édition postérieure)
t('config types : suppression non ressuscitée, ré-édition conservée', function(){
  const del={ctypes:{old:'2026-06-23T10:00:00Z'}};
  const m=mergeCustomTypesByType(
    [{id:'keep',label:'K',steps:[]}],
    [{id:'old',label:'Old',steps:[]},{id:'keep',label:'K',steps:[]}],del);
  assert.deepStrictEqual(m.map(function(x){return x.id;}).sort(),['keep']); // 'old' supprimé reste supprimé
  // ré-édité APRÈS la suppression → revient
  const m2=mergeCustomTypesByType(
    [{id:'old',label:'Old',_rev:'2026-06-23T12:00:00Z',steps:[{label:'s',tech:'tom',dayOffset:1}]}],
    [],del);
  assert.deepStrictEqual(m2.map(function(x){return x.id;}),['old']);
});

console.log('\nsync-merge: '+passed+' tests OK');
