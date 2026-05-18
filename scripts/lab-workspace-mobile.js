/* Labosync Mobile — admin au quotidien, prog légère en onglet */
(function (global) {
  'use strict';

  var VIEW_WS = {
    home: 'both',
    travaux: 'both',
    livraisons: 'admin',
    docs: 'admin',
    messages: 'both',
    prog: 'prog-tab',
    cabinets: 'admin',
    'cab-detail': 'admin',
    bdl: 'admin',
  };

  var DEFAULT_VIEW = { admin: 'home', prog: 'prog' };

  function mobToast(msg, color) {
    if (typeof global.toast === 'function') global.toast(msg, color || 'var(--ink)');
  }

  function canMobAdmin() {
    return typeof global.canAccessWorkspace === 'function' && global.canAccessWorkspace('admin');
  }

  function canMobProg() {
    return (
      typeof global.isProgEnabled === 'function' &&
      global.isProgEnabled() &&
      typeof global.canAccessWorkspace === 'function' &&
      global.canAccessWorkspace('prog')
    );
  }

  /** Onglet « À prog. » : visible en admin (file rapide) ou en espace atelier (production). */
  function mobProgTabVisible(ws) {
    if (!canMobProg()) return false;
    return ws === 'admin' || ws === 'prog';
  }

  /** Hub désactivé : un onglet suffit pour la file à programmer. */
  function mobileNeedsHub() {
    return false;
  }

  function getResolvedMobileWorkspace() {
    if (canMobAdmin()) return 'admin';
    if (canMobProg()) return 'prog';
    return 'admin';
  }

  function viewAllowed(id) {
    var ws = typeof global.getWorkspace === 'function' ? global.getWorkspace() : 'admin';
    if (ws === 'hub') return false;
    if (id === 'prog') return mobProgTabVisible(ws);
    var tw = VIEW_WS[id] || 'both';
    if (tw === 'prog-tab') return mobProgTabVisible(ws);
    if (tw === 'both') return true;
    return tw === ws;
  }

  function applyMobileNav(ws) {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(function (btn) {
      var v = btn.dataset.view;
      if (v === 'prog') {
        btn.style.display = mobProgTabVisible(ws) ? '' : 'none';
        return;
      }
      var tw = VIEW_WS[v] || 'both';
      var show = tw === 'both' || tw === ws;
      btn.style.display = show ? '' : 'none';
    });
  }

  function updateMobileTopbar(ws) {
    var sw = document.getElementById('btn-mob-workspace-switch');
    if (sw) sw.style.display = mobileNeedsHub() && ws !== 'hub' ? '' : 'none';
    var brand = document.querySelector('.topbar-brand');
    var badge = document.getElementById('mob-workspace-badge');
    if (badge) {
      if (ws === 'hub' || ws === 'admin') {
        if (ws === 'hub') {
          badge.style.display = 'none';
        } else {
          badge.style.display = 'inline-block';
          badge.textContent = 'Administratif';
          badge.className = 'mob-ws-badge';
        }
      } else if (ws === 'prog') {
        badge.style.display = 'inline-block';
        badge.textContent = 'Atelier';
        badge.className = 'mob-ws-badge mob-ws-badge--prog';
      }
    }
    if (brand) {
      if (mobileNeedsHub() && ws !== 'hub') {
        brand.setAttribute('title', 'Changer d\'espace');
      } else {
        brand.removeAttribute('title');
      }
    }
  }

  function applyMobileFab(ws) {
    var fab = document.getElementById('fab-new-job');
    if (!fab) return;
    fab.style.display = ws === 'admin' ? 'flex' : 'none';
    if (ws === 'admin') {
      fab.setAttribute('aria-label', 'Créer un travail');
    }
  }

  function applyMobileHomeHints(ws) {
    var sub = document.getElementById('mob-home-ws-hint');
    if (!sub) return;
    if (ws === 'admin') {
      sub.textContent = canMobProg()
        ? 'Saisie, facturation — onglet « À prog. » pour la file atelier'
        : 'Saisie des travaux, livraisons et facturation';
      sub.style.display = '';
    } else if (ws === 'prog') {
      sub.textContent = 'File à programmer — planning détaillé sur ordinateur';
      sub.style.display = '';
    } else {
      sub.style.display = 'none';
    }
  }

  function showMobileHub() {
    if (!mobileNeedsHub()) return;
    if (typeof global.setWorkspace === 'function') global.setWorkspace('hub');
    var hub = document.getElementById('mobile-workspace-hub');
    var app = document.getElementById('app');
    if (hub) {
      hub.style.display = 'flex';
      hub.setAttribute('aria-hidden', 'false');
    }
    if (app) app.style.display = 'none';
    var progBtn = document.getElementById('mob-hub-enter-prog');
    var foot = document.getElementById('mob-hub-foot');
    var enabled = canMobProg();
    if (progBtn) {
      progBtn.classList.toggle('mob-hub-card--disabled', !enabled);
      progBtn.disabled = !enabled;
    }
    if (foot) {
      foot.textContent = enabled
        ? 'Même compte, mêmes données : un travail saisi en administratif apparaît dans l’onglet À prog.'
        : 'Activez la programmation sur ordinateur (Réglages).';
    }
  }

  function hideMobileHub() {
    var hub = document.getElementById('mobile-workspace-hub');
    var app = document.getElementById('app');
    if (hub) {
      hub.style.display = 'none';
      hub.setAttribute('aria-hidden', 'true');
    }
    if (app) app.style.display = 'flex';
  }

  function showMobilePinSheet() {
    var ov = document.getElementById('mob-admin-pin-sheet');
    if (ov) ov.style.display = 'flex';
    var inp = document.getElementById('mob-admin-pin-input');
    if (inp) {
      inp.value = '';
      setTimeout(function () {
        inp.focus();
      }, 200);
    }
  }

  function hideMobilePinSheet() {
    var ov = document.getElementById('mob-admin-pin-sheet');
    if (ov) ov.style.display = 'none';
  }

  async function submitMobilePin() {
    var inp = document.getElementById('mob-admin-pin-input');
    var err = document.getElementById('mob-admin-pin-err');
    var pin = inp ? String(inp.value || '').trim() : '';
    if (!pin) {
      if (err) {
        err.textContent = 'Entrez le code.';
        err.style.display = 'block';
      }
      return;
    }
    try {
      var res = await global.fetchLabAccess('verify', { pin: pin });
      if (res.ok) {
        if (typeof global.setAdminUnlocked === 'function') global.setAdminUnlocked();
        hideMobilePinSheet();
        await enterMobileWorkspace('admin', { skipPin: true });
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

  function mobShowDefaultView(ws) {
    var id = DEFAULT_VIEW[ws] || 'home';
    if (typeof global.showView === 'function') global.showView(id);
  }

  function applyMobileWorkspaceUi(ws) {
    ws = ws || (typeof global.getWorkspace === 'function' ? global.getWorkspace() : 'admin');
    if (ws === 'hub' && mobileNeedsHub()) {
      showMobileHub();
      updateMobileTopbar('hub');
      return;
    }
    if (ws === 'hub') ws = getResolvedMobileWorkspace();
    hideMobileHub();
    applyMobileNav(ws);
    updateMobileTopbar(ws);
    applyMobileFab(ws);
    applyMobileHomeHints(ws);
    var travauxTitle = document.getElementById('mob-travaux-title');
    if (travauxTitle) {
      travauxTitle.textContent = ws === 'prog' ? 'Travaux programmés' : 'Travaux en cours';
    }
    var progHint = document.getElementById('mob-prog-desktop-hint');
    if (progHint) progHint.style.display = mobProgTabVisible(ws) ? '' : 'none';
    if (mobProgTabVisible(ws) && typeof global.renderProgQueue === 'function') {
      global.renderProgQueue();
    }
    if (typeof global.renderAll === 'function') global.renderAll();
  }

  async function enterMobileWorkspace(ws, opts) {
    opts = opts || {};
    if (!canMobAdmin() && ws === 'admin') {
      ws = 'prog';
    }
    if (ws === 'prog' && !canMobProg()) {
      if (canMobAdmin()) ws = 'admin';
      else {
        mobToast('Programmation non disponible.', 'var(--orange)');
        return;
      }
    }
    if (ws === 'admin' && !canMobAdmin()) {
      mobToast('Accès administratif refusé.', 'var(--red)');
      return;
    }
    if (ws === 'admin' && !opts.skipPin) {
      if (typeof global.refreshAdminPinStatus === 'function') await global.refreshAdminPinStatus();
      var pinHas = typeof global.getAdminPinHas === 'function' ? global.getAdminPinHas() : false;
      var needsPin =
        pinHas && typeof global.isAdminUnlocked === 'function' && !global.isAdminUnlocked();
      if (needsPin) {
        showMobilePinSheet();
        return;
      }
    }
    if (typeof global.enterWorkspace === 'function') {
      await global.enterWorkspace(ws, { skipPin: true });
    } else if (typeof global.setWorkspace === 'function') {
      global.setWorkspace(ws);
    }
    applyMobileWorkspaceUi(ws);
    mobShowDefaultView(ws);
  }

  function resolveMobileWorkspaceAfterBoot() {
    var ws = getResolvedMobileWorkspace();
    if (typeof global.setWorkspace === 'function' && global.getWorkspace() === 'hub') {
      global.setWorkspace(ws);
    }
    enterMobileWorkspace(ws, { skipPin: ws !== 'admin' });
  }

  function addMobileAdminJob(opts) {
    opts = opts || {};
    var patient = opts.patient;
    var items = opts.items || [];
    var cab = opts.cabinet || '';
    var delivery = opts.deliveryDate || opts.requestedDeliveryDate || '';
    var note = opts.note || '';
    var urgent = !!opts.urgent;
    var missingItems = opts.missingItems || [];
    if (!patient) {
      mobToast('Code patient requis', 'var(--red)');
      return false;
    }
    if (!items.length) {
      mobToast('Ajoutez au moins un type', 'var(--red)');
      return false;
    }
    var totalNb = items.reduce(function (s, it) {
      return s + (it.nb || 1);
    }, 0);
    var lbl = totalNb > 1 ? patient + ' (' + totalNb + ' éléments)' : patient;
    var job = {
      id: String(Date.now()),
      patient: lbl,
      type: items[0].type,
      tasks: [],
      nb: totalNb,
      items: items,
      urgent: urgent,
      note: note,
      requestedDeliveryDate: delivery,
      deliveryDate: delivery,
      labDeliveryDate: '',
      labDeliverySlot: '12',
      cabinet: cab,
      createdAt: new Date().toISOString(),
      trackCode: typeof global.genTrackCode === 'function' ? global.genTrackCode() : '',
      prothesisId: '',
      needsProg: canMobProg(),
    };
    if (missingItems.length) job.missingInfoItems = missingItems;
    global.jobs.push(job);
    if (canMobProg() && global.queue) {
      global.queue.push({
        id: job.id + '_q',
        patient: lbl,
        type: items[0].type,
        nb: items[0].nb,
        items: items,
        note: note,
        cabinet: cab,
        urgent: urgent,
        createdAt: job.createdAt,
        requestedDeliveryDate: delivery,
        jobId: job.id,
        missingInfoItems: missingItems.length ? missingItems : undefined,
      });
    }
    if (cab) localStorage.setItem('lb_last_cab', cab);
    return true;
  }

  function programQueueItemMobile(qId) {
    var q = (global.queue || []).find(function (x) {
      return x.id === qId;
    });
    if (!q && String(qId).indexOf('job_') === 0) {
      var jid = String(qId).slice(4);
      var jobOnly = global.jobs.find(function (j) {
        return j.id === jid;
      });
      if (jobOnly) {
        var jobItems =
          jobOnly.items && jobOnly.items.length
            ? jobOnly.items
            : [{ type: jobOnly.type, nb: jobOnly.nb || 1 }];
        var jobTasks = [];
        jobItems.forEach(function (it) {
          if (typeof global.buildTasksMobile === 'function') {
            jobTasks = jobTasks.concat(global.buildTasksMobile(it.type));
          }
        });
        jobOnly.tasks = jobTasks;
        jobOnly.needsProg = false;
        return;
      }
    }
    if (!q) return;
    var items = q.items && q.items.length ? q.items : [{ type: q.type, nb: q.nb || 1 }];
    var tasks = [];
    if (typeof global.buildTasksMobile === 'function') {
      items.forEach(function (it) {
        tasks = tasks.concat(global.buildTasksMobile(it.type));
      });
    }
    var existing = q.jobId ? global.jobs.find(function (j) { return j.id === q.jobId; }) : null;
    if (existing) {
      existing.tasks = tasks;
      existing.needsProg = false;
    } else {
      global.jobs.push({
        id: q.jobId || String(Date.now()),
        patient: q.patient,
        type: items[0].type,
        tasks: tasks,
        nb: items[0].nb || 1,
        items: items,
        urgent: q.urgent || false,
        note: q.note || '',
        cabinet: q.cabinet || '',
        deliveryDate: q.requestedDeliveryDate || q.deliveryDate || '',
        createdAt: q.createdAt || new Date().toISOString(),
        trackCode: typeof global.genTrackCode === 'function' ? global.genTrackCode() : '',
        prothesisId: q.prothesisId || '',
      });
    }
    global.queue = global.queue.filter(function (x) {
      return x.id !== qId;
    });
  }

  function renderProgQueue() {
    var el = document.getElementById('mob-prog-queue');
    var cnt = document.getElementById('mob-prog-queue-cnt');
    if (!el) return;
    var list = (global.queue || []).slice();
    global.jobs.forEach(function (j) {
      if ((!j.tasks || !j.tasks.length) && j.needsProg) {
        list.push({
          id: 'job_' + j.id,
          jobId: j.id,
          patient: j.patient,
          type: j.type,
          nb: j.nb,
          items: j.items,
          note: j.note,
          cabinet: j.cabinet,
          urgent: j.urgent,
          createdAt: j.createdAt,
          fromJob: true,
        });
      }
    });
    if (cnt) cnt.textContent = list.length ? '(' + list.length + ')' : '';
    if (!list.length) {
      el.innerHTML =
        '<div class="empty" style="padding:40px 16px;text-align:center;"><div class="empty-icon" style="font-size:2rem;margin-bottom:8px;">✅</div><p style="font-size:.92rem;font-weight:600;">Rien à programmer</p><p style="font-size:.78rem;margin-top:8px;line-height:1.45;color:var(--ink-soft);">Créez un travail depuis l’accueil ou l’onglet Travaux.</p></div>';
      return;
    }
    el.innerHTML = list
      .map(function (q) {
        var cab = q.cabinet ? global.cabinets.find(function (c) { return c.id === q.cabinet; }) : null;
        return (
          '<article class="mcard" style="margin-bottom:10px;border-left:4px solid var(--accent);">' +
          '<div style="font-weight:700;font-size:.95rem;margin-bottom:4px;">' +
          (typeof global.esc === 'function' ? global.esc(q.patient) : q.patient) +
          '</div>' +
          '<div style="font-size:.78rem;color:var(--ink-soft);margin-bottom:10px;">' +
          (cab ? cab.name : 'Sans cabinet') +
          ' · ' +
          (typeof global.getJobTypeLabel === 'function' ? global.getJobTypeLabel(q) : q.type) +
          '</div>' +
          '<button type="button" class="btn btn-primary" data-prog-id="' +
          q.id +
          '" style="min-height:48px;">▶ Planifier en un geste</button>' +
          '</article>'
        );
      })
      .join('');
    el.querySelectorAll('[data-prog-id]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        programQueueItemMobile(btn.getAttribute('data-prog-id'));
        if (typeof global.saveData === 'function') await global.saveData();
        renderProgQueue();
        if (typeof global.renderAll === 'function') global.renderAll();
        mobToast('✅ Travail planifié', 'var(--green)');
      });
    });
  }

  function wrapShowView() {
    if (global._showViewWrapped) return;
    global._showViewWrapped = true;
    var orig = global.showView;
    global.showView = function (id) {
      if (!viewAllowed(id)) {
        mobToast('Cet onglet n’est pas disponible pour votre profil.', 'var(--orange)');
        return;
      }
      orig(id);
      if (id === 'prog' && typeof global.renderProgQueue === 'function') global.renderProgQueue();
    };
  }

  function wireMobileWorkspaceEvents() {
    var hubAdmin = document.getElementById('mob-hub-enter-admin');
    var hubProg = document.getElementById('mob-hub-enter-prog');
    if (hubAdmin) hubAdmin.addEventListener('click', function () { enterMobileWorkspace('admin'); });
    if (hubProg) hubProg.addEventListener('click', function () { enterMobileWorkspace('prog'); });
    var sw = document.getElementById('btn-mob-workspace-switch');
    if (sw)
      sw.addEventListener('click', function () {
        if (mobileNeedsHub()) showMobileHub();
      });
    var pinOk = document.getElementById('mob-admin-pin-ok');
    var pinCancel = document.getElementById('mob-admin-pin-cancel');
    if (pinOk) pinOk.addEventListener('click', submitMobilePin);
    if (pinCancel)
      pinCancel.addEventListener('click', function () {
        hideMobilePinSheet();
        if (canMobProg() && !canMobAdmin()) enterMobileWorkspace('prog', { skipPin: true });
        else mobToast('Code requis pour l’accès administratif.', 'var(--orange)');
      });
    var topbar = document.querySelector('.topbar-brand');
    if (topbar)
      topbar.addEventListener('click', function () {
        if (mobileNeedsHub()) showMobileHub();
      });
  }

  function initMobileWorkspace() {
    wrapShowView();
    wireMobileWorkspaceEvents();
    global.applyMobileWorkspaceUi = applyMobileWorkspaceUi;
    global.resolveMobileWorkspaceAfterBoot = resolveMobileWorkspaceAfterBoot;
    global.enterMobileWorkspace = enterMobileWorkspace;
    global.showMobileHub = showMobileHub;
    global.addMobileAdminJob = addMobileAdminJob;
    global.renderProgQueue = renderProgQueue;
    global.programQueueItemMobile = programQueueItemMobile;
    global.mobileNeedsHub = mobileNeedsHub;
    global.mobProgTabVisible = mobProgTabVisible;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileWorkspace);
  } else {
    initMobileWorkspace();
  }
})(typeof window !== 'undefined' ? window : globalThis);
