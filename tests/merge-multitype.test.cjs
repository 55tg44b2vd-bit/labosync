/* Fusion multi-types par famille (_mergeStepsByFamily).
   Extrait le vrai code d'app.html ET labo-mobile.html, vérifie le cas du patron
   (inlay core + couronne céramo-métallique en numérique) et la parité desktop↔mobile. */
'use strict';
const fs=require('fs');
const assert=require('assert');
const vm=require('vm');

function extractFn(src,name){
  const sig='function '+name+'(';
  const start=src.indexOf(sig);
  if(start<0)throw new Error('introuvable: '+name);
  let depth=0;
  for(let p=src.indexOf('{',start);p<src.length;p++){
    if(src[p]==='{')depth++;
    else if(src[p]==='}'){depth--;if(depth===0)return src.slice(start,p+1);}
  }
  throw new Error('accolade non fermée: '+name);
}
function load(path){
  const code=extractFn(fs.readFileSync(path,'utf8'),'_mergeStepsByFamily');
  const ctx={String:String,Array:Array,Object:Object};vm.createContext(ctx);vm.runInContext(code,ctx);
  return ctx._mergeStepsByFamily;
}
const D=load('app.html');
const M=load('labo-mobile.html');

// Workflows numériques (emp) des 2 types, tels que configurés par le labo.
function buildOne(it){
  if(it.type==='inlay_only')return [
    {label:'récupération empreinte',tech:'fabien',nb:1},
    {label:'modélisation inlay core',tech:'leeloo',nb:1},
    {label:'impression modèle',tech:'fabien',nb:1,sameTechAsLabel:'récupération empreinte'}
  ];
  // Couronne céramo-métallique (libellés volontairement DIFFÉRENTS pour tester le dédoublonnage souple)
  return [
    {label:'récupération des empreintes',tech:'fabien',nb:1},
    {label:'modélisation chappe métal',tech:'leeloo',nb:1},
    {label:'impression model',tech:'fabien',nb:1,sameTechAsLabel:'récupération des empreintes'},
    {label:'montage céramique cosmétique',tech:'kris',nb:1}
  ];
}
const items=[{type:'inlay_only',nb:1},{type:'ccm',nb:1}];

let passed=0;function ok(n){passed++;console.log('  ✓ '+n);}

function run(fn){return fn(items,buildOne);}
const d=run(D);

// 1) Une SEULE empreinte (les 2 "récupération…" fusionnent malgré les libellés différents)
const scans=d.filter(s=>/empreinte/i.test(s.label));
assert.strictEqual(scans.length,1,'devrait y avoir 1 seule prise d\'empreinte, vu: '+JSON.stringify(d.map(s=>s.label)));
ok('une seule empreinte (dédoublonnage souple des libellés)');

// 2) Une SEULE impression de modèle
const prints=d.filter(s=>/impression/i.test(s.label));
assert.strictEqual(prints.length,1,'devrait y avoir 1 seule impression de modèle, vu: '+JSON.stringify(d.map(s=>s.label)));
ok('une seule impression de modèle');

// 3) Les 2 modélisations (inlay core + chappe) le MÊME jour (parallèle)
const mInlay=d.find(s=>/inlay core/i.test(s.label));
const mChappe=d.find(s=>/chappe/i.test(s.label));
assert.ok(mInlay&&mChappe,'les deux modélisations présentes');
assert.strictEqual(mInlay.wd,mChappe.wd,'modélisation inlay core et chappe le même jour (parallèle)');
ok('modélisations inlay core + chappe en parallèle (wd='+mInlay.wd+')');

// 4) Ordre du pipeline : empreinte < modélisation < impression < montage
const wd=lbl=>d.find(s=>new RegExp(lbl,'i').test(s.label)).wd;
assert.ok(wd('empreinte')<mInlay.wd,'empreinte avant modélisation');
assert.ok(mInlay.wd<wd('impression'),'modélisation avant impression');
assert.ok(wd('impression')<wd('montage'),'impression avant montage');
ok('pipeline cohérent empreinte→modélisation→impression→montage');

// 5) Jours consécutifs (1,2,3,4) sans trou
const days=Array.from(new Set(d.map(s=>s.wd))).sort((a,b)=>a-b);
assert.deepStrictEqual(days,[1,2,3,4],'jours consécutifs, vu: '+JSON.stringify(days));
ok('jours consécutifs 1→4');

// 6) PARITÉ desktop ≡ mobile (mêmes libellés/jours/techs)
const m=run(M);
const sig=a=>a.map(s=>s.label+'|'+s.wd+'|'+s.tech).join(';');
assert.strictEqual(sig(d),sig(m),'parité desktop↔mobile rompue:\n  D='+sig(d)+'\n  M='+sig(m));
ok('parité desktop ↔ mobile');

// 7) Lien « même technicien que » préservé sur l'impression conservée
const print=prints[0];
assert.ok(print.sameTechAsLabel&&/empreinte/i.test(print.sameTechAsLabel),'lien tech de l\'impression conservé');
ok('lien « même technicien que » conservé');

console.log('\n'+passed+' tests fusion multi-types passés ✅');
