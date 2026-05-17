exports.handler = async (event) => {
  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = allowedOrigins.length
    ? (allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0])
    : '*';

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Portal-Token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const isValidPortalId = (portalId) => typeof portalId === 'string' && /^[a-zA-Z0-9_-]{4,120}$/.test(portalId);
  const clampStr = (value, maxLen) => String(value || '').slice(0, maxLen);
  const normPortalId = (portalId) => String(portalId || '').trim().toLowerCase();
  const readRow = async (rowId) => {
    const resp = await fetch(
      `${SB_URL}/rest/v1/labo_data?id=eq.${rowId}&select=data,updated_at`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      }
    );
    if (!resp.ok) {
      const txt = await resp.text();
      return { ok: false, error: txt, rows: [] };
    }
    const rows = await resp.json();
    return { ok: true, rows };
  };

  // ── GET : lire les données d'un portail ou d'un chat ────────────────────
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const portalId = params.portalId;
    if (!isValidPortalId(portalId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'portalId invalide' }) };
    }

    const type = params.type; // 'chat' ou absent (portal)
    if (!SERVICE_KEY) {
      // En local sans clé serveur, on évite les 500 en boucle sur le polling chat.
      if (type === 'chat') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([{ data: { messages: [] }, updated_at: null, _degraded: true }]),
        };
      }
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Configuration locale incomplète: SUPABASE_SERVICE_KEY requis' }) };
    }
    const normalizedId = normPortalId(portalId);
    const rowId = type === 'chat' ? 'chat_' + normalizedId : 'portal_' + normalizedId;
    const legacyRowId = type === 'chat' ? 'chat_' + portalId : 'portal_' + portalId;
    let rows = [];
    const firstRead = await readRow(rowId);
    if (!firstRead.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Lecture échouée : ' + firstRead.error }) };
    }
    rows = firstRead.rows;
    if ((!rows || !rows.length) && legacyRowId !== rowId) {
      const legacyRead = await readRow(legacyRowId);
      if (!legacyRead.ok) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Lecture échouée : ' + legacyRead.error }) };
      }
      rows = legacyRead.rows;
    }
    return { statusCode: 200, headers, body: JSON.stringify(rows) };
  }

  // ── POST : écrire les données d'un portail ou ajouter un message chat ──
  if (event.httpMethod === 'POST') {
    if (!SERVICE_KEY) {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Configuration locale incomplète: SUPABASE_SERVICE_KEY requis' }) };
    }
    let body;
    try { body = JSON.parse(event.body); } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
    }

    const { action, portalId, payload } = body;

    // ── action = 'chat' : ajouter un message ──────────────────────────────
    if (action === 'chat') {
      const { sender, senderName, content, image, attachment } = body;
      if (!isValidPortalId(portalId) || !sender || (!content && !image && !attachment)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes (portalId, sender, et content ou pièce jointe)' }) };
      }
      if (sender !== 'labo' && sender !== 'cabinet') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'sender invalide' }) };
      }
      if (content && String(content).length > 5000) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message trop long' }) };
      }
      if (image && String(image).length > 3_000_000) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Image trop volumineuse' }) };
      }
      if (attachment && (!attachment.url || String(attachment.url).length > 2048)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Pièce jointe invalide' }) };
      }

      const normalizedId = normPortalId(portalId);
      const rowId = 'chat_' + normalizedId;
      const legacyRowId = 'chat_' + portalId;

      // Lire les messages existants
      let rows = [];
      const firstRead = await readRow(rowId);
      if (!firstRead.ok) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Lecture chat échouée : ' + firstRead.error }) };
      }
      rows = firstRead.rows;
      if ((!rows || !rows.length) && legacyRowId !== rowId) {
        const legacyRead = await readRow(legacyRowId);
        if (!legacyRead.ok) {
          return { statusCode: 500, headers, body: JSON.stringify({ error: 'Lecture chat échouée : ' + legacyRead.error }) };
        }
        rows = legacyRead.rows;
      }
      const existing = (rows[0] && rows[0].data && rows[0].data.messages) ? rows[0].data.messages : [];

      const newMsg = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        sender,
        senderName: clampStr(senderName || sender, 80),
        content: clampStr(content || '', 5000),
        createdAt: new Date().toISOString(),
      };
      if (image) newMsg.image = image;
      if (attachment && attachment.url) {
        // On ne stocke que les métadonnées de la pièce jointe (URL Supabase Storage)
        newMsg.attachment = {
          url: clampStr(attachment.url, 2048),
          name: clampStr(attachment.name || 'fichier', 200),
          size: parseInt(attachment.size, 10) || 0,
          type: clampStr(attachment.type || 'file', 40),
        };
      }

      const messages = [...existing, newMsg];
      // Garder les 200 derniers messages max
      const trimmed = messages.slice(-200);

      const writeResp = await fetch(`${SB_URL}/rest/v1/labo_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: rowId,
          data: { messages: trimmed },
          updated_at: new Date().toISOString(),
        }),
      });

      if (!writeResp.ok) {
        const txt = await writeResp.text();
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Écriture échouée : ' + txt }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: newMsg }) };
    }

    // ── action absent : écriture portail standard ─────────────────────────
    if (!isValidPortalId(portalId) || !payload) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes' }) };
    }

    const normalizedId = normPortalId(portalId);
    const resp = await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: 'portal_' + normalizedId,
        data: payload,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Écriture échouée : ' + txt }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
};
