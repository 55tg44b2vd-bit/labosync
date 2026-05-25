const {
  SB_URL,
  buildCors,
  signPortalToken,
  verifySupabaseUser,
  verifyPortalToken,
  getPortalTokenFromEvent,
  labOwnsPortal,
  findLabUserIdForPortal,
  laboDataUpsert,
} = require('./_labosync-auth');
exports.handler = async (event) => {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = buildCors(event);
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Portal-Token';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const isValidPortalId = (portalId) => typeof portalId === 'string' && /^[a-zA-Z0-9_-]{4,120}$/.test(portalId);
  const clampStr = (value, maxLen) => String(value || '').slice(0, maxLen);
  const normPortalId = (portalId) => String(portalId || '').trim().toLowerCase();
  const cabLoginRowId = (code) => 'cablogin_' + String(code || '').trim().toUpperCase();

  const stripPortalSecrets = (data) => {
    if (!data || typeof data !== 'object') return data;
    const out = Object.assign({}, data);
    delete out.cabPwd;
    return out;
  };

  const upsertCabLoginIndex = async (portalId, cabCode, cabId) => {
    const codeUp = String(cabCode || '').trim().toUpperCase();
    if (!codeUp || !isValidPortalId(portalId)) return;
    await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: cabLoginRowId(codeUp),
        data: { portalId: normPortalId(portalId), cabId: clampStr(cabId || '', 80) || null, cabCode: codeUp },
        updated_at: new Date().toISOString(),
      }),
    });
  };

  const readRow = async (rowId) => {
    const resp = await fetch(
      `${SB_URL}/rest/v1/labo_data?id=eq.${encodeURIComponent(rowId)}&select=data,updated_at`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
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

  async function readStripePaymentsForFactures(factureIds) {
    const map = {};
    if (!SERVICE_KEY || !factureIds.length) return map;
    const rowIds = factureIds.map((id) => `stripe_sess_${id}`);
    const inList = rowIds.map((id) => encodeURIComponent(id)).join(',');
    try {
      const resp = await fetch(`${SB_URL}/rest/v1/labo_data?id=in.(${inList})&select=id,data`, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      });
      if (!resp.ok) return map;
      const rows = await resp.json();
      for (const row of rows || []) {
        const data = row.data || {};
        const fid = data.factureId || String(row.id || '').replace(/^stripe_sess_/, '');
        if (!fid) continue;
        map[fid] = {
          status: data.status || 'pending',
          paidAt: data.paidAt || null,
          failedAt: data.failedAt || null,
          expiredAt: data.expiredAt || null,
        };
      }
    } catch (_) {
      /* ignore */
    }
    return map;
  }

  async function enrichPortalWithStripePayments(rows) {
    if (!rows || !rows.length || !rows[0] || !rows[0].data) return rows;
    const factures = Array.isArray(rows[0].data.factures) ? rows[0].data.factures : [];
    const facIds = factures
      .filter((f) => f && f.id && (f.type || 'facture') !== 'avoir')
      .map((f) => String(f.id));
    const payMap = await readStripePaymentsForFactures(facIds);
    const enriched = factures.map((f) => {
      const sp = payMap[f.id];
      if (!sp) return f;
      return Object.assign({}, f, { stripePayment: sp });
    });
    rows[0].data = Object.assign({}, rows[0].data, {
      factures: enriched,
      _paymentsAt: new Date().toISOString(),
    });
    return rows;
  }

  async function authorizePortalAccess(portalId) {
    if (!isValidPortalId(portalId)) return null;
    const normalized = normPortalId(portalId);

    const portalToken = getPortalTokenFromEvent(event);
    if (portalToken) {
      const payload = verifyPortalToken(portalToken);
      if (payload && normPortalId(payload.portalId) === normalized) {
        return { role: 'cabinet', portalId: normalized };
      }
    }

    const user = await verifySupabaseUser(event);
    if (user && user.id) {
      const owns = await labOwnsPortal(user.id, normalized);
      if (owns) return { role: 'lab', portalId: normalized, userId: user.id };
    }

    return null;
  }

  // ── GET : lire portail ou chat (authentifié) ─────────────────────────────
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const portalId = params.portalId;
    if (!isValidPortalId(portalId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'portalId invalide' }) };
    }
    if (!SERVICE_KEY) {
      const type = params.type;
      if (type === 'chat') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([{ data: { messages: [] }, updated_at: null, _degraded: true }]),
        };
      }
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Configuration locale incomplète: SUPABASE_SERVICE_KEY requis' }),
      };
    }

    const auth = await authorizePortalAccess(portalId);
    if (!auth) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Accès portail refusé' }) };
    }

    const type = params.type;
    const normalizedId = auth.portalId;
    const rowId =
      type === 'chat' ? `chat_${normalizedId}` : type === 'orders' ? `orders_${normalizedId}` : `portal_${normalizedId}`;
    const legacyRowId =
      type === 'chat' ? `chat_${portalId}` : type === 'orders' ? `orders_${portalId}` : `portal_${portalId}`;
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
    let portalRows = rows || [];
    if (type !== 'chat' && type !== 'orders') {
      portalRows = await enrichPortalWithStripePayments(portalRows);
    }
    const sanitizedRows = portalRows.map((row) => {
      if (!row || !row.data) return row;
      const rowId = String(row.id || '');
      if (!/^portal_/i.test(rowId)) return row;
      return Object.assign({}, row, { data: stripPortalSecrets(row.data) });
    });
    return { statusCode: 200, headers, body: JSON.stringify(sanitizedRows) };
  }

  // ── POST : écrire portail ou chat (authentifié) ───────────────────────────
  if (event.httpMethod === 'POST') {
    if (!SERVICE_KEY) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Configuration locale incomplète: SUPABASE_SERVICE_KEY requis' }),
      };
    }
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
    }

    const { action, portalId, payload } = body;

    if (action === 'cabinet_link_token') {
      const auth = await authorizePortalAccess(portalId);
      if (!auth || auth.role !== 'lab') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Seul le laboratoire peut créer un lien cabinet' }) };
      }
      const ttlMs = 2 * 3600 * 1000;
      const expiresAt = new Date(Date.now() + ttlMs).toISOString();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, portalId: auth.portalId, portalToken: signPortalToken(auth.portalId, ttlMs), expiresAt }),
      };
    }

    if (action === 'chat') {
      const { sender, senderName, content, image, attachment } = body;
      if (!isValidPortalId(portalId) || !sender || (!content && !image && !attachment)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Données manquantes (portalId, sender, et content ou pièce jointe)' }),
        };
      }
      if (sender !== 'labo' && sender !== 'cabinet') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'sender invalide' }) };
      }

      const auth = await authorizePortalAccess(portalId);
      if (!auth) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Accès portail refusé' }) };
      }
      if (auth.role === 'cabinet' && sender !== 'cabinet') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Sender non autorisé' }) };
      }
      if (auth.role === 'lab' && sender !== 'labo') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Sender non autorisé' }) };
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

      const normalizedId = auth.portalId;
      const rowId = `chat_${normalizedId}`;
      const legacyRowId = `chat_${portalId}`;

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
      const existing = rows[0] && rows[0].data && rows[0].data.messages ? rows[0].data.messages : [];

      const newMsg = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        sender,
        senderName: clampStr(senderName || sender, 80),
        content: clampStr(content || '', 5000),
        createdAt: new Date().toISOString(),
      };
      if (image) newMsg.image = image;
      if (attachment && attachment.url) {
        newMsg.attachment = {
          url: clampStr(attachment.url, 2048),
          name: clampStr(attachment.name || 'fichier', 200),
          size: parseInt(attachment.size, 10) || 0,
          type: clampStr(attachment.type || 'file', 40),
        };
      }

      const trimmed = [...existing, newMsg].slice(-200);

      let chatLabUserId = auth.userId || null;
      if (!chatLabUserId && rows[0]?.data?.labUserId) {
        chatLabUserId = String(rows[0].data.labUserId);
      }
      if (!chatLabUserId) {
        const portalRead = await readRow(`portal_${normalizedId}`);
        if (portalRead.ok && portalRead.rows[0]?.data?.labUserId) {
          chatLabUserId = String(portalRead.rows[0].data.labUserId);
        } else if (legacyRowId !== rowId) {
          const legacyPortal = await readRow(legacyRowId.replace(/^chat_/, 'portal_'));
          if (legacyPortal.ok && legacyPortal.rows[0]?.data?.labUserId) {
            chatLabUserId = String(legacyPortal.rows[0].data.labUserId);
          }
        }
      }
      if (!chatLabUserId) {
        chatLabUserId = await findLabUserIdForPortal(normalizedId);
      }
      if (!chatLabUserId && portalId !== normalizedId) {
        chatLabUserId = await findLabUserIdForPortal(portalId);
      }
      if (chatLabUserId) {
        try {
          await laboDataUpsert(`portal_owner_${normalizedId}`, {
            labUserId: chatLabUserId,
            portalId: normalizedId,
          });
        } catch (e) {
          console.warn('[portal] portal_owner from chat', e);
        }
      }

      const writeResp = await fetch(`${SB_URL}/rest/v1/labo_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: rowId,
          data: { messages: trimmed, labUserId: chatLabUserId },
          updated_at: new Date().toISOString(),
        }),
      });

      if (!writeResp.ok) {
        const txt = await writeResp.text();
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Écriture échouée : ' + txt }) };
      }

      let laboName = clampStr(senderName || '', 80);
      if (sender === 'labo') {
        const portalRead = await readRow(`portal_${normalizedId}`);
        if (portalRead.ok && portalRead.rows[0]?.data?.laboName) {
          laboName = clampStr(portalRead.rows[0].data.laboName, 80);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, message: newMsg }),
      };
    }

    if (action === 'orders') {
      const { list, cabId } = body;
      if (!isValidPortalId(portalId) || !Array.isArray(list)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données commandes invalides' }) };
      }
      if (list.length > 500) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Trop de commandes' }) };
      }

      const auth = await authorizePortalAccess(portalId);
      if (!auth) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Accès portail refusé' }) };
      }
      if (auth.role !== 'cabinet' && auth.role !== 'lab') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Accès commandes non autorisé' }) };
      }

      const normalizedId = auth.portalId;
      const rowId = `orders_${normalizedId}`;
      let labUserId = null;
      const portalRow = await readRow(`portal_${normalizedId}`);
      if (portalRow.ok && portalRow.rows[0]?.data?.labUserId) {
        labUserId = portalRow.rows[0].data.labUserId;
      }
      if (!labUserId && auth.role === 'lab') {
        labUserId = auth.userId;
      }

      const writeResp = await fetch(`${SB_URL}/rest/v1/labo_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: rowId,
          data: {
            list: list.slice(0, 500),
            portalId: normalizedId,
            cabId: clampStr(cabId || '', 80) || null,
            labUserId,
          },
          updated_at: new Date().toISOString(),
        }),
      });

      if (!writeResp.ok) {
        const txt = await writeResp.text();
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Écriture commandes échouée : ' + txt }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (!isValidPortalId(portalId) || !payload) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes' }) };
    }

    const auth = await authorizePortalAccess(portalId);
    if (!auth || auth.role !== 'lab') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Seul le laboratoire peut publier le portail' }) };
    }

    const normalizedId = auth.portalId;
    const safePayload = Object.assign({}, payload, { labUserId: auth.userId });

    const prevPortalRead = await readRow(`portal_${normalizedId}`);
    const prevFactures =
      prevPortalRead.ok && prevPortalRead.rows[0]?.data?.factures
        ? prevPortalRead.rows[0].data.factures
        : [];

    const resp = await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: `portal_${normalizedId}`,
        data: safePayload,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Écriture échouée : ' + txt }) };
    }

    try {
      await upsertCabLoginIndex(normalizedId, safePayload.cabCode, safePayload.cabId);
    } catch (_) {
      /* index optionnel — la connexion par code reste possible via cabCode JSON */
    }

    try {
      await laboDataUpsert(`portal_owner_${normalizedId}`, {
        labUserId: auth.userId,
        portalId: normalizedId,
        cabId: safePayload.cabId || null,
      });
    } catch (e) {
      console.warn('[portal] portal_owner index', e);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
};
