/* Garde anti-doublon de création de travail.
   Extrait le vrai code (_jobContentSig + _isRecentDuplicateJob) d'app.html et le teste. */
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

const html=fs.readFileSync('app.html','utf8');
const code=extractFn(html,'_jobContentSig')+'\n'+extractFn(html,'_isRecentDuplicateJob');
const ctx={jobs:[],queue:[],Date:Date,parseInt:parseInt,isNaN:isNaN,String:String};
vm.createContext(ctx);
vm.runInContext(code,ctx);

let passed=0;function ok(n){passed++;console.log('  ✓ '+n);}
const nowIso=function(msAgo){return new Date(Date.now()-(msAgo||0)).toISOString();};

// 1) File vide → pas de doublon
ctx.jobs=[];ctx.queue=[];
assert.strictEqual(ctx._isRecentDuplicateJob('bjkkk',[{type:'ccm',nb:1}]),false);
ok('aucun travail → pas de doublon');

// 2) Travail identique créé il y a 2s → doublon détecté
ctx.jobs=[{patient:'bjkkk',items:[{type:'ccm',nb:1}],createdAt:nowIso(2000)}];
assert.strictEqual(ctx._isRecentDuplicateJob('bjkkk',[{type:'ccm',nb:1}]),true);
ok('même travail < 6s → doublon détecté');

// 3) Même travail mais vieux (10s) → autorisé
ctx.jobs=[{patient:'bjkkk',items:[{type:'ccm',nb:1}],createdAt:nowIso(10000)}];
assert.strictEqual(ctx._isRecentDuplicateJob('bjkkk',[{type:'ccm',nb:1}]),false);
ok('même travail ancien (>6s) → autorisé');

// 4) Patient différent → autorisé
ctx.jobs=[{patient:'bjkkk',items:[{type:'ccm',nb:1}],createdAt:nowIso(1000)}];
assert.strictEqual(ctx._isRecentDuplicateJob('autre',[{type:'ccm',nb:1}]),false);
ok('patient différent → autorisé');

// 5) Types différents → autorisé
assert.strictEqual(ctx._isRecentDuplicateJob('bjkkk',[{type:'crown_only',nb:1}]),false);
ok('types différents → autorisé');

// 6) Doublon présent dans la FILE (queue) aussi détecté
ctx.jobs=[];ctx.queue=[{patient:'bjkkk',items:[{type:'ccm',nb:1}],createdAt:nowIso(1500)}];
assert.strictEqual(ctx._isRecentDuplicateJob('bjkkk',[{type:'ccm',nb:1}]),true);
ok('doublon dans la file → détecté');

// 7) Casse/espaces ignorés (patient « BJKKK » vs « bjkkk »)
ctx.jobs=[{patient:'  BJKKK ',items:[{type:'ccm',nb:1}],createdAt:nowIso(1000)}];ctx.queue=[];
assert.strictEqual(ctx._isRecentDuplicateJob('bjkkk',[{type:'ccm',nb:1}]),true);
ok('comparaison insensible casse/espaces');

console.log('\n'+passed+' tests anti-doublon passés ✅');
