/* Import données */
var _importPlan=null;


function _fxNormHeader(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function _fxParseAmount(s){
  var t=String(s||'').replace(/\s/g,'').replace(',','.');
  var n=parseFloat(t);
  return Number.isFinite(n)?n:NaN;
}
function _fxParseDateISO(s){
  var t=String(s||'').trim();
  if(/^\d{4}-\d{2}-\d{2}/.test(t))return t.slice(0,10);
  var m=t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if(m){
    var d=parseInt(m[1],10),mo=parseInt(m[2],10),y=parseInt(m[3],10);
    if(y<100)y+=2000;
    if(mo>=1&&mo<=12&&d>=1&&d<=31)return String(y)+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  }
  return '';
}
function _fxFirstDesc(el, localName){
  if(!el)return null;
  if(el.localName===localName)return el;
  for(var i=0;i<el.children.length;i++){
    var r=_fxFirstDesc(el.children[i],localName);
    if(r)return r;
  }
  return null;
}
function _fxText(el){
  return String(el&&(el.textContent!=null?el.textContent:'')).replace(/\s+/g,' ').trim();
}
function _fxAll(docOrEl, localName){
  try{return Array.prototype.slice.call(docOrEl.getElementsByTagNameNS('*',localName));}
  catch(e){return Array.prototype.slice.call(docOrEl.getElementsByTagName(localName));}
}

function _fxExtractUBLInvoice(inv,fileName){
  var idEl=_fxFirstDesc(inv,'ID');
  var invoiceId=_fxText(idEl)||'IMPORT';
  var dateEl=_fxFirstDesc(inv,'IssueDate');
  var dateISO=_fxText(dateEl).slice(0,10)||fmtISO(new Date());
  var custParty=_fxFirstDesc(inv,'AccountingCustomerParty');
  var party=custParty?_fxFirstDesc(custParty,'Party'):null;
  var custName='';
  if(party){
    var pn=_fxFirstDesc(party,'PartyName');
    var nEl=pn?_fxFirstDesc(pn,'Name'):null;
    custName=_fxText(nEl);
    if(!custName){
      var ple=_fxFirstDesc(party,'PartyLegalEntity');
      if(ple){var rn=_fxFirstDesc(ple,'RegistrationName');custName=_fxText(rn);}
    }
  }
  var addrParts=[];
  if(party){
    var post=_fxFirstDesc(party,'PostalAddress');
    if(post){
      ['StreetName','AdditionalStreetName','CityName','PostalZone','CountrySubentity'].forEach(function(ln){
        var n=_fxFirstDesc(post,ln),tx=_fxText(n);if(tx)addrParts.push(tx);
      });
    }
  }
  var siret='';
  if(party){
    var ids=_fxAll(party,'ID');
    for(var i=0;i<ids.length;i++){
      var idn=ids[i];
      var scheme=String(idn.getAttribute('schemeID')||idn.getAttribute('schemeId')||'').toUpperCase();
      if(scheme==='0002'||scheme.indexOf('SIRET')>=0){siret=_fxText(idn).replace(/\D/g,'');break;}
    }
    if(!siret){
      var ple2=_fxFirstDesc(party,'PartyLegalEntity');
      if(ple2){
        var cid=_fxFirstDesc(ple2,'CompanyID');
        var st=String(cid&&cid.getAttribute('schemeID')||'').toUpperCase();
        if(st==='0002'||!st)siret=_fxText(cid).replace(/\D/g,'');
      }
    }
  }
  var lines=[];
  var invLines=_fxAll(inv,'InvoiceLine');
  for(var li=0;li<invLines.length;li++){
    var lin=invLines[li];
    var qtyEl=_fxFirstDesc(lin,'InvoicedQuantity');
    var qty=_fxParseAmount(_fxText(qtyEl));if(!Number.isFinite(qty)||qty<=0)qty=1;
    var lineAmtEl=_fxFirstDesc(lin,'LineExtensionAmount');
    var lineTotal=_fxParseAmount(_fxText(lineAmtEl));
    var item=_fxFirstDesc(lin,'Item');
    var label='Ligne '+(li+1);
    if(item){
      var desc=_fxFirstDesc(item,'Description');
      var nam=_fxFirstDesc(item,'Name');
      label=_fxText(desc)||_fxText(nam)||label;
    }
    var unitPrix=Number.isFinite(lineTotal)?lineTotal/qty:0;
    if(!Number.isFinite(unitPrix)||unitPrix<0)unitPrix=0;
    lines.push({label:label.slice(0,220),qty:Math.max(1,qty),prix:unitPrix});
  }
  var payable=_fxFirstDesc(inv,'PayableAmount');
  var taxIncl=_fxFirstDesc(inv,'TaxInclusiveAmount');
  var taxExcl=_fxFirstDesc(inv,'TaxExclusiveAmount');
  var total=_fxParseAmount(_fxText(payable));
  if(!Number.isFinite(total))total=_fxParseAmount(_fxText(taxIncl));
  if(!Number.isFinite(total))total=_fxParseAmount(_fxText(taxExcl));
  if(!Number.isFinite(total)&&lines.length)total=lines.reduce(function(s,l){return s+l.qty*l.prix;},0);
  if(!Number.isFinite(total))total=0;
  var bdlRefs=[];
  var ads=_fxAll(inv,'AdditionalDocumentReference');
  for(var ai=0;ai<ads.length;ai++){
    var ade=ads[ai];
    var idd=_fxFirstDesc(ade,'ID');
    var t=_fxText(idd);if(!t)continue;
    var dtc=_fxText(_fxFirstDesc(ade,'DocumentTypeCode'));
    if(!dtc||dtc==='130'||dtc==='916'||/BL|livraison|delivery|despatch/i.test(String(ade.textContent||'')))bdlRefs.push(t);
  }
  bdlRefs=Array.from(new Set(bdlRefs)).slice(0,50);
  if(!custName)custName='Client (fichier)';
  return{
    cabinetName:custName,
    cabinetAdresse:addrParts.join(', '),
    cabinetSiret:siret.slice(0,14),
    facture:{
      legacyNum:invoiceId,
      dateISO:dateISO,
      lines:lines.length?lines:[{label:'Import fichier',qty:1,prix:total}],
      total:total,
      bdlRefs:bdlRefs,
      note:'Import XML fichier / UBL — '+String(fileName||''),
      status:'brouillon'
    }
  };
}

function _fxExtractCII(doc,fileName){
  var txn=_fxFirstDesc(doc.documentElement,'SupplyChainTradeTransaction');
  if(!txn)txn=_fxFirstDesc(doc.documentElement,'SpecifiedSupplyChainTradeTransaction');
  if(!txn)return null;
  var agr=_fxFirstDesc(txn,'ApplicableHeaderTradeAgreement');
  var buyer=agr?_fxFirstDesc(agr,'BuyerTradeParty'):null;
  if(!buyer)return null;
  var custName=_fxText(_fxFirstDesc(buyer,'Name'));
  var post=_fxFirstDesc(buyer,'PostalTradeAddress');
  var addrParts=[];
  if(post){
    ['LineOne','LineTwo','CityName','PostcodeCode','CountryID'].forEach(function(ln){
      var n=_fxFirstDesc(post,ln),tx=_fxText(n);if(tx)addrParts.push(tx);
    });
  }
  var siret='';
  var specIds=_fxAll(buyer,'ID');
  for(var si=0;si<specIds.length;si++){
    var sid=specIds[si];
    var sch=String(sid.getAttribute('schemeID')||'').toUpperCase();
    if(sch==='0002'||sch.indexOf('SIRET')>=0)siret=_fxText(sid).replace(/\D/g,'');
  }
  var invoiceId='';
  var dateISO=fmtISO(new Date());
  var hi=_fxFirstDesc(doc.documentElement,'ExchangedDocumentContext')?_fxFirstDesc(doc.documentElement,'HeaderExchangedDocument'):_fxFirstDesc(doc.documentElement,'HeaderExchangedDocument');
  hi=_fxFirstDesc(doc.documentElement,'HeaderExchangedDocument')||hi;
  if(!hi){
    var roots=_fxAll(doc,'HeaderExchangedDocument');
    if(roots.length)hi=roots[0];
  }
  if(hi){
    invoiceId=_fxText(_fxFirstDesc(hi,'ID'))||invoiceId;
    var issued=_fxFirstDesc(hi,'IssueDateTime');
    if(issued){
      var ds=_fxText(_fxFirstDesc(issued,'DateTimeString'));
      if(ds&&ds.length>=8)dateISO=ds.slice(0,4)+'-'+ds.slice(4,6)+'-'+ds.slice(6,8);
    }
  }
  var lines=[];
  var lineItems=_fxAll(txn,'IncludedSupplyChainTradeLineItem');
  for(var li=0;li<lineItems.length;li++){
    var item=lineItems[li];
    var prod=_fxFirstDesc(item,'SpecifiedTradeProduct');
    var label=prod?_fxText(_fxFirstDesc(prod,'Name')):'Ligne '+(li+1);
    var settled=_fxFirstDesc(item,'SpecifiedLineTradeSettlement');
    var lineTotal=NaN,qty=1;
    if(settled){
      var summ=_fxFirstDesc(settled,'SpecifiedTradeSettlementLineMonetarySummation');
      if(summ){
        var lta=_fxFirstDesc(summ,'LineTotalAmount');
        lineTotal=_fxParseAmount(_fxText(lta));
      }
      var agree=_fxFirstDesc(item,'SpecifiedLineTradeAgreement');
      if(agree){
        var net=_fxFirstDesc(agree,'NetPriceProductTradePrice');
        if(net){
          var qEl=_fxFirstDesc(net,'BasisQuantity');
          qty=_fxParseAmount(_fxText(qEl));if(!Number.isFinite(qty)||qty<=0)qty=1;
        }
      }
    }
    if(!Number.isFinite(lineTotal))lineTotal=0;
    var unitPrix=qty?lineTotal/qty:0;
    lines.push({label:(label||'Ligne').slice(0,220),qty:Math.max(1,qty),prix:unitPrix});
  }
  var grandTotal=NaN;
  var sums=_fxAll(txn,'SpecifiedTradeSettlementHeaderMonetarySummation');
  if(!sums.length)sums=_fxAll(doc,'SpecifiedTradeSettlementHeaderMonetarySummation');
  for(var g=0;g<sums.length;g++){
    var pay=_fxFirstDesc(sums[g],'GrandTotalAmount')||_fxFirstDesc(sums[g],'DuePayableAmount');
    var v=_fxParseAmount(_fxText(pay));
    if(Number.isFinite(v)){grandTotal=v;break;}
  }
  if(!Number.isFinite(grandTotal)){
    var gas=_fxAll(doc,'GrandTotalAmount');
    for(var gi=gas.length-1;gi>=0;gi--){
      var v2=_fxParseAmount(_fxText(gas[gi]));
      if(Number.isFinite(v2)&&v2>0){grandTotal=v2;break;}
    }
  }
  if(!Number.isFinite(grandTotal)&&lines.length)grandTotal=lines.reduce(function(s,l){return s+l.qty*l.prix;},0);
  if(!Number.isFinite(grandTotal))grandTotal=0;
  if(!custName)custName='Client (fichier CII)';
  if(!invoiceId)invoiceId='IMPORT';
  return{
    cabinetName:custName,
    cabinetAdresse:addrParts.join(', '),
    cabinetSiret:siret.slice(0,14),
    facture:{
      legacyNum:invoiceId,
      dateISO:dateISO,
      lines:lines.length?lines:[{label:'Import fichier',qty:1,prix:grandTotal}],
      total:grandTotal,
      bdlRefs:[],
      note:'Import XML fichier (CII) — '+String(fileName||''),
      status:'brouillon'
    }
  };
}

function importFacturXPlanToTextDump(data){
  return '=== Extrait structuré fichier (auto) ===\nCabinet : '+data.cabinetName+'\nAdresse : '+(data.cabinetAdresse||'')+'\nSIRET : '+(data.cabinetSiret||'')+'\nFacture : '+data.facture.legacyNum+' du '+data.facture.dateISO+'\nTotal : '+data.facture.total+'\n';
}

function importFacturXBuildPlan(xmlString,fileName){
  try{
    var doc=new DOMParser().parseFromString(xmlString,'text/xml');
    if(doc.querySelector('parsererror'))throw new Error('XML invalide');
    var data=null;
    if(_fxAll(doc,'Invoice').length)data=_fxExtractUBLInvoice(_fxAll(doc,'Invoice')[0],fileName);
    if(!data)data=_fxExtractCII(doc,fileName);
    if(!data||!data.facture)throw new Error('Format non reconnu (UBL Invoice ou CII / CrossIndustryInvoice).');
    var useName=data.cabinetName;
    var ex=_importFindCabinetByName(data.cabinetName);
    if(ex)useName=ex.name;
    var actions=[];
    if(!ex){
      actions.push({type:'create_cabinet',draft:{
        name:data.cabinetName,phone:'',email:'',
        adresse:data.cabinetAdresse||'',siretCab:data.cabinetSiret||'',note:'fichier'
      }});
    }
    actions.push({type:'create_facture',draft:{
      cabinetName:useName,
      legacyNum:String(data.facture.legacyNum||'').slice(0,80),
      dateISO:data.facture.dateISO,
      status:data.facture.status||'brouillon',
      lines:data.facture.lines,
      total:data.facture.total,
      bdlRefs:data.facture.bdlRefs||[],
      note:data.facture.note||''
    }});
    return{
      ok:true,
      plan:{
        summary:'fichier : facture '+String(data.facture.legacyNum)+' — '+data.facture.lines.length+' ligne(s), total '+String(data.facture.total)+' pour « '+useName+' ».',
        questions:[],
        actions:actions,
        _source:'factur_x'
      },
      textDump:importFacturXPlanToTextDump(data)
    };
  }catch(e){
    return{ok:false,error:String(e&&e.message||e)};
  }
}

function importCsvSplitLine(line,delim){
  var out=[],cur='',inQ=false;
  for(var i=0;i<line.length;i++){
    var c=line[i],n=line[i+1];
    if(c==='"'&&inQ&&n==='"'){cur+='"';i++;continue;}
    if(c==='"'){inQ=!inQ;continue;}
    if(!inQ&&c===delim){out.push(cur);cur='';continue;}
    cur+=c;
  }
  out.push(cur);
  return out.map(function(s){return s.trim();});
}
function importCsvDetectDelim(headerLine){
  var sc=(headerLine.match(/;/g)||[]).length;
  var cc=(headerLine.match(/,/g)||[]).length;
  var tc=(headerLine.match(/\t/g)||[]).length;
  if(tc>=sc&&tc>=cc)return '\t';
  if(sc>=cc)return ';';
  return ',';
}
var _IMPORT_COL_SYN={
  cabinet:['cabinet','client','praticien','dentiste','customer','compte','dr','docteur','nom client','libelle client','raison sociale','tiers','contact'],
  patient:['patient','nom patient','beneficiaire'],
  date:['date','dt','jour','livraison','liv','emis'],
  bl:['bl','bon','livraison','bdl','no bl','n° bl','numero bl','num bl','delivery','delivery note'],
  facture:['facture','n facture','n° facture','no facture','invoice','fac','num facture','numero facture','piece'],
  desc:['libelle','description','travail','prestation','designation','article','prothese','type','product'],
  prix:['prix','montant','total','ht','ttc','amount','net','pu','prix unitaire'],
  qty:['qte','qty','quantite','quantité','nombre','nb'],
  materiau:['materiau','materiaux','matériau','alliage','materiel'],
  lot:['lot','n lot','batch'],
  siret:['siret'],
  email:['email','mail','e-mail'],
  phone:['tel','telephone','téléphone','phone','portable']
};
function importCsvMapHeaders(headers){
  var norm=headers.map(_fxNormHeader);
  var best={};
  for(var role in _IMPORT_COL_SYN){
    var bestI=-1,bestSc=0;
    for(var i=0;i<norm.length;i++){
      var sc=0;
      var syns=_IMPORT_COL_SYN[role];
      for(var s=0;s<syns.length;s++){
        if(norm[i]===syns[s])sc=15;
        else if(norm[i].indexOf(syns[s])>=0)sc=Math.max(sc,9);
      }
      if(sc>bestSc){bestSc=sc;bestI=i;}
    }
    if(bestI>=0&&bestSc>=6)best[role]=bestI;
  }
  return{best:best,headers:headers,norm:norm};
}
function importProthesisRowsToPlan(rows,mapRes,fileName){
  var map=mapRes.best;
  if(map.cabinet==null)return{ok:false,error:'Colonne cabinet / client introuvable (en-têtes : '+mapRes.headers.join(' | ')+').'};
  var cabs=[],cabL=new Set();
  for(var r=0;r<rows.length;r++){
    var cn=String(rows[r][map.cabinet]||'').trim();
    if(cn&&!cabL.has(_fxNormHeader(cn))){cabL.add(_fxNormHeader(cn));cabs.push(cn);}
  }
  var actions=[];
  for(var c=0;c<cabs.length;c++){
    actions.push({type:'create_cabinet',draft:{name:cabs[c],phone:'',email:'',adresse:'',siretCab:'',note:'preset CSV'}});
  }
  var facCount=0,blCount=0;
  var facCol=map.facture!=null;
  var nf=0;
  for(var r0=0;r0<rows.length;r0++){
    if(facCol&&String(rows[r0][map.facture]||'').trim())nf++;
  }
  var groupInvoices=facCol&&nf>=Math.max(1,Math.floor(rows.length*0.15));
  if(groupInvoices){
    var groups={};
    for(var r1=0;r1<rows.length;r1++){
      var row1=rows[r1];
      var fac=String(row1[map.facture]||'').trim();
      if(!fac)continue;
      var cn1=String(row1[map.cabinet]||'').trim();
      if(!cn1)continue;
      var k=_fxNormHeader(cn1)+'||'+_fxNormHeader(fac);
      if(!groups[k])groups[k]={cabinet:cn1,fac:fac,lines:[],dates:[],bdl:[]};
      var ds=map.desc!=null?String(row1[map.desc]||'').trim():'Ligne';
      var qty=map.qty!=null?_fxParseAmount(row1[map.qty]):1;if(!Number.isFinite(qty)||qty<=0)qty=1;
      var pr=map.prix!=null?_fxParseAmount(row1[map.prix]):NaN;
      if(!Number.isFinite(pr))pr=0;
      groups[k].lines.push({label:ds||'Ligne',qty:qty,prix:qty?pr/qty:pr});
      if(map.date!=null){var d=_fxParseDateISO(row1[map.date]);if(d)groups[k].dates.push(d);}
      if(map.bl!=null){var b=String(row1[map.bl]||'').trim();if(b)groups[k].bdl.push(b);}
    }
    for(var gk in groups){
      var g=groups[gk];
      if(!g.lines.length)continue;
      var tot=g.lines.reduce(function(s,l){return s+l.qty*l.prix;},0);
      var dt=g.dates.length?g.dates.slice().sort()[0]:fmtISO(new Date());
      var brefs=Array.from(new Set(g.bdl)).slice(0,30);
      actions.push({type:'create_facture',draft:{
        cabinetName:g.cabinet,
        legacyNum:g.fac,
        dateISO:dt,
        lines:g.lines,
        total:tot,
        bdlRefs:brefs,
        note:'Import CSV (factures) — '+String(fileName||''),
        status:'brouillon'
      }});
      facCount++;
    }
    if(!facCount)groupInvoices=false;
  }
  if(!groupInvoices){
    for(var r2=0;r2<rows.length;r2++){
      var row2=rows[r2];
      var cn2=String(row2[map.cabinet]||'').trim();
      if(!cn2)continue;
      var ds2=map.desc!=null?String(row2[map.desc]||'').trim():'';
      var q2=map.qty!=null?_fxParseAmount(row2[map.qty]):1;if(!Number.isFinite(q2)||q2<=0)q2=1;
      var pr2=map.prix!=null?_fxParseAmount(row2[map.prix]):0;if(!Number.isFinite(pr2))pr2=0;
      var d2=map.date!=null?_fxParseDateISO(row2[map.date]):'';
      var bln=map.bl!=null?String(row2[map.bl]||'').trim():'';
      var pat=map.patient!=null?String(row2[map.patient]||'').trim():'';
      var mat=map.materiau!=null?String(row2[map.materiau]||'').trim():'';
      var lot=map.lot!=null?String(row2[map.lot]||'').trim():'';
      actions.push({type:'create_bl',draft:{
        cabinetName:cn2,
        patient:pat,
        legacyBlNum:bln,
        dateISO:d2,
        description:ds2||'Import CSV',
        typeKey:'provisoire',
        nb:q2,
        prix:pr2,
        materiaux:mat,
        lot:lot,
        note:'preset CSV'
      }});
      blCount++;
    }
  }
  if(!facCount&&!blCount)return{ok:false,error:'Aucune ligne exploitable (vérifiez prix, libellé, n° facture ou cabinet).'};
  return{
    ok:true,
    plan:{
      summary:'Tableau : '+cabs.length+' cabinet(s), '+(groupInvoices&&facCount?facCount+' facture(s) groupée(s)':blCount+' bon(s) de livraison')+'. Fichier : '+String(fileName||'')+'.',
      questions:[],
      actions:actions,
      _source:'prothesis_csv'
    }
  };
}

function importProthesisParseCsvText(csvText,fileName){
  var lines=String(csvText||'').split(/\r?\n/).filter(function(l){return String(l).trim().length;});
  if(lines.length<2)return{ok:false,error:'CSV trop court (en-tête + au moins une ligne).'};
  var delim=importCsvDetectDelim(lines[0]);
  var headers=importCsvSplitLine(lines[0],delim);
  var rows=[];
  for(var i=1;i<lines.length;i++){
    var cells=importCsvSplitLine(lines[i],delim);
    if(cells.length===1&&!cells[0].trim())continue;
    rows.push(cells);
  }
  for(var j=0;j<rows.length;j++){
    while(rows[j].length<headers.length)rows[j].push('');
  }
  var mapRes=importCsvMapHeaders(headers);
  return importProthesisRowsToPlan(rows,mapRes,fileName);
}

function importTryLoadStructuredAfterFile(text,fileName){
  var mode=importAiGetMode();
  var st=document.getElementById('import-ai-status');
  var ta=document.getElementById('import-ai-raw');
  _importPlan=null;
  if(mode==='facturx'){
    var fx=importFacturXBuildPlan(text,fileName);
    if(fx.ok){
      _importPlan=fx.plan;
      if(ta&&fx.textDump)ta.value=fx.textDump;
      if(st){st.textContent='fichier : plan prêt (sans IA). Vérifiez l’aperçu puis appliquez.';st.style.color='#2a6049';}
      renderImportPlanPreview(_importPlan);
      return true;
    }
    if(ta)ta.value=text;
    if(st){st.textContent='fichier : '+fx.error+' — corrigez le fichier ou repassez en mode Auto + IA.';st.style.color='#c8410a';}
    return false;
  }
  if(mode==='prothesis'){
    var pr=importProthesisParseCsvText(text,fileName);
    if(pr.ok){
      _importPlan=pr.plan;
      if(ta)ta.value=text;
      if(st){st.textContent='CSV : plan prêt (sans IA).';st.style.color='#2a6049';}
      renderImportPlanPreview(_importPlan);
      return true;
    }
    if(ta)ta.value=text;
    if(st){st.textContent=pr.error;st.style.color='#c8410a';}
    return false;
  }
  return false;
}



function _importParseAiJsonText(text){
  var t=String(text||'').trim();
  var fence=t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(fence)t=fence[1].trim();
  return JSON.parse(t);
}

function _importSetByPath(obj, pathStr, val){
  var parts=String(pathStr||'').split('.').filter(Boolean);
  if(!parts.length)return;
  var cur=obj;
  for(var i=0;i<parts.length-1;i++){
    var k=parts[i];
    if(cur[k]==null||typeof cur[k]!=='object')cur[k]={};
    cur=cur[k];
  }
  cur[parts[parts.length-1]]=val;
}

function _importFindCabinetByName(name){
  var n=String(name||'').trim().toLowerCase();if(!n)return null;
  var exact=cabinets.find(function(c){return String(c.name||'').trim().toLowerCase()===n;});
  if(exact)return exact;
  return cabinets.find(function(c){
    var cn=String(c.name||'').trim().toLowerCase();
    return cn&&n&&(cn.indexOf(n)>=0||n.indexOf(cn)>=0);
  })||null;
}

function _importResolveTypeKey(draft){
  var k=String(draft.typeKey||'').trim();
  if(k&&TYPE_LABELS[k])return k;
  var desc=String(draft.description||draft.typeLabel||'').toLowerCase();
  if(desc){
    for(var id in TYPE_LABELS){
      var lab=String(TYPE_LABELS[id]||'').toLowerCase();
      if(lab&&(desc.indexOf(lab)>=0||lab.indexOf(desc)>=0))return id;
    }
  }
  return 'provisoire';
}

function createLegacyImportedBL(cab, draft){
  if(!cab||!draft)return;
  var typeKey=_importResolveTypeKey(draft);
  var nb=Math.max(1,parseInt(draft.nb,10)||1);
  var pu=parseFloat(draft.prix);
  if(!Number.isFinite(pu))pu=0;
  var lignes=draft.lignes;
  if(!Array.isArray(lignes)||!lignes.length){
    lignes=[{type:typeKey,typeLabel:TYPE_LABELS[typeKey]||draft.description||'Import',nb:nb,prix:pu,total:pu*nb}];
  }else{
    lignes=lignes.map(function(l){
      var t=l.type&&TYPE_LABELS[l.type]?l.type:_importResolveTypeKey({typeKey:l.type,description:l.typeLabel||l.label});
      var nbb=Math.max(1,parseFloat(l.nb)||1);
      var p=parseFloat(l.prix);if(!Number.isFinite(p))p=0;
      return {type:t,typeLabel:TYPE_LABELS[t]||l.typeLabel||l.label||t,nb:nbb,prix:p,total:p*nbb};
    });
  }
  var totalBL=lignes.reduce(function(s,l){return s+(l.total!=null?l.total:(l.prix||0)*(l.nb||1));},0);
  var first=lignes[0];
  var leg=String(draft.legacyBlNum||'').trim();
  var num=leg&&!bdl.find(function(b){return b.num===leg;})?leg:genBLNum();
  var dStr=String(draft.dateISO||'').trim();
  var dateIso=dStr&&/^\d{4}-\d{2}-\d{2}$/.test(dStr)?dStr:fmtISO(new Date());
  var bl={
    id:'impbl_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    num:num,
    jobId:null,
    patient:String(draft.patient||'').trim()||'—',
    trackCode:'',
    prothesisId:String(draft.prothesisId||'').trim(),
    type:first.type,
    typeLabel:lignes.length>1?lignes.map(function(l){return l.typeLabel;}).join(', '):first.typeLabel,
    nb:first.nb,
    lignes:lignes,
    note:String(draft.note||'').trim(),
    materiaux:String(draft.materiaux||'').trim(),
    lot:String(draft.lot||'').trim(),
    cabinet:cab.id,
    cabName:cab.name,
    cabPortalId:cab.portalId||'',
    prix:first.prix,
    total:totalBL,
    deliveryDate:'',
    date:dateIso,
    status:'envoye',
    createdAt:new Date().toISOString(),
    importedFrom:'ai_import',
    orderId:null,orderPortalId:null,orderStepId:null,orderData:null,parentJobId:null
  };
  if(!cab.portalId){cab.portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();}
  if(!cab.code){cab.code=Math.random().toString(36).substr(2,6).toUpperCase();}
  if(!cab.pwd){cab.pwd=Math.random().toString(36).substr(2,8);}
  bdl.unshift(bl);
}

function createLegacyImportedFacture(cab, draft){
  if(!cab||!draft)return;
  var lines=Array.isArray(draft.lines)?draft.lines.map(function(l){
    return {label:String(l.label||'').trim()||'Ligne',qty:Math.max(1,parseFloat(l.qty)||1),prix:parseFloat(l.prix)||0};
  }):[];
  if(!lines.length)lines=[{label:String(draft.note||'Import').slice(0,80)||'Import',qty:1,prix:parseFloat(draft.total)||0}];
  var total=parseFloat(draft.total);
  if(!Number.isFinite(total))total=lines.reduce(function(s,l){return s+(l.qty||1)*(l.prix||0);},0);
  var now=new Date();
  var year=now.getFullYear();
  var n=documents.filter(function(d){return d.type==='facture'&&d.num&&d.num.includes(String(year));}).length+1;
  var st=String(draft.status||'brouillon').toLowerCase()==='envoye'?'envoye':'brouillon';
  var leg=String(draft.legacyNum||'').trim();
  var num=leg&&!documents.find(function(d){return d.num===leg;})?leg:('FAC-'+year+'-'+String(n).padStart(3,'0'));
  var dStr=String(draft.dateISO||'').trim();
  var dateIso=dStr&&/^\d{4}-\d{2}-\d{2}$/.test(dStr)?dStr:fmtISO(now);
  documents.unshift({
    id:'impfac_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    num:num,
    type:'facture',
    cabinet:cab.id,
    cabName:cab.name,
    date:dateIso,
    note:String(draft.note||'').trim(),
    lines:lines,
    total:total,
    bdlRefs:[],
    status:st,
    createdAt:now.toISOString(),
    importedFrom:'ai_import'
  });
}

async function runAiImportAnalyze(){
  if(!guardPerm('action:data_import','⛔ Votre rôle ne permet pas d\'importer des données.'))return;
  var ta=document.getElementById('import-ai-raw');
  var st=document.getElementById('import-ai-status');
  var pv=document.getElementById('import-ai-preview');
  if(!ta||!st)return;
  var raw=ta.value||'';
  if(!raw.trim()){st.textContent='Collez du contenu ou choisissez un fichier.';st.style.color='#c0392b';return;}
  _importPlan=null;
  st.textContent='Analyse en cours…';
  st.style.color='var(--ink-soft)';
  if(pv){pv.style.display='none';pv.innerHTML='';}
  try{
    var resp=await fetch('/.netlify/functions/ai-import-plan',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        rawText:raw,
        fileName:(document.getElementById('import-ai-file')&&document.getElementById('import-ai-file').files[0]&&document.getElementById('import-ai-file').files[0].name)||'',
        existingCabinetNames:cabinets.map(function(c){return c.name;})
      })
    });
    var data=await resp.json();
    if(!resp.ok||data.error){
      throw new Error((data.error&&data.error.message)||data.message||('HTTP '+resp.status));
    }
    var aiText=(data.content&&data.content[0]&&data.content[0].text)||'';
    if(!aiText)throw new Error('Réponse vide du modèle.');
    var plan=_importParseAiJsonText(aiText);
    if(!plan||typeof plan!=='object')throw new Error('Format de plan invalide.');
    if(!Array.isArray(plan.actions))plan.actions=[];
    if(!Array.isArray(plan.questions))plan.questions=[];
    _importPlan=plan;
    st.textContent='C\'est prêt — vérifiez le résumé puis validez.';
    st.style.color='#2a6049';
    renderImportPlanPreview(plan);
  }catch(e){
    st.textContent='Erreur : '+String(e.message||e).slice(0,200);
    st.style.color='#c0392b';
  }
}

async function applyAiImportPlan(){
  if(!guardPerm('action:data_import','⛔ Import refusé pour votre rôle.'))return;
  if(!_importPlan||!Array.isArray(_importPlan.actions)){showToast('Aucun plan à appliquer — lancez d’abord l’analyse.','#c0392b');return;}
  var plan=JSON.parse(JSON.stringify(_importPlan));
  var inputs=document.querySelectorAll('.import-q-inp');
  for(var i=0;i<inputs.length;i++){
    var inp=inputs[i];
    var qid=inp.dataset.qid;
    var idx=parseInt(inp.dataset.idx,10);
    var path=inp.dataset.path;
    var v=inp.value.trim();
    if(!v)continue;
    var q=(plan.questions||[]).find(function(x){return x.id===qid;});
    if(q&&q.mergeInto&&typeof q.mergeInto.actionIndex==='number'&&plan.actions[q.mergeInto.actionIndex]){
      _importSetByPath(plan.actions[q.mergeInto.actionIndex], q.mergeInto.path||'draft.note', v);
    }
  }
  var cabByName={};
  var created=0,errors=[];
  for(var j=0;j<plan.actions.length;j++){
    var act=plan.actions[j];
    try{
      if(act.type==='create_cabinet'&&act.draft){
        var nm=String(act.draft.name||'').trim();
        if(!nm)continue;
        var ex=_importFindCabinetByName(nm);
        if(ex){cabByName[nm.toLowerCase()]=ex;continue;}
        if(cabinets.find(function(c){return String(c.name||'').toLowerCase()===nm.toLowerCase();})){cabByName[nm.toLowerCase()]=cabinets.find(function(c){return String(c.name||'').toLowerCase()===nm.toLowerCase();});continue;}
        var colors=['#1a4a7a','#2a6049','#5a3472','#c8410a','#7b3f00'];
        var col=colors[cabinets.length%colors.length];
        addCabinet(nm,col,String(act.draft.phone||'').trim(),String(act.draft.email||'').trim());
        var createdCab=cabinets.find(function(c){return String(c.name||'').toLowerCase()===nm.toLowerCase();});
        if(createdCab)cabByName[nm.toLowerCase()]=createdCab;
        created++;
      }else if(act.type==='create_bl'&&act.draft){
        var cname=String(act.draft.cabinetName||'').trim();
        var cab=cabByName[cname.toLowerCase()]||_importFindCabinetByName(cname);
        if(!cab){errors.push('BL sans cabinet : '+cname);continue;}
        createLegacyImportedBL(cab,act.draft);
        cabByName[cname.toLowerCase()]=cab;
        created++;
      }else if(act.type==='create_facture'&&act.draft){
        var cname2=String(act.draft.cabinetName||'').trim();
        var cab2=cabByName[cname2.toLowerCase()]||_importFindCabinetByName(cname2);
        if(!cab2){errors.push('Facture sans cabinet : '+cname2);continue;}
        createLegacyImportedFacture(cab2,act.draft);
        cabByName[cname2.toLowerCase()]=cab2;
        created++;
      }
    }catch(err){errors.push(String(err&&err.message||err));}
  }
  saveCabinets();saveBdl();saveDocs();
  scheduleSave();
  _importPlan=null;
  var pv=document.getElementById('import-ai-preview');if(pv){pv.style.display='none';pv.innerHTML='';}
  var st=document.getElementById('import-ai-status');if(st){st.textContent='Terminé.';st.style.color='#2a6049';}
  renderLivraisons();renderToInvoice();renderBillDocs();updateBillStats();renderCabList();
  reportAudit({action:'data_import_applied',target:String(created),meta:errors.length?errors.slice(0,5).join(' | '):''});
  showToast('✅ Import : '+created+' action(s) appliquée(s)'+(errors.length?' — '+errors.length+' avertissement(s)':'')+'.','#2a6049',7000);
  if(errors.length)console.warn('Import warnings',errors);
}



function importAiPickFile(inp){
  var f=inp.files&&inp.files[0];if(!f)return;
  var st=document.getElementById('import-ai-status');
  var ta=document.getElementById('import-ai-raw');
  if(st){st.textContent='Lecture du fichier « '+f.name+' »…';st.style.color='var(--ink-soft)';}
  var r=new FileReader();
  r.onload=function(){
    var txt=String(r.result||'');
    if(ta)ta.value=txt;
    var fn=f.name||'';
    if(/^\s*</.test(txt)||/\.xml$/i.test(fn)){
      var fx=importFacturXBuildPlan(txt,fn);
      if(fx.ok){
        _importPlan=fx.plan;
        if(fx.textDump&&ta)ta.value=fx.textDump;
        if(st){st.textContent='Fichier reconnu. Vérifiez le résumé ci-dessous.';st.style.color='#2a6049';}
        renderImportPlanPreview(_importPlan);
        inp.value='';
        return;
      }
    }
    if(importTryLoadStructuredAfterFile(txt,fn)){inp.value='';return;}
    if(st){st.textContent='Fichier chargé. Cliquez sur « Préparer l\'import ».';st.style.color='var(--ink-soft)';}
    inp.value='';
  };
  r.onerror=function(){if(st){st.textContent='Impossible de lire ce fichier.';st.style.color='#c0392b';}};
  r.readAsText(f,'UTF-8');
}

function importAiGetMode(){ return 'auto'; }

function _importActionLabel(type){
  if(type==='create_cabinet')return 'Dentiste';
  if(type==='create_bl')return 'Bon de livraison';
  if(type==='create_facture')return 'Facture';
  return 'Élément';
}


async function runImportPrepare(){
  if(!guardPerm('action:data_import','⛔ Votre rôle ne permet pas d\'importer des données.'))return;
  var ta=document.getElementById('import-ai-raw');
  var st=document.getElementById('import-ai-status');
  var pv=document.getElementById('import-ai-preview');
  if(!ta||!st)return;
  var raw=ta.value||'';
  if(!raw.trim()){st.textContent='Choisissez un fichier ou collez un export de votre ancien logiciel.';st.style.color='#c0392b';return;}
  var fn=(document.getElementById('import-ai-file')&&document.getElementById('import-ai-file').files[0]&&document.getElementById('import-ai-file').files[0].name)||'export';
  _importPlan=null;
  if(pv){pv.style.display='none';pv.innerHTML='';}
  st.textContent='Analyse en cours…';st.style.color='var(--ink-soft)';
  if(/^\s*</.test(raw)||/\.xml$/i.test(fn)){
    var fx=importFacturXBuildPlan(raw,fn);
    if(fx.ok){ _importPlan=fx.plan; st.textContent='C\'est prêt — vérifiez le résumé puis validez.'; st.style.color='#2a6049'; renderImportPlanPreview(_importPlan); return; }
  }
  var pr=importProthesisParseCsvText(raw,fn);
  if(pr.ok){ _importPlan=pr.plan; st.textContent='C\'est prêt — vérifiez le résumé puis validez.'; st.style.color='#2a6049'; renderImportPlanPreview(_importPlan); return; }
  await runAiImportAnalyze();
}
function importRunStructuredFromTextarea(){ runImportPrepare(); }
