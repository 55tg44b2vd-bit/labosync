/**
 * Déclenche une notification push (filet de sécurité si portal.js ne l'a pas fait).
 * POST { type: 'invoice'|'chat', portalId, facture?, sender?, content?, senderName? }
 * Auth : Bearer labo (Supabase).
 */
const { buildCors, verifySupabaseUser, labOwnsPortal, findLabUserIdForPortal } = require('./_labosync-auth');
const { notifyInvoice, notifyChatMessage, isConfigured } = require('./_onesignal');

const normPortalId = (portalId) => String(portalId || '').trim().toLowerCase();

exports.handler = async (event) => {
  const headers = buildCors(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST uniquement' }) };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise' }) };
  }

  if (!isConfigured()) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'OneSignal non configuré' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const portalId = normPortalId(body.portalId);
  if (!portalId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'portalId requis' }) };
  }

  const owns = await labOwnsPortal(user.id, portalId);
  if (!owns) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Portail non autorisé' }) };
  }

  const type = String(body.type || '').trim();

  if (type === 'invoice') {
    const fac = body.facture || body;
    const result = await notifyInvoice({
      portalId,
      facture: {
        id: fac.id,
        num: fac.num,
        total: fac.total,
        type: fac.type || 'facture',
        status: fac.status || 'envoye',
      },
      laboName: String(body.laboName || 'Votre laboratoire').slice(0, 80),
      cabName: String(body.cabName || '').slice(0, 80),
    });
    return {
      statusCode: result.ok ? 200 : 502,
      headers,
      body: JSON.stringify({
        ok: result.ok,
        recipients: result.recipients,
        reason: result.reason,
        message: result.ok
          ? 'Notification facture envoyée au cabinet'
          : 'Aucun appareil cabinet enregistré — le dentiste doit activer les notifications sur son portail',
      }),
    };
  }

  if (type === 'chat') {
    const sender = body.sender === 'cabinet' ? 'cabinet' : 'labo';
    let labUserId = sender === 'labo' ? user.id : await findLabUserIdForPortal(portalId);
    if (!labUserId && sender === 'cabinet') {
      labUserId = await findLabUserIdForPortal(body.portalId);
    }
    const result = await notifyChatMessage({
      sender,
      portalId,
      labUserId,
      senderName: String(body.senderName || '').slice(0, 80),
      content: String(body.content || 'Nouveau message').slice(0, 5000),
      laboName: String(body.laboName || 'Votre laboratoire').slice(0, 80),
    });
    return {
      statusCode: result.ok ? 200 : 502,
      headers,
      body: JSON.stringify({
        ok: result.ok,
        recipients: result.recipients,
        reason: result.reason,
        labUserId: labUserId || null,
        message: result.ok
          ? 'Notification message envoyée'
          : result.reason === 'no_recipient'
            ? 'Destinataire introuvable — republiez le portail du cabinet'
            : 'Aucun appareil enregistré pour ce destinataire',
      }),
    };
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'type invalide (invoice|chat)' }) };
};
