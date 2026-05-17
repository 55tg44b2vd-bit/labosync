const fs = require('fs');
const p = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let h = fs.readFileSync(p, 'utf8');

const oldFn = `function printBatchLabSheets(jobIds){
  if(!jobIds||!jobIds.length){alert('Sélectionnez au moins une fiche.');return;}
  var parts=[];
  jobIds.forEach(function(id){
    var job=jobs.find(function(j){return String(j.id)===String(id);});
    if(!job)return;
    parts.push('<motion class="lab-sheet-batch-page">'+generateLabSheetHTML(job)+'</motion>');
    job.labSheetPrintedAt=new Date().toISOString();
  });
  if(!parts.length){alert('Travaux introuvables.');return;}
  saveJobs();
  var html=parts.join('');
  if(!_showLabSheetPreview(html)){
    var w=window.open('','_blank','width=900,height=700');
    if(!w){alert('Autorisez les pop-ups ou utilisez l\\'aperçu impression.');return;}
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fiches labo</title><style>@media print{.lab-sheet-batch-page{page-break-after:always;}.lab-sheet-batch-page:last-child{page-break-after:auto;}}body{margin:0;padding:16px;}</style></head><body>'+html+'</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function(){try{w.print();}catch(e){}},300);
  }
  closeBatchLabSheetModal();
  if(typeof showToast==='function')showToast(jobIds.length+' fiche'+(jobIds.length>1?'s':'')+' prête'+(jobIds.length>1?'s':'')+' à imprimer','#2a6049',3500);
}`;

const oldFn2 = oldFn.replace(/<motion/g, '<motion').replace(/<\/motion>/g, '</motion>');
// actual file uses div
const oldFnReal = oldFn2.replace(/motion/g, 'div');

const newFn = `var _pdfLibsReady=null;
function _loadScriptOnce(src,ready){
  return new Promise(function(resolve,reject){
    if(ready())return resolve();
    var s=document.createElement('script');
    s.src=src;s.async=true;
    s.onload=function(){resolve();};
    s.onerror=function(){reject(new Error('load '+src));};
    document.head.appendChild(s);
  });
}
function _ensurePdfLibs(){
  if(_pdfLibsReady)return _pdfLibsReady;
  _pdfLibsReady=Promise.all([
    _loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',function(){return !!window.jspdf;}),
    _loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',function(){return !!window.html2canvas;})
  ]);
  return _pdfLibsReady;
}
function _captureLabSheetCanvas(job,compact){
  var wrap=document.createElement('div');
  wrap.style.cssText='position:fixed;left:-12000px;top:0;width:794px;background:#fff;z-index:-1;';
  wrap.innerHTML=generateLabSheetHTML(job,{compact:compact});
  document.body.appendChild(wrap);
  var target=wrap.querySelector('.lab-sheet-sheet')||wrap.firstElementChild||wrap;
  return html2canvas(target,{scale:2,backgroundColor:'#ffffff',logging:false,useCORS:true,windowWidth:794}).then(function(canvas){
    document.body.removeChild(wrap);
    return canvas;
  }).catch(function(err){
    if(wrap.parentNode)document.body.removeChild(wrap);
    throw err;
  });
}
function _pdfAddCanvasFit(doc,canvas,x,y,maxW,maxH){
  var img=canvas.toDataURL('image/jpeg',0.92);
  var w=maxW,h=(canvas.height*w)/canvas.width;
  if(h>maxH){h=maxH;w=(canvas.width*h)/canvas.height;}
  doc.addImage(img,'JPEG',x+(maxW-w)/2,y,w,h);
}
async function exportBatchLabSheetsAsPdf(jobIds){
  if(!jobIds||!jobIds.length){alert('Sélectionnez au moins une fiche.');return;}
  var layoutEl=document.getElementById('batch-ls-layout');
  var layout=layoutEl?layoutEl.value:'full';
  var compact=layout==='half';
  var btn=document.getElementById('batch-ls-print');
  if(btn){btn.disabled=true;btn.textContent='Génération PDF…';}
  try{
    await _ensurePdfLibs();
  }catch(e){
    alert('Impossible de charger les outils PDF. Vérifiez votre connexion internet.');
    if(btn){btn.disabled=false;_updateBatchLabSheetPrintBtn();}
    return;
  }
  var list=[];
  jobIds.forEach(function(id){
    var job=jobs.find(function(j){return String(j.id)===String(id);});
    if(job)list.push(job);
  });
  if(!list.length){alert('Travaux introuvables.');if(btn){btn.disabled=false;_updateBatchLabSheetPrintBtn();}return;}
  try{
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    var pageW=210,pageH=297,margin=10,contentW=pageW-margin*2;
    for(var i=0;i<list.length;i++){
      if(btn)btn.textContent='PDF '+(i+1)+'/'+list.length+'…';
      var canvas=await _captureLabSheetCanvas(list[i],compact);
      if(layout==='half'){
        var slotH=(pageH-margin*3)/2;
        var slot=i%2;
        if(i>0&&slot===0)doc.addPage();
        var y=margin+slot*(slotH+margin);
        _pdfAddCanvasFit(doc,canvas,margin,y,contentW,slotH);
      }else{
        if(i>0)doc.addPage();
        _pdfAddCanvasFit(doc,canvas,margin,margin,contentW,pageH-margin*2);
      }
      list[i].labSheetPrintedAt=new Date().toISOString();
    }
    saveJobs();
    var stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
    doc.save('fiches_labo_'+stamp+'.pdf');
    closeBatchLabSheetModal();
    if(typeof showToast==='function')showToast(list.length+' fiche'+(list.length>1?'s':'')+' — PDF téléchargé','#2a6049',4000);
  }catch(err){
    console.error('exportBatchLabSheetsAsPdf',err);
    alert('Erreur PDF : '+(err.message||err));
  }
  if(btn){btn.disabled=false;_updateBatchLabSheetPrintBtn();}
}
function printBatchLabSheets(jobIds){
  exportBatchLabSheetsAsPdf(jobIds);
}`;

if (!h.includes('function printBatchLabSheets(jobIds){')) {
  console.error('printBatchLabSheets not found');
  process.exit(1);
}

// find and replace by line-based approach
const start = h.indexOf('function printBatchLabSheets(jobIds){');
const end = h.indexOf('\nfunction printJobLabSheet(jobId){', start);
if (start < 0 || end < 0) {
  console.error('bounds not found', start, end);
  process.exit(1);
}
h = h.slice(0, start) + newFn + h.slice(end);
fs.writeFileSync(p, h);
console.log('patched printBatchLabSheets');
