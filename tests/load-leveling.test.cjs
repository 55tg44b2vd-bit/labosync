/* Test sandbox du lissage de charge (_levelTasksLoad).
   Reproduit les helpers de dates + la fonction, avec des stubs (jobs, TECHS, capacité). */
'use strict';
const assert=require('assert');

// ── Helpers de dates (copie conforme d'app.html) ──
function addWD(d,n){const r=new Date(d);let a=0;while(a<n){r.setDate(r.getDate()+1);if(r.getDay()!==0&&r.getDay()!==6)a++;}return r;}
function subWD(d,n){const r=new Date(d);let a=0;while(a<n){r.setDate(r.getDate()-1);if(r.getDay()!==0&&r.getDay()!==6)a++;}return r;}
function countWD(from,to){const a=new Date(from);a.setHours(0,0,0,0);const b=new Date(to);b.setHours(0,0,0,0);let n=0;while(a<b){a.setDate(a.getDate()+1);if(a.getDay()!==0&&a.getDay()!==6)n++;}return n;}

// ── Environnement simulé ──
let jobs=[];
let TECHS={};
let _progCfg={loadLeveling:true,dentistPrefs:{},zonePrefs:{}};
function _techCapacity(k){var c=(TECHS[k]&&parseInt(TECHS[k].capacity,10));return c>0?c:8;}
function _progScoringActive(){ // simplifié : actif dès qu'une capacité est réglée
  return Object.keys(TECHS).some(k=>parseInt(TECHS[k].capacity,10)>0);
}

// ── Fonction testée (copie conforme d'app.html) ──
function _loadLevelingActive(){
  return typeof _progScoringActive==='function' && _progScoringActive()
    && (!_progCfg || _progCfg.loadLeveling!==false);
}
function _levelTasksLoad(tasks,levelDeadlineISO,excludeJobId){
  if(!Array.isArray(tasks)||!tasks.length)return tasks;
  if(!_loadLevelingActive())return tasks;
  if(!levelDeadlineISO)return tasks;
  var deadline=new Date(String(levelDeadlineISO).slice(0,10)+'T00:00:00');
  if(isNaN(deadline))return tasks;
  var today=new Date();today.setHours(0,0,0,0);
  if(deadline<=today)return tasks;
  var ds=function(d){return new Date(d).toDateString();};
  var norm=function(d){var x=new Date(d);x.setHours(0,0,0,0);return x;};
  var baseLoad={};
  (typeof jobs!=='undefined'?jobs:[]).forEach(function(j){
    if(excludeJobId!=null&&String(j.id)===String(excludeJobId))return;
    (j.tasks||[]).forEach(function(t){
      if(!t||!t.tech||!t.dueDate)return;
      (baseLoad[t.tech]=baseLoad[t.tech]||{});
      var day=ds(t.dueDate);baseLoad[t.tech][day]=(baseLoad[t.tech][day]||0)+(parseInt(t.nb,10)||1);
    });
  });
  var jobLoad={};
  function loadAt(tech,dayStr){return (baseLoad[tech]&&baseLoad[tech][dayStr]||0)+(jobLoad[tech]&&jobLoad[tech][dayStr]||0);}
  function addJobLoad(tech,dayStr,nb){(jobLoad[tech]=jobLoad[tech]||{});jobLoad[tech][dayStr]=(jobLoad[tech][dayStr]||0)+nb;}
  var byDay={},dayKeys=[];
  tasks.forEach(function(t){var dk=norm(t.dueDate).getTime();if(!byDay[dk]){byDay[dk]=[];dayKeys.push(dk);}byDay[dk].push(t);});
  dayKeys.sort(function(a,b){return a-b;});
  var stages=dayKeys.map(function(dk){return {origDue:new Date(dk),tasks:byDay[dk]};});
  var n=stages.length;
  var minGap=new Array(n).fill(0);
  for(var i=1;i<n;i++)minGap[i]=Math.max(1,countWD(stages[i-1].origDue,stages[i].origDue));
  var tailGap=new Array(n).fill(0);
  for(var j2=n-2;j2>=0;j2--)tailGap[j2]=tailGap[j2+1]+minGap[j2+1];
  var placedPrev=null;
  for(var s=0;s<n;s++){
    var stage=stages[s];
    var lower=norm(stage.origDue);
    if(s>0){var minAfterPrev=norm(addWD(placedPrev,minGap[s]));if(minAfterPrev>lower)lower=minAfterPrev;}
    var upper=norm(subWD(deadline,tailGap[s]));
    if(upper<lower)upper=new Date(lower);
    var stageLoads={};
    stage.tasks.forEach(function(t){if(t.tech)stageLoads[t.tech]=(stageLoads[t.tech]||0)+(parseInt(t.nb,10)||1);});
    var techs=Object.keys(stageLoads);
    var overloadCost=function(dayStr){
      var cost=0;
      techs.forEach(function(tk){
        var cap=_techCapacity(tk);
        var after=loadAt(tk,dayStr)+stageLoads[tk];
        if(after>cap)cost+=(after-cap);
      });
      return cost;
    };
    var chosen=new Date(lower),bestCost=Infinity;
    var cur=new Date(lower);
    while(cur<=upper){
      if(cur.getDay()!==0&&cur.getDay()!==6){
        var c=overloadCost(cur.toDateString());
        if(c<bestCost){bestCost=c;chosen=new Date(cur);if(c===0)break;}
      }
      cur.setDate(cur.getDate()+1);
    }
    chosen.setHours(0,0,0,0);
    var chosenStr=chosen.toDateString();
    stage.tasks.forEach(function(t){
      var old=new Date(t.dueDate);
      var nd=new Date(chosen);nd.setHours(old.getHours(),old.getMinutes(),old.getSeconds(),old.getMilliseconds());
      t.dueDate=nd.toISOString();
      if(t.tech)addJobLoad(t.tech,chosenStr,parseInt(t.nb,10)||1);
    });
    placedPrev=chosen;
  }
  return tasks;
}

// ── Utilitaire : un lundi de référence pour éviter les week-ends ──
function nextMonday(){const d=new Date();d.setHours(0,0,0,0);while(d.getDay()!==1)d.setDate(d.getDate()+1);return d;}
const MON=nextMonday();
function wd(n){return addWD(MON,n);} // MON + n jours ouvrés
function iso(d){return new Date(d).toISOString();}
function dayOf(t){return new Date(t.dueDate).toDateString();}

// ── Réinitialisation entre tests ──
function reset(){jobs=[];TECHS={};_progCfg={loadLeveling:true};}

let passed=0;
function ok(name){passed++;console.log('  ✓ '+name);}

// 1) Pas de marge (deadline = jour de la dernière étape) → aucune étape ne bouge
(function(){
  reset();TECHS={marie:{capacity:1}};
  // marie déjà chargée à J+2
  jobs=[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(2)),nb:5}]}];
  const tasks=[{label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1}];
  const deadline=iso(wd(2)); // échéance = J+2, aucune marge
  _levelTasksLoad(tasks,deadline);
  assert.strictEqual(dayOf(tasks[0]),wd(2).toDateString(),'reste à J+2 (pas de marge)');
  ok('Sans marge : étape inchangée');
})();

// 2) Marge dispo + tech surchargé à J+2 → l'étape glisse vers un jour calme
(function(){
  reset();TECHS={marie:{capacity:5}};
  jobs=[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(2)),nb:5}]}]; // J+2 déjà plein (5/5)
  const tasks=[{label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1}];
  const deadline=iso(wd(6)); // grande marge
  _levelTasksLoad(tasks,deadline);
  assert.strictEqual(dayOf(tasks[0]),wd(3).toDateString(),'repoussée à J+3 (J+2 saturé)');
  ok('Avec marge : étape surchargée repoussée au jour calme suivant');
})();

// 3) Jamais avancée avant la date prévue (recette J+2, J+1 vide) → reste >= J+2
(function(){
  reset();TECHS={marie:{capacity:5}};
  jobs=[]; // rien
  const tasks=[{label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1}];
  _levelTasksLoad(tasks,iso(wd(6)));
  assert.strictEqual(dayOf(tasks[0]),wd(2).toDateString(),'reste à J+2 (jamais avancée à J+1)');
  ok('Jamais avancée avant la date de la recette');
})();

// 4) Jamais après l'échéance même si tous les jours sont chargés (pas de blocage)
(function(){
  reset();TECHS={marie:{capacity:1}};
  // marie saturée J+2..J+4
  jobs=[{id:'x',tasks:[
    {tech:'marie',dueDate:iso(wd(2)),nb:9},
    {tech:'marie',dueDate:iso(wd(3)),nb:9},
    {tech:'marie',dueDate:iso(wd(4)),nb:9},
  ]}];
  const tasks=[{label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1}];
  const deadline=iso(wd(4));
  _levelTasksLoad(tasks,deadline);
  const placed=new Date(tasks[0].dueDate);placed.setHours(0,0,0,0);
  assert.ok(placed<=wd(4),'placée au plus tard à l\'échéance');
  assert.ok(placed>=wd(2),'placée au plus tôt à la date prévue');
  ok('Tous jours chargés : choisit le moins pire sans dépasser l\'échéance');
})();

// 5) Couplage même-jour préservé (scan fabien + modélisation marie le même jour bougent ensemble)
(function(){
  reset();TECHS={marie:{capacity:5},fabien:{capacity:20}};
  jobs=[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(2)),nb:5}]}]; // marie pleine J+2
  const tasks=[
    {label:'Scan',tech:'fabien',dueDate:iso(wd(2)),nb:1},
    {label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1},
  ];
  _levelTasksLoad(tasks,iso(wd(6)));
  assert.strictEqual(dayOf(tasks[0]),dayOf(tasks[1]),'scan et modélisation restent le même jour');
  assert.strictEqual(dayOf(tasks[1]),wd(3).toDateString(),'le palier entier glisse à J+3');
  ok('Couplage même-jour préservé (le palier bouge en bloc)');
})();

// 6) Ordre des étapes préservé (étape 2 jamais avant étape 1)
(function(){
  reset();TECHS={marie:{capacity:5}};
  jobs=[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(2)),nb:5}]}];
  const tasks=[
    {label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1},
    {label:'Glaçage',tech:'marie',dueDate:iso(wd(3)),nb:1},
  ];
  _levelTasksLoad(tasks,iso(wd(8)));
  const d1=new Date(tasks[0].dueDate),d2=new Date(tasks[1].dueDate);
  assert.ok(d2>d1,'glaçage après modélisation');
  assert.ok(countWD(d1,d2)>=1,'écart d\'au moins 1 jour ouvré conservé');
  ok('Ordre et écart minimal entre étapes préservés');
})();

// 7) Toggle OFF → aucun déplacement
(function(){
  reset();TECHS={marie:{capacity:5}};_progCfg.loadLeveling=false;
  jobs=[{id:'x',tasks:[{tech:'marie',dueDate:iso(wd(2)),nb:5}]}];
  const tasks=[{label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1}];
  _levelTasksLoad(tasks,iso(wd(6)));
  assert.strictEqual(dayOf(tasks[0]),wd(2).toDateString(),'inchangé quand le lissage est désactivé');
  ok('Toggle désactivé : aucun lissage');
})();

// 8) excludeJobId : la charge du travail reprogrammé ne se compte pas contre lui-même
(function(){
  reset();TECHS={marie:{capacity:5}};
  // Le travail J occupe déjà 5 à J+2 ; en le reprogrammant, on doit pouvoir rester à J+2.
  jobs=[{id:'J',tasks:[{tech:'marie',dueDate:iso(wd(2)),nb:5}]}];
  const tasks=[{label:'Modélisation',tech:'marie',dueDate:iso(wd(2)),nb:1}];
  _levelTasksLoad(tasks,iso(wd(6)),'J');
  assert.strictEqual(dayOf(tasks[0]),wd(2).toDateString(),'reste à J+2 car sa propre charge est exclue');
  ok('excludeJobId : ne se compte pas contre soi-même');
})();

console.log('\n'+passed+' tests passés ✅');
