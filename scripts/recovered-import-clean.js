var _importPlan=null;

function importAiGetMode(){
  var s=document.getElementById('import-ai-mode');
  return s&&s.value?s.value:'auto';
}

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
  if(!custName)custName='Client (Factur-X)';
  return{
    cabinetName:custName,
    cabinetAdresse:addrParts.join(', '),
    cabinetSiret:siret.slice(0,14),
    facture:{
      legacyNum:invoiceId,
      dateISO:dateISO,
      lines:lines.length?lines:[{label:'Import Factur-X',qty:1,prix:total}],
      total:total,
      bdlRefs:bdlRefs,
      note:'Import XML Factur-X / UBL — '+String(fileName||''),
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
  if(!custName)custName='Client (Factur-X CII)';
  if(!invoiceId)invoiceId='IMPORT';
  return{
    cabinetName:custName,
    cabinetAdresse:addrParts.join(', '),
    cabinetSiret:siret.slice(0,14),
    facture:{
      legacyNum:invoiceId,
      dateISO:dateISO,
      lines:lines.length?lines:[{label:'Import Factur-X',qty:1,prix:grandTotal}],
      total:grandTotal,
      bdlRefs:[],
      note:'Import XML Factur-X (CII) — '+String(fileName||''),
      status:'brouillon'
    }
  };
}

function importFacturXPlanToTextDump(data){
  return '=== Extrait structuré Factur-X (auto) ===\nCabinet : '+data.cabinetName+'\nAdresse : '+(data.cabinetAdresse||'')+'\nSIRET : '+(data.cabinetSiret||'')+'\nFacture : '+data.facture.legacyNum+' du '+data.facture.dateISO+'\nTotal : '+data.facture.total+'\n';
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
        adresse:data.cabinetAdresse||'',siretCab:data.cabinetSiret||'',note:'Factur-X'
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
        summary:'Factur-X : facture '+String(data.facture.legacyNum)+' — '+data.facture.lines.length+' ligne(s), total '+String(data.facture.total)+' pour « '+useName+' ».',
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
      summary:'Preset CSV : '+cabs.length+' cabinet(s), '+(groupInvoices&&facCount?facCount+' facture(s) groupée(s)':blCount+' bon(s) de livraison')+'. Fichier : '+String(fileName||'')+'.',
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
      if(st){st.textContent='Factur-X : plan prêt (sans IA). Vérifiez l’aperçu puis appliquez.';st.style.color='#2a6049';}
      renderImportPlanPreview(_importPlan);
      return true;
    }
    if(ta)ta.value=text;
    if(st){st.textContent='Factur-X : '+fx.error+' — corrigez le fichier ou repassez en mode Auto + IA.';st.style.color='#c8410a';}
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

function importRunStructuredFromTextarea(){
  if(!guardPerm('action:data_import','⛔ Import refusé pour votre rôle.'))return;
  var ta=document.getElementById('import-ai-raw');
  var st=document.getElementById('import-ai-status');
  if(!ta||!st)return;
  var txt=ta.value||'';
  if(!txt.trim()){st.textContent='Collez du CSV ou du XML, ou chargez un fichier.';st.style.color='#c0392b';return;}
  var fn=(document.getElementById('import-ai-file')&&document.getElementById('import-ai-file').files[0]&&document.getElementById('import-ai-file').files[0].name)||'collage';
  var mode=importAiGetMode();
  if(mode==='facturx'){
    var fx=importFacturXBuildPlan(txt,fn);
    if(fx.ok){
      _importPlan=fx.plan;
      st.textContent='Plan Factur-X généré.';
      st.style.color='#2a6049';
      renderImportPlanPreview(_importPlan);
    }else{
      st.textContent=fx.error;
      st.style.color='#c0392b';
    }
    return;
  }
  if(mode==='prothesis'){
    var pr=importProthesisParseCsvText(txt,fn);
    if(pr.ok){
      _importPlan=pr.plan;
      st.textContent='Plan CSV généré.';
      st.style.color='#2a6049';
      renderImportPlanPreview(_importPlan);
    }else{
      st.textContent=pr.error;
      st.style.color='#c0392b';
    }
    return;
  }
  st.textContent='Choisissez le mode Factur-X ou CSV labo pour ce bouton ; en Auto, utilisez « Analyser avec l’IA ».';
  st.style.color='#c8410a';
}

function importAiEnsurePdfJs(){