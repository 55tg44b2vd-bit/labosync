/* Labosync — multi-poste : fusion cloud, indicateur synchro, profil poste */
(function (global) {
  'use strict';

  var POSTE_KEY = 'lb_poste_preset';
  var SYNC_EL_ID = 'sync-badge';

  function recordKey(item) {
    if (!item || typeof item !== 'object') return '';
    return String(item.id || item.jobId || item.trackCode || '');
  }

  function recordTime(item) {
    if (!item) return 0;
    var raw = item.updatedAt || item.modifiedAt || item.createdAt || item.savedAt || 0;
    var t = new Date(raw).getTime();
    return isNaN(t) ? 0 : t;
  }

  /** Fusionne deux listes par id : union + version la plus récente en cas de doublon. */
  function mergeRecords(localArr, remoteArr) {
    var map = Object.create(null);
    function put(item) {
      var k = recordKey(item);
      if (!k) return;
      var prev = map[k];
      if (!prev || recordTime(item) >= recordTime(prev)) {
        map[k] = item;
      }
    }
    (remoteArr || []).forEach(put);
    (localArr || []).forEach(put);
    return Object.keys(map).map(function (k) {
      return map[k];
    });
  }

  function setSyncStatus(state, detail) {
    var el = document.getElementById(SYNC_EL_ID);
    if (!el) return;
    el.className = '';
    if (state === 'syncing') {
      el.className = 'syncing';
      el.textContent = 'Synchro…';
      el.title = 'Enregistrement sur le cloud';
    } else if (state === 'remote') {
      el.className = 'syncing';
      el.textContent = 'Mise à jour';
      el.title = detail || 'Données mises à jour depuis un autre poste';
    } else if (state === 'synced') {
      el.className = 'synced';
      var hh = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      el.textContent = 'À jour';
      el.title = 'Dernière synchro : ' + hh + (detail ? ' — ' + detail : '');
    } else if (state === 'error') {
      el.className = 'error';
      el.textContent = 'Hors ligne';
      el.title = detail || 'Synchro indisponible';
    } else {
      el.textContent = '';
      el.title = '';
    }
  }

  function getPostePreset() {
    return localStorage.getItem(POSTE_KEY) || '';
  }

  function savePostePreset(value) {
    if (!value) localStorage.removeItem(POSTE_KEY);
    else localStorage.setItem(POSTE_KEY, value);
  }

  function applyPostePresetRoles() {
    var preset = getPostePreset();
    if (preset === 'accueil') {
      if (typeof global._userRole !== 'undefined') global._userRole = 'billing';
      localStorage.setItem('lb_user_role', 'billing');
      if (typeof global.setWorkspace === 'function') global.setWorkspace('admin');
    } else if (preset === 'prog') {
      if (typeof global._userRole !== 'undefined') global._userRole = 'production';
      localStorage.setItem('lb_user_role', 'production');
      if (typeof global.setWorkspace === 'function') global.setWorkspace('prog');
    }
    if (typeof global.applyRoleUi === 'function') global.applyRoleUi();
  }

  function applyPostePresetOnBoot() {
    var preset = getPostePreset();
    if (!preset) return false;
    applyPostePresetRoles();
    return true;
  }

  function bindPostePresetSettings() {
    var sel = document.getElementById('poste-preset-select');
    var btn = document.getElementById('btn-poste-preset-save');
    var msg = document.getElementById('poste-preset-msg');
    if (!sel || !btn) return;
    sel.value = getPostePreset();
    btn.onclick = function () {
      var v = sel.value || '';
      savePostePreset(v);
      if (v) applyPostePresetRoles();
      if (msg) {
        msg.textContent = v
          ? 'Poste enregistré pour cet ordinateur.'
          : 'Profil poste effacé — choix manuel au démarrage.';
      }
      if (v === 'accueil' && typeof global.enterWorkspace === 'function') {
        global.enterWorkspace('admin', { skipPin: false });
      } else if (v === 'prog' && typeof global.enterWorkspace === 'function') {
        global.enterWorkspace('prog', { skipPin: true });
      }
      if (typeof global.showToast === 'function') {
        global.showToast(
          v ? '✅ Ce poste est configuré.' : 'Profil poste réinitialisé.',
          '#2a6049',
          2800
        );
      }
    };
  }

  function applyRemoteSync() {
    if (typeof global.syncWindowLabData === 'function') global.syncWindowLabData();
    if (typeof global.syncWindowQueue === 'function') global.syncWindowQueue();
    var pane = document.querySelector('.pane.on');
    var id = pane ? pane.id : '';
    if (id === 'pane-saisie') {
      if (typeof global.renderQueueMain === 'function') global.renderQueueMain();
    }
    if (typeof global.render === 'function') global.render();
    if (typeof global.refreshTechSelects === 'function') global.refreshTechSelects();
    if (typeof global.refreshTypeSelects === 'function') global.refreshTypeSelects();
    if (typeof global.applyProgMode === 'function') global.applyProgMode();
    if (typeof global.renderWaiting === 'function') global.renderWaiting();
    if (id === 'pane-calendrier' && typeof global.renderCal === 'function') global.renderCal();
  }

  global.LabMultiPoste = {
    mergeRecords: mergeRecords,
    setSyncStatus: setSyncStatus,
    getPostePreset: getPostePreset,
    savePostePreset: savePostePreset,
    applyPostePresetOnBoot: applyPostePresetOnBoot,
    applyPostePresetRoles: applyPostePresetRoles,
    bindPostePresetSettings: bindPostePresetSettings,
    applyRemoteSync: applyRemoteSync,
  };
})(typeof window !== 'undefined' ? window : global);
