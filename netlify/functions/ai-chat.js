const { buildCors, verifySupabaseUser } = require('./_labosync-auth');

const rateMap = new Map();

function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count <= 40;
}

exports.handler = async function (event) {
  const headers = buildCors(event);
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!checkRate(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: { message: 'Trop de requêtes, réessayez dans une minute.' } }) };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: { message: 'Connexion requise pour utiliser l\'assistant IA.' } }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: { message: "Clé API non configurée sur le serveur. Ajoutez ANTHROPIC_API_KEY dans les variables d'environnement Netlify." },
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: { message: 'JSON invalide' } }) };
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
  const maxTokens = Math.min(parseInt(body.max_tokens, 10) || 1024, 4096);
  // Modèle : haiku par défaut (chat), mais un appelant peut demander un modèle plus
  // puissant (ex. optimisation de programmation) parmi une liste blanche.
  const ALLOWED_MODELS = new Set(['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-8']);
  const model = ALLOWED_MODELS.has(body.model) ? body.model : 'claude-haiku-4-5-20251001';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        system: String(body.system || '').slice(0, 12000),
        messages,
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: { message: 'Erreur serveur : ' + e.message } }),
    };
  }
};
