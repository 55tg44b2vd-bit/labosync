import fs from 'fs';

const path = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let s = fs.readFileSync(path, 'utf8');

const start = s.indexOf('Sous-tot    <!-- Tarifs');
if (start < 0) {
  console.error('corruption marker not found');
  process.exit(1);
}
const blockStart = s.lastIndexOf('          <div style="background:var(--bg);border-radius:9px;', start);
const end = s.indexOf('\n\n  <!-- Liste des documents -->', start);
if (blockStart < 0 || end < 0) {
  console.error('bounds', blockStart, end);
  process.exit(1);
}

const replacement = [
  '          <div style="background:var(--bg);border-radius:9px;padding:12px 16px;margin-bottom:14px;">',
  '            <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px;">',
  '              <span data-i18n="bill.subtotal" style="color:var(--ink-soft);">Sous-total HT</span><span id="bill-subtotal">0,00 €</span>',
  '            </div>',
  '            <div style="display:flex;justify-content:space-between;font-size:.76rem;margin-bottom:4px;">',
  '              <span data-i18n="bill.vat" style="color:var(--ink-soft);">TVA</span><span data-i18n="bill.vat.exempt" style="color:var(--ink-soft);">Exonéré (art. 261-4 CGI)</span>',
  '            </div>',
  '            <div style="display:flex;justify-content:space-between;font-family:\'Inter\',sans-serif;font-weight:700;font-size:1rem;border-top:1px solid var(--border);padding-top:8px;margin-top:6px;">',
  '              <span data-i18n="bill.total_ttc">Total TTC</span><span id="bill-total" style="color:var(--accent);">0,00 €</span>',
  '            </div>',
  '          </div>',
  '          <div class="fl" style="margin-bottom:14px;"><label data-i18n="form.bill.note">Note</label>',
  '            <textarea id="bill-note" rows="2" placeholder="ex: Paiement à 30 jours..." style="width:100%;border:1.5px solid var(--border);border-radius:7px;background:var(--bg);font-family:monospace;font-size:.82rem;padding:8px 12px;color:var(--ink);outline:none;resize:vertical;"></textarea>',
  '          </div>',
  '          <div style="display:flex;gap:8px;">',
  '            <button id="btn-bill-save" style="flex:1;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:11px;font-family:monospace;font-size:.82rem;font-weight:600;cursor:pointer;">💾 Enregistrer</button>',
  '            <button id="btn-bill-cancel" style="background:none;border:1px solid var(--border);border-radius:8px;padding:11px 14px;font-family:monospace;font-size:.82rem;cursor:pointer;color:var(--ink-soft);">Annuler</button>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </div>',
  '',
  '    <!-- Tarifs : Réglages -->',
  '    <div class="card" id="tarif-card" style="margin:0;">',
  '      <h2>Tarifs</h2>',
  '      <p style="font-size:.8rem;color:var(--ink-soft);margin-bottom:14px;line-height:1.5;">Un seul endroit pour vos prix : <strong>Réglages → Types de travaux et tarifs</strong>.</p>',
  '      <button type="button" class="btn btn-a" onclick="goSettings();setTimeout(function(){openSettingsSection(\'tarifs\');},200);">Gérer les tarifs</button>',
  '    </div>',
  '  </div>',
].join('\n');

s = s.slice(0, blockStart) + replacement + s.slice(end);
fs.writeFileSync(path, s);
console.log('OK facturation fixed');
