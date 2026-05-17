const fs = require('fs');
const path = 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('<!-- PARAMÈTRES -->');
const end = s.indexOf('<!-- FACTURATION -->');
if (start < 0 || end < 0) { console.error('markers not found'); process.exit(1); }

const block = `<!-- PARAMÈTRES -->
<div class="pane" id="pane-parametres">
  <motion-div class="settings-shell">
    <div id="settings-hub" class="settings-hub">
      <div class="settings-topbar settings-topbar--hub">
        <h2>Paramètres</h2>
      </div>
      <div class="settings-group" data-settings-group="compte">
        <motion-div class="settings-group-label">Compte</div>
        <button type="button" class="settings-row" onclick="openSettingsSection('compte')">
          <span class="settings-row-icon">👤</span>
          <span class="settings-row-body"><span class="settings-row-title">Compte et abonnement</span><span class="settings-row-desc">Nom du labo, formule Labosync, rôle</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </div>
      <div class="settings-group" data-settings-group="labo">
        <motion-div class="settings-group-label">Laboratoire</div>
        <button type="button" class="settings-row" onclick="openSettingsSection('labo')">
          <span class="settings-row-icon">🏢</span>
          <span class="settings-row-body"><span class="settings-row-title">Identité et documents</span><span class="settings-row-desc">Mentions légales, signatures sur les fiches</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </div>
      <motion-div class="settings-group" data-settings-group="travail">
        <div class="settings-group-label">Travail</div>
        <button type="button" class="settings-row" onclick="openSettingsSection('tarifs')">
          <span class="settings-row-icon">🔧</span>
          <span class="settings-row-body"><span class="settings-row-title">Types de travaux et tarifs</span><span class="settings-row-desc">Catalogue, prix, étapes de programmation</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
        <button type="button" class="settings-row" onclick="openSettingsSection('equipe')">
          <span class="settings-row-icon">👨‍🔬</span>
          <span class="settings-row-body"><span class="settings-row-title">Équipe et planning</span><span class="settings-row-desc">Mode programmation, absences et fermetures</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </div>
      <div class="settings-group" data-settings-group="donnees">
        <motion-div class="settings-group-label">Données</div>
        <button type="button" class="settings-row" onclick="openSettingsSection('donnees')">
          <span class="settings-row-icon">☁️</span>
          <span class="settings-row-body"><span class="settings-row-title">Sauvegarde cloud</span><span class="settings-row-desc">Sauvegarder ou restaurer vos données</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
        <button type="button" class="settings-row" id="settings-row-migration" data-settings-req="migration" onclick="openSettingsSection('migration')">
          <span class="settings-row-icon">📦</span>
          <span class="settings-row-body"><span class="settings-row-title">Importer des données</span><span class="settings-row-desc">Migration depuis un autre logiciel (CSV, Factur-X…)</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </div>
      <div class="settings-group" data-settings-group="facturation" data-settings-req="paiements">
        <motion-div class="settings-group-label">Facturation</div>
        <button type="button" class="settings-row" onclick="openSettingsSection('paiements')">
          <span class="settings-row-icon">💳</span>
          <span class="settings-row-body"><span class="settings-row-title">Paiements en ligne</span><span class="settings-row-desc">Configuration Stripe pour vos cabinets</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </motion-div>
      <div class="settings-group" data-settings-group="systeme" data-settings-req="danger">
        <div class="settings-group-label">Système</div>
        <button type="button" class="settings-row settings-row--danger" onclick="openSettingsSection('danger')">
          <span class="settings-row-icon">⚠️</span>
          <span class="settings-row-body"><span class="settings-row-title">Zone dangereuse</span><span class="settings-row-desc">Effacer toutes les données du compte</span></span>
          <span class="settings-row-chevron">›</span>
        </button>
      </div>
    </div>

    <div id="settings-sec-compte" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Compte et abonnement</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card">
        <h2 data-i18n="h2.settings.labname">🏷️ Nom du laboratoire</h2>
        <div style="display:flex;gap:10px;align-items:flex-end;max-width:400px;">
          <div class="fl" style="flex:1;"><label data-i18n="form.display_name">Nom affiché</label><input type="text" id="labo-name-input" placeholder="ex: Laboratoire Dupont"/></div>
          <button class="btn btn-a" id="btn-labo-name-save" data-i18n="btn.save">Enregistrer</button>
        </div>
      </div>
      <div class="card">
        <h2>💳 Mon abonnement Labosync</h2>
        <motion-div id="sub-info" style="font-size:.84rem;color:var(--ink-soft);margin-bottom:14px;">Chargement…</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-a" onclick="openBillingPortal()">🔧 Gérer mon abonnement</button>
          <button class="btn btn-b" onclick="showPaywall('upgrade')">⬆️ Changer de formule</button>
        </div>
        <div style="font-size:.72rem;color:var(--ink-soft);margin-top:12px;">Résiliation à tout moment depuis le portail Stripe. Pas d'engagement.</div>
      </div>
      <div class="card" data-settings-req="role-admin">
        <h2>🔐 Rôle utilisateur</h2>
        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:12px;">Contrôle des droits dans l'interface (socle RBAC).</p>
        <div style="display:flex;gap:10px;align-items:flex-end;max-width:460px;flex-wrap:wrap;">
          <div class="fl" style="flex:1;min-width:220px;">
            <label>Rôle actif</label>
            <select id="user-role-select">
              <option value="admin">Admin</option>
              <option value="production">Production</option>
              <option value="billing">Facturation</option>
              <option value="support">Support</option>
            </select>
          </div>
          <button class="btn btn-a" id="btn-role-save">Appliquer le rôle</button>
        </div>
        <div id="role-msg" style="font-size:.74rem;color:var(--ink-soft);margin-top:8px;min-height:16px;"></motion-div>
      </div>
    </div>

    <div id="settings-sec-labo" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Identité et documents</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card">
        <h2 data-i18n="h2.settings.legal">🏢 Informations légales du laboratoire</h2>
        <p data-i18n="desc.legal" style="font-size:.74rem;color:var(--ink-soft);margin-bottom:16px;">Ces informations apparaissent sur vos bons de livraison et certificats de conformité CE.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:640px;margin-bottom:14px;">
          <div class="fl"><label data-i18n="form.legal.company">Raison sociale</label><input type="text" id="legal-raison-sociale" placeholder="Laboratoire Dupont SARL"/></div>
          <div class="fl"><label data-i18n="form.legal.siret">SIRET</label><input type="text" id="legal-siret" placeholder="000 000 000 00000" maxlength="20"/></div>
          <div class="fl" style="grid-column:1/-1;"><label data-i18n="form.legal.address">Adresse complète</label><input type="text" id="legal-adresse" placeholder="12 rue de la Santé, 75014 Paris"/></div>
          <div class="fl"><label data-i18n="form.legal.phone">Téléphone</label><input type="text" id="legal-tel" placeholder="01 23 45 67 89"/></div>
          <div class="fl"><label data-i18n="form.legal.email">Email</label><input type="email" id="legal-email" placeholder="contact@labo.fr"/></div>
          <motion-div class="fl" style="grid-column:1/-1;"><label data-i18n="form.legal.director">Directeur technique / Responsable</label><input type="text" id="legal-directeur" placeholder="Jean Dupont, Prothésiste dentaire"/></div>
          <div class="fl" style="grid-column:1/-1;"><label data-i18n="form.legal.ce">Numéro de fabricant CE (optionnel)</label><input type="text" id="legal-ce-num" placeholder="FR-LAB-XXXXX"/></div>
        </div>
        <button class="btn btn-a" id="btn-legal-save" data-i18n="btn.save.legal">Enregistrer les informations légales</button>
        <div id="legal-msg" style="font-size:.76rem;margin-top:10px;color:#2a6049;min-height:16px;"></div>
      </div>
      <div class="card">
        <h2>✍️ Signature électronique (dessin)</h2>
        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:14px;line-height:1.45;">Dessinez une signature pour qu'elle apparaisse dans les fiches (ex: « Voir la fiche »).</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;max-width:780px;">
          <div>
            <div style="font-weight:700;margin-bottom:6px;color:var(--ink);">Laboratoire — Signature</div>
            <canvas id="sig-labo-canvas" width="420" height="130" style="width:100%;border:1.5px dashed var(--border);border-radius:10px;background:#fff;touch-action:none;"></canvas>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
              <button class="btn btn-b" id="btn-sig-labo-clear" type="button" style="padding:8px 12px;font-size:.76rem;">Effacer</button>
              <button class="btn btn-a" id="btn-sig-labo-save" type="button" style="padding:8px 12px;font-size:.76rem;">Enregistrer</button>
            </div>
            <div style="margin-top:10px;">
              <motion-div style="font-size:.72rem;color:var(--ink-soft);margin-bottom:6px;">Aperçu</motion-div>
              <img id="sig-labo-preview" style="display:none;max-width:100%;border:1px solid var(--border);border-radius:10px;background:#fff;padding:6px;"/>
            </div>
          </div>
          <div>
            <div style="font-weight:700;margin-bottom:6px;color:var(--ink);">Cabinet — Signature (optionnel)</div>
            <canvas id="sig-cab-canvas" width="420" height="130" style="width:100%;border:1.5px dashed var(--border);border-radius:10px;background:#fff;touch-action:none;"></canvas>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
              <button class="btn btn-b" id="btn-sig-cab-clear" type="button" style="padding:8px 12px;font-size:.76rem;">Effacer</button>
              <button class="btn btn-a" id="btn-sig-cab-save" type="button" style="padding:8px 12px;font-size:.76rem;">Enregistrer</button>
            </div>
            <div style="margin-top:10px;">
              <div style="font-size:.72rem;color:var(--ink-soft);margin-bottom:6px;">Aperçu</div>
              <img id="sig-cab-preview" style="display:none;max-width:100%;border:1px solid var(--border);border-radius:10px;background:#fff;padding:6px;"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="settings-sec-tarifs" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Types et tarifs</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card" id="card-custom-types">
        <h2 data-i18n="h2.settings.types">🔧 Types de travaux &amp; tarifs</h2>
        <p data-i18n="desc.types" style="font-size:.76rem;color:var(--ink-soft);margin-bottom:16px;">Gérez vos types de travaux et leur prix unitaire. Le prix est automatiquement proposé lors de la création d'un bon de livraison.</p>
        <div id="ct-list" style="margin-bottom:16px;"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-b" id="btn-ct-show-form" data-i18n="btn.ct.add" onclick="showCustomTypeForm()">+ Ajouter un type</button>
          <button class="btn" onclick="openAIConfigModal()" style="background:linear-gradient(135deg,#6c47ff,#a855f7);color:#fff;border:none;display:flex;align-items:center;gap:6px;">🤖 Aide IA</button>
        </div>
        <div id="ct-form" style="display:none;margin-top:18px;border-top:1px solid var(--border);padding-top:18px;">
          <div data-i18n="ct.form.new" style="font-size:.82rem;font-weight:700;margin-bottom:12px;" id="ct-form-title">Nouveau type</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
            <div class="fl"><label data-i18n="ct.form.name">Nom du type</label><input type="text" id="ct-name" placeholder="ex: Gouttière de bruxisme"/></div>
            <div class="fl"><label data-i18n="ct.form.category">Catégorie</label>
              <input type="text" id="ct-category" placeholder="ex: Prothèse &amp; Occlusion" list="ct-cat-list"/>
              <datalist id="ct-cat-list">
                <option value="Couronnes"/><option value="Composite &amp; Céramique"/>
                <option value="Armatures"/><option value="Prothèse &amp; Occlusion"/>
                <option value="Bridges"/><option value="Autre"/>
                <option value="Chirurgie &amp; Modèles"/>
              </datalist>
            </div>
          </div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;gap:10px;">
            <div style="font-size:.7rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);">Programmation (optionnel)</div>
            <div style="font-size:.7rem;color:var(--ink-soft);font-style:italic;">Ajoutez des étapes uniquement si vous planifiez les travaux par technicien</div>
          </div>
          <div id="ct-steps"></motion-div>
          <button class="btn btn-b" style="margin-top:8px;" onclick="addCustomStep()">+ Ajouter une étape</button>
          <div id="ct-emp-section" style="margin-top:16px;"></motion-div>
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button class="btn btn-a" data-i18n="btn.ct.save" onclick="saveCustomType()">Enregistrer le type</button>
            <button class="btn btn-b" data-i18n="btn.cancel" onclick="hideCustomTypeForm()">Annuler</button>
          </div>
        </div>
      </div>
    </div>

    <div id="settings-sec-equipe" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Équipe et planning</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card">
        <h2 data-i18n="h2.settings.options">⚙️ Options</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;">
          <div>
            <div data-i18n="opt.prog.title" style="font-size:.88rem;font-weight:500;">🔬 Activer la programmation<button class="help-tip" data-help-title="Mode Programmation" data-help="Activez ce mode si vous travaillez en équipe et que vous voulez répartir les travaux par technicien et par étape (modélage, finition, etc.). Si vous travaillez seul, laissez-le désactivé : c'est plus simple.">?</button></div>
            <div data-i18n="opt.prog.desc" style="font-size:.74rem;color:var(--ink-soft);margin-top:2px;">Affiche les onglets Impression, Équipe et En attente. Activez si vous planifiez les travaux par technicien.</div>
          </div>
          <label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;margin-left:16px;">
            <input type="checkbox" id="toggle-prog" style="opacity:0;width:0;height:0;" onchange="saveProgToggle()"/>
            <span id="toggle-prog-track" style="position:absolute;inset:0;background:var(--border);border-radius:99px;cursor:pointer;transition:background .2s;"></span>
            <span id="toggle-prog-thumb" style="position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);"></span>
          </label>
        </div>
      </div>
      <div class="card">
        <h2 data-i18n="h2.settings.absences">🏖️ Absences & Fermetures</h2>
        <div style="margin-bottom:14px;">
          <div data-i18n="absences.lab" style="font-size:.72rem;font-weight:500;margin-bottom:6px;">Fermeture du laboratoire</div>
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <input type="date" id="conge-date-input" style="font-family:monospace;font-size:.82rem;padding:7px 12px;border:1.5px solid var(--border);border-radius:7px;background:var(--bg);color:var(--ink);outline:none;"/>
            <button onclick="addConge()" style="background:var(--accent);color:#fff;border:none;border-radius:7px;padding:7px 14px;font-family:monospace;font-size:.8rem;cursor:pointer;">+ Ajouter</button>
          </div>
          <div id="conges-list"></div>
        </div>
        <div>
          <div data-i18n="absences.individual" style="font-size:.72rem;font-weight:500;margin-bottom:6px;">Absence individuelle</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            <select id="abs-tech-sel" style="font-family:monospace;font-size:.8rem;padding:7px 12px;border:1.5px solid var(--border);border-radius:7px;background:var(--bg);color:var(--ink);outline:none;">
              <option value="">— Technicien —</option>
            </select>
            <input type="date" id="abs-date-input" style="font-family:monospace;font-size:.82rem;padding:7px 12px;border:1.5px solid var(--border);border-radius:7px;background:var(--bg);color:var(--ink);outline:none;"/>
            <button onclick="addAbsence()" style="background:#1a4a7a;color:#fff;border:none;border-radius:7px;padding:7px 14px;font-family:monospace;font-size:.8rem;cursor:pointer;">+ Ajouter</button>
          </div>
          <div id="abs-list"></div>
        </div>
      </div>
    </div>

    <div id="settings-sec-donnees" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Sauvegarde cloud</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card">
        <h2 data-i18n="h2.settings.cloud">☁️ Sauvegarde cloud</h2>
        <p data-i18n="desc.cloud" style="font-size:.76rem;color:var(--ink-soft);margin-bottom:16px;">Vos données sont sauvegardées sur Supabase (cloud sécurisé). Sauvegarde automatique toutes les 5 minutes. Restaurez sur n'importe quel appareil.</p>
        <p data-i18n="desc.cloud_ux" style="font-size:.72rem;color:var(--ink-muted);margin:-8px 0 16px;line-height:1.45;">Astuce : Ctrl+K (⌘K sur Mac) ouvre la recherche globale depuis n'importe où.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-a" id="btn-cloud-save" data-i18n="btn.cloud_save">☁️ Sauvegarder maintenant</button>
          <button class="btn btn-g" id="btn-cloud-restore" data-i18n="btn.cloud_restore">⬇️ Restaurer depuis le cloud</button>
        </div>
        <div id="cloud-msg" style="font-size:.76rem;margin-top:12px;color:var(--ink-soft);min-height:18px;"></div>
        <div id="cloud-last" style="font-size:.68rem;color:var(--ink-soft);margin-top:4px;"></div>
      </div>
    </div>

    <div id="settings-sec-migration" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Importer des données</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="migration-hero" style="margin-bottom:16px;">
        <p style="margin:0;font-size:.84rem;color:#5b21b6;line-height:1.55;">Import ponctuel depuis un autre logiciel. Une fois votre compte à jour, vous n’aurez plus besoin de cet outil.</p>
      </div>
      <motion-div class="card" style="max-width:920px;border-left:4px solid #7c3aed;">
        <h2 style="margin-top:0;">Données à importer</h2>
        <p style="font-size:.84rem;color:var(--ink);margin-bottom:12px;line-height:1.55;">
          <strong>1)</strong> déposez un fichier ou collez un tableau, <strong>2)</strong> vérifiez le résumé, <strong>3)</strong> validez. Rien n’est enregistré sans confirmation.
        </p>
        <details style="font-size:.72rem;color:var(--ink-soft);margin-bottom:12px;line-height:1.5;border:1px solid var(--border);border-radius:8px;padding:8px 12px;background:var(--bg);">
          <summary style="cursor:pointer;font-weight:600;color:var(--ink);">Aide rapide : Factur-X, bdlRefs, CSV labo</summary>
          <p style="margin:10px 0 0;"><strong>Factur-X</strong> : XML UBL ou CII analysé localement (cabinet acheteur, lignes, totaux, références BL si présentes).</p>
          <p style="margin:8px 0 0;"><strong>bdlRefs</strong> : numéros de BL rattachés à une facture pour la traçabilité.</p>
          <p style="margin:8px 0 0;"><strong>CSV labo</strong> : en-têtes reconnus automatiquement ; regroupement par n° de facture si la colonne est remplie sur assez de lignes.</p>
        </details>
        <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
          <label style="font-size:.74rem;color:var(--ink-soft);white-space:nowrap;">Source</label>
          <select id="import-ai-mode" style="font-size:.78rem;padding:6px 10px;border-radius:7px;border:1.5px solid var(--border);background:var(--bg);color:var(--ink);max-width:100%;">
            <option value="auto">Auto (IA + XML auto si reconnu)</option>
            <option value="facturx">Factur-X / UBL-CII (XML → plan direct)</option>
            <option value="prothesis">Export CSV labo (plan direct)</option>
          </select>
        </div>
        <div style="margin-bottom:10px;">
          <input type="file" id="import-ai-file" accept=".csv,.txt,.tsv,.pdf,.xml,text/plain,text/csv,application/pdf,text/xml,application/xml" onchange="importAiPickFile(this)" style="font-size:.78rem;margin-bottom:8px;"/>
          <textarea id="import-ai-raw" placeholder="Collez ici le contenu (CSV, XML, tableau, texte extrait d'un PDF…) — max ~120 000 caractères" rows="10" style="width:100%;box-sizing:border-box;font-family:monospace;font-size:.78rem;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);outline:none;resize:vertical;"></textarea>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <button type="button" class="btn btn-a" id="btn-import-ai-analyze" onclick="runAiImportAnalyze()">🔍 Analyser avec l'IA</button>
          <button type="button" class="btn btn-b" onclick="importRunStructuredFromTextarea()">📋 Plan depuis le texte (XML ou CSV)</button>
          <span style="font-size:.7rem;color:var(--ink-soft);">IA : <code>ANTHROPIC_API_KEY</code> sur Netlify · XML/CSV : local</span>
        </div>
        <div id="import-ai-status" style="font-size:.76rem;margin-top:10px;min-height:18px;color:var(--ink-soft);"></div>
        <motion-div id="import-ai-preview" style="display:none;margin-top:14px;padding:14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);"></motion-div>
      </div>
    </div>

    <div id="settings-sec-paiements" class="settings-section">
      <div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Paiements en ligne</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card">
        <h2 data-i18n="h2.settings.stripe">💳 Paiements en ligne (Stripe)</h2>
        <p style="font-size:.76rem;color:var(--ink-soft);margin-bottom:14px;">Permettez à vos cabinets dentaires de payer leurs factures en ligne. Chaque laboratoire renseigne sa propre clé secrète Stripe (compte du labo) : elle est enregistrée sur cet appareil pour générer les liens de paiement et n'est jamais visible côté dentiste. Vous pouvez aussi définir <code>STRIPE_SECRET_KEY</code> sur Netlify comme repli pour les appareils sans clé locale.</p>
        <div style="margin-bottom:12px;">
          <div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:5px;">Clé secrète Stripe</div>
          <div style="font-size:.68rem;color:var(--ink-soft);margin-bottom:6px;">Trouvez-la sur <strong>dashboard.stripe.com → Développeurs → Clés API → Clé secrète</strong></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="password" id="stripe-key-input" placeholder="sk_live_... ou sk_test_..." style="flex:1;font-family:monospace;font-size:.82rem;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);outline:none;"/>
            <button onclick="toggleStripeKeyVisibility()" style="background:none;border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;cursor:pointer;font-size:.85rem;" title="Afficher/masquer">👁️</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn btn-a" id="btn-stripe-save">💾 Enregistrer</button>
          <div id="stripe-status" style="font-size:.75rem;"></div>
        </div>
        <div id="stripe-msg" style="font-size:.76rem;margin-top:10px;min-height:16px;"></div>
      </div>
    </div>

    <div id="settings-sec-danger" class="settings-section">
      <motion-div class="settings-topbar">
        <button type="button" class="settings-back" onclick="closeSettingsSection()" aria-label="Retour">←</button>
        <h2>Zone dangereuse</h2>
        <span class="settings-topbar-spacer"></span>
      </div>
      <div class="card" style="border-color:#e74c3c;">
        <h2 data-i18n="h2.settings.danger" style="color:#c0392b;">⚠️ Zone dangereuse</h2>
        <p style="font-size:.76rem;color:var(--ink-soft);margin-bottom:14px;">Cette action efface définitivement toutes les données de votre compte Labosync sur cet appareil et dans le cloud.</p>
        <button class="btn" data-i18n="btn.reset_all" style="background:#fdecea;color:#c0392b;border:1.5px solid #e74c3c;" id="btn-reset-all">🗑️ Effacer toutes les données</button>
      </div>
    </div>
  </div>
</motion-div>

`;

const cleaned = block.split('motion-div').join('motion-div');
// fix accidental motion-div typos from template - use div
const fixed = cleaned.replace(/motion-div/g, 'motion-div');
// Actually we want all motion-div -> div
const out = block.replace(/motion-div/g, 'div');
fs.writeFileSync(path, s.slice(0, start) + out + s.slice(end));
console.log('OK', out.length);
