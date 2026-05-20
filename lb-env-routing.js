/**
 * Routage automatique Labosync mobile ↔ desktop.
 * Priorité : lb_env (choix explicite) > détection appareil.
 * Ne pas router : cabinet.html, admin-console.html, ?noenv=1, /admin.
 */
(function (global) {
  function detect() {
    try {
      var forced = localStorage.getItem('lb_env');
      if (forced === 'mobile' || forced === 'desktop') return forced;
    } catch (e) {}
    var ua = navigator.userAgent || '';
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
    if (/iPad/i.test(ua)) {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) return 'mobile';
      } catch (e) {}
      return 'desktop';
    }
    try {
      var narrow = window.matchMedia('(max-width: 900px)').matches;
      var coarse = window.matchMedia('(pointer: coarse)').matches;
      if (narrow && coarse) return 'mobile';
    } catch (e) {}
    return 'desktop';
  }

  function isAdminEntry() {
    var path = (location.pathname || '').replace(/\/+$/, '');
    return path === '/admin' || /admin-console\.html$/i.test(path);
  }

  function shouldSkipRouting() {
    var path = location.pathname || '';
    if (/cabinet\.html|suivi\.html/i.test(path)) return true;
    if (/[?&]noenv=1(?:&|$)/.test(location.search || '')) return true;
    return false;
  }

  function routeEarly() {
    if (shouldSkipRouting()) return false;
    var qs = location.search || '';
    var hash = location.hash || '';
    var path = (location.pathname || '').replace(/\/+$/, '') || '/';
    var isApp =
      /\/app\.html$/i.test(path) ||
      path === '/app' ||
      path === '/login' ||
      path === '/signup' ||
      path === '/admin';
    var isMobile = /\/labo-mobile\.html$/i.test(path) || path === '/mobile';

    if (isAdminEntry()) return false;

    var env = detect();
    if (env === 'mobile' && isApp && !isMobile) {
      location.replace('/labo-mobile.html' + qs + hash);
      return true;
    }
    if (env === 'desktop' && isMobile && !isApp) {
      location.replace('/app.html' + qs + hash);
      return true;
    }
    return false;
  }

  global.lbEnvDetect = detect;
  global.lbEnvRouteEarly = routeEarly;
  routeEarly();
})(typeof window !== 'undefined' ? window : this);
