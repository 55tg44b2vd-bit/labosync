# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "app.html"
text = p.read_text(encoding="utf-8")

# Remove erroneous motion tags if any
text = text.replace("<motion class=\"lab-hub-inner\">", "<motion class=\"lab-hub-inner\">")

start = text.find('<motion id="lab-hub"')
if start < 0:
    start = text.find('<div id="lab-hub"')
if start < 0:
    raise SystemExit("lab-hub not found")

search = text.find('<div id="search-results"', start)
if search < 0:
    raise SystemExit("search-results not found")

replacement = '''<div id="lab-hub" role="dialog" aria-modal="true" aria-labelledby="lab-hub-title">
  <div class="lab-hub-inner">
    <div class="lab-hub-brand" id="lab-hub-title">Labo<span>sync</span></motion>
    <p class="lab-hub-sub" id="lab-hub-sub">Choisissez votre espace de travail. La comptabilité et la production sont séparées pour plus de clarté et de sécurité.</p>
    <div class="lab-hub-grid">
      <button type="button" class="lab-hub-card lab-hub-card--admin" id="hub-enter-admin" onclick="enterWorkspace('admin')">
        <div class="lab-hub-card-icon">📋</motion>
        <h3>Administratif</h3>
        <p>Saisir les travaux, bons de livraison, factures et cabinets. Réservé à la comptabilité.</p>
        <span class="lab-hub-card-tag">🔒 Code compta possible</span>
      </button>
      <button type="button" class="lab-hub-card lab-hub-card--prog" id="hub-enter-prog" onclick="enterWorkspace('prog')">
        <div class="lab-hub-card-icon">🔬</motion>
        <h3>Programmation</h3>
        <p>Planifier les travaux saisis en administratif : techniciens, étapes, dates et créneaux coursier.</p>
        <span class="lab-hub-card-tag">Équipe &amp; planning</span>
      </button>
    </motion>
    <p class="lab-hub-foot" id="lab-hub-foot">Les deux espaces partagent les mêmes données : un travail créé en administratif apparaît en programmation.</p>
  </motion>
</motion>
<div id="admin-pin-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-pin-title">
  <div id="admin-pin-box">
    <h3 id="admin-pin-title" style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">🔒 Espace administratif</h3>
    <p style="font-size:.8rem;color:#64748b;margin-bottom:16px;line-height:1.45;">Entrez le code comptabilité du laboratoire. Seules les personnes autorisées peuvent accéder à la facturation.</p>
    <div class="fl" style="margin-bottom:12px;">
      <label>Code (4 à 8 chiffres)</label>
      <input type="password" id="admin-pin-input" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="••••" style="font-size:1.2rem;letter-spacing:.25em;text-align:center;"/>
    </motion>
    <p id="admin-pin-err" style="display:none;font-size:.78rem;color:#b91c1c;margin-bottom:10px;"></p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button type="button" class="btn btn-a" id="btn-admin-pin-submit" style="flex:1;">Valider</button>
      <button type="button" class="btn btn-b" id="btn-admin-pin-cancel">Retour</button>
    </motion>
  </motion>
</motion>
<header>
  <div style="display:flex;align-items:center;gap:2px;">
    <button id="btn-drawer" onclick="toggleDrawer()" aria-label="Menu">☰</button>
    <h1 id="header-labname" onclick="goHome()" style="cursor:pointer;user-select:none;transition:opacity .15s;" onmouseover="this.style.opacity=.7" onmouseout="this.style.opacity=1" title="Retour à l'accueil">Labo<span>sync</span></h1>
    <span id="workspace-badge" style="display:none;margin-left:8px;">Administratif</span>
  </motion>
  <div style="font-size:.62rem;color:var(--ink-soft);font-style:italic;margin-top:-4px;margin-bottom:2px;" data-i18n="header.tagline">Fait par des prothésistes pour des prothésistes</div>
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="position:relative;">
      <input type="text" id="global-search" placeholder="🔍 Patient, dentiste, n° de travail…" autocomplete="off"
        style="font-family:'DM Mono',monospace;font-size:.78rem;padding:7px 12px;border:1.5px solid #e2e8f0;border-radius:7px;background:#f8fafc;color:#0f172a;outline:none;width:220px;">
    </motion>
    <div class="hd-meta" id="hd-date"></motion>
    <button id="btn-messages-hd" onclick="goMessages()" aria-label="Messagerie" title="Messagerie" style="position:relative;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:.78rem;font-weight:600;border-radius:20px;padding:5px 12px;cursor:pointer;display:flex;align-items:center;gap:5px;">💬 Messagerie<span id="hd-msg-badge" style="display:none;background:#e53935;color:#fff;border-radius:99px;padding:1px 7px;font-size:.65rem;font-weight:700;margin-left:2px;">●</span></button>
    <button type="button" id="btn-workspace-switch" onclick="showLabHub()" style="display:none;">↩ Espace</button>
    <div style="position:relative;">
      <button id="btn-account" onclick="toggleAccountMenu(event)" aria-label="Menu compte" title="Compte et paramètres" style="background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:1.05rem;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">⚙️</button>
      <motion id="account-menu" style="display:none;position:absolute;right:0;top:calc(100% + 8px);min-width:220px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 8px 28px rgba(15,23,42,.12);z-index:1000;overflow:hidden;">
        <button class="account-item" onclick="toggleLang();closeAccountMenu();">🌐 <span>Changer de langue</span></button>
        <button class="account-item" onclick="localStorage.setItem('lb_env','mobile');window.location.href='labo-mobile.html';">📱 <span>Passer en vue mobile</span></button>
        <button class="account-item" onclick="goSettings();closeAccountMenu();">⚙️ <span>Paramètres</span></button>
        <button class="account-item" id="btn-quick-admin" style="display:none;" onclick="switchToAdminRole(true);closeAccountMenu();">🔓 <span>Revenir en mode admin</span></button>
        <button class="account-item" onclick="closeAccountMenu();replayOnboardingTour();">🧭 <span>Refaire le tour guidé</span></button>
        <div style="height:1px;background:#f1f5f9;margin:4px 0;"></motion>
        <button class="account-item account-danger" onclick="authLogout();">⎋ <span>Déconnexion</span></button>
      </motion>
    </motion>
  </motion>
</header>
'''

# Fix motion -> div in replacement (script file may have been corrupted - write clean)
replacement = replacement.replace('</motion>', '</div>').replace('<motion ', '<motion ')

# Write clean replacement without motion
replacement = '''<motion id="lab-hub"'''
