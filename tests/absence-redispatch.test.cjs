/* Absence technicien (report/réassignation avec chaînes « même technicien ») et
   délestage du technicien préféré surchargé — extrait le vrai code d'app.html. */
'use strict';
const fs=require('fs');
const assert=require('assert');
const vm=require('vm');

const appSrc=fs.readFileSync('app.html','utf8');

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

const FNS=['addWD','countWD','fmtISO','_techCapacity','_scoreTech','_linkChainIdxs','_dayLoads',
  '_allowedTechsForTask','_allowedTechsForChain',
  '_bestReplacementTech','_planTechAbsence','_applyTechAbsencePlan','_relievePreferredOverload','_relieveTechDay'];
const code=FNS.map(function(n){return extractFn(appSrc,n);}).join('\n');

function mkCtx(over){
  const ctx=Object.assign({
    Date:Date,String:String,Object:Object,Array:Array,Number:Number,Math:Math,
    parseInt:parseInt,isNaN:isNaN,console:console,
    TECHS:{marc:{label:'Marc',color:'#111'},sarah:{label:'Sarah',color:'#222'},tom:{label:'Tom',color:'#333'}},
    jobs:[],absences:{},customTypes:[],
    saveJobs:function(){},saveAbsences:function(){},
    isTechUnavailableForAuto:function(k,d){return d.getDay()===0||d.getDay()===6;},
    _deliveryDeadline:function(j){return j.deadline?new Date(j.deadline):null;}
  },over||{});
  vm.createContext(ctx);
  vm.runInContext(code,ctx,{filename:'absence-redispatch'});
  return ctx;
}

// Semaine de référence : lun 06/07/2026 … ven 10/07/2026 (le 04/07 est un samedi).
const D=(day,h)=>new Date('2026-07-'+String(day).padStart(2,'0')+'T'+(h||'12')+':00:00').toISOString();

// ── 1. Chaîne « même technicien que » (les deux sens, transitif) ──
{
  const ctx=mkCtx();
  const tasks=[
    {label:'Modélisation',tech:'marc',dueDate:D(7)},
    {label:'Impression',tech:'sarah',dueDate:D(8)},
    {label:'Glaçage',tech:'marc',dueDate:D(9),sameTechAsLabel:'Modélisation'}
  ];
  const chain=vm.runInContext('_linkChainIdxs(T,0)',Object.assign(ctx,{T:tasks}));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(chain)),[0,2],'glaçage lié à la modélisation (sens inverse suivi)');
}

// ── 2. Absence avec échéance LARGE → report de toute la fin du travail ──
{
  const ctx=mkCtx();
  ctx.jobs.push({id:'j1',patient:'dupont',cabinet:'cabB',deadline:'2026-07-17T23:59:59',tasks:[
    {label:'Modélisation',tech:'marc',dueDate:D(7),nb:1,done:false},
    {label:'Montage',tech:'sarah',dueDate:D(8),nb:1,done:false}
  ]});
  const plan=vm.runInContext('_planTechAbsence("marc","2026-07-07","2026-07-07")',ctx);
  assert.strictEqual(plan.moves.length,1,'un seul mouvement');
  assert.strictEqual(plan.moves[0].kind,'report','échéance large → report');
  assert.strictEqual(plan.moves[0].delta,1,'retour mercredi → décalage d\'1 j ouvré');
  assert.strictEqual(plan.moves[0].count,2,'toute la fin du travail suit (étape de Sarah comprise : elle dépend de la sienne)');
  vm.runInContext('_applyTechAbsencePlan(P)',Object.assign(ctx,{P:plan}));
  assert.strictEqual(ctx.jobs[0].tasks[0].dueDate.slice(0,10),'2026-07-08','modélisation reportée à mercredi');
  assert.strictEqual(ctx.jobs[0].tasks[1].dueDate.slice(0,10),'2026-07-09','montage suit (jeudi)');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.absences.marc)),['2026-07-07'],'absence enregistrée');
}

// ── 3. Échéance SERRÉE → réassignation, le glaçage SUIT le remplaçant (hors fenêtre d'absence) ──
{
  const ctx=mkCtx();
  ctx.jobs.push({id:'j2',patient:'martin',cabinet:'cabB',deadline:'2026-07-09T23:59:59',tasks:[
    {label:'Modélisation',tech:'marc',dueDate:D(7),nb:1,done:false},
    {label:'Impression',tech:'sarah',dueDate:D(8),nb:1,done:false},
    {label:'Glaçage',tech:'marc',dueDate:D(9),nb:1,done:false,sameTechAsLabel:'Modélisation'}
  ]});
  const plan=vm.runInContext('_planTechAbsence("marc","2026-07-07","2026-07-07")',ctx);
  assert.strictEqual(plan.moves.length,1,'une chaîne réassignée');
  assert.strictEqual(plan.moves[0].kind,'reassign','échéance serrée → réassignation');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.moves[0].idxs)),[0,2],'modélisation + glaçage lié');
  const nt=plan.moves[0].newTech;
  assert.ok(nt==='sarah'||nt==='tom','remplaçant valide');
  vm.runInContext('_applyTechAbsencePlan(P)',Object.assign(ctx,{P:plan}));
  assert.strictEqual(ctx.jobs[0].tasks[0].tech,nt,'modélisation réassignée');
  assert.strictEqual(ctx.jobs[0].tasks[2].tech,nt,'glaçage (jeudi, HORS fenêtre) suit le même remplaçant');
  assert.strictEqual(ctx.jobs[0].tasks[1].tech,'sarah','l\'étape de Sarah ne bouge pas');
  assert.strictEqual(ctx.jobs[0].tasks[0].dueDate.slice(0,10),'2026-07-07','dates inchangées en réassignation');
}

// ── 4. Délestage : technicien préféré surchargé → ses tâches d'équilibrage partent ──
{
  const ctx=mkCtx({
    _progCfg:{weights:{dentist:60,tooth:25,load:30},dentistPrefs:{cabA:['marc'],cabC:['marc']},zonePrefs:{}},
    _progScoringActive:function(){return true;}
  });
  ctx.TECHS.marc.capacity=4;
  ctx.TECHS.sarah.capacity=8;
  ctx.TECHS.tom.capacity=8;
  // J1 : cabinet SANS préférence → déplaçable. J3 : cabinet qui préfère AUSSI Marc → intouchable.
  ctx.jobs.push(
    {id:'J1',patient:'equil',cabinet:'cabB',tasks:[{label:'Montage',tech:'marc',dueDate:D(7),nb:3,done:false}]},
    {id:'J3',patient:'fidele',cabinet:'cabC',tasks:[{label:'Chape',tech:'marc',dueDate:D(7),nb:2,done:false}]},
    {id:'J2',patient:'prefere',cabinet:'cabA',tasks:[{label:'Couronne',tech:'marc',dueDate:D(7),nb:3,done:false}]}
  );
  const moved=vm.runInContext('_relievePreferredOverload(jobs[2])',ctx);
  assert.strictEqual(moved,1,'un travail délesté');
  assert.notStrictEqual(ctx.jobs[0].tasks[0].tech,'marc','le travail d\'équilibrage (cabB) part chez un collègue');
  assert.strictEqual(ctx.jobs[1].tasks[0].tech,'marc','le travail du cabinet fidèle (préférence) reste chez Marc');
  assert.strictEqual(ctx.jobs[2].tasks[0].tech,'marc','le nouveau travail du cabinet préféré reste chez Marc');
}

// ── 5. Délestage : pas de préférence pour ce cabinet → aucun mouvement ──
{
  const ctx=mkCtx({
    _progCfg:{weights:{dentist:60,tooth:25,load:30},dentistPrefs:{cabA:['marc']},zonePrefs:{}},
    _progScoringActive:function(){return true;}
  });
  ctx.TECHS.marc.capacity=2;
  ctx.jobs.push(
    {id:'K1',patient:'x',cabinet:'cabB',tasks:[{label:'A',tech:'marc',dueDate:D(7),nb:2,done:false}]},
    {id:'K2',patient:'y',cabinet:'cabB',tasks:[{label:'B',tech:'marc',dueDate:D(7),nb:2,done:false}]}
  );
  const moved=vm.runInContext('_relievePreferredOverload(jobs[1])',ctx);
  assert.strictEqual(moved,0,'surcharge sans préférence cabinet = comportement inchangé');
}

// ── 6. Pool du poste : le remplaçant est choisi PARMI les techniciens autorisés pour l'étape ──
{
  const ctx=mkCtx();
  ctx.TECHS.kris={label:'Kris',color:'#444'};
  ctx.customTypes.push({id:'chape',steps:[
    {label:'modélisation chappe métal',tech:['marc','tom'],dayOffset:2},
    {label:'montage céramique cosmétique',tech:'auto',dayOffset:3}
  ]});
  // Kris et Sarah ont plus de marge, mais seuls marc/tom sont autorisés sur la modélisation.
  // (job SANS champ type : le repli « libellé dans tous les types » doit retrouver le pool)
  ctx.jobs.push({id:'p1',patient:'tesfttcf',cabinet:'cabB',deadline:'2026-07-08T23:59:59',tasks:[
    {label:'modélisation chappe métal',tech:'marc',dueDate:D(7),nb:1,done:false},
    {label:'montage céramique cosmétique',tech:'kris',dueDate:D(8),nb:1,done:false}
  ]});
  const plan=vm.runInContext('_planTechAbsence("marc","2026-07-07","2026-07-07")',ctx);
  assert.strictEqual(plan.moves[0].kind,'reassign','échéance serrée → réassignation');
  assert.strictEqual(plan.moves[0].newTech,'tom','remplaçant pris DANS le pool de l\'étape (tom), pas kris/sarah');
  assert.strictEqual(plan.moves[0].pooled,true,'contrainte de pool signalée');

  // Pool réduit au seul absent → aucun remplaçant : l'étape est signalée, pas déplacée.
  ctx.customTypes[0].steps[0].tech=['marc'];
  const plan2=vm.runInContext('_planTechAbsence("marc","2026-07-07","2026-07-07")',ctx);
  assert.strictEqual(plan2.moves[0].kind,'stuck','pool vide une fois l\'absent retiré → signalé');
}

// ── 7. Pool sur une chaîne liée : intersection des pools de TOUTES les étapes de la chaîne ──
{
  const ctx=mkCtx();
  ctx.customTypes.push({id:'zircone',steps:[
    {label:'Modélisation',tech:['marc','sarah','tom'],dayOffset:1},
    {label:'Glaçage',tech:['marc','tom'],dayOffset:3,sameAs:0}
  ]});
  ctx.jobs.push({id:'c1',patient:'chainpool',cabinet:'cabB',type:'zircone',items:[{type:'zircone',nb:1}],deadline:'2026-07-09T23:59:59',tasks:[
    {label:'Modélisation',tech:'marc',dueDate:D(7),nb:1,done:false},
    {label:'Glaçage',tech:'marc',dueDate:D(9),nb:1,done:false,sameTechAsLabel:'Modélisation'}
  ]});
  const plan=vm.runInContext('_planTechAbsence("marc","2026-07-07","2026-07-07")',ctx);
  assert.strictEqual(plan.moves[0].kind,'reassign','réassignation de la chaîne');
  assert.strictEqual(plan.moves[0].newTech,'tom','sarah exclue : elle ne peut pas faire le glaçage (intersection des pools)');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.moves[0].idxs)),[0,1],'chaîne complète');
}

console.log('✅ absence-redispatch.test.cjs — chaînes liées, report, réassignation, délestage, pools de poste : OK');
