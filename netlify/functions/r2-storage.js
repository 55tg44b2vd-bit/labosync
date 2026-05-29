const { buildCors } = require('./_labosync-auth');
const {
  ALLOWED_EXT,
  CHAT_ALLOWED_EXT,
  r2Config,
  maxFileBytes,
  maxChatFileBytes,
  buildObjectKey,
  buildChatObjectKey,
  parseObjectKey,
  safeFileName,
  authorizeAccess,
  presignUpload,
  presignDownload,
} = require('./_r2-storage');

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Cache-Control'] = 'no-store';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const cfg = r2Config();
  if (!cfg) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'Stockage fichiers non configuré (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)',
      }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const action = String(body.action || '');

  if (action === 'prepare_upload') {
    const portalId = String(body.portalId || '').trim().toLowerCase();
    const caseId = String(body.caseId || '').trim();
    const stepId = String(body.stepId || '').trim();
    const fileName = safeFileName(body.fileName);
    const fileSize = parseInt(body.fileSize, 10) || 0;
    const contentType = String(body.contentType || 'application/octet-stream').slice(0, 120);

    if (!portalId || !caseId || !stepId || !fileName) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }

    const ext = (fileName.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Type de fichier non autorisé (' + ext + '). Autorisés : ' + Array.from(ALLOWED_EXT).join(', '),
        }),
      };
    }

    if (fileSize <= 0 || fileSize > maxFileBytes()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Taille invalide (max ' + Math.round(maxFileBytes() / (1024 * 1024)) + ' Mo)',
        }),
      };
    }

    const auth = await authorizeAccess(event, portalId, null);
    if (!auth.ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: auth.error }) };
    }

    const storageKey = buildObjectKey(auth.labUserId, portalId, caseId, stepId, fileName);
    const uploadUrl = await presignUpload(cfg, storageKey, contentType);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        uploadUrl,
        storageKey,
        file: {
          id: 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          name: fileName,
          size: fileSize,
          mime: contentType,
          ext,
          storageKey,
          uploadedAt: new Date().toISOString(),
        },
      }),
    };
  }

  if (action === 'prepare_chat_upload') {
    const portalId = String(body.portalId || '').trim().toLowerCase();
    const fileName = safeFileName(body.fileName);
    const fileSize = parseInt(body.fileSize, 10) || 0;
    const contentType = String(body.contentType || 'application/octet-stream').slice(0, 120);

    if (!portalId || !fileName) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }

    const ext = (fileName.split('.').pop() || '').toLowerCase();
    if (!CHAT_ALLOWED_EXT.has(ext)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            'Type de fichier non autorisé (' +
            ext +
            '). Autorisés : ' +
            Array.from(CHAT_ALLOWED_EXT).join(', '),
        }),
      };
    }

    if (fileSize <= 0 || fileSize > maxChatFileBytes()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Taille invalide (max ' + Math.round(maxChatFileBytes() / (1024 * 1024)) + ' Mo)',
        }),
      };
    }

    const auth = await authorizeAccess(event, portalId, null);
    if (!auth.ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: auth.error }) };
    }

    const storageKey = buildChatObjectKey(auth.labUserId, portalId, fileName);
    const uploadUrl = await presignUpload(cfg, storageKey, contentType);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        uploadUrl,
        storageKey,
        file: {
          name: fileName,
          size: fileSize,
          mime: contentType,
          ext,
          storageKey,
          storage: 'r2',
          uploadedAt: new Date().toISOString(),
        },
      }),
    };
  }

  if (action === 'download_url') {
    const storageKey = String(body.storageKey || '').trim();
    const parsed = parseObjectKey(storageKey);
    if (!parsed) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'storageKey invalide' }) };
    }

    const auth = await authorizeAccess(event, parsed.portalId, parsed.labUserId);
    if (!auth.ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: auth.error }) };
    }

    const downloadUrl = await presignDownload(cfg, storageKey);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, downloadUrl, fileName: parsed.fileName }),
    };
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Action inconnue' }) };
};
