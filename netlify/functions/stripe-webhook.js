const crypto = require('crypto');

exports.handler = async (event) => {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY;
  const SB_URL    = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SB_KEY    = process.env.SUPABASE_SERVICE_KEY;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // ── Vérifier la signature Stripe ─────────────────────────────────────────
  const sig = event.headers['stripe-signature'];
  if (!STRIPE_WEBHOOK_SECRET || !sig) {
    return { statusCode: 400, body: 'Signature manquante' };
  }

  // Netlify peut base64-encoder le body pour les requêtes binaires
  const payload = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  const parts   = sig.split(',');
  const tPart   = parts.find(p => p.startsWith('t='));
  const vPart   = parts.find(p => p.startsWith('v1='));
  if (!tPart || !vPart) return { statusCode: 400, body: 'Signature invalide' };

  const timestamp   = tPart.slice(2);
  const receivedSig = vPart.slice(3);
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET)
    .update(signedPayload, 'utf8').digest('hex');

  // timingSafeEqual exige des buffers de même longueur
  let sigValid = false;
  try {
    const expBuf = Buffer.from(expected, 'hex');
    const recBuf = Buffer.from(receivedSig, 'hex');
    sigValid = expBuf.length === recBuf.length &&
               crypto.timingSafeEqual(expBuf, recBuf);
  } catch (_) { sigValid = false; }

  if (!sigValid) return { statusCode: 400, body: 'Signature incorrecte' };
  const receivedTs = Number(timestamp);
  const nowSec = Math.floor(Date.now() / 1000);
  const toleranceSec = 300;
  if (!Number.isFinite(receivedTs) || Math.abs(nowSec - receivedTs) > toleranceSec) {
    return { statusCode: 400, body: 'Signature expirée' };
  }

  // ── Traiter l'événement ───────────────────────────────────────────────────
  let stripeEvent;
  try { stripeEvent = JSON.parse(payload); } catch {
    return { statusCode: 400, body: 'JSON invalide' };
  }

  async function upsert(id, data) {
    if (!SB_KEY) return;
    await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ id, data, updated_at: new Date().toISOString() }),
    });
  }

  async function readSubRow(userId) {
    if (!SB_KEY) return null;
    const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.sub_${userId}&select=data`, {
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` },
    });
    const rows = await r.json();
    return rows[0] && rows[0].data ? rows[0].data : null;
  }

  // ── FACTURES (paiements one-shot via Payment Links / Checkout Sessions) ──────
  if (stripeEvent.type === 'checkout.session.completed') {
    const session   = stripeEvent.data.object;
    const sessionId = session.id;
    const meta      = session.metadata || {};
    const factureId = meta.factureId || '';

    if (session.mode === 'payment') {
      const rowBody = {
        factureId,
        factureNum: meta.factureNum || '',
        portalId:   meta.portalId   || '',
        status:     'paid',
        paidAt:     new Date().toISOString(),
        amountTotal: session.amount_total,
        checkoutSessionId: sessionId,
      };
      if (factureId) await upsert(`stripe_sess_${factureId}`, rowBody);
      await upsert(`stripe_sess_${sessionId}`, rowBody);
    }

    // Checkout en mode subscription — traité via customer.subscription.*
  }

  // ── ABONNEMENTS (subscriptions) ─────────────────────────────────────────────
  if (stripeEvent.type === 'customer.subscription.created'
    || stripeEvent.type === 'customer.subscription.updated'
    || stripeEvent.type === 'customer.subscription.deleted') {

    const sub = stripeEvent.data.object;
    const meta = sub.metadata || {};
    const userId = meta.userId || '';
    const email = meta.email || '';

    if (!userId) return { statusCode: 200, body: JSON.stringify({ received: true, note: 'no userId in metadata' }) };

    const existing = (await readSubRow(userId)) || {};
    const nextStatus = stripeEvent.type === 'customer.subscription.deleted' ? 'canceled' : sub.status;

    await upsert(`sub_${userId}`, Object.assign({}, existing, {
      userId,
      email: email || existing.email || '',
      stripeCustomerId: sub.customer,
      stripeSubscriptionId: sub.id,
      status: nextStatus,
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : (existing.trialEndsAt || null),
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      priceId: sub.items && sub.items.data[0] ? sub.items.data[0].price.id : '',
      plan: sub.items && sub.items.data[0] && sub.items.data[0].price.recurring
        ? (sub.items.data[0].price.recurring.interval === 'year' ? 'annual' : 'monthly')
        : (existing.plan || ''),
      updatedAt: new Date().toISOString(),
    }));
  }

  // Paiement d'une facture d'abonnement échoué
  if (stripeEvent.type === 'invoice.payment_failed') {
    const inv = stripeEvent.data.object;
    const subId = inv.subscription;
    if (subId && SB_KEY) {
      // Retrouver le userId par customer
      try {
        const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=like.sub_*&select=id,data`, {
          headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` },
        });
        const rows = await r.json();
        const match = rows.find(row => row.data && row.data.stripeCustomerId === inv.customer);
        if (match) {
          await upsert(match.id, Object.assign({}, match.data, {
            status: 'past_due',
            lastPaymentFailedAt: new Date().toISOString(),
          }));
        }
      } catch (e) {}
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
