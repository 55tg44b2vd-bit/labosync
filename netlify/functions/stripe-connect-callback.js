const {
  verifyState,
  saveStripeConnect,
  resolveAppReturnBase,
  platformStripeSecret,
} = require('./_labosync-auth');

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const code = qs.code || '';
  const stateRaw = qs.state || '';
  const err = qs.error || '';
  const errDesc = qs.error_description || '';

  let appBase = 'https://labosync.app/app.html';
  const payload = verifyState(stateRaw);
  if (payload && payload.appUrl) {
    appBase = resolveAppReturnBase(payload.appUrl);
  }

  function redirect(status, extra) {
    const u = new URL(appBase);
    u.searchParams.set('stripe_connect', status);
    if (extra) u.searchParams.set('stripe_connect_msg', extra);
    return {
      statusCode: 302,
      headers: { Location: u.toString() },
      body: '',
    };
  }

  if (err) {
    return redirect('error', errDesc || err);
  }

  if (!code || !payload || !payload.userId) {
    return redirect('error', 'Lien de retour invalide ou expiré.');
  }

  const platformKey = platformStripeSecret();
  if (!platformKey) {
    return redirect('error', 'Configuration serveur Stripe incomplète.');
  }

  const clientId = (process.env.STRIPE_CONNECT_CLIENT_ID || '').trim();
  const redirectUri = (process.env.STRIPE_CONNECT_REDIRECT_URI || '').trim() ||
    resolveConnectRedirectUriFromEvent(event);

  let tokenResp;
  try {
    tokenResp = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_secret: platformKey,
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
      }).toString(),
    });
  } catch (e) {
    return redirect('error', 'Impossible de contacter Stripe.');
  }

  const tokenData = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok) {
    const msg = tokenData.error_description || tokenData.error || 'Échange OAuth échoué';
    return redirect('error', msg);
  }

  const accountId = tokenData.stripe_user_id || tokenData.stripe_publishable_key || '';
  if (!accountId || !/^acct_/.test(accountId)) {
    return redirect('error', 'Compte Stripe connecté introuvable.');
  }

  try {
    await saveStripeConnect(payload.userId, {
      stripeAccountId: accountId,
      livemode: !!tokenData.livemode,
      scope: tokenData.scope || 'read_write',
      connectedAt: new Date().toISOString(),
    });
  } catch (e) {
    return redirect('error', 'Enregistrement du compte échoué.');
  }

  return redirect('success', '');
};

function resolveConnectRedirectUriFromEvent(event) {
  const host = event.headers.host || event.headers.Host || 'labosync.app';
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${proto}://${host}/.netlify/functions/stripe-connect-callback`;
}
