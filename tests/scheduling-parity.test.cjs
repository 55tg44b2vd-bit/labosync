/* Parité desktop ↔ mobile du moteur de lissage de charge.
   On EXTRAIT le vrai code de _levelTasksLoad (+ helpers de dates) de app.html ET
   labo-mobile.html, on l'exécute dans deux bacs à sable avec les mêmes stubs, et on
   vérifie qu'ils produisent des programmations IDENTIQUES. Détecte toute dérive de copie. */
'use strict';
const fs=require('fs');
const assert=require('assert');
const vm=require('vm');

// Extrait `function NAME(...) { ... }` (accolades équilibrées) du source.
function extractFn(src,name){
  const sig='function '+name+'(';
  const start=src.indexOf(sig);
  if(start<0)throw new Error('introuvable: '+name);
  let i=src.indexOf('{',start);
  let depth=0;
  for(let p=i;p<src.length;p++){
    const ch=src[p];
    if(ch==='{')depth++;
    else if(ch==='}'){depth--;if(depth===0)return src.slice(start,p+1);}
  }
  throw new Error('accolade non fermée: '+name);
}

function buildSandbox(htmlPath){
  const html=fs.readFileSync(htmlPath,'utf8');
  const names=['addWD','subWD','countWD','_loadLevelingActive','_levelTasksLoad','_toothZone','_zoneFromTeeth','_scoreTech'];
  const code=names.map(n=>extractFn(html,n)).join('\n');
  const ctx={
    jobs:[],TECHS:{},_progCfg:{loadLeveling:true},
    _techCapacity:function(k){var c=(ctx.TECHS[k]&&parseInt(ctx.TECHS[k].capacity,10));return c>0?c:8;},
    _progScoringActive:function(){return Object.keys(ctx.TECHS).some(k=>parseInt(ctx.TECHS[k].capacity,10)>0);},
    Date:Date,parseInt:parseInt,isNaN:isNaN,Array:Array,Math:Math,String:String,Object:Object,console:console
  };
  vm.createContext(ctx);
  vm.runInContext(code,ctx);
  return ctx;
}

const D=buildSandbox('app.html');
const M=buildSandbox('labo-mobile.html');

function nextMonday(){const d=new Date();d.setHours(0,0,0,0);while(d.getDay()!==1)d.setDate(d.getDate()+1);return d;}
const MON=nextMonday();
function wd(ctx,n){return ctx.addWD(MON,n);}
function iso(d){return new Date(d).toISOString();}
function sig(steps){return steps.map(s=>s.label+'|'+new Date(s.dueDate).toDateString()+'|'+s.tech).join(';');}

let passed=0;function ok(n){passed++;console.log('  ✓ '+n);}

// Scénarios : on configure le MÊME état (TECHS+jobs) dans les deux bacs et on compare.
const scenarios=[
  {name:'tech surchargé J+2 → glisse au jour calme',
   techs:{marie:{capacity:5}},
   jobs:n=>[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(D,2)),nb:5}]}],
   tasks:ctx=>[{label:'Modélisation',tech:'marie',dueDate:iso(wd(ctx,2)),nb:1}],
   deadline:ctx=>iso(wd(ctx,6))},
  {name:'pas de marge → inchangé',
   techs:{marie:{capacity:1}},
   jobs:n=>[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(D,2)),nb:5}]}],
   tasks:ctx=>[{label:'Modélisation',tech:'marie',dueDate:iso(wd(ctx,2)),nb:1}],
   deadline:ctx=>iso(wd(ctx,2))},
  {name:'couplage même-jour préservé',
   techs:{marie:{capacity:5},fabien:{capacity:20}},
   jobs:n=>[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(D,2)),nb:5}]}],
   tasks:ctx=>[{label:'Scan',tech:'fabien',dueDate:iso(wd(ctx,2)),nb:1},{label:'Modélisation',tech:'marie',dueDate:iso(wd(ctx,2)),nb:1}],
   deadline:ctx=>iso(wd(ctx,6))},
  {name:'deux étapes : ordre + écart conservés',
   techs:{marie:{capacity:5}},
   jobs:n=>[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(D,2)),nb:5}]}],
   tasks:ctx=>[{label:'Modélisation',tech:'marie',dueDate:iso(wd(ctx,2)),nb:1},{label:'Glaçage',tech:'marie',dueDate:iso(wd(ctx,3)),nb:1}],
   deadline:ctx=>iso(wd(ctx,8))}
];

scenarios.forEach(function(sc){
  // Desktop
  D.TECHS=sc.techs;D.jobs=sc.jobs();D._progCfg={loadLeveling:true};
  var dt=sc.tasks(D);D._levelTasksLoad(dt,sc.deadline(D));
  // Mobile (mêmes données)
  M.TECHS=sc.techs;M.jobs=sc.jobs();M._progCfg={loadLeveling:true};
  var mt=sc.tasks(M);M._levelTasksLoad(mt,sc.deadline(M));
  assert.strictEqual(sig(dt),sig(mt),'PARITÉ rompue : '+sc.name+'\n  desktop='+sig(dt)+'\n  mobile ='+sig(mt));
  ok('parité — '+sc.name);
});

// Parité du score d'affectation (_scoreTech) + zone d'une dent.
(function(){
  var cfg={weights:{dentist:30,tooth:20,load:40},dentistPrefs:{cab1:['marie']},zonePrefs:{anterior:{pref:['marie'],avoid:['lucas']},posterior:{pref:[],avoid:[]}}};
  D._progCfg=cfg;M._progCfg=cfg;
  var cases=[
    {tech:'marie',ctx:{cabinetId:'cab1',zone:'anterior',loadRatio:0.5}},
    {tech:'lucas',ctx:{cabinetId:'cab1',zone:'anterior',loadRatio:0}},
    {tech:'marie',ctx:{cabinetId:null,zone:'posterior',loadRatio:1.2}},
    {tech:'bob',ctx:{cabinetId:'cab1',zone:null,loadRatio:0}}
  ];
  cases.forEach(function(c,i){
    var ds=D._scoreTech(c.tech,c.ctx,cfg).score;
    var ms=M._scoreTech(c.tech,c.ctx,cfg).score;
    assert.strictEqual(ds,ms,'score divergent cas '+i+' : desktop='+ds+' mobile='+ms);
    ok('parité score — cas '+(i+1)+' ('+c.tech+' = '+ds+')');
  });
  ['11','13','21','16','38','45'].forEach(function(t){
    assert.strictEqual(D._toothZone(t),M._toothZone(t),'zone divergente dent '+t);
  });
  ok('parité zone des dents (FDI)');
})();

console.log('\n'+passed+' tests de parité passés ✅');
