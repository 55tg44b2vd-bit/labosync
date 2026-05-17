import fs from 'fs';
import path from 'path';

const file = path.resolve(import.meta.dirname, '../app.html');
let s = fs.readFileSync(file, 'utf8');

const start = s.indexOf('/* ── EMAIL FACTURE (Resend via Netlify) ── */');
const end = s.indexOf('// Event listeners for billing', start);
if (start < 0 || end < 0) throw new Error('block not found');

const newBlock = `/* ── EMAIL FACTURE (Resend via Netlify + repli client mail) ── */
function invoiceEmailPlainBody(doc,labo,portalUrl){
  let s='Bonjour,\\n\\n';
  s+='Votre laboratoire '+String(labo.raisonSociale||'Laboratoire')+' vous envoie la facture '+doc.num+' d\\'un montant de '+fmtEur(doc.total)+'.\\n\\n';
  (doc.lines||[]).forEach(function(l){
    s+='• '+String(l.label||'')+' : '+fmtEur((parseFloat(l.qty)||1)*(parseFloat(l.prix)||0))+'\\n';
  });
  s+='\\nTotal TTC : '+fmtEur(doc.total)+'\\n';
  s+='Exonéré de TVA — art. 261-4-1° CGI · Paiement à 30 jours\\n';
  if(portalUrl)s+='\\nEspace cabinet : '+portalUrl+'\\n';
  s+='\\nCordialement,\\n'+String(labo.raisonSociale||'');
  if(labo.tel)s+='\\nTél : '+labo.tel;
  return s;
}

function openInvoiceMailtoFallback(doc,cab,labo){
  const portalUrl=cab&&cab.portalId?'https://labosync.app/cabinet.html?id='+cab.portalId:'';
  const subject='Facture '+doc.num+' — '+String(labo.raisonSociale||'Laboratoire');
  const body=invoiceEmailPlainBody(doc,labo,portalUrl);
  window.location.href='mailto:'+encodeURIComponent(cab.email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}

async function sendInvoiceEmail(docId,opts){
  opts=opts||{};
  const doc=documents.find(function(d){return d.id===docId;});if(!doc)return false;
  const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
  const email=cab&&cab.email?String(cab.email).trim():'';
  if(!email){showToast(t('toast.no_cab_email'),'#c0392b');return false;}
  const labo=getLegalInfo();
  const portalUrl=cab&&cab.portalId?'https://labosync.app/cabinet.html?id='+cab.portalId:'';
  const linesHtml=(doc.lines||[]).map(function(l){
    return '<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;">'+String(l.label||'')+'</td>'+
      '<td style="padding:6px 10px;text-align:right;border-bottom:1px solid #eee;">'+fmtEur((parseFloat(l.qty)||1)*(parseFloat(l.prix)||0))+'</td></tr>';
  }).join('');
  const htmlBody=\`<motion style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1c1714;">
<div style="background:#1c1410;color:#f5f0e8;padding:20px 24px;border-radius:10px 10px 0 0;">
  <h1 style="margin:0;font-size:18px;">Nouvelle facture — \${String(labo.raisonSociale)}</h1>
</motion>
<div style="background:#fff;border:1px solid #e5ddd2;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
  <p>Bonjour,</p>
  <p>Votre laboratoire <strong>\${String(labo.raisonSociale)}</strong> vous envoie la facture <strong>\${String(doc.num)}</strong> d'un montant de <strong>\${fmtEur(doc.total)}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5f0;border-radius:8px;overflow:hidden;">
    <thead><tr style="background:#1c1714;color:#fff;"><th style="padding:8px 10px;text-align:left;font-size:12px;">Prestation</th><th style="padding:8px 10px;text-align:right;font-size:12px;">Montant</th></tr></thead>
    <tbody>\${linesHtml}</tbody>
    <tfoot><tr><td style="padding:10px;font-weight:700;">Total TTC</td><td style="padding:10px;text-align:right;font-weight:700;color:#c8410a;">\${fmtEur(doc.total)}</td></tr></tfoot>
  </table>
  <p style="font-size:12px;color:#666;">Exonéré de TVA — art. 261-4-1° CGI · Paiement à 30 jours</p>
  \${portalUrl?'<div style="text-align:center;margin-top:20px;"><a href="'+portalUrl+'" style="background:#c8410a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block;">Accéder à votre espace cabinet</a></div>':''}
  <p style="margin-top:20px;font-size:12px;color:#888;">Cordialement,<br/><strong>\${String(labo.raisonSociale)}</strong>\${labo.tel?' — Tél : '+labo.tel:''}</p>
</div></div>\`;

  function mailtoFallback(){
    if(opts.skipMailto)return false;
    if(opts.confirmMailto!==false&&!opts.autoFallback){
      if(!confirm('L\\'envoi automatique par email n\\'est pas disponible.\\n\\nOuvrir Outlook (ou votre client mail) pour envoyer la facture à '+email+' ?'))return false;
    }
    try{if(typeof genPDFDoc==='function')genPDFDoc(docId);}catch(ePdf){}
    openInvoiceMailtoFallback(doc,cab,labo);
    showToast(t('toast.email_mailto_fallback'),'#2a6049',7000);
    return false;
  }

  try{
    const r=await fetch('/.netlify/functions/send-email',{
      method:'POST',
      headers:_portalApiHeaders(),
      body:JSON.stringify({
        to:email,
        subject:'Facture '+doc.num+' — '+String(labo.raisonSociale),
        html:htmlBody,
        fromName:String(labo.raisonSociale)
      })
    });
    const res=await r.json().catch(function(){return {};});
    if(r.ok&&res.ok){
      showToast(ti('toast.email_resend_ok',{email:email})||ti('toast.email_sent',{email:email}),'#2a6049');
      return true;
    }
    const resendMissing=(res.code==='RESEND_NOT_CONFIGURED')||(res.error&&String(res.error).indexOf('RESEND')>=0)||r.status===503;
    if(resendMissing){
      mailtoFallback();
      return false;
    }
    if(r.status===401){
      showToast('Reconnectez-vous pour envoyer un email','#c0392b');
      return false;
    }
    showToast(ti('toast.invoice_sent_email_fail',{err:res.error||r.status}),'#c0392b',7000);
    if(confirm('Échec de l\\'envoi automatique. Ouvrir votre client mail à la place ?'))mailtoFallback();
    return false;
  }catch(e){
    if(opts.autoFallback||confirm('Erreur réseau. Ouvrir votre client mail pour envoyer la facture ?'))mailtoFallback();
    else showToast(t('toast.invoice_sent_email_error'),'#c0392b',6000);
    return false;
  }
}

`;

const newBlockClean = newBlock.replace(/motion/g, 'div');

s = s.slice(0, start) + newBlockClean + s.slice(end);

// Auto-send on "Envoyer" with mailto fallback
s = s.replace(
  `    if(cabForEmail&&cabForEmail.email){
      sendInvoiceEmail(id);
    } else {
      showToast(t('toast.invoice_sent'),'#1a4a7a');
    }`,
  `    if(cabForEmail&&cabForEmail.email){
      sendInvoiceEmail(id,{autoFallback:true,confirmMailto:false});
    } else {
      showToast(t('toast.invoice_sent'),'#1a4a7a');
    }`
);

fs.writeFileSync(file, s);
console.log('OK');
