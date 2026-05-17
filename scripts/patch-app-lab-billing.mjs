import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'app.html');
let s = fs.readFileSync(p, 'utf8');
const D = 'motion'.replace('motion', 'div');

if (!s.includes('loadLabCourierBilling')) {
  const js = `
function labBillingMonthOptions(){
  const sel=document.getElementById('lab-courier-billing-month');
  if(!sel)return;
  const opts=[];
  const d=new Date();
  for(let i=0;i<18;i++){
    const y=d.getUTCFullYear();
    const m=d.getUTCMonth();
    const mk=y+'-'+String(m+1).padStart(2,'0');
    const label=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    opts.push('<option value="'+mk+'"'+(i===0?' selected':'')+'>'+label.charAt(0).toUpperCase()+label.slice(1)+'</option>');
    d.setUTCMonth(d.getUTCMonth()-1);
  }
  sel.innerHTML=opts.join('');
}

function syncLabCourierBillingSelectors(){
  const csel=document.getElementById('lab-courier-billing-courier');
  if(!csel)return;
  if(!_courierLinks.length){
    csel.innerHTML='<option value="">— Aucun coursier —</option>';
    return;
  }
  csel.innerHTML=_courierLinks.map(function(c,i){
    return '<option value="'+escH(c.courierUserId)+'"'+(i===0?' selected':'')+'>'+escH(c.displayName)+'</option>';
  }).join('');
  labBillingMonthOptions();
}

function fmtMonthLabelCourier(mk){
  if(!mk)return '';
  const p=mk.split('-');
  if(p.length<2)return mk;
  const dt=new Date(Date.UTC(parseInt(p[0],10),parseInt(p[1],10)-1,1));
  const label=dt.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  return label.charAt(0).toUpperCase()+label.slice(1);
}

function fmtBillingDateCourier(iso){
  if(!iso)return '';
  return new Date(iso).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}

async function loadLabCourierBilling(){
  const el=document.getElementById('lab-courier-billing-result');
  const csel=document.getElementById('lab-courier-billing-courier');
  const msel=document.getElementById('lab-courier-billing-month');
  if(!el||!csel||!msel)return;
  const courierUserId=csel.value;
  if(!courierUserId){
    el.innerHTML='<span style="color:var(--ink-soft);">Choisissez un coursier rattaché.</span>';
    return;
  }
  el.innerHTML='<span style="color:var(--ink-soft);">Chargement…</span>';
  try{
    const j=await courierApi('getCourierBillingForLab',{courierUserId:courierUserId,month:msel.value});
    const b=j.summary||{};
    const name=(b.courier&&b.courier.displayName)||'Coursier';
    const monthLbl=fmtMonthLabelCourier(b.period&&b.period.month);
    if(!b.totalCourses){
      el.innerHTML='<'+D+' style="padding:12px;background:var(--bg);border-radius:8px;color:var(--ink-soft);">Aucune course terminée pour <b>'+escH(name)+'</b> en '+escH(monthLbl)+'.</'+D+'>';
      return;
    }
    let html='<'+D+' style="padding:14px;background:#f0f7f4;border:1px solid #c8e6d4;border-radius:10px;margin-bottom:12px;">'+
      '<'+D+' style="font-weight:700;font-size:1rem;color:#2a6049;">'+b.totalCourses+' course'+(b.totalCourses>1?'s':'')+' terminée'+(b.totalCourses>1?'s':'')+'</'+D+'>'+
      '<'+D+' style="font-size:.78rem;color:#2a6049;margin-top:4px;">'+escH(name)+' · '+escH(monthLbl)+' · '+b.totalPickups+' réc. · '+b.totalDeliveries+' liv.</'+D+'></'+D+'>';
    if((b.missions||[]).length){
      html+='<'+D+' style="font-weight:700;margin-bottom:8px;font-size:.78rem;">Détail</'+D+'>';
      html+=(b.missions||[]).map(function(m,i){
        return '<'+D+' style="padding:8px 0;border-bottom:1px solid var(--border);font-size:.78rem;">'+
          '<b>'+(i+1)+'.</b> '+escH(m.label)+'<br/><span style="color:var(--ink-soft);">'+fmtBillingDateCourier(m.completedAt)+'</span></'+D+'>';
      }).join('');
    }
    el.innerHTML=html;
  }catch(e){
    el.innerHTML='<span style="color:#c0392b;">'+escH(e.message)+'</span>';
  }
}

`;

  s = s.replace('async function renderCourierLinks(){', js + '\nasync function renderCourierLinks(){');

  const marker = "Aucun coursier rattaché.</motion>";
  if (s.includes(marker)) {
    s = s.replace(marker, "Aucun coursier rattaché.</motion>".replace('motion', 'motion'));
  }
  s = s.replace(
    "}).join(''):'<div style=\"font-size:.78rem;color:var(--ink-soft);\">Aucun coursier rattaché.</div>';\n  }catch(e){el.innerHTML='<motion style=\"color:#c0392b;font-size:.78rem;\">'+escH(e.message)+'</motion>';\n}",
    "}).join(''):'<div style=\"font-size:.78rem;color:var(--ink-soft);\">Aucun coursier rattaché.</motion>';\n    syncLabCourierBillingSelectors();\n    loadLabCourierBilling().catch(function(){});\n  }catch(e){el.innerHTML='<div style=\"color:#c0392b;font-size:.78rem;\">'+escH(e.message)+'</div>';\n}"
  );

  // simpler replace after renderCourierLinks block end
  if (!s.includes('syncLabCourierBillingSelectors();')) {
    s = s.replace(
      `}).join(''):'<div style="font-size:.78rem;color:var(--ink-soft);">Aucun coursier rattaché.</div>';
  }catch(e){el.innerHTML='<div style="color:#c0392b;font-size:.78rem;">'+escH(e.message)+'</div>';}
}

async function renderCourierBoard(){`,
      `}).join(''):'<div style="font-size:.78rem;color:var(--ink-soft);">Aucun coursier rattaché.</div>';
    syncLabCourierBillingSelectors();
    loadLabCourierBilling().catch(function(){});
  }catch(e){el.innerHTML='<motion style="color:#c0392b;font-size:.78rem;">'+escH(e.message)+'</motion>';}
}

async function renderCourierBoard(){`
    );
    s = s.replace(/<motion style="color:#c0392b/g, '<div style="color:#c0392b').replace(/<\/motion>';\n}\n\nasync function renderCourierBoard/, "';</div>\n}\n\nasync function renderCourierBoard");
  }

  s = s.replace(
    `if(pane==='coursiers'){initCourierPaneForm();renderCourierBoard();}`,
    `if(pane==='coursiers'){initCourierPaneForm();renderCourierBoard();renderCourierLinks().catch(function(){});syncLabCourierBillingSelectors();loadLabCourierBilling().catch(function(){});}`
  );

  if (!s.includes('lab-courier-billing-courier')?.addEventListener) {
    s = s.replace(
      `document.getElementById('btn-cp-maps-preview')?.addEventListener('click',function(){`,
      `document.getElementById('lab-courier-billing-courier')?.addEventListener('change',function(){loadLabCourierBilling().catch(function(){});});
document.getElementById('lab-courier-billing-month')?.addEventListener('change',function(){loadLabCourierBilling().catch(function(){});});
document.getElementById('btn-cp-maps-preview')?.addEventListener('click',function(){`
    );
  }
}

fs.writeFileSync(p, s);
console.log('OK');
