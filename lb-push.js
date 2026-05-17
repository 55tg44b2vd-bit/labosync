/**
 * Notifications push Labosync (OneSignal Web v16, PWA).
 * SDK local : /vendor/onesignal-sdk.js (bundle ES6 complet).
 */
(function (global) {
  var SDK_URL = '/vendor/onesignal-sdk.js';
  var _cfg = null;
  var _role = null;
  var _externalId = null;
  var _sdkReady = false;
  var _initStarted = false;
  var _initPromise = null;
  var _sdkLoadPromise = null;

  function isStandalone() {
    try {
      if (global.matchMedia && global.matchMedia('(display-mode: standalone)').matches) return true;
      if (global.navigator && global.navigator.standalone === true) return true;
    } catch (e) {}
    return false;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(global.navigator && global.navigator.userAgent ? global.navigator.userAgent : '');
  }

  function supportsWebPush() {
    return 'Notification' in global && 'serviceWorker' in global.navigator;
  }

  function nativePermission() {
    try {
      return global.Notification ? global.Notification.permission : 'default';
    } catch (e) {
      return 'default';
    }
  }

  /** localStorage indisponible = souvent navigation privée */
  function isPrivateBrowsingSync() {
    try {
      var k = '__lb_pm_test';
      global.localStorage.setItem(k, '1');
      global.localStorage.removeItem(k);
      return false;
    } catch (e) {
      return true;
    }
  }

  function privateModeMessage() {
    return (
      'Les notifications Web ne fonctionnent pas en navigation privée (InPrivate). ' +
      'Fermez la fenêtre privée, ouvrez https://labosync.app dans une fenêtre normale, puis réessayez.'
    );
  }

  function deniedMessage() {
    return (
      'Notifications bloquées pour ce site. ' +
      'Cliquez sur le cadenas ou l’icône 🔔 à gauche de l’adresse → Notifications → Autoriser pour labosync.app, puis Ctrl+F5.'
    );
  }

  function edgeQuietMessage() {
    return (
      'Edge peut masquer la demande : cherchez « Notifications bloquées » ou une icône 🔔 dans la barre d’adresse (à côté de l’URL) et cliquez Autoriser.'
    );
  }

  function fetchConfig() {
    if (_cfg) return Promise.resolve(_cfg);
    return fetch('/.netlify/functions/onesignal-config')
      .then(function (r) {
        return r.ok ? r.json() : { enabled: false, appId: '' };
      })
      .then(function (j) {
        _cfg = j || { enabled: false, appId: '' };
        return _cfg;
      })
      .catch(function () {
        _cfg = { enabled: false, appId: '' };
        return _cfg;
      });
  }

  function resetSdkState() {
    _sdkReady = false;
    _initStarted = false;
    _initPromise = null;
  }

  function raceTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error(label || 'Délai dépassé'));
        }, ms);
      }),
    ]);
  }

  function loadSdk() {
    if (_sdkLoadPromise) return _sdkLoadPromise;
    _sdkLoadPromise = new Promise(function (resolve, reject) {
      var existing = global.document.getElementById('onesignal-sdk');
      if (existing) {
        if (
          existing.getAttribute('data-lb-loaded') === '1' ||
          existing.readyState === 'complete' ||
          existing.readyState === 'loaded' ||
          global.OneSignal
        ) {
          existing.setAttribute('data-lb-loaded', '1');
          resolve();
          return;
        }
        existing.addEventListener(
          'load',
          function () {
            existing.setAttribute('data-lb-loaded', '1');
            resolve();
          },
          { once: true }
        );
        existing.addEventListener(
          'error',
          function () {
            reject(new Error('Impossible de charger le module notifications (fichier /vendor/onesignal-sdk.js).'));
          },
          { once: true }
        );
        return;
      }
      var s = global.document.createElement('script');
      s.id = 'onesignal-sdk';
      s.src = SDK_URL;
      s.defer = true;
      s.onload = function () {
        s.setAttribute('data-lb-loaded', '1');
        resolve();
      };
      s.onerror = function () {
        reject(new Error('Impossible de charger le module notifications.'));
      };
      global.document.head.appendChild(s);
    });
    return _sdkLoadPromise;
  }

  function onNotificationClick(event) {
    try {
      var data = (event && event.notification && event.notification.additionalData) || {};
      if (_role === 'cabinet') {
        if (data.kind === 'invoice') {
          var tabF = global.document.querySelector('[data-ptab="factures"]');
          if (tabF) tabF.click();
        } else if (data.kind === 'chat') {
          var tabM = global.document.querySelector('[data-ptab="messages"]');
          if (tabM) tabM.click();
        }
        return;
      }
      if (_role === 'lab') {
        if (typeof global.goMessages === 'function') global.goMessages();
        else {
          var btn = global.document.getElementById('btn-messages-hd');
          if (btn) btn.click();
        }
      }
    } catch (e) {
      console.warn('[push] click', e);
    }
  }

  function bindClickHandler(OneSignal) {
    try {
      OneSignal.Notifications.addEventListener('click', onNotificationClick);
    } catch (e) {}
  }

  function initOneSignal(OneSignal, cfg) {
    return raceTimeout(
      OneSignal.init({
        appId: cfg.appId,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        allowLocalhostAsSecureOrigin: true,
      }),
      30000,
      'Initialisation OneSignal trop longue (vérifiez la connexion).'
    )
      .then(function () {
        return raceTimeout(OneSignal.login(_externalId), 15000, 'Connexion au compte notifications trop longue.');
      })
      .then(function () {
        bindClickHandler(OneSignal);
        _sdkReady = true;
        return OneSignal;
      })
      .catch(function (err) {
        var msg = String((err && err.message) || err || '');
        if (/already initialized|init.*already/i.test(msg)) {
          _sdkReady = true;
          return OneSignal;
        }
        throw err;
      });
  }

  /** Initialise OneSignal dès la connexion (pattern officiel v16). */
  function startInit() {
    if (!_externalId || _initStarted) return _initPromise || Promise.resolve(null);
    _initStarted = true;

    _initPromise = fetchConfig()
      .then(function (cfg) {
        if (!cfg.enabled || !cfg.appId) {
          throw new Error('Notifications non configurées côté serveur.');
        }
        if (!supportsWebPush()) {
          throw new Error('Navigateur incompatible avec les notifications Web.');
        }
        return loadSdk().then(function () {
          global.OneSignalDeferred = global.OneSignalDeferred || [];
          return new Promise(function (resolve, reject) {
            var settled = false;
            function finish(err, os) {
              if (settled) return;
              settled = true;
              if (err) reject(err);
              else resolve(os);
            }
            global.OneSignalDeferred.push(function (OneSignal) {
              initOneSignal(OneSignal, cfg)
                .then(function (os) {
                  finish(null, os);
                })
                .catch(finish);
            });
            setTimeout(function () {
              if (!settled && !_sdkReady) {
                finish(new Error('OneSignal ne démarre pas. Rechargez avec Ctrl+F5.'));
              }
            }, 35000);
          });
        });
      })
      .catch(function (err) {
        _initStarted = false;
        _initPromise = null;
        throw err;
      });

    return _initPromise;
  }

  function ensureSdkReady() {
    if (!_externalId) {
      return Promise.reject(new Error('Connectez-vous d\'abord à Labosync.'));
    }
    if (_sdkReady && global.OneSignal) {
      return Promise.resolve(global.OneSignal);
    }
    return startInit().then(function (os) {
      return os || global.OneSignal;
    });
  }

  function prepare(opts) {
    if (!opts || !opts.externalId) return;
    if (_externalId && _externalId !== opts.externalId) resetSdkState();
    _role = opts.role || null;
    _externalId = opts.externalId;
    global.OneSignalDeferred = global.OneSignalDeferred || [];
    startInit().catch(function (e) {
      console.warn('[push] init', e);
    });
  }

  function init(opts) {
    prepare(opts);
    return Promise.resolve({ ok: true });
  }

  function promptForNotifications() {
    if (isPrivateBrowsingSync()) {
      return Promise.resolve({ ok: false, message: privateModeMessage() });
    }
    if (isIos() && !isStandalone()) {
      return Promise.resolve({
        ok: false,
        message: 'Sur iPhone : Safari → Partager → Sur l\'écran d\'accueil, puis ouvrez Labosync via l\'icône.',
      });
    }
    if (!_externalId) {
      return Promise.resolve({ ok: false, message: 'Connectez-vous d\'abord.' });
    }
    if (!supportsWebPush()) {
      return Promise.resolve({ ok: false, message: 'Notifications non supportées sur ce navigateur.' });
    }
    if (nativePermission() === 'denied') {
      return Promise.resolve({ ok: false, message: deniedMessage() });
    }

    return ensureSdkReady()
      .then(function (OneSignal) {
        var sub = OneSignal.User && OneSignal.User.PushSubscription;
        if (sub && typeof sub.optIn === 'function') {
          return raceTimeout(sub.optIn(), 20000, 'Activation des notifications trop longue.');
        }
        if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
          return raceTimeout(
            OneSignal.Notifications.requestPermission(),
            20000,
            'Demande de permission trop longue.'
          );
        }
        return Promise.resolve();
      })
      .then(function () {
        var p = nativePermission();
        if (p === 'granted') {
          return { ok: true, message: 'Notifications activées sur cet appareil.' };
        }
        if (p === 'denied') {
          return { ok: false, message: deniedMessage() };
        }
        return { ok: false, message: edgeQuietMessage() };
      })
      .catch(function (err) {
        var msg = (err && err.message) || 'Erreur activation notifications.';
        if (/private|incognito|inprivate/i.test(msg)) {
          msg = privateModeMessage();
        }
        return { ok: false, message: msg };
      });
  }

  function showInstallBanner(targetEl, opts) {
    opts = opts || {};
    if (!targetEl) return;
    var key = opts.storageKey || 'lb_push_install_hint';

    if (isPrivateBrowsingSync()) {
      targetEl.style.display = 'block';
      targetEl.innerHTML =
        '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:14px 18px;margin-bottom:16px;font-size:.84rem;color:#991b1b;line-height:1.45;">' +
        '<strong>Navigation privée détectée</strong> — ' +
        privateModeMessage() +
        '</div>';
      return;
    }

    try {
      if (global.localStorage.getItem(key) === '1' && !(isIos() && !isStandalone())) return;
    } catch (e) {}

    var title = opts.title || 'Recevoir les alertes sur votre téléphone';
    var hint =
      isIos() && !isStandalone()
        ? 'iPhone : Safari → Partager → Sur l\'écran d\'accueil, puis ouvrez via l\'icône.'
        : 'Au clic, autorisez les notifications (barre en haut ou icône 🔔 à côté de l\'adresse).';

    targetEl.style.display = 'block';
    targetEl.innerHTML =
      '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:14px;padding:16px 18px;margin-bottom:16px;">' +
      '<div style="font-weight:700;color:#1e3a8a;margin-bottom:6px;">' +
      title +
      '</div>' +
      '<div style="font-size:.82rem;color:#475569;line-height:1.45;margin-bottom:10px;">' +
      (opts.subtitle || 'Messages et factures même application fermée.') +
      ' ' +
      hint +
      '</div>' +
      '<div style="font-size:.76rem;color:#64748b;margin-bottom:12px;">Utilisez une fenêtre normale (pas InPrivate). Chaque appareil (PC, téléphone) s\'active séparément.</div>' +
      '<button type="button" data-lb-push-enable style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:.84rem;font-weight:700;cursor:pointer;margin-right:8px;">🔔 Activer les notifications</button>' +
      '<button type="button" data-lb-push-dismiss style="background:#fff;border:1px solid #93c5fd;color:#1d4ed8;border-radius:8px;padding:10px 14px;font-size:.8rem;cursor:pointer;">Plus tard</button>' +
      '<div data-lb-push-status style="margin-top:10px;font-size:.78rem;min-height:1.2em;font-weight:600;"></div></div>';

    var enableBtn = targetEl.querySelector('[data-lb-push-enable]');
    var dismissBtn = targetEl.querySelector('[data-lb-push-dismiss]');
    var statusEl = targetEl.querySelector('[data-lb-push-status]');
    var busy = false;

    if (enableBtn) {
      enableBtn.addEventListener('click', function () {
        if (busy) return;
        busy = true;
        enableBtn.disabled = true;
        if (statusEl) {
          statusEl.style.color = '#1d4ed8';
          statusEl.textContent = 'Activation en cours…';
        }
        promptForNotifications()
          .then(function (res) {
            if (statusEl) {
              statusEl.style.color = res.ok ? '#059669' : '#c2410c';
              statusEl.textContent = res.message || '';
            }
            if (typeof global.showToast === 'function') {
              global.showToast(
                res.message || (res.ok ? 'Notifications activées' : 'Impossible d\'activer'),
                res.ok ? '#2563eb' : '#c0392b',
                8000
              );
            }
            if (res.ok) {
              try {
                global.localStorage.setItem(key, '1');
              } catch (e) {}
            }
          })
          .finally(function () {
            busy = false;
            enableBtn.disabled = false;
          });
      });
    }
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        try {
          global.localStorage.setItem(key, '1');
        } catch (e) {}
        targetEl.innerHTML = '';
        targetEl.style.display = 'none';
      });
    }
  }

  global.LabosyncPush = {
    prepare: prepare,
    init: init,
    loadSdk: loadSdk,
    isStandalone: isStandalone,
    isIos: isIos,
    isPrivateBrowsing: isPrivateBrowsingSync,
    showInstallBanner: showInstallBanner,
    promptForNotifications: promptForNotifications,
  };
})(typeof window !== 'undefined' ? window : globalThis);
