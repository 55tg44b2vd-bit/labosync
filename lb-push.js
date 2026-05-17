/**
 * Notifications push Labosync — enregistrement natif (Push API + API OneSignal).
 * Le SDK page OneSignal n'est plus requis pour s'abonner (évite CSP / init bloqué).
 */
(function (global) {
  var SDK_URL = '/vendor/onesignal-sdk.js';
  var _cfg = null;
  var _role = null;
  var _externalId = null;
  var _authHeadersFn = null;
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

  function isOneSignalInitialized() {
    try {
      return !!(
        global.OneSignal &&
        global.OneSignal.Kr &&
        global.OneSignal.C &&
        global.OneSignal.User &&
        global.OneSignal.User.PushSubscription
      );
    } catch (e) {
      return false;
    }
  }

  /** Attend OneSignal.EVENTS.SDK_INITIALIZED (flag OneSignal.C). */
  function waitForSdkInitialized(OneSignal, maxMs) {
    maxMs = maxMs || 120000;
    return new Promise(function (resolve, reject) {
      function ok() {
        resolve(OneSignal);
      }
      try {
        if (OneSignal && OneSignal.C) {
          ok();
          return;
        }
        if (OneSignal && OneSignal.EVENTS && OneSignal.P && typeof OneSignal.P.once === 'function') {
          var settled = false;
          function finish() {
            if (settled) return;
            settled = true;
            ok();
          }
          OneSignal.P.once(OneSignal.EVENTS.SDK_INITIALIZED, finish);
          setTimeout(function () {
            if (settled) return;
            if (OneSignal && OneSignal.C) finish();
            else {
              settled = true;
              reject(new Error('OneSignal initialisation incomplète — Ctrl+F5 puis réessayez.'));
            }
          }, maxMs);
          return;
        }
      } catch (e) {}
      var start = Date.now();
      function tick() {
        try {
          if (OneSignal && OneSignal.C) {
            ok();
            return;
          }
        } catch (e2) {}
        if (Date.now() - start > maxMs) {
          reject(new Error('OneSignal initialisation incomplète — Ctrl+F5 puis réessayez.'));
          return;
        }
        setTimeout(tick, 150);
      }
      tick();
    });
  }

  function readExternalId(OneSignal) {
    try {
      if (OneSignal.User && OneSignal.User.externalId) return OneSignal.User.externalId;
      if (OneSignal.ye && typeof OneSignal.ye.Qe === 'function') {
        var id = OneSignal.ye.Qe();
        if (id && id.qe) return id.qe;
      }
    } catch (e) {}
    return null;
  }

  function waitForIdentityReady(OneSignal, externalId, maxMs) {
    return new Promise(function (resolve, reject) {
      var start = Date.now();
      function tick() {
        try {
          if (readExternalId(OneSignal) === externalId) {
            resolve(OneSignal);
            return;
          }
        } catch (e) {}
        if (Date.now() - start > (maxMs || 60000)) {
          reject(new Error('Liaison compte OneSignal incomplète — réessayez.'));
          return;
        }
        setTimeout(tick, 250);
      }
      tick();
    });
  }

  function waitForUserModule(OneSignal, maxMs) {
    return new Promise(function (resolve, reject) {
      var start = Date.now();
      function tick() {
        try {
          if (
            OneSignal &&
            OneSignal.User &&
            OneSignal.User.PushSubscription &&
            typeof OneSignal.User.PushSubscription.optIn === 'function'
          ) {
            resolve(OneSignal);
            return;
          }
        } catch (e) {}
        if (Date.now() - start > (maxMs || 45000)) {
          reject(new Error('OneSignal n\'a pas fini de démarrer. Ctrl+F5 puis réessayez.'));
          return;
        }
        setTimeout(tick, 250);
      }
      tick();
    });
  }

  function formatApiResponseError(j, fallback) {
    if (!j) return fallback || 'Erreur serveur';
    if (j.message && typeof j.message === 'string') return j.message;
    var err = j.error;
    if (err && typeof err === 'object' && Array.isArray(err.errors)) {
      return err.errors
        .map(function (e) {
          if (typeof e === 'string') return e;
          if (e && typeof e === 'object') return e.title || e.message || e.code || '';
          return '';
        })
        .filter(Boolean)
        .join(' — ') || fallback;
    }
    if (j.reason) return String(j.reason);
    return fallback || 'Erreur serveur';
  }

  function detectWebPushType() {
    try {
      var ua = global.navigator && global.navigator.userAgent ? global.navigator.userAgent : '';
      if (/firefox|fxios/i.test(ua)) return 'FirefoxPush';
      if (/safari/i.test(ua) && !/chrome|crios|crmo|edg/i.test(ua)) return 'SafariPush';
    } catch (e) {}
    return 'ChromePush';
  }

  function formatPushError(err) {
    var msg =
      err && err.message
        ? String(err.message)
        : err && typeof err === 'object'
          ? formatApiResponseError(err, 'Erreur activation.')
          : String(err || 'Erreur activation.');
    if (/^timeout$/i.test(msg.trim())) {
      return (
        'Le navigateur autorise déjà les notifications. Ctrl+F5, attendez 10 s, puis menu ⚙️ → « Finaliser l\'enregistrement ».'
      );
    }
    if (/Cannot read properties of undefined|reading 'Qe'/i.test(msg)) {
      return (
        'Enregistrement interrompu. Ctrl+F5 puis menu ⚙️ → Finaliser l\'enregistrement.'
      );
    }
    if (/Clé push manquante|VAPID|Service Worker|service worker|AbortError/i.test(msg)) {
      return msg + ' — Ctrl+F5 puis réessayez.';
    }
    if (/Non autorisé|403/i.test(msg)) {
      return 'Session expirée — reconnectez-vous à Labosync, puis réessayez.';
    }
    if (/SDK OneSignal non chargé|Module notifications/i.test(msg)) {
      return (
        'Module notifications non chargé. Ctrl+F5, attendez que la page soit entièrement chargée (15 s), puis réessayez.'
      );
    }
    return msg;
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

  function waitForOneSignalGlobal(maxMs) {
    return new Promise(function (resolve, reject) {
      var start = Date.now();
      function tick() {
        try {
          if (global.OneSignal && typeof global.OneSignal.init === 'function') {
            resolve(global.OneSignal);
            return;
          }
        } catch (e) {}
        if (Date.now() - start > (maxMs || 90000)) {
          reject(
            new Error(
              'Module notifications indisponible. Vérifiez votre connexion, désactivez les bloqueurs pour labosync.app, puis Ctrl+F5.'
            )
          );
          return;
        }
        setTimeout(tick, 80);
      }
      tick();
    });
  }

  function loadSdk() {
    if (_sdkLoadPromise) return _sdkLoadPromise;
    _sdkLoadPromise = new Promise(function (resolve, reject) {
      function afterScriptTag() {
        waitForOneSignalGlobal(90000).then(resolve).catch(reject);
      }

      if (global.OneSignal && typeof global.OneSignal.init === 'function') {
        resolve();
        return;
      }

      var existing = global.document.getElementById('onesignal-sdk');
      if (existing) {
        if (existing.getAttribute('data-lb-loaded') === '1') {
          afterScriptTag();
          return;
        }
        existing.addEventListener(
          'load',
          function () {
            existing.setAttribute('data-lb-loaded', '1');
            afterScriptTag();
          },
          { once: true }
        );
        existing.addEventListener(
          'error',
          function () {
            reject(new Error('Fichier /vendor/onesignal-sdk.js inaccessible.'));
          },
          { once: true }
        );
        return;
      }

      var s = global.document.createElement('script');
      s.id = 'onesignal-sdk';
      s.src = SDK_URL;
      s.async = false;
      s.onload = function () {
        s.setAttribute('data-lb-loaded', '1');
        afterScriptTag();
      };
      s.onerror = function () {
        reject(new Error('Impossible de charger /vendor/onesignal-sdk.js'));
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

  function bootstrapOneSignal(cfg, options) {
    options = options || {};
    var opts = buildInitOptions(cfg);

    return loadSdk()
      .then(function () {
        return waitForOneSignalGlobal(90000);
      })
      .then(function (OneSignal) {
        var chain = Promise.resolve();

        if (!options.skipSwReset && nativePermission() !== 'granted') {
          chain = chain.then(function () {
            return resetServiceWorkers();
          });
        }

        if (!isOneSignalInitialized()) {
          chain = chain.then(function () {
            return raceTimeout(
              OneSignal.init(opts),
              120000,
              'Initialisation notifications trop longue — rechargez la page (Ctrl+F5).'
            );
          });
        }

        return chain
          .then(function () {
            return waitForSdkInitialized(OneSignal, 120000);
          })
          .then(function () {
            return waitForUserModule(OneSignal, 60000);
          })
          .then(function () {
            return OneSignal.login(_externalId);
          })
          .then(function () {
            return waitForIdentityReady(OneSignal, _externalId, 60000);
          })
          .then(function () {
            bindClickHandler(OneSignal);
            _sdkReady = true;
            return OneSignal;
          });
      })
      .catch(function (err) {
        var msg = String((err && err.message) || err || '');
        if (/already initialized|init.*already/i.test(msg)) {
          var OS = global.OneSignal;
          return waitForSdkInitialized(OS, 90000)
            .then(function () {
              return waitForUserModule(OS, 30000);
            })
            .then(function () {
              return OS.login(_externalId);
            })
            .then(function () {
              return waitForIdentityReady(OS, _externalId, 45000);
            })
            .then(function () {
              bindClickHandler(OS);
              _sdkReady = true;
              return OS;
            });
        }
        throw err;
      });
  }

  function startInit(options) {
    options = options || {};
    if (!_externalId) return Promise.resolve(null);
    if (_initPromise && !options.forceRetry) return _initPromise;
    if (options.forceRetry) resetSdkState();
    if (_initStarted && _initPromise) return _initPromise;
    _initStarted = true;

    _initPromise = fetchConfig()
      .then(function (cfg) {
        if (!cfg.enabled || !cfg.appId) {
          throw new Error('Notifications non configurées côté serveur.');
        }
        if (!supportsWebPush()) {
          throw new Error('Navigateur incompatible.');
        }
        return bootstrapOneSignal(cfg, options);
      })
      .catch(function (err) {
        _initStarted = false;
        _initPromise = null;
        throw err;
      });

    return _initPromise;
  }

  function ensureSdkReady(options) {
    options = options || {};
    if (!_externalId) {
      return Promise.reject(new Error('Connectez-vous d\'abord à Labosync.'));
    }
    if (options.forceRetry) resetSdkState();
    if (_sdkReady && isOneSignalInitialized() && !options.forceRetry) {
      return waitForSdkInitialized(global.OneSignal, 30000).then(function (OS) {
        if (readExternalId(OS) === _externalId) return OS;
        return OS.login(_externalId).then(function () {
          return waitForIdentityReady(OS, _externalId, 45000);
        });
      });
    }
    return startInit(options).then(function (os) {
      return os || global.OneSignal;
    });
  }

  function runOptIn(OneSignal, attempt) {
    attempt = attempt || 0;
    return waitForSdkInitialized(OneSignal, 120000)
      .then(function (OS) {
        return waitForUserModule(OS, 60000);
      })
      .then(function (OS) {
        if (readExternalId(OS) !== _externalId) {
          return OS.login(_externalId).then(function () {
            return waitForIdentityReady(OS, _externalId, 60000);
          });
        }
        return OS;
      })
      .then(function (OS) {
        var sub = OS.User.PushSubscription;
        if (sub.optedIn === true) return OS;
        if (nativePermission() !== 'granted') {
          return OS.Notifications.requestPermission();
        }
        return sub.optIn().then(function () {
          return OS;
        });
      })
      .catch(function (err) {
        var msg = String((err && err.message) || err || '');
        if (
          attempt < 4 &&
          /Cannot read properties of undefined|reading 'Qe'|initialisation incomplète|Liaison compte/i.test(
            msg
          )
        ) {
          return new Promise(function (r) {
            setTimeout(r, 1200 * (attempt + 1));
          }).then(function () {
            return runOptIn(OneSignal, attempt + 1);
          });
        }
        throw err;
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

  function getApiHeaders() {
    var h = { 'Content-Type': 'application/json' };
    if (typeof _authHeadersFn === 'function') {
      try {
        var extra = _authHeadersFn();
        if (extra && typeof extra === 'object') {
          Object.keys(extra).forEach(function (k) {
            h[k] = extra[k];
          });
        }
      } catch (e) {}
    }
    return h;
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = global.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  function pickVapidKey(cfg) {
    return (cfg && (cfg.onesignalVapidPublicKey || cfg.vapidPublicKey)) || '';
  }

  function ensurePushServiceWorker() {
    if (!global.navigator.serviceWorker) {
      return Promise.reject(new Error('Service Worker non supporté par ce navigateur.'));
    }
    return global.navigator.serviceWorker
      .register('/OneSignalSDKWorker.js', { scope: '/' })
      .catch(function () {
        return resetServiceWorkers().then(function () {
          return global.navigator.serviceWorker.register('/OneSignalSDKWorker.js', { scope: '/' });
        });
      })
      .then(function () {
        return global.navigator.serviceWorker.ready;
      });
  }

  function subscribeNativePush(registration, vapidKey) {
    return registration.pushManager.getSubscription().then(function (existing) {
      if (existing) return existing;
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    });
  }

  function sendSubscriptionToServer(subscription) {
    var json = subscription.toJSON ? subscription.toJSON() : subscription;
    var keys = (json && json.keys) || {};
    if (!json.endpoint || !keys.auth || !keys.p256dh) {
      return Promise.reject(new Error('Abonnement navigateur incomplet.'));
    }
    return fetch('/.netlify/functions/onesignal-register', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        externalId: _externalId,
        endpoint: json.endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
        pushType: detectWebPushType(),
      }),
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || !j.ok) {
          throw new Error(formatApiResponseError(j, 'Enregistrement serveur refusé (HTTP ' + r.status + ')'));
        }
        return j;
      });
    });
  }

  /** Chemin fiable : SW + Push API + API REST OneSignal (sans SDK page). */
  function nativeRegister() {
    if (!_externalId) {
      return Promise.reject(new Error('Connectez-vous d\'abord à Labosync.'));
    }
    if (!supportsWebPush()) {
      return Promise.reject(new Error('Notifications non supportées.'));
    }
    if (isPrivateBrowsingSync()) {
      return Promise.reject(new Error(privateModeMessage()));
    }
    if (nativePermission() !== 'granted') {
      return requestBrowserPermission().then(function (perm) {
        if (perm !== 'granted') {
          throw new Error(perm === 'denied' ? deniedMessage() : edgeQuietMessage());
        }
        return nativeRegister();
      });
    }

    return fetchConfig()
      .then(function (cfg) {
        if (!cfg.enabled || !cfg.appId) {
          throw new Error('Notifications non configurées côté serveur.');
        }
        var vapid = pickVapidKey(cfg);
        if (!vapid) {
          throw new Error('Clé push manquante — réessayez dans une minute.');
        }
        return ensurePushServiceWorker().then(function (reg) {
          return subscribeNativePush(reg, vapid);
        });
      })
      .then(function (sub) {
        return sendSubscriptionToServer(sub);
      })
      .then(function () {
        return checkServerRegistration();
      })
      .then(function (st) {
        if (st && st.registered) {
          return {
            ok: true,
            message: 'Appareil enregistré. Testez via ⚙️ → Tester une notification.',
          };
        }
        throw new Error(
          'Autorisation navigateur OK, enregistrement serveur incomplet — réessayez.'
        );
      });
  }

  function requestBrowserPermission() {
    return new Promise(function (resolve) {
      try {
        if (!global.Notification || !global.Notification.requestPermission) {
          resolve('denied');
          return;
        }
        var p = global.Notification.requestPermission();
        if (p && typeof p.then === 'function') {
          p.then(resolve).catch(function () {
            resolve('denied');
          });
        } else {
          resolve(global.Notification.permission || 'default');
        }
      } catch (e) {
        resolve('denied');
      }
    });
  }

  function syncIfPermissionGranted() {
    if (!_externalId || isPrivateBrowsingSync()) return Promise.resolve();
    if (nativePermission() !== 'granted') return Promise.resolve();
    return checkServerRegistration()
      .then(function (st) {
        if (st && st.registered) return null;
        return nativeRegister().catch(function (e) {
          console.warn('[push] sync', e);
        });
      });
  }

  function prepare(opts) {
    if (!opts || !opts.externalId) return;
    if (_externalId && _externalId !== opts.externalId) resetSdkState();
    _role = opts.role || null;
    _externalId = opts.externalId;
    if (typeof opts.authHeaders === 'function') _authHeadersFn = opts.authHeaders;
  }

  function init(opts) {
    prepare(opts);
    return Promise.resolve({ ok: true });
  }

  function finalizeRegistration() {
    return nativeRegister().catch(function (err) {
      return { ok: false, message: formatPushError(err) };
    });
  }

  /** Menu ⚙️ ou bannière : autoriser OU finaliser si le cadenas est déjà vert. */
  function activateOrFinalize() {
    if (nativePermission() === 'granted') {
      return finalizeRegistration();
    }
    return promptForNotifications();
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
    return nativeRegister().catch(function (err) {
      return { ok: false, message: formatPushError(err) };
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
      ' Si le cadenas est déjà vert : menu ⚙️ → Finaliser l\'enregistrement.</div>' +
      '<button type="button" data-lb-push-enable style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:.84rem;font-weight:700;cursor:pointer;margin-right:8px;">🔔 Activer / finaliser</button>' +
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
        activateOrFinalize()
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
          .catch(function (err) {
            var msg = formatPushError(err);
            if (statusEl) {
              statusEl.style.color = '#c2410c';
              statusEl.textContent = msg;
            }
            if (typeof global.showToast === 'function') {
              global.showToast(msg, '#c0392b', 8000);
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
    activateOrFinalize: activateOrFinalize,
    finalizeRegistration: finalizeRegistration,
    syncIfPermissionGranted: syncIfPermissionGranted,
    checkServerRegistration: checkServerRegistration,
    getStatus: getStatus,
    getExternalId: getExternalId,
  };
})(typeof window !== 'undefined' ? window : globalThis);
