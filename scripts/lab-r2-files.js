/* Labosync — upload / téléchargement fichiers (Cloudflare R2) */
(function (global) {
  'use strict';

  var API = '/.netlify/functions/r2-storage';
  var MAX_BYTES = 150 * 1024 * 1024;
  var CHAT_MAX_BYTES = 50 * 1024 * 1024;
  var ALLOWED_EXT = ['stl', 'obj', 'ply', 'zip', 'pdf', '3mf', '7z', 'rar'];
  var CHAT_ALLOWED_EXT = ALLOWED_EXT.concat(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);

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

  /** Pièce jointe messagerie (R2 privé, URL signée à la lecture). */
  async function uploadChatFile(file, portalId, headers) {
    if (!file) throw new Error('Fichier manquant');
    if (!portalId) throw new Error('Portail manquant');
    var ext = extOf(file.name);
    if (CHAT_ALLOWED_EXT.indexOf(ext) < 0) {
      throw new Error('Format .' + ext + ' non autorisé pour le chat.');
    }
    if (file.size > CHAT_MAX_BYTES) {
      throw new Error('Fichier trop volumineux (max ' + Math.round(CHAT_MAX_BYTES / (1024 * 1024)) + ' Mo)');
    }

    var prep = await r2Api(
      'prepare_chat_upload',
      {
        portalId: portalId,
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

    var fileType =
      ext === 'stl'
        ? 'stl'
        : ext === 'obj'
          ? 'obj'
          : ext === 'ply'
            ? 'ply'
            : ext === 'pdf'
              ? 'pdf'
              : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'].indexOf(ext) >= 0
                ? 'image'
                : 'file';

    return {
      storage: 'r2',
      storageKey: prep.storageKey,
      name: file.name,
      size: file.size,
      type: fileType,
    };
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

  function chatViewImg(src) {
    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
    overlay.innerHTML =
      '<img src="' +
      src +
      '" style="max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,.5);"/>';
    overlay.onclick = function () {
      document.body.removeChild(overlay);
    };
    document.body.appendChild(overlay);
  }

  /**
   * HTML bulle pièce jointe. Si storageKey sans url, bouton qui déclenche le téléchargement signé.
   * opts: { isOutgoing, esc(str), humanSize(bytes) }
   */
  function buildChatAttachmentHtml(a, opts) {
    opts = opts || {};
    var esc =
      opts.esc ||
      function (s) {
        return String(s || '');
      };
    var hs = opts.humanSize || humanSize;
    if (!a) return '';
    var url = a.url || '';
    var key = a.storageKey || '';
    var name = a.name || 'fichier';
    var type = a.type || 'file';
    var isOutgoing = !!opts.isOutgoing;
    var isImage = type === 'image' || (a.mime && String(a.mime).indexOf('image/') === 0);

    if (isImage && url) {
      return (
        '<img src="' +
        esc(url) +
        '" style="max-width:220px;max-height:180px;border-radius:8px;display:block;cursor:pointer;" onclick="LabR2.chatViewImg(this.src)"/>'
      );
    }

    if (key && !url) {
      var ic = type === 'stl' ? '🦷' : type === 'pdf' ? '📄' : '📎';
      var sz = a.size ? hs(a.size) : '';
      var bg = isOutgoing ? 'rgba(255,255,255,.18)' : 'var(--bg)';
      var border = isOutgoing ? 'rgba(255,255,255,.3)' : 'var(--border)';
      return (
        '<button type="button" data-chat-storage-key="' +
        esc(key) +
        '" data-chat-file-name="' +
        esc(name) +
        '" style="display:flex;align-items:center;gap:10px;background:' +
        bg +
        ';border:1px solid ' +
        border +
        ';border-radius:8px;padding:8px 10px;cursor:pointer;color:inherit;max-width:240px;width:100%;text-align:left;font:inherit;">' +
        '<span style="font-size:1.5rem;line-height:1;flex-shrink:0;">' +
        ic +
        '</span>' +
        '<span style="flex:1;min-width:0;"><span style="display:block;font-weight:600;font-size:.84rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
        esc(name) +
        '</span><span style="display:block;font-size:.7rem;opacity:.85;">' +
        esc((type || '').toUpperCase()) +
        (sz ? ' · ' + sz : '') +
        ' · Télécharger</span></span></button>'
      );
    }

    if (url) {
      if (isImage) {
        return (
          '<img src="' +
          esc(url) +
          '" style="max-width:220px;max-height:180px;border-radius:8px;display:block;cursor:pointer;" onclick="LabR2.chatViewImg(this.src)"/>'
        );
      }
      var ic2 = type === 'stl' ? '🦷' : type === 'pdf' ? '📄' : '📎';
      var sz2 = a.size ? hs(a.size) : '';
      return (
        '<a href="' +
        esc(url) +
        '" target="_blank" rel="noopener" download="' +
        esc(name) +
        '" style="display:flex;align-items:center;gap:10px;background:' +
        (isOutgoing ? 'rgba(255,255,255,.18)' : 'var(--bg)') +
        ';border:1px solid ' +
        (isOutgoing ? 'rgba(255,255,255,.3)' : 'var(--border)') +
        ';border-radius:8px;padding:8px 10px;text-decoration:none;color:inherit;max-width:240px;">' +
        '<span style="font-size:1.5rem;line-height:1;flex-shrink:0;">' +
        ic2 +
        '</span>' +
        '<span style="flex:1;min-width:0;"><span style="display:block;font-weight:600;font-size:.84rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
        esc(name) +
        '</span><span style="display:block;font-size:.7rem;opacity:.85;">' +
        esc((type || '').toUpperCase()) +
        (sz2 ? ' · ' + sz2 : '') +
        ' · ouvrir</span></span></a>'
      );
    }

    return '<span style="font-size:.78rem;opacity:.8;">Fichier indisponible</span>';
  }

  function bindChatAttachmentButtons(root, getHeaders) {
    if (!root || typeof getHeaders !== 'function') return;
    root.querySelectorAll('[data-chat-storage-key]').forEach(function (btn) {
      if (btn._chatR2Bound) return;
      btn._chatR2Bound = true;
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-chat-storage-key');
        var name = btn.getAttribute('data-chat-file-name') || 'fichier';
        downloadFile({ storageKey: key, name: name }, getHeaders()).catch(function (e) {
          alert(e.message || 'Téléchargement impossible');
        });
      });
    });
  }

  global.LabR2 = {
    MAX_BYTES: MAX_BYTES,
    CHAT_MAX_BYTES: CHAT_MAX_BYTES,
    ALLOWED_EXT: ALLOWED_EXT,
    CHAT_ALLOWED_EXT: CHAT_ALLOWED_EXT,
    humanSize: humanSize,
    extOf: extOf,
    uploadFile: uploadFile,
    uploadChatFile: uploadChatFile,
    getDownloadUrl: getDownloadUrl,
    downloadFile: downloadFile,
    chatViewImg: chatViewImg,
    buildChatAttachmentHtml: buildChatAttachmentHtml,
    bindChatAttachmentButtons: bindChatAttachmentButtons,
  };
})(typeof window !== 'undefined' ? window : this);
