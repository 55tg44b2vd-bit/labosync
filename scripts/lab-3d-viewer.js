/* Labosync — Viewer 3D intégré (STL / PLY / OBJ) — Three.js chargé à la demande.
 * Usage : LabViewer.open([{name, storageKey}|{name, url}], headersObj)
 * Three.js et les loaders sont hébergés localement (vendor/) pour respecter la CSP.
 */
(function (global) {
  'use strict';

  var VENDOR = [
    '/vendor/three.min.js',
    '/vendor/three-OrbitControls.js',
    '/vendor/three-STLLoader.js',
    '/vendor/three-PLYLoader.js',
    '/vendor/three-OBJLoader.js',
  ];
  var _ready = false;
  var _readyPromise = null;
  var PALETTE = ['#c7d2e0', '#f0a98c', '#9ad0b0', '#f3cf86', '#b6a8e0', '#86c5e0', '#e59ab8', '#bcd99a'];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Échec chargement ' + src)); };
      document.head.appendChild(s);
    });
  }
  // Charge Three puis les loaders (qui dépendent du global THREE), en séquence.
  function ensureThree() {
    if (_ready) return Promise.resolve();
    if (_readyPromise) return _readyPromise;
    _readyPromise = VENDOR.reduce(function (p, src) {
      return p.then(function () { return loadScript(src); });
    }, Promise.resolve()).then(function () { _ready = true; });
    return _readyPromise;
  }

  function extOf(name) {
    var p = String(name || '').split('.');
    return (p.length > 1 ? p.pop() : '').toLowerCase();
  }
  function is3D(name) {
    return ['stl', 'ply', 'obj'].indexOf(extOf(name)) >= 0;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Construit une géométrie/objet THREE depuis un ArrayBuffer selon l'extension.
  function parseModel(ext, buffer) {
    var THREE = global.THREE;
    if (ext === 'stl') {
      var g = new THREE.STLLoader().parse(buffer);
      g.computeBoundingBox();
      if (!g.attributes.normal) g.computeVertexNormals();
      return { geometry: g };
    }
    if (ext === 'ply') {
      var gp = new THREE.PLYLoader().parse(buffer);
      gp.computeBoundingBox();
      if (!gp.attributes.normal) gp.computeVertexNormals();
      return { geometry: gp };
    }
    if (ext === 'obj') {
      var text = new TextDecoder().decode(new Uint8Array(buffer));
      var obj = new THREE.OBJLoader().parse(text);
      return { object: obj };
    }
    throw new Error('Format .' + ext + ' non visualisable');
  }

  function open(files, headers) {
    files = (files || []).filter(function (f) { return f && is3D(f.name); });
    if (!files.length) { alert('Aucun fichier 3D (STL, PLY ou OBJ) à visualiser.'); return; }

    // ── Overlay + structure ────────────────────────────────────────────────
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#0b1220;display:flex;flex-direction:column;';
    ov.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#111a2e;color:#e2e8f0;border-bottom:1px solid #1e2a44;flex-shrink:0;">' +
        '<span style="font-weight:700;font-size:.95rem;">🧊 Visualiseur 3D</span>' +
        '<span id="lv-status" style="font-size:.78rem;color:#94a3b8;flex:1;">Chargement…</span>' +
        '<button id="lv-reset" title="Recentrer la vue" style="background:#1e2a44;color:#cbd5e1;border:none;border-radius:7px;padding:7px 12px;font-size:.78rem;cursor:pointer;">↺ Recentrer</button>' +
        '<button id="lv-close" style="background:#dc2626;color:#fff;border:none;border-radius:7px;padding:7px 14px;font-size:.82rem;font-weight:600;cursor:pointer;">✕ Fermer</button>' +
      '</div>' +
      '<div style="flex:1;display:flex;min-height:0;">' +
        '<div id="lv-canvas" style="flex:1;min-width:0;position:relative;cursor:grab;"></div>' +
        '<div id="lv-panel" style="width:270px;flex-shrink:0;background:#0f1729;color:#e2e8f0;border-left:1px solid #1e2a44;overflow-y:auto;padding:14px;"></div>' +
      '</div>';
    document.body.appendChild(ov);
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var statusEl = ov.querySelector('#lv-status');
    var canvasWrap = ov.querySelector('#lv-canvas');
    var panel = ov.querySelector('#lv-panel');

    var renderer, scene, camera, controls, raf, lights = [], baseLightIntensity = [];
    var entries = []; // { name, object, materials:[], color }
    var disposed = false;

    function cleanup() {
      if (disposed) return;
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      try {
        entries.forEach(function (e) {
          e.object.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
            if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.dispose(); }); }
          });
        });
        if (renderer) { renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); }
      } catch (e) {}
      document.body.style.overflow = prevOverflow;
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    ov.querySelector('#lv-close').addEventListener('click', cleanup);
    function onKey(e) { if (e.key === 'Escape') { cleanup(); document.removeEventListener('keydown', onKey); } }
    document.addEventListener('keydown', onKey);

    function onResize() {
      if (!renderer || !camera) return;
      var w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    var fitState = null;
    function fitCameraToScene() {
      var THREE = global.THREE;
      var box = new THREE.Box3();
      var has = false;
      entries.forEach(function (e) { if (e.object.visible) { box.expandByObject(e.object); has = true; } });
      if (!has) entries.forEach(function (e) { box.expandByObject(e.object); });
      if (box.isEmpty()) return;
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      var radius = Math.max(size.x, size.y, size.z) * 0.5 || 1;
      var fov = camera.fov * Math.PI / 180;
      var dist = (radius / Math.sin(fov / 2)) * 1.25;
      controls.target.copy(center);
      camera.position.set(center.x + dist * 0.4, center.y + dist * 0.35, center.z + dist);
      camera.near = Math.max(dist / 1000, 0.01);
      camera.far = dist * 1000;
      camera.updateProjectionMatrix();
      controls.update();
      fitState = { center: center.clone(), dist: dist };
    }
    ov.querySelector('#lv-reset').addEventListener('click', function () { fitCameraToScene(); });

    function initScene() {
      var THREE = global.THREE;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b1220);
      var w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
      camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 5000);
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      canvasWrap.appendChild(renderer.domElement);
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.9;
      // Éclairage : ambiante + hémisphérique + 2 directionnelles (clé / contre).
      var amb = new THREE.AmbientLight(0xffffff, 0.65); scene.add(amb); lights.push(amb);
      var hemi = new THREE.HemisphereLight(0xffffff, 0x223044, 0.55); scene.add(hemi); lights.push(hemi);
      var d1 = new THREE.DirectionalLight(0xffffff, 0.85); d1.position.set(1, 1, 1); scene.add(d1); lights.push(d1);
      var d2 = new THREE.DirectionalLight(0xffffff, 0.45); d2.position.set(-1, -0.5, -1); scene.add(d2); lights.push(d2);
      lights.forEach(function (l) { baseLightIntensity.push(l.intensity); });
      function animate() { raf = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
      animate();
    }

    function setBrightness(mult) {
      lights.forEach(function (l, i) { l.intensity = baseLightIntensity[i] * mult; });
    }

    function addEntry(name, parsed, idx) {
      var THREE = global.THREE;
      var color = new THREE.Color(PALETTE[idx % PALETTE.length]);
      var materials = [];
      var object;
      if (parsed.geometry) {
        var mat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.05, roughness: 0.75, transparent: true, opacity: 1, side: THREE.DoubleSide, flatShading: false });
        materials.push(mat);
        object = new THREE.Mesh(parsed.geometry, mat);
      } else {
        object = parsed.object;
        object.traverse(function (o) {
          if (o.isMesh) {
            o.material = new THREE.MeshStandardMaterial({ color: color, metalness: 0.05, roughness: 0.75, transparent: true, opacity: 1, side: THREE.DoubleSide });
            materials.push(o.material);
          }
        });
      }
      scene.add(object);
      entries.push({ name: name, object: object, materials: materials, color: '#' + color.getHexString() });
    }

    function renderPanel() {
      var html = '<div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:10px;">Fichiers (' + entries.length + ')</div>';
      entries.forEach(function (e, i) {
        html +=
          '<div style="border:1px solid #1e2a44;border-radius:9px;padding:10px;margin-bottom:10px;background:#0b1322;">' +
            '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px;">' +
              '<input type="checkbox" data-lv-vis="' + i + '" checked/>' +
              '<span style="width:12px;height:12px;border-radius:3px;background:' + e.color + ';flex-shrink:0;"></span>' +
              '<span style="font-size:.8rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(e.name) + '</span>' +
            '</label>' +
            '<div style="font-size:.68rem;color:#94a3b8;margin-bottom:3px;">Transparence</div>' +
            '<input type="range" data-lv-opa="' + i + '" min="15" max="100" value="100" style="width:100%;"/>' +
          '</div>';
      });
      html +=
        '<div style="border-top:1px solid #1e2a44;margin-top:6px;padding-top:12px;">' +
          '<div style="font-size:.68rem;color:#94a3b8;margin-bottom:3px;">💡 Luminosité</div>' +
          '<input type="range" id="lv-bright" min="30" max="220" value="100" style="width:100%;"/>' +
          '<p style="font-size:.68rem;color:#64748b;margin-top:12px;line-height:1.45;">Glissez pour pivoter · molette pour zoomer · clic droit pour déplacer.</p>' +
        '</div>';
      panel.innerHTML = html;
      panel.querySelectorAll('[data-lv-vis]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var i = parseInt(cb.getAttribute('data-lv-vis'), 10);
          entries[i].object.visible = cb.checked;
        });
      });
      panel.querySelectorAll('[data-lv-opa]').forEach(function (sl) {
        sl.addEventListener('input', function () {
          var i = parseInt(sl.getAttribute('data-lv-opa'), 10);
          var op = parseInt(sl.value, 10) / 100;
          entries[i].materials.forEach(function (m) { m.opacity = op; m.transparent = op < 1; m.needsUpdate = true; });
        });
      });
      var bright = panel.querySelector('#lv-bright');
      if (bright) bright.addEventListener('input', function () { setBrightness(parseInt(bright.value, 10) / 100); });
    }

    // ── Pipeline : charger Three, résoudre URLs, fetch + parse chaque fichier ──
    ensureThree().then(function () {
      initScene();
      var loaded = 0;
      return files.reduce(function (p, f, idx) {
        return p.then(function () {
          statusEl.textContent = 'Chargement ' + (idx + 1) + '/' + files.length + ' — ' + f.name;
          var urlP = f.url ? Promise.resolve(f.url)
            : (global.LabR2 && f.storageKey ? global.LabR2.getDownloadUrl(f.storageKey, headers || {}) : Promise.reject(new Error('Fichier inaccessible')));
          return urlP
            .then(function (url) { return fetch(url); })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
            .then(function (buf) { addEntry(f.name, parseModel(extOf(f.name), buf), idx); loaded++; })
            .catch(function (e) {
              console.warn('Viewer: échec ' + f.name, e);
              statusEl.textContent = '⚠️ ' + f.name + ' : ' + (e.message || 'échec');
            });
        });
      }, Promise.resolve()).then(function () {
        if (!loaded) {
          statusEl.textContent = '❌ Aucun fichier chargé (CORS ou format).';
          panel.innerHTML = '<p style="font-size:.8rem;color:#fca5a5;line-height:1.5;">Impossible de charger le(s) fichier(s) pour la visualisation. Vous pouvez toujours les télécharger depuis la fiche.</p>';
          return;
        }
        statusEl.textContent = loaded + ' fichier(s) chargé(s)';
        fitCameraToScene();
        renderPanel();
      });
    }).catch(function (e) {
      statusEl.textContent = 'Erreur : ' + (e.message || e);
    });
  }

  global.LabViewer = { open: open, is3D: is3D, extOf: extOf };
})(typeof window !== 'undefined' ? window : this);
