/* Portail technicien — statut de chaîne (couleurs), parité app.html ↔ technicien.html,
   application des coches live côté desktop et superposition graph+live côté portail. */
'use strict';
const fs=require('fs');
const assert=require('assert');
const vm=require('vm');

const APP='app.html';
const PORTAL='technicien.html';

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

const appSrc=fs.readFileSync(APP,'utf8');
const portalSrc=fs.readFileSync(PORTAL,'utf8');

function loadChainStatus(src,label){
  const code=extractFn(src,'_tpDayKey')+'\n'+extractFn(src,'_techChainStatus');
  const ctx={Date:Date,String:String,isNaN:isNaN,parseInt:parseInt};
  vm.createContext(ctx);
  vm.runInContext(code,ctx,{filename:label});
  return {dayKey:ctx._tpDayKey,status:ctx._techChainStatus};
}

const appFns=loadChainStatus(appSrc,'app');
const portalFns=loadChainStatus(portalSrc,'portal');

// ── 1. Statut de chaîne : cas du patron (empreintes + modélisation le même jour) ──
const TODAY='2026-07-04';
function steps(list){return list.map((s,i)=>Object.assign({label:'S'+i,tech:'t'+i},s));}

for(const [name,fns] of [['app.html',appFns],['technicien.html',portalFns]]){
  // Récupération (idx 0) et modélisation (idx 1) le même jour : la modélisation attend.
  let st=fns.status(steps([
    {dueDate:'2026-07-04T12:00:00',done:false},
    {dueDate:'2026-07-04T12:00:00',done:false}
  ]),1,TODAY);
  assert.strictEqual(st.state,'waiting',name+': modélisation en attente des empreintes');
  assert.strictEqual(st.waitingOn.label,'S0',name+': attend bien l\'étape 0');

  // La récupération est cochée → la modélisation passe au vert.
  st=fns.status(steps([
    {dueDate:'2026-07-04T12:00:00',done:true},
    {dueDate:'2026-07-04T12:00:00',done:false}
  ]),1,TODAY);
  assert.strictEqual(st.state,'ready',name+': prêt une fois l\'étape précédente faite');

  // Étape précédente en retard (hier, non faite) → rouge.
  st=fns.status(steps([
    {dueDate:'2026-07-03T12:00:00',done:false},
    {dueDate:'2026-07-04T12:00:00',done:false}
  ]),1,TODAY);
  assert.strictEqual(st.state,'late',name+': bloqué si une étape précédente est en retard');

  // Ma propre étape cochée → done, quel que soit le reste.
  st=fns.status(steps([
    {dueDate:'2026-07-03T12:00:00',done:false},
    {dueDate:'2026-07-04T12:00:00',done:true}
  ]),1,TODAY);
  assert.strictEqual(st.state,'done',name+': étape cochée = fait');

  // Première étape de la chaîne : rien avant → prêt.
  st=fns.status(steps([
    {dueDate:'2026-07-04T12:00:00',done:false},
    {dueDate:'2026-07-05T12:00:00',done:false}
  ]),0,TODAY);
  assert.strictEqual(st.state,'ready',name+': première étape toujours prête');

  // Plusieurs manquantes, aucune en retard → jaune avec compte.
  st=fns.status(steps([
    {dueDate:'2026-07-04T12:00:00',done:false},
    {dueDate:'2026-07-04T12:00:00',done:false},
    {dueDate:'2026-07-04T12:00:00',done:false}
  ]),2,TODAY);
  assert.strictEqual(st.state,'waiting',name+': plusieurs manquantes non en retard = attente');
  assert.strictEqual(st.missing,2,name+': compte des manquantes');
  assert.strictEqual(st.waitingOn.label,'S1',name+': attend l\'étape immédiatement précédente');

  // Ma propre étape dépassée → ownLate signalé.
  st=fns.status(steps([{dueDate:'2026-07-01T12:00:00',done:false}]),0,TODAY);
  assert.strictEqual(st.ownLate,true,name+': ownLate quand ma date est passée');

  // Les étapes des jours SUIVANTS ne bloquent jamais.
  st=fns.status(steps([
    {dueDate:'2026-07-06T12:00:00',done:false},
    {dueDate:'2026-07-04T12:00:00',done:false}
  ]),1,TODAY);
  assert.strictEqual(st.state,'ready',name+': une étape future ne bloque pas');
}

// Parité stricte : mêmes sorties sur un jeu aléatoire reproductible.
let seed=42;
function rnd(){seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;}
for(let c=0;c<200;c++){
  const n=1+Math.floor(rnd()*6);
  const sts=steps(Array.from({length:n},()=>({
    dueDate:'2026-07-0'+(1+Math.floor(rnd()*8))+'T12:00:00',
    done:rnd()<0.5
  })));
  const idx=Math.floor(rnd()*n);
  // JSON : les objets sortent de deux contextes vm (prototypes différents).
  assert.strictEqual(
    JSON.stringify(appFns.status(sts,idx,TODAY)),
    JSON.stringify(portalFns.status(sts,idx,TODAY)),
    'parité desktop↔portail (cas '+c+')'
  );
}

// ── 2. Desktop : application des événements live (_applyTechLive) ──
{
  const code=extractFn(appSrc,'_techLiveAppliedRev')+'\n'+extractFn(appSrc,'_applyTechLive');
  const store={lb_techlive_rev:'1000'};
  const ctx={
    Date:Date,String:String,Object:Object,Array:Array,parseInt:parseInt,
    localStorage:{getItem:k=>store[k]==null?null:store[k],setItem:(k,v)=>{store[k]=String(v);}},
    jobs:[{id:'j1',tasks:[{label:'Empreintes',tech:'sarah',done:false},{label:'Modélisation',tech:'marc',done:false}]}],
    genericTasks:[{id:'gt_1',label:'Four',tech:'marc',done:false}]
  };
  vm.createContext(ctx);
  vm.runInContext(code,ctx,{filename:'applyTechLive'});

  const res=ctx._applyTechLive({
    checks:{
      'j1|0':{done:true,by:'sarah',at:'2026-07-04T09:00:00Z',rev:2000},   // nouveau → appliqué
      'j1|1':{done:true,by:'marc',at:'2026-07-01T09:00:00Z',rev:500}      // déjà appliqué (rev ≤ 1000) → ignoré
    },
    notes:{'j1|0':{text:'empreinte OK',by:'sarah',at:'2026-07-04T09:01:00Z',rev:2001}},
    gtChecks:{'gt_1':{done:true,by:'marc',at:'2026-07-04T10:00:00Z',rev:2002}},
    added:[
      {id:'tt_1',label:'Réparation urgente',tech:'marc',dueDate:'2026-07-04T12:00:00',note:'',by:'marc',rev:2003},
      {id:'gt_1',label:'Doublon',tech:'marc',dueDate:'2026-07-04T12:00:00',note:'',by:'marc',rev:2004} // id déjà présent → ignoré
    ]
  });

  assert.strictEqual(ctx.jobs[0].tasks[0].done,true,'coche appliquée');
  assert.strictEqual(ctx.jobs[0].tasks[0].doneBy,'sarah','auteur de la coche');
  assert.strictEqual(ctx.jobs[0].tasks[1].done,false,'événement déjà appliqué ignoré');
  assert.strictEqual(ctx.jobs[0].tasks[0].techNote.text,'empreinte OK','note appliquée');
  assert.strictEqual(ctx.genericTasks[0].done,true,'tâche atelier cochée');
  assert.strictEqual(ctx.genericTasks.length,2,'tâche ajoutée une seule fois (dédup par id)');
  assert.strictEqual(ctx.genericTasks[1].id,'tt_1','tâche du technicien intégrée');
  assert.strictEqual(res.maxRev,2004,'rev max remontée');
  assert.ok(res.jobsChanged&&res.gtChanged,'drapeaux de sauvegarde');
}

// ── 3. Portail : superposition graph publié + événements live (effectiveSteps) ──
{
  const code=extractFn(portalSrc,'_publishedMs')+'\n'+extractFn(portalSrc,'effectiveSteps');
  const ctx={Date:Date,String:String,Object:Object,Array:Array,S:null};
  vm.createContext(ctx);
  vm.runInContext(code,ctx,{filename:'effectiveSteps'});

  const pubAt='2026-07-04T08:00:00Z';
  const pubMs=Date.parse(pubAt);
  ctx.S={
    graph:{publishedAt:pubAt},
    live:{
      checks:{
        'j1|0':{done:true,by:'sarah',at:'2026-07-04T09:00:00Z',rev:pubMs+3600000},  // APRÈS publication → prime
        'j1|1':{done:true,by:'marc',at:'2026-07-03T09:00:00Z',rev:pubMs-3600000}    // AVANT publication → le graph prime
      },
      notes:{},gtChecks:{},added:[]
    },
    tech:{key:'marc'}
  };
  const job={id:'j1',steps:[
    {i:0,label:'Empreintes',tech:'sarah',dueDate:'2026-07-04T12:00:00',nb:1,done:false},
    {i:1,label:'Modélisation',tech:'marc',dueDate:'2026-07-04T12:00:00',nb:1,done:false}
  ]};
  const eff=vm.runInContext('effectiveSteps(S_job)',Object.assign(ctx,{S_job:job}));
  assert.strictEqual(eff[0].done,true,'événement postérieur à la publication appliqué');
  assert.strictEqual(eff[0].doneBy,'sarah','auteur conservé');
  assert.strictEqual(eff[1].done,false,'événement antérieur à la publication ignoré (le labo a repris la main)');
}

console.log('✅ tech-portal.test.cjs — statuts de chaîne, parité, coches live : OK');
