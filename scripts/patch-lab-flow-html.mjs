import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const D = 'di' + 'v';
const appPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
let s = fs.readFileSync(appPath, 'utf8');

if (!s.includes('id="prog-scan-in"')) {
  const queueScan =
    `    <${D} style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-bottom:12px;padding:12px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;">` +
    `<${D} class="fl" style="flex:1;min-width:200px;margin:0;"><label style="font-size:.72rem;">📷 Scanner la fiche labo (douchette)</label><input type="text" id="prog-scan-in" placeholder="Scannez le code-barres de la boîte…" autocomplete="off" style="font-family:monospace;letter-spacing:.08em;"/></${D}>` +
    `<span style="font-size:.72rem;color:#1e40af;line-height:1.4;flex:1;min-width:180px;">Le scan ouvre le travail pour le programmer.</span></${D}>\n    `;
  s = s.replace('<motion id="queue-list-main"></motion>', queueScan + `<${D} id="queue-list-main"></${D}>`);
  s = s.replace('<div id="queue-list-main"></motion>', queueScan + `<${D} id="queue-list-main"></${D}>`);
  s = s.replace('<div id="queue-list-main"></motion>', queueScan + `<${D} id="queue-list-main"></${D}>`);
  const marker = '    <motion id="queue-list-main"></motion>';
  if (s.includes('prog-scan-in')) {
    /* ok */
  } else {
    s = s.replace(
      '    <div id="queue-list-main"></div>',
      queueScan + `    <${D} id="queue-list-main"></${D}>`
    );
  }
}

if (!s.includes('id="admin-finish-modal"')) {
  const finishModal =
    `\n<!-- Modal échéance saisie admin -->\n` +
    `<${D} id="admin-finish-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3600;align-items:center;justify-content:center;padding:16px;">` +
    `<${D} style="background:#fff;border-radius:14px;width:100%;max-width:420px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.2);">` +
    `<h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;">Échéance atelier</h3>` +
    `<p style="font-size:.82rem;color:#64748b;margin:0 0 16px;line-height:1.45;">Quand ce travail doit-il être terminé ? Une fiche labo avec code-barres sera générée pour la boîte.</p>` +
    `<${D} class="fl" style="margin-bottom:12px;"><label>Date limite</label><input type="date" id="admin-finish-date" style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:1rem;"/></${D}>` +
    `<${D} class="fl" style="margin-bottom:18px;"><label>Heure limite</label><select id="admin-finish-slot" style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:1rem;"><option value="9">Finir avant 9h</option><option value="12" selected>Finir avant 12h</option><option value="18">Finir avant 18h</option></select></${D}>` +
    `<${D} style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;"><button type="button" class="btn btn-b" id="admin-finish-cancel">Annuler</button><button type="button" class="btn btn-a" id="admin-finish-ok">Valider et générer la fiche</button></${D}></${D}></${D}>\n`;
  s = s.replace('<div id="courier-dispatch-modal"', finishModal + '<div id="courier-dispatch-modal"');
}

if (!s.includes('lab-admin-job-flow.js')) {
  s = s.replace(
    '<script src="/scripts/lab-workspace.js"></script>',
    '<script src="/scripts/lab-workspace.js"></script>\n<script src="/scripts/lab-admin-job-flow.js"></script>'
  );
}

const needle =
  "'<tr><td style=\"padding:6px 0;color:#64748b;\">Code patient</td><td style=\"font-weight:700;font-size:1.1rem;\">'+escH2(job.patient)+(job.urgent?' <span style=\"color:#dc2626;\">🔴 URGENT</span>':'')+'</td></tr>'+";
if (s.includes(needle) && !s.includes('job.patientSex')) {
  s = s.replace(
    needle,
    needle +
      "\n      (job.patientSex?'<tr><td style=\"padding:6px 0;color:#64748b;\">Sexe</td><td><strong>'+escH2(job.patientSex==='M'?'Homme':job.patientSex==='F'?'Femme':job.patientSex)+'</strong></td></tr>':'')+"
  );
}

const beforeNote = "(job.note?'<div style=\"background:#fef9c3;";
const deadlineBlock =
  `('<${D} style="background:#1e3a5f;color:#fff;border-radius:10px;padding:14px 16px;margin-bottom:16px;text-align:center;"><${D} style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;opacity:.85;margin-bottom:4px;">À terminer avant</${D}><${D} style="font-size:1.35rem;font-weight:800;">'+escH2((function(){var dl=typeof _deliveryDeadline==='function'?_deliveryDeadline(job):null;if(dl)return dl.toLocaleString('fr-FR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});return typeof _fmtJobDeliveryLine==='function'?_fmtJobDeliveryLine(job):'—';})())+'</${D}></${D}>')+`;
if (s.includes(beforeNote) && !s.includes('À terminer avant')) {
  s = s.replace(beforeNote, deadlineBlock + beforeNote);
}

const footNeedle =
  "'<motion style=\"margin-top:28px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:.72rem;color:#94a3b8;\">Document interne — '+escH2(job.trackCode||job.id)+'</div>'+";
const footNeedle2 =
  "'<div style=\"margin-top:28px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:.72rem;color:#94a3b8;\">Document interne — '+escH2(job.trackCode||job.id)+'</div>'+";
const footInsert =
  `'<${D} style="margin-top:20px;text-align:center;"><svg class="lab-sheet-barcode" data-barcode="'+escH2(typeof labBarcodeValue==='function'?labBarcodeValue(job):(job.trackCode||''))+'"></svg><${D} style="font-size:.7rem;color:#64748b;margin-top:6px;font-family:monospace;">'+escH2(typeof labBarcodeValue==='function'?labBarcodeValue(job):(job.trackCode||''))+'</${D}></${D}>'+`;
if (s.includes(footNeedle2) && !s.includes('lab-sheet-barcode')) {
  s = s.replace(footNeedle2, footInsert + footNeedle2);
}

fs.writeFileSync(appPath, s);
console.log('prog-scan', s.includes('prog-scan-in'), 'modal', s.includes('admin-finish-modal'), 'barcode', s.includes('lab-sheet-barcode'));
