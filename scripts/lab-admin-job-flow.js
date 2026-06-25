/* Saisie admin + fiche labo code-barres + scan douchette → programmation */
(function (global) {
  'use strict';

  var _pendingAdminJob = null;

  function jobsList() {
    return global.window && global.window.jobs ? global.window.jobs : global.jobs || [];
  }

  function queueList() {
    return global.window && global.window.queue ? global.window.queue : global.queue || [];
  }

  function labBarcodeValue(job) {
    if (!job) return '';
    var tc = String(job.trackCode || '').trim().toUpperCase();
    if (!tc) return 'LS' + String(job.id || '');
    return 'LS-' + tc;
  }

  function normalizeScanCode(raw) {
    var s = String(raw || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');
    if (s.indexOf('LS-') === 0) s = s.slice(3);
    else if (s.indexOf('LS') === 0 && s.length > 2) s = s.slice(2);
    return s;
  }

  function findJobByScanCode(raw) {
    if (!raw) return null;
    var n = normalizeScanCode(raw);
    if (!n) return null;
    var list = jobsList();
    if (list.length) {
      var byTrack = list.find(function (j) {
        return j.trackCode && String(j.trackCode).toUpperCase() === n;
      });
      if (byTrack) return byTrack;
      var byId = list.find(function (j) {
        return String(j.id) === n || String(j.id) === String(raw).trim();
      });
      if (byId) return byId;
    }
    var qList = queueList();
    var fromQ = qList.find(function (q) {
      return q.trackCode && normalizeScanCode(q.trackCode) === n;
    });
    if (fromQ) return queueItemAsJob(fromQ);
    return null;
  }

  function renderBarcodesIn(root) {
    if (!root) return;
    root.querySelectorAll('img.lab-sheet-barcode-img[data-barcode]').forEach(function (img) {
      var val = img.getAttribute('data-barcode');
      if (!val) return;
      if (!img.getAttribute('src') || img.getAttribute('src').indexOf('bwipjs') < 0) {
        img.src =
          'https://bwipjs-api.metafloor.com/?bcid=code128&scale=2&height=14&includetext&text=' +
          encodeURIComponent(val);
      }
      img.alt = val;
    });
  }

  function showLabSheetForJob(job) {
    if (!job || typeof global.generateLabSheetHTML !== 'function') {
      return;
    }
    var html = global.generateLabSheetHTML(job);
    if (typeof global._showLabSheetPreview === 'function' && global._showLabSheetPreview(html, job.id)) {
      return;
    }
    if (typeof global.printJobLabSheet === 'function') global.printJobLabSheet(job.id);
  }

  function clearAdminSaisieForm() {
    var nameEl = document.getElementById('saisie-ip');
    if (nameEl) nameEl.value = '';
    if (typeof global.resetSaisiePatientSex === 'function') global.resetSaisiePatientSex();
    var nb = document.getElementById('saisie-inb');
    if (nb) nb.value = '1';
    var note = document.getElementById('saisie-inote');
    if (note) note.value = '';
    var req = document.getElementById('saisie-ireq-delivery');
    if (req) req.value = '';
    var urg = document.getElementById('saisie-iurg');
    if (urg) urg.checked = false;
    if (typeof global._resetSaisieMissingState === 'function') global._resetSaisieMissingState();
    if (typeof global.resetSaisieLines === 'function') global.resetSaisieLines();
    if (typeof global._resetSaisieTeethPick === 'function') global._resetSaisieTeethPick();
    if (typeof global.resetSaisieDeliveryFields === 'function') global.resetSaisieDeliveryFields();
  }

  function queueItemAsJob(q) {
    if (!q) return null;
    return {
      id: q.jobId || q.id,
      patient: q.patient,
      type: q.type,
      tasks: q.tasks || [],
      nb: q.nb || 1,
      items: q.items || [{ type: q.type, nb: q.nb || 1 }],
      note: q.note || '',
      cabinet: q.cabinet || '',
      urgent: !!q.urgent,
      createdAt: q.createdAt || new Date().toISOString(),
      trackCode: q.trackCode || '',
      prothesisId: q.prothesisId || '',
      teeth: q.teeth || [],
      links: q.links || [],
      patientSex: q.patientSex || '',
      requestedDeliveryDate: q.requestedDeliveryDate || '',
      labDeliveryDate: q.labDeliveryDate || '',
      labDeliverySlot: q.labDeliverySlot || '12',
      needsProg: true,
      missingInfoItems: q.missingInfoItems,
    };
  }

  function commitAdminJob(pending, delivery, autoProgram) {
    var job = pending.job;
    // Garde anti-doublon : si un travail identique (même patient + mêmes types) a été créé il y a
    // quelques secondes, on ignore (double-clic / « refait » répété). Évite les travaux en double.
    if (typeof global._isRecentDuplicateJob === 'function') {
      var _items = (job.items && job.items.length) ? job.items : [{ type: job.type, nb: job.nb || 1 }];
      var _existsById = (jobsList() || []).some(function (j) { return String(j.id) === String(job.id); });
      if (!_existsById && global._isRecentDuplicateJob(job.patient, _items)) {
        if (typeof global.showToast === 'function') global.showToast('⚠️ Ce travail vient d\'être créé — doublon évité', '#d97706', 3500);
        return;
      }
    }
    if (typeof global.applyDeliveryFieldsToObject === 'function') {
      global.applyDeliveryFieldsToObject(job, delivery);
    } else {
      job.labDeliveryDate = delivery.labDeliveryDate || '';
      job.labDeliverySlot = delivery.labDeliverySlot || '12';
      job.requestedDeliveryDate = delivery.requestedDeliveryDate || job.requestedDeliveryDate || '';
    }
    var qItem = pending.queueItem;
    var progOn = typeof global.isProgEnabled === 'function' && global.isProgEnabled();

    if (progOn && qItem) {
      var list = jobsList();
      if (list && typeof list.push === 'function') {
        var existingJob = list.find(function (j) {
          return String(j.id) === String(job.id);
        });
        if (existingJob) Object.assign(existingJob, job);
        else list.push(job);
        if (typeof global.saveJobs === 'function') global.saveJobs();
      }
      qItem.jobId = job.id;
      qItem.trackCode = job.trackCode;
      qItem.requestedDeliveryDate = job.requestedDeliveryDate;
      qItem.labDeliveryDate = job.labDeliveryDate;
      qItem.labDeliverySlot = job.labDeliverySlot;
      qItem.patientSex = job.patientSex;
      qItem.teeth = job.teeth;
      qItem.links = job.links;
      if (job.missingInfoItems) qItem.missingInfoItems = job.missingInfoItems;
      var q = queueList();
      if (q && typeof q.push === 'function') {
        // Idempotent : ne pas empiler deux entrées de file pour le même travail (jobId).
        var dupQ = q.find(function (x) { return String(x.id) === String(qItem.id) || (x.jobId && String(x.jobId) === String(job.id)); });
        if (dupQ) Object.assign(dupQ, qItem); else q.push(qItem);
        if (typeof global.saveQueue === 'function') global.saveQueue();
        if (typeof global.updateQueueBadge === 'function') global.updateQueueBadge();
        if (typeof global.renderQueueMain === 'function') global.renderQueueMain();
      }
    } else {
      var list = jobsList();
      if (list && typeof list.push === 'function') {
        // Idempotent : ne pas pousser deux fois le même travail (même id).
        var existingDirect = list.find(function (j) { return String(j.id) === String(job.id); });
        if (existingDirect) Object.assign(existingDirect, job); else list.push(job);
        if (typeof global.saveJobs === 'function') global.saveJobs();
      }
    }

    // Programmation automatique immédiate (1 geste) : génère les étapes (rétro-planifiées sur
    // l'échéance) avant d'afficher la fiche, pour que le travail ne reste pas « à programmer ».
    if (autoProgram && progOn && typeof global.programJobAuto === 'function') {
      try { global.programJobAuto(job.id); } catch (e) { /* on garde le travail même si la prog échoue */ }
      // APERÇU ÉDITABLE AVANT LA FICHE : présente la programmation proposée (édition manuelle,
      // « 🤖 IA », « 🔁 Autre proposition »). La fiche ne s'ouvre qu'après validation.
      if (typeof global.openScheduleEditor === 'function') {
        if (typeof global.render === 'function') global.render();
        if (typeof global.cloudSave === 'function') global.cloudSave();
        global.openScheduleEditor(job.id, {
          confirmLabel: '✓ Valider et générer la fiche',
          afterSave: function (j) { showLabSheetForJob(j || job); },
        });
        return;
      }
    }

    if (typeof global.render === 'function') global.render();
    showLabSheetForJob(job);
    if (typeof global.cloudSave === 'function') global.cloudSave();
  }

  function hideFinishModal() {
    var m = document.getElementById('admin-finish-modal');
    if (m) m.style.display = 'none';
    _pendingAdminJob = null;
  }

  function suggestFinishDate(pending) {
    var req = pending.job.requestedDeliveryDate || '';
    if (req && typeof global._suggestLabDateFromRequested === 'function') {
      var sug = global._suggestLabDateFromRequested(req);
      if (sug) return sug;
    }
    // Pas de date demandée → proposer 2 jours ouvrés (plutôt qu'aujourd'hui, peu réaliste).
    var base = typeof global.addWD === 'function' ? global.addWD(new Date(), 2) : new Date();
    if (typeof global.fmtISO === 'function') return global.fmtISO(base);
    var t = base;
    return (
      t.getFullYear() +
      '-' +
      String(t.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(t.getDate()).padStart(2, '0')
    );
  }

  function promptAdminJobFinish(pending) {
    _pendingAdminJob = pending;
    var m = document.getElementById('admin-finish-modal');
    var dEl = document.getElementById('admin-finish-date');
    var sEl = document.getElementById('admin-finish-slot');
    if (!m || !dEl) {
      commitAdminJob(pending, {
        labDeliveryDate: suggestFinishDate(pending),
        labDeliverySlot: '12',
        requestedDeliveryDate: pending.job.requestedDeliveryDate || '',
      });
      return;
    }
    dEl.value = suggestFinishDate(pending);
    if (sEl) sEl.value = '12';
    m.style.display = 'flex';
    // Refléter la préférence de planification (au plus tôt / pour l'échéance) sur le toggle.
    if (typeof global._syncPlanModeButtons === 'function') global._syncPlanModeButtons();
    setTimeout(function () {
      dEl.focus();
    }, 80);
  }

  function openJobForProgramming(job) {
    if (!job) return false;
    if (typeof global.isProgEnabled === 'function' && !global.isProgEnabled()) {
      if (typeof global.openJobDetail === 'function') global.openJobDetail(job.id);
      return true;
    }
    if (typeof global.enterWorkspace === 'function') global.enterWorkspace('prog', { skipPin: true });
    var tab = document.querySelector('.tab[data-pane="saisie"]');
    if (tab) tab.click();
    var q = queueList().find(function (x) {
      return x.jobId === job.id || x.id === job.id + '_q';
    });
    if (q && typeof global.openManualModal === 'function') {
      setTimeout(function () {
        global.openManualModal(q.id);
      }, 200);
      if (typeof global.showToast === 'function')
        global.showToast('Programmation : ' + job.patient, '#1d4ed8', 3000);
      return true;
    }
    if ((!job.tasks || !job.tasks.length) && typeof global.showToast === 'function') {
      global.showToast('Travail introuvable en file — resaisissez depuis Gestion', '#d97706', 4500);
    } else if (typeof global.openJobDetail === 'function') {
      global.openJobDetail(job.id);
    }
    return true;
  }

  function handleLabBarcodeScan(raw) {
    var job = findJobByScanCode(raw);
    if (!job) return false;
    return openJobForProgramming(job);
  }

  function wireUi() {
    var ok = document.getElementById('admin-finish-ok');
    var cancel = document.getElementById('admin-finish-cancel');
    if (ok) {
      ok.onclick = function () {
        if (!_pendingAdminJob) return hideFinishModal();
        var dEl = document.getElementById('admin-finish-date');
        var sEl = document.getElementById('admin-finish-slot');
        var labDate = dEl ? dEl.value : '';
        if (!labDate) {
          alert('Indiquez la date limite.');
          return;
        }
        var delivery = {
          labDeliveryDate: labDate,
          labDeliverySlot: sEl ? sEl.value || '12' : '12',
          requestedDeliveryDate: _pendingAdminJob.job.requestedDeliveryDate || '',
        };
        var autoEl = document.getElementById('admin-finish-autoprog');
        var autoProgram = autoEl ? autoEl.checked : false;
        var p = _pendingAdminJob;
        hideFinishModal();
        commitAdminJob(p, delivery, autoProgram);
      };
    }
    if (cancel) {
      cancel.onclick = function () {
        if (confirm('Annuler ce travail ? Il ne sera pas enregistré.')) hideFinishModal();
      };
    }

    var progScan = document.getElementById('prog-scan-in');
    if (progScan) {
      progScan.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var v = progScan.value.trim();
          if (v && handleLabBarcodeScan(v)) {
            progScan.value = '';
            e.preventDefault();
          }
        }
      });
    }

    var gs = document.getElementById('global-search');
    if (gs) {
      gs.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var v = gs.value.trim();
        if (v.length >= 4 && handleLabBarcodeScan(v)) {
          gs.value = '';
          var sr = document.getElementById('search-results');
          if (sr) sr.style.display = 'none';
          e.preventDefault();
        }
      });
    }
  }

  var origProcessScan = global.processScan;
  if (typeof origProcessScan === 'function') {
    global.processScan = function () {
      var inp = document.getElementById('scan-in');
      var raw = inp ? inp.value.trim() : '';
      if (raw && handleLabBarcodeScan(raw)) {
        if (inp) inp.value = '';
        var card = document.getElementById('scan-result-card');
        if (card) card.style.display = 'none';
        return;
      }
      return origProcessScan();
    };
  }

  var origPrintJobLabSheet = global.printJobLabSheet;
  if (typeof origPrintJobLabSheet === 'function') {
    global.printJobLabSheet = function (jobId) {
      var job = jobsList().find(function (j) {
        return String(j.id) === String(jobId);
      });
      if (!job) {
        alert('Travail introuvable');
        return;
      }
      try {
        var html = global.generateLabSheetHTML(job);
        if (typeof global._showLabSheetPreview === 'function' && global._showLabSheetPreview(html, jobId)) {
          return;
        }
        origPrintJobLabSheet(jobId);
      } catch (err) {
        console.error(err);
        alert('Erreur fiche labo');
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireUi);
  } else {
    wireUi();
  }

  global.labBarcodeValue = labBarcodeValue;
  global.findJobByScanCode = findJobByScanCode;
  global.handleLabBarcodeScan = handleLabBarcodeScan;
  global.openJobForProgramming = openJobForProgramming;
  global.promptAdminJobFinish = promptAdminJobFinish;
  global.renderLabSheetBarcodes = renderBarcodesIn;
  global.clearAdminSaisieForm = clearAdminSaisieForm;
})(typeof window !== 'undefined' ? window : globalThis);
