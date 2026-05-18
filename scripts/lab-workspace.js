/* Labosync — espaces Administratif / Programmation */
(function (global) {
  'use strict';

  var WS_KEY = 'lb_workspace';
  var UNLOCK_KEY = 'lb_admin_unlocked_until';
  var UNLOCK_MS = 8 * 60 * 60 * 1000;
  var _adminPinHas = false;
  var _pendingWorkspace = null;

  function getWorkspace() {
    return localStorage.getItem(WS_KEY) || 'hub';
  }

  function setWorkspace(ws) {
    if (ws === 'hub') localStorage.removeItem(WS_KEY);
    else localStorage.setItem(WS_KEY, ws);
  }

  function isProgEnabled() {
    return localStorage.getItem('lb_prog_actif') === '1';
  }

  function isProgDisplayActive() {
    var ws = getWorkspace();
    if (ws === 'admin') return false;
    if (ws === 'prog') return isProgEnabled();
    return typeof global.isProgActif === 'function' && global.isProgActif();
  }

  function canAccessWorkspace(ws) {
    if (typeof global.hasPerm !== 'function') return true;
    if (global.hasPerm('*')) return true;
    if (ws === 'admin') return global.hasPerm('workspace:admin');
    if (ws === 'prog') return global.hasPerm('workspace:prog');
    return true;
  }

  function isAdminUnlocked() {
    var until = parseInt(sessionStorage.getItem(UNLOCK_KEY) || '0', 10);
    return until > Date.now();
  }

  function setAdminUnlocked() {
    sessionStorage.setItem(UNLOCK_KEY, String(Date.now() + UNLOCK_MS));
  }

  function clearAdminUnlock() {
    sessionStorage.removeItem(UNLOCK_KEY);
  }

  async function fetchLabAccess(action, body) {
    var token = global._cachedAccessToken;
    if (!token) throw new Error('Non connecté');
    var url =
      action === 'status'
        ? '/.netlify/functions/lab-access?action=status'
        : '/.netlify/functions/lab-access';
    var r = await fetch(url, {
      method: action === 'status' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: action === 'status' ? undefined : JSON.stringify(Object.assign({ action: action }, body || {})),
    });
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) throw new Error(data.error || 'Erreur réseau');
    return data;
  }

  async function refreshAdminPinStatus() {
    try {
      var st = await fetchLabAccess('status');
      _adminPinHas = !!st.hasPin;
    } catch (e) {
      console.warn('admin pin status', e);
      _adminPinHas = false;
    }
    return _adminPinHas;
  }

  function showLabHub() {
    setWorkspace('hub');
    clearAdminUnlock();
    applyWorkspaceUi();
    if (typeof global.render === 'function') global.render();
  }

  function hideLabHub() {
    var hub = document.getElementById('lab-hub');
    if (hub) {
      hub.style.display = 'none';
      hub.setAttribute('aria-hidden', 'true');
    }
    var wrap = document.querySelector('#app-main > .wrap');
    var header = document.querySelector('#app-main > header');
    var drawer = document.getElementById('drawer');
    var drawerOv = document.getElementById('drawer-overlay');
    if (wrap) wrap.style.display = '';
    if (header) header.style.display = '';
    if (drawer) drawer.style.display = '';
    if (drawerOv) drawerOv.style.display = '';
  }

  function showLabHubScreen() {
    var hub = document.getElementById('lab-hub');
    if (hub) {
      hub.style.display = 'flex';
      hub.setAttribute('aria-hidden', 'false');
    }
    var wrap = document.querySelector('#app-main > .wrap');
    var header = document.querySelector('#app-main > header');
    var drawer = document.getElementById('drawer');
    var drawerOv = document.getElementById('drawer-overlay');
    if (wrap) wrap.style.display = 'none';
    if (header) header.style.display = 'none';
    if (drawer) drawer.style.display = 'none';
    if (drawerOv) drawerOv.style.display = 'none';
    document.querySelectorAll('.pane').forEach(function (p) {
      p.classList.remove('on');
    });
    updateHubCards();
  }

  function updateHubCards() {
    var progBtn = document.getElementById('hub-enter-prog');
    var foot = document.getElementById('lab-hub-foot');
    var enabled = isProgEnabled();
    if (progBtn) {
      progBtn.classList.toggle('lab-hub-card--disabled', !enabled);
      progBtn.disabled = !enabled;
    }
    if (foot) {
      foot.textContent = enabled
        ? 'Les deux espaces partagent les mêmes données : un travail créé en administratif apparaît en programmation.'
        : 'La programmation est désactivée. Activez-la dans Réglages → Équipe et planning si vous travaillez en équipe.';
    }
  }

  function showAdminPinModal() {
    var ov = document.getElementById('admin-pin-overlay');
    var inp = document.getElementById('admin-pin-input');
    var err = document.getElementById('admin-pin-err');
    if (err) {
      err.style.display = 'none';
      err.textContent = '';
    }
    if (inp) {
      inp.value = '';
      setTimeout(function () {
        inp.focus();
      }, 80);
    }
    if (ov) ov.style.display = 'flex';
  }

  function hideAdminPinModal() {
    var ov = document.getElementById('admin-pin-overlay');
    if (ov) ov.style.display = 'none';
    _pendingWorkspace = null;
  }

  async function ensureAdminPinUnlocked() {
    await refreshAdminPinStatus();
    if (!_adminPinHas || isAdminUnlocked()) return true;
    _pendingWorkspace = 'admin';
    showAdminPinModal();
    return false;
  }

  async function submitAdminPin() {
    var inp = document.getElementById('admin-pin-input');
    var err = document.getElementById('admin-pin-err');
    var pin = inp ? String(inp.value || '').trim() : '';
    if (!pin) {
      if (err) {
        err.textContent = 'Entrez le code.';
        err.style.display = 'block';
      }
      return;
    }
    try {
      var res = await fetchLabAccess('verify', { pin: pin });
      if (res.ok) {
        setAdminUnlocked();
        hideAdminPinModal();
        var ws = _pendingWorkspace || 'admin';
        _pendingWorkspace = null;
        await enterWorkspace(ws, { skipPin: true });
      } else if (err) {
        err.textContent = 'Code incorrect.';
        err.style.display = 'block';
      }
    } catch (e) {
      if (err) {
        err.textContent = e.message || 'Erreur';
        err.style.display = 'block';
      }
    }
  }

  function tabMatchesWorkspace(tab, ws) {
    var tw = tab.getAttribute('data-ws');
    if (!tw) return true;
    return tw === 'both' || tw === ws;
  }

  function applyWorkspaceNav(ws) {
    document.querySelectorAll('#tabs-labo .drawer-tab-wrap').forEach(function (wrap) {
      var tab = wrap.querySelector('.tab[data-pane]');
      if (!tab) return;
      var show = tabMatchesWorkspace(tab, ws);
      wrap.style.display = show ? '' : 'none';
    });
    document.querySelectorAll('#drawer-nav-secondary .tab[data-pane]').forEach(function (tab) {
      var show = tabMatchesWorkspace(tab, ws);
      tab.style.display = show ? '' : 'none';
    });
    var label = document.querySelector('.drawer-nav-label');
    if (label) {
      label.textContent = ws === 'admin' ? 'Administratif' : ws === 'prog' ? 'Programmation' : 'Principal';
    }
  }

  function applySaisieWorkspace(ws) {
    var cardSub = document.getElementById('saisie-card-sub');
    var btn = document.getElementById('btn-saisie-add');
    document.querySelectorAll('.field-prog-only').forEach(function (el) {
      el.style.display = ws === 'prog' ? '' : 'none';
    });
    var jobsSection = document.getElementById('jobs-section-title');
    var queueSec = document.getElementById('queue-section');
    var tgrid = document.getElementById('tgrid-container');
    var tgridTitle = document.getElementById('tgrid-stitle');
    var jobsToolbar = document.getElementById('jobs-ops-toolbar');
    var jobsHint = document.getElementById('jobs-ops-hint');
    var jobsTable = document.querySelector('#pane-saisie .tbox');

    var newJobCard = document.getElementById('saisie-new-job-card');
    if (ws === 'admin') {
      if (newJobCard) newJobCard.style.display = '';
      if (cardSub)
        cardSub.textContent =
          'Saisissez le travail pour le bon de livraison et la facturation. La programmation atelier est optionnelle.';
      if (btn) btn.textContent = '+ Enregistrer le travail';
      if (queueSec) queueSec.style.display = 'none';
      if (tgrid) tgrid.style.display = 'none';
      if (tgridTitle) tgridTitle.style.display = 'none';
      if (jobsTable) jobsTable.style.display = '';
    } else if (ws === 'prog') {
      if (newJobCard) newJobCard.style.display = 'none';
      if (cardSub)
        cardSub.textContent =
          'Travaux saisis en administratif : planifiez techniciens, dates et créneaux coursier.';
      if (btn) btn.textContent = '+ Mettre en file (à programmer)';
      if (queueSec && isProgEnabled()) queueSec.style.display = '';
      if (jobsTable) jobsTable.style.display = isProgEnabled() ? '' : 'none';
      if (jobsToolbar) jobsToolbar.style.display = isProgEnabled() ? '' : 'none';
      if (jobsHint) jobsHint.style.display = isProgEnabled() ? '' : 'none';
    }
  }

  function applyCourierWorkspace(ws) {
    var banner = document.getElementById('courier-ws-banner');
    var billing = document.getElementById('courier-billing-block');
    if (banner) {
      banner.className = '';
      if (ws === 'admin') {
        banner.className = 'ws-admin';
        banner.innerHTML =
          '<b>Coursier — administratif</b> Demandez une course pour un enlèvement ou une livraison liée à un bon de livraison.';
      } else if (ws === 'prog') {
        banner.className = 'ws-prog';
        banner.innerHTML =
          '<b>Coursier — programmation</b> Planifiez les courses en lien avec les dates labo et le planning du jour.';
      }
    }
    if (billing) billing.style.display = ws === 'admin' ? '' : 'none';
  }

  function updateWorkspaceBadge(ws) {
    var badge = document.getElementById('workspace-badge');
    var sw = document.getElementById('btn-workspace-switch');
    if (badge) {
      if (ws === 'hub') {
        badge.style.display = 'none';
      } else {
        badge.style.display = 'inline-block';
        badge.textContent = ws === 'admin' ? 'Administratif' : 'Programmation';
        badge.className = ws === 'prog' ? 'ws-prog' : '';
      }
    }
    if (sw) sw.style.display = ws === 'hub' ? 'none' : 'inline-block';
  }

  function getDefaultPaneForWorkspace(ws) {
    if (ws === 'admin') return 'dashboard';
    if (ws === 'prog') return isProgEnabled() ? 'saisie' : 'dashboard';
    return 'dashboard';
  }

  function openDefaultPane(ws) {
    if (!document.getElementById('tabs-labo')) return;
    var pane = getDefaultPaneForWorkspace(ws);
    var tab = document.querySelector('#tabs-labo .tab[data-pane="' + pane + '"]');
    if (tab && tabMatchesWorkspace(tab, ws) && typeof global.canAccessPane === 'function' && global.canAccessPane(pane)) {
      tab.click();
      return;
    }
    var fallback = document.querySelector('#tabs-labo .tab[data-pane]');
    if (fallback) fallback.click();
  }

  function applyWorkspaceUi() {
    var ws = getWorkspace();
    updateHubCards();
    if (ws === 'hub') {
      showLabHubScreen();
      updateWorkspaceBadge('hub');
      return;
    }
    hideLabHub();
    applyWorkspaceNav(ws);
    applySaisieWorkspace(ws);
    applyCourierWorkspace(ws);
    updateWorkspaceBadge(ws);
    if (typeof global.applyProgMode === 'function') global.applyProgMode();
    if (typeof global.applyRoleUi === 'function') global.applyRoleUi();
  }

  async function enterWorkspace(ws, opts) {
    opts = opts || {};
    if (!canAccessWorkspace(ws)) {
      if (typeof global.showToast === 'function')
        global.showToast('⛔ Accès refusé pour votre rôle.', '#c0392b', 3500);
      return;
    }
    if (ws === 'prog' && !isProgEnabled()) {
      if (typeof global.showToast === 'function')
        global.showToast('Activez la programmation dans les réglages.', '#d97706', 4000);
      showLabHub();
      return;
    }
    if (ws === 'admin' && !opts.skipPin) {
      var ok = await ensureAdminPinUnlocked();
      if (!ok) return;
    }
    setWorkspace(ws);
    hideAdminPinModal();
    applyWorkspaceUi();
    openDefaultPane(ws);
    if (typeof global.reportAudit === 'function') {
      global.reportAudit({ action: 'workspace_enter', target: ws });
    }
  }

  function resolveWorkspaceAfterBoot() {
    refreshAdminPinStatus().catch(function () {});
    if (typeof global._userRole === 'string') {
      if (global._userRole === 'billing' && canAccessWorkspace('admin')) {
        enterWorkspace('admin', { skipPin: false });
        return;
      }
      if (global._userRole === 'production' && canAccessWorkspace('prog') && isProgEnabled()) {
        enterWorkspace('prog', { skipPin: true });
        return;
      }
    }
    var ws = getWorkspace();
    if ((ws === 'admin' || ws === 'prog') && canAccessWorkspace(ws)) {
      enterWorkspace(ws, { skipPin: ws !== 'admin' });
    } else {
      setWorkspace('hub');
      applyWorkspaceUi();
    }
  }

  function addAdminJob() {
    var nameEl = document.getElementById('saisie-ip');
    var name = nameEl ? nameEl.value.trim() : '';
    if (!name) {
      alert(typeof global.t === 'function' ? global.t('alert.enter_patient') : 'Code patient requis');
      return;
    }
    var type = document.getElementById('saisie-it').value;
    var nb = parseInt(document.getElementById('saisie-inb').value, 10) || 1;
    var note = document.getElementById('saisie-inote').value.trim();
    var reqDate = document.getElementById('saisie-ireq-delivery');
    var req = reqDate ? reqDate.value : '';
    var cabEl = document.getElementById('saisie-icab');
    var cab = cabEl ? cabEl.value : '';
    var urg = document.getElementById('saisie-iurg').checked;
    var missingItems =
      typeof global._readMissingItems === 'function' ? global._readMissingItems() : [];
    var allItems =
      typeof global.getSaisieItems === 'function' ? global.getSaisieItems(type, nb) : [{ type: type, nb: nb }];
    var toothD =
      typeof global._readSaisieTeethFields === 'function'
        ? global._readSaisieTeethFields()
        : { teeth: [], links: [] };
    var job = {
      id: String(Date.now()),
      patient: name,
      type: allItems[0].type,
      tasks: [],
      nb: allItems[0].nb,
      items: allItems,
      note: note,
      requestedDeliveryDate: req,
      labDeliveryDate: '',
      labDeliverySlot: '12',
      deliveryDate: req || '',
      cabinet: cab,
      urgent: urg,
      createdAt: new Date().toISOString(),
      trackCode: typeof global.genTrackCode === 'function' ? global.genTrackCode() : '',
      prothesisId: '',
      teeth: toothD.teeth,
      links: toothD.links,
      needsProg: isProgEnabled(),
    };
    if (missingItems.length) job.missingInfoItems = missingItems;
    if (typeof global.jobs !== 'undefined') {
      global.jobs.push(job);
      if (typeof global.saveJobs === 'function') global.saveJobs();
    }
    if (isProgEnabled() && typeof global.queue !== 'undefined') {
      var queueItem = {
        id: job.id + '_q',
        patient: name,
        type: allItems[0].type,
        nb: allItems[0].nb,
        items: allItems,
        note: note,
        cabinet: cab,
        urgent: urg,
        createdAt: job.createdAt,
        teeth: toothD.teeth,
        links: toothD.links,
        requestedDeliveryDate: req,
        jobId: job.id,
      };
      if (missingItems.length) queueItem.missingInfoItems = missingItems;
      global.queue.push(queueItem);
      if (typeof global.saveQueue === 'function') global.saveQueue();
      if (typeof global.updateQueueBadge === 'function') global.updateQueueBadge();
      if (typeof global.renderQueueMain === 'function') global.renderQueueMain();
    }
    if (nameEl) nameEl.value = '';
    document.getElementById('saisie-inb').value = '1';
    document.getElementById('saisie-inote').value = '';
    if (reqDate) reqDate.value = '';
    document.getElementById('saisie-iurg').checked = false;
    if (typeof global._resetSaisieMissingState === 'function') global._resetSaisieMissingState();
    if (typeof global.resetSaisieLines === 'function') global.resetSaisieLines();
    if (typeof global._resetSaisieTeethPick === 'function') global._resetSaisieTeethPick();
    if (typeof global.render === 'function') global.render();
    if (typeof global.showToast === 'function')
      global.showToast(
        isProgEnabled()
          ? '✅ Travail enregistré — visible en programmation'
          : '✅ Travail enregistré',
        '#2a6049',
        3500
      );
  }

  function handleSaisieAdd() {
    var ws = getWorkspace();
    if (ws === 'admin') {
      addAdminJob();
      return;
    }
    if (isProgDisplayActive()) {
      if (typeof global.addToQueue === 'function') global.addToQueue();
    } else if (typeof global.addDirect === 'function') {
      global.addDirect();
    }
  }

  async function saveAdminPinFromSettings() {
    var neu = document.getElementById('admin-pin-set');
    var cur = document.getElementById('admin-pin-set-current');
    var msg = document.getElementById('admin-pin-set-msg');
    var pin = neu ? String(neu.value || '').trim() : '';
    if (!/^\d{4,8}$/.test(pin)) {
      if (msg) msg.textContent = 'Code : 4 à 8 chiffres.';
      return;
    }
    try {
      await fetchLabAccess('set', { pin: pin, currentPin: cur ? cur.value.trim() : '' });
      if (neu) neu.value = '';
      if (cur) cur.value = '';
      if (msg) msg.textContent = '✅ Code enregistré.';
      _adminPinHas = true;
    } catch (e) {
      if (msg) msg.textContent = e.message || 'Erreur';
    }
  }

  async function clearAdminPinFromSettings() {
    var cur = document.getElementById('admin-pin-set-current');
    var msg = document.getElementById('admin-pin-set-msg');
    try {
      await fetchLabAccess('clear', { currentPin: cur ? cur.value.trim() : '' });
      if (cur) cur.value = '';
      if (msg) msg.textContent = 'Code supprimé.';
      _adminPinHas = false;
      clearAdminUnlock();
    } catch (e) {
      if (msg) msg.textContent = e.message || 'Erreur';
    }
  }

  function wireWorkspaceEvents() {
    var pinSubmit = document.getElementById('btn-admin-pin-submit');
    var pinCancel = document.getElementById('btn-admin-pin-cancel');
    var pinInput = document.getElementById('admin-pin-input');
    if (pinSubmit) pinSubmit.addEventListener('click', submitAdminPin);
    if (pinCancel)
      pinCancel.addEventListener('click', function () {
        hideAdminPinModal();
        showLabHub();
      });
    if (pinInput)
      pinInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') submitAdminPin();
      });
    var pinSave = document.getElementById('btn-admin-pin-save');
    var pinClear = document.getElementById('btn-admin-pin-clear');
    if (pinSave) pinSave.addEventListener('click', saveAdminPinFromSettings);
    if (pinClear) pinClear.addEventListener('click', clearAdminPinFromSettings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireWorkspaceEvents);
  } else {
    wireWorkspaceEvents();
  }

  global.getWorkspace = getWorkspace;
  global.setWorkspace = setWorkspace;
  global.isProgEnabled = isProgEnabled;
  global.isProgDisplayActive = isProgDisplayActive;
  global.showLabHub = showLabHub;
  global.enterWorkspace = enterWorkspace;
  global.applyWorkspaceUi = applyWorkspaceUi;
  global.resolveWorkspaceAfterBoot = resolveWorkspaceAfterBoot;
  global.addAdminJob = addAdminJob;
  global.handleSaisieAdd = handleSaisieAdd;
  global.refreshAdminPinStatus = refreshAdminPinStatus;
  global.fetchLabAccess = fetchLabAccess;
  global.isAdminUnlocked = isAdminUnlocked;
  global.setAdminUnlocked = setAdminUnlocked;
  global.getAdminPinHas = function () {
    return _adminPinHas;
  };
})(typeof window !== 'undefined' ? window : globalThis);
