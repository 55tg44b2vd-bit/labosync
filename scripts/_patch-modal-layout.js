const fs = require('fs');
const p = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let h = fs.readFileSync(p, 'utf8');

const insertAfter =
  '<label style="font-size:.74rem;display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="batch-ls-include-printed"/> Inclure déjà imprimés</label>\n    </div>';

const insert =
  '<label style="font-size:.74rem;display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="batch-ls-include-printed"/> Inclure déjà imprimés</label>\n      <label style="font-size:.74rem;font-weight:600;color:var(--ink-soft);">Mise en page</label>\n      <select id="batch-ls-layout" style="font-size:.8rem;padding:7px 10px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);">\n        <option value="full">1 fiche par page A4</option>\n        <option value="half">2 fiches par page A4</option>\n      </select>\n    </motion>';

const insertFixed = insert.replace(/<\/motion>/g, '</div>').replace(/motion>/g, 'motion>').replace('    </motion>', '    </div>');

if (!h.includes(insertAfter)) {
  console.error('anchor not found');
  process.exit(1);
}
h = h.replace(insertAfter, insertFixed);

h = h.replace(
  "btn.textContent=n?'🖨️ Imprimer '+n+' fiche'+(n>1?'s':''):'🖨️ Imprimer la sélection';",
  "btn.textContent=n?'📄 PDF — '+n+' fiche'+(n>1?'s':''):'📄 Télécharger le PDF';"
);

h = h.replace(
  '<button type="button" id="batch-ls-print" class="btn-dk" style="flex:1;min-width:140px;font-size:.8rem;">🖨️ Imprimer la sélection</button>',
  '<button type="button" id="batch-ls-print" class="btn-dk" style="flex:1;min-width:140px;font-size:.8rem;">📄 Télécharger le PDF</button>'
);

fs.writeFileSync(p, h);
console.log('modal patched');
