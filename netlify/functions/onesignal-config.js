const { buildCors } = require('./_labosync-auth');

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Cache-Control'] = 'public, max-age=300';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const appId = process.env.ONESIGNAL_APP_ID || '';
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      enabled: !!appId,
      appId,
    }),
  };
};
