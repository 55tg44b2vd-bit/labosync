/**
 * Notifications push Labosync (OneSignal Web v16, PWA).
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
      'Ouvrez https://labosync.app dans une fenêtre normale.'
    );
  }

  function deniedMessage() {
    return (
      'Notifications bloquées. Cadenas ou icône 🔔 → Autoriser pour labosync.app, puis Ctrl+F5.'
    );
  }

  function edgeQuietMessage() {
    return (
      'Cherchez « Notifications bloquées » ou 🔔 à gauche de l\'adresse, puis Autoriser.'
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
      Promise.resolve(promise),
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
            reject(new Error('Module notifications introuvable (/vendor/onesignal-sdk.js).'));
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

  /** Nettoie les anciens service workers bloqués (cause fréquente d'init infinie). */
  function resetServiceWorkers() {
    if (!global.navigator.serviceWorker || !global.navigator.serviceWorker.getRegistrations) {
      return Promise.resolve();
    }
    return global.navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all(
        regs.map(function (reg) {
          return reg.unregister().catch(function () {
            return false;
          });
        })
      );
    });
  }

  function buildInitOptions(cfg) {
    return {
      appId: cfg.appId,
      path: '/',
      serviceWorkerPath: 'OneSignalSDKWorker.js',
      serviceWorkerParam: { scope: '/' },
      allowLocalhostAsSecureOrigin: true,
      promptOptions: {
        native: { enabled: false, autoPrompt: false },
        slidedown: {
          prompts: [
            {
              type: 'push',
              autoPrompt: false,
              delay: { pageViews: 999, timeDelay: 0 },
            },
          ],
        },
      },
    };
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

  function waitForSdkInstance(ms) {
    return new Promise(function (resolve, reject) {
      if (global.OneSignal && global.OneSignal.init) {
        resolve(global.OneSignal);
        return;
      }
      var settled = false;
      function done(os) {
        if (settled) return;
        settled = true;
        resolve(os);
      }
      global.OneSignalDeferred = global.OneSignalDeferred || [];
      global.OneSignalDeferred.push(function (OneSignal) {
        done(OneSignal);
      });
      setTimeout(function () {
        if (!settled) {
          settled = true;
          reject(new Error('SDK OneSignal non chargé. Ctrl+F5.'));
        }
      }, ms || 20000);
    });
  }

  function initOneSignal(OneSignal, cfg) {
    if (_sdkReady) return Promise.resolve(OneSignal);

    var opts = buildInitOptions(cfg);
    return resetServiceWorkers()
      .then(function () {
        return raceTimeout(OneSignal.init(opts), 60000, 'Init OneSignal bloquée (service worker). Rechargez la page.');
      })
      .then(function () {
        return raceTimeout(OneSignal.login(_externalId), 20000, 'Liaison compte OneSignal trop longue.');
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
          return OneSignal.login(_externalId).then(function () {
            bindClickHandler(OneSignal);
            return OneSignal;
          });
        }
        throw err;
      });
  }

  function startInit() {
    if (!_externalId || _initStarted) return _initPromise || Promise.resolve(null);
    _initStarted = true;

    _initPromise = fetchConfig()
      .then(function (cfg) {
        if (!cfg.enabled || !cfg.appId) {
          throw new Error('Notifications non configurées côté serveur.');
        }
        if (!supportsWebPush()) {
          throw new Error('Navigateur incompatible.');
        }
        return loadSdk()
          .then(function () {
            return waitForSdkInstance(25000);
          })
          .then(function (OneSignal) {
            return initOneSignal(OneSignal, cfg);
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

  function checkServerRegistration() {
    if (!_externalId) return Promise.resolve({ registered: false });
    return fetch(
      '/.netlify/functions/onesignal-status?externalId=' + encodeURIComponent(_externalId)
    )
      .then(function (r) {
        return r.ok ? r.json() : { registered: false };
      })
      .catch(function () {
        return { registered: false };
      });
  }

  function syncIfPermissionGranted() {
    if (!_externalId || isPrivateBrowsingSync()) return Promise.resolve();
    if (nativePermission() !== 'granted') return Promise.resolve();
    return ensureSdkReady()
      .then(function (OneSignal) {
        var sub = OneSignal.User && OneSignal.User.PushSubscription;
        if (sub && typeof sub.optIn === 'function') {
          return raceTimeout(sub.optIn(), 25000, 'Enregistrement push trop long');
        }
        return Promise.resolve();
      })
      .catch(function (e) {
        console.warn('[push] sync', e);
      });
  }

  function prepare(opts) {
    if (!opts || !opts.externalId) return;
    if (_externalId && _externalId !== opts.externalId) resetSdkState();
    _role = opts.role || null;
    _externalId = opts.externalId;
    global.OneSignalDeferred = global.OneSignalDeferred || [];
    startInit()
      .then(function () {
        return syncIfPermissionGranted();
      })
      .catch(function (e) {
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
        message: 'iPhone : ajoutez Labosync à l\'écran d\'accueil (Safari → Partager).',
      });
    }
    if (!_externalId) {
      return Promise.resolve({ ok: false, message: 'Connectez-vous d\'abord.' });
    }
    if (!supportsWebPush()) {
      return Promise.resolve({ ok: false, message: 'Notifications non supportées.' });
    }
    if (nativePermission() === 'denied') {
      return Promise.resolve({ ok: false, message: deniedMessage() });
    }

    return ensureSdkReady()
      .then(function (OneSignal) {
        var sub = OneSignal.User && OneSignal.User.PushSubscription;
        if (sub && typeof sub.optIn === 'function') {
          return raceTimeout(sub.optIn(), 25000, 'Activation trop longue — rechargez la page.');
        }
        if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
          return raceTimeout(OneSignal.Notifications.requestPermission(), 25000, 'Permission trop longue.');
        }
        return Promise.resolve();
      })
      .then(function () {
        return checkServerRegistration();
      })
      .then(function (st) {
        if (st && st.registered) {
          return {
            ok: true,
            message: 'Notifications activées. Testez via ⚙️ → Tester une notification.',
          };
        }
        if (nativePermission() === 'granted') {
          return {
            ok: false,
            message:
              'Autorisation navigateur OK, mais OneSignal n\'a pas enregistré cet appareil. Ctrl+F5 puis réessayez.',
          };
        }
        if (nativePermission() === 'denied') {
          return { ok: false, message: deniedMessage() };
        }
        return { ok: false, message: edgeQuietMessage() };
      })
      .catch(function (err) {
        return { ok: false, message: (err && err.message) || 'Erreur activation.' };
      });
  }

  function showInstallBanner(targetEl, opts) {
    opts = opts || {};
    if (!targetEl) return;
    var key = opts.storageKey || 'lb_push_install_hint';

    if (isPrivateBrowsingSync()) {
      targetEl.style.display = 'block';
      targetEl.innerHTML =
        '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:14px 18px;margin-bottom:16px;font-size:.84rem;color:#991b1b;">' +
        '<strong>Navigation privée</strong> — ' +
        privateModeMessage() +
        '</div>';
      return;
    }

    try {
      if (global.localStorage.getItem(key) === '1' && !(isIos() && !isStandalone())) return;
    } catch (e) {}

    var title = opts.title || 'Recevoir les alertes sur votre téléphone';
    targetEl.style.display = 'block';
    targetEl.innerHTML =
      '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:14px;padding:16px 18px;margin-bottom:16px;">' +
      '<div style="font-weight:700;color:#1e3a8a;margin-bottom:6px;">' +
      title +
      '</div>' +
      '<div style="font-size:.82rem;color:#475569;line-height:1.45;margin-bottom:10px;">' +
      (opts.subtitle || 'Messages et factures même application fermée.') +
      ' Cliquez le bouton ci-dessous (pas seulement le cadenas du navigateur).</div>' +
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
          statusEl.textContent = 'Activation…';
        }
        promptForNotifications()
          .then(function (res) {
            if (statusEl) {
              statusEl.style.color = res.ok ? '#059669' : '#c2410c';
              statusEl.textContent = res.message || '';
            }
            if (typeof global.showToast === 'function') {
              global.showToast(res.message || '', res.ok ? '#2563eb' : '#c0392b', 8000);
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

  function getExternalId() {
    return _externalId;
  }

  function getStatus() {
    return checkServerRegistration().then(function (server) {
      return {
        externalId: _externalId,
        browserPermission: nativePermission(),
        serverRegistered: !!(server && server.registered),
        sdkReady: _sdkReady,
      };
    });
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
    syncIfPermissionGranted: syncIfPermissionGranted,
    checkServerRegistration: checkServerRegistration,
    getStatus: getStatus,
    getExternalId: getExternalId,
  };
})(typeof window !== 'undefined' ? window : globalThis);
