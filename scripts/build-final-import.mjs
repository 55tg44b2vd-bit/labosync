import fs from 'fs';

const clean = fs.readFileSync(new URL('./recovered-import-clean.js', import.meta.url), 'utf8');
const full = fs.readFileSync(new URL('./recovered-import-full.js', import.meta.url), 'utf8');
const extras = fs.readFileSync(new URL('./import-extras.js', import.meta.url), 'utf8');

let parsers = clean.replace(/^var _importPlan=null;\n?/, '');
let cut = parsers.indexOf('function importAiEnsurePdfJs');
if (cut > 0) parsers = parsers.slice(0, cut);
parsers = parsers.replace(/function importAiGetMode[\s\S]*?^}\n\n/m, '');
parsers = parsers.replace(/function importRunStructuredFromTextarea[\s\S]*?^}\n\n/m, '');

let ui = full.replace(/^\/\*[\s\S]*?\*\/\nvar _importPlan=null;\n?/, '');
ui = ui.replace(/function importAiPickFile[\s\S]*?^}\n\n/m, '');
ui = ui.replace(/function renderImportPlanPreview[\s\S]*?^}\n\n/m, '');
ui = ui.replace(/async function _markStepDelivered[\s\S]*$/, '');

ui = ui.replace(
  /st\.textContent='Plan prêt — vérifiez et complétez ci-dessous\.';/,
  "st.textContent='C\\'est prêt — vérifiez le résumé puis validez.';"
);
ui = ui.replace(
  /if\(!guardPerm\('action:data_import','[^']+'\)\)return;/,
  "if(!guardPerm('action:data_import','⛔ Votre rôle ne permet pas d\\'importer des données.'))return;"
);

parsers = parsers.replace(/Factur-X/g, 'fichier');
parsers = parsers.replace(/CSV labo/g, 'tableau');
parsers = parsers.replace(/Preset CSV/g, 'Tableau');

const render = full.match(/function renderImportPlanPreview[\s\S]*?^}\n\n/)?.[0] || '';
const renderPatched = render
  .replace(/escHtml\(a\.type\)/g, '_importActionLabel(a.type)')
  .replace(
    /'<td style="padding:6px 8px;border-bottom:1px solid var\(--border\);font-size:.74rem;">'\s*\+i\+/,
    "'<td style=\"display:none;\">'+i+'"
  )
  .replace(
    /escHtml\(JSON\.stringify\(a\.draft\|\|\{\}\)\.slice\(0,220\)\)/,
    "(function(){var d=a.draft||{};var s='';if(a.type==='create_cabinet')s=d.name||'';else if(a.type==='create_bl')s=(d.cabinetName||'')+' — '+(d.patient||d.description||'');else if(a.type==='create_facture')s=(d.cabinetName||'')+(d.total!=null?' — '+d.total+' €':'');return escHtml(String(s).slice(0,220));})()"
  )
  .replace('Informations complémentaires', 'Quelques précisions')
  .replace('Actions prévues', 'Détail')
  .replace('Appliquer ce plan au compte', 'Tout importer dans mon compte')
  .replace('Type</th>', 'Élément</th>')
  .replace('Brouillon</th>', 'Détail</th>');

const bundle = '/* Import données */\nvar _importPlan=null;\n\n' + parsers + '\n' + ui + '\n' + renderPatched + '\n' + extras;

fs.writeFileSync(new URL('./lab-import-bundle.js', import.meta.url), bundle);
try {
  new Function(bundle);
  console.log('syntax OK', bundle.length);
} catch (e) {
  console.error('syntax FAIL', e.message);
  const lines = bundle.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      new Function(lines.slice(0, i + 1).join('\n'));
    } catch (err) {
      if (!String(err.message).includes('end')) {
        console.log('near line', i + 1, lines[i]);
        break;
      }
    }
  }
}
