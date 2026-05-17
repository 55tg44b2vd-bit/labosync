const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app.html');
let html = fs.readFileSync(file, 'utf8');

const marker = "// État éphémère du formulaire d'acceptation (côté droit de la modale)\nlet _acceptForm={portalId:null,caseId:null,stepId:null,patient:'',requestedDeliveryDate:'',labDeliveryDate:'',labDeliverySlot:'12',deliveryDate:'',urgent:false,items:[],note:''};";

const insert = String.raw`var _labTeethPick={teeth:{},links:{},chartId:'lab-tooth-chart',summaryId:'lab-tooth-summary'};

function _teethMapFromArrays(teethArr,linksArr){
  var t={},l={};
  (teethArr||[]).forEach(function(n){t[Number(n)]=true;});
  (linksArr||[]).forEach(function(k){l[k]=true;});
  return {teeth:t,links:l};
}
function _teethArraysFromMap(teethMap,linksMap){
  return {
    teeth:Object.keys(teethMap||{}).map(Number).filter(function(n){return n>0;}).sort(function(a,b){return a-b;}),
    links:Object.keys(linksMap||{}).filter(function(k){return linksMap[k];})
  };
}
function _jobTeethArrays(job){
  if(!job)return {teeth:[],links:[]};
  if(Array.isArray(job.teeth)&&job.teeth.length)return {teeth:job.teeth.slice(),links:(job.links||[]).slice()};
  if(job.orderData&&Array.isArray(job.orderData.teeth)&&job.orderData.teeth.length)return {teeth:job.orderData.teeth.slice(),links:(job.orderData.links||[]).slice()};
  return {teeth:[],links:[]};
}
function _initLabTeethPick(teethArr,linksArr,chartId,summaryId){
  var m=_teethMapFromArrays(teethArr,linksArr);
  _labTeethPick.teeth=m.teeth;
  _labTeethPick.links=m.links;
  _labTeethPick.chartId=chartId||'lab-tooth-chart';
  _labTeethPick.summaryId=summaryId||'lab-tooth-summary';
  renderLabToothChartEl();
}
function toggleLabTooth(num){
  if(_labTeethPick.teeth[num])delete _labTeethPick.teeth[num];
  else _labTeethPick.teeth[num]=true;
  renderLabToothChartEl();
}
function toggleLabLink(a,b){
  var key=Math.min(a,b)+'-'+Math.max(a,b);
  if(_labTeethPick.links[key])delete _labTeethPick.links[key];
  else _labTeethPick.links[key]=true;
  renderLabToothChartEl();
}
function _renderToothChartInteractive(pick){
  var teethMap=pick.teeth||{},linksMap=pick.links||{};
  var upper=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  var lower=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  function row(arr){
    var html='<DIV_TAG style="display:flex;align-items:center;justify-content:center;gap:0;flex-wrap:nowrap;width:max-content;margin:0 auto;">';
    arr.forEach(function(num,i){
      if(i===8)html+='<DIV_TAG style="width:12px;flex-shrink:0;"></DIV_TAG>';
      var sel=!!teethMap[num];
      var radius=(i===0||i===8)?'6px 2px 2px 6px':(i===7||i===arr.length-1)?'2px 6px 6px 2px':'2px';
      html+='<button type="button" onclick="toggleLabTooth('+num+')" style="width:32px;height:38px;border:1.5px solid '+(sel?'#2a6049':'#cbd5e1')+';background:'+(sel?'#2a6049':'#fff')+';color:'+(sel?'#fff':'#475569')+';font-family:monospace;font-size:.72rem;font-weight:'+(sel?700:500)+';cursor:pointer;border-radius:'+radius+';margin:0 1px;flex-shrink:0;padding:0;">'+num+'</button>';
      if(i<arr.length-1){
        var a=num,b=arr[i+1],key=Math.min(a,b)+'-'+Math.max(a,b),lk=!!linksMap[key];
        if(lk){
          html+='<button type="button" onclick="toggleLabLink('+a+','+b+')" title="Solidarisation" style="width:20px;height:7px;border:none;background:linear-gradient(180deg,#10b981,#059669);border-radius:4px;cursor:pointer;flex-shrink:0;margin:0 -1px;"></button>';
        }else{
          html+='<button type="button" onclick="toggleLabLink('+a+','+b+')" title="Solidariser" style="width:10px;height:10px;border:1.5px solid #cbd5e1;background:#fff;border-radius:50%;cursor:pointer;flex-shrink:0;padding:0;margin:0 2px;"></button>';
        }
      }
    });
    return html+'</DIV_TAG>';
  }
  return '<DIV_TAG style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px 0 4px;"><DIV_TAG style="width:max-content;margin:0 auto;">'+
    '<DIV_TAG style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:6px;text-align:center;">Maxillaire</DIV_TAG>'+
    row(upper)+
    '<DIV_TAG style="height:12px;"></DIV_TAG>'+
    row(lower)+
    '<DIV_TAG style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-top:6px;text-align:center;">Mandibule</DIV_TAG>'+
    '</DIV_TAG></DIV_TAG>';
}
function renderLabToothChartEl(){
  var el=document.getElementById(_labTeethPick.chartId);
  if(el)el.innerHTML=_renderToothChartInteractive(_labTeethPick);
  var sum=document.getElementById(_labTeethPick.summaryId);
  if(sum){
    var arr=_teethArraysFromMap(_labTeethPick.teeth,_labTeethPick.links);
    sum.textContent=arr.teeth.length?('Sélection : '+arr.teeth.join(', ')):'Cliquez les dents concernées · points entre dents = solidarisation';
    sum.style.color=arr.teeth.length?'#2a6049':'#94a3b8';
  }
}
function _renderLabTeethPickerBlock(chartId,summaryId){
  return '<DIV_TAG style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:14px;">'+
    '<DIV_TAG style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">'+
      '<label style="font-size:.74rem;font-weight:600;color:#64748b;margin:0;">🦷 Dents impactées (notation FDI)</label>'+
      '<button type="button" onclick="_initLabTeethPick([],[],\''+escH2(chartId)+'\',\''+escH2(summaryId)+'\')" style="background:none;border:none;color:#64748b;font-size:.72rem;cursor:pointer;text-decoration:underline;">Effacer</button>'+
    '</DIV_TAG>'+
    '<DIV_TAG id="'+escH2(chartId)+'"></DIV_TAG>'+
    '<DIV_TAG id="'+escH2(summaryId)+'" style="font-size:.72rem;color:#94a3b8;margin-top:8px;font-family:monospace;"></DIV_TAG>'+
  '</DIV_TAG>';
}
function _resetSaisieTeethPick(){
  _initLabTeethPick([],[],'saisie-tooth-chart','saisie-tooth-summary');
}
function _readSaisieTeethFields(){
  if(_labTeethPick.chartId==='saisie-tooth-chart')return _teethArraysFromMap(_labTeethPick.teeth,_labTeethPick.links);
  return {teeth:[],links:[]};
}

`.replace(/DIV_TAG/g, 'div');

if (html.includes('function _teethMapFromArrays')) {
  console.log('Already patched');
  process.exit(0);
}
if (!html.includes(marker)) {
  console.error('Marker not found');
  process.exit(1);
}
html = html.replace(marker, insert + marker);
fs.writeFileSync(file, html);
console.log('Patched app.html');
