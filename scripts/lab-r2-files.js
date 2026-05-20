/* Labosync — upload / téléchargement fichiers (Cloudflare R2) */
(function (global) {
  'use strict';

  var API = '/.netlify/functions/r2-storage';
  var MAX_BYTES = 150 * 1024 * 1024;
  var ALLOWED_EXT = ['stl', 'obj', 'ply', 'zip', 'pdf', '3mf', '7z', 'rar'];

  function extOf(name) {
    var p = String(name || '').split('.');
    return (p.length > 1 ? p.pop() : '').toLowerCase();
  }

  function humanSize(n) {
    var b = Number(n) || 0;
    if (b < 1024) return b + ' o';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' Ko';
    return (b / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  async function r2Api(action, payload, headers) {
    var r = await fetch(API, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
      body: JSON.stringify(Object.assign({ action: action }, payload || {})),
    });
    var j = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) throw new Error(j.error || 'Erreur stockage ' + r.status);
    return j;
  }

  async function uploadFile(file, meta, headers) {
    if (!file) throw new Error('Fichier manquant');
    var ext = extOf(file.name);
    if (ALLOWED_EXT.indexOf(ext) < 0) {
      throw new Error('Format .' + ext + ' non autorisé. Utilisez : ' + ALLOWED_EXT.join(', '));
    }
    if (file.size > MAX_BYTES) {
      throw new Error('Fichier trop volumineux (max ' + Math.round(MAX_BYTES / (1024 * 1024)) + ' Mo)');
    }

    var prep = await r2Api(
      'prepare_upload',
      {
        portalId: meta.portalId,
        caseId: meta.caseId,
        stepId: meta.stepId,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || 'application/octet-stream',
      },
      headers,
    );

    var put = await fetch(prep.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!put.ok) throw new Error('Échec envoi du fichier (' + put.status + ')');

    return prep.file;
  }

  async function getDownloadUrl(storageKey, headers) {
    var j = await r2Api('download_url', { storageKey: storageKey }, headers);
    return j.downloadUrl;
  }

  async function downloadFile(fileMeta, headers) {
    var url = await getDownloadUrl(fileMeta.storageKey, headers);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileMeta.name || 'fichier';
    a.rel = 'noopener';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  global.LabR2 = {
    MAX_BYTES: MAX_BYTES,
    ALLOWED_EXT: ALLOWED_EXT,
    humanSize: humanSize,
    extOf: extOf,
    uploadFile: uploadFile,
    getDownloadUrl: getDownloadUrl,
    downloadFile: downloadFile,
  };
})(typeof window !== 'undefined' ? window : this);
