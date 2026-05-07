const assert = require('assert');

const portal = require('../netlify/functions/portal.js');
const portalLogin = require('../netlify/functions/portal-login.js');
const stripePayment = require('../netlify/functions/stripe-create-payment.js');
const stripeSub = require('../netlify/functions/stripe-create-subscription.js');
const stripePortal = require('../netlify/functions/stripe-create-portal-session.js');
const aiChat = require('../netlify/functions/ai-chat.js');
const sendEmail = require('../netlify/functions/send-email.js');
const logClientError = require('../netlify/functions/log-client-error.js');
const auditLog = require('../netlify/functions/audit-log.js');

async function run() {
  const tests = [];

  tests.push((async () => {
    const res = await portal.handler({ httpMethod: 'OPTIONS', headers: {} });
    assert.equal(res.statusCode, 200);
  })());

  tests.push((async () => {
    const res = await portalLogin.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await stripePayment.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await stripeSub.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await stripePortal.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await aiChat.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await sendEmail.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await logClientError.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const res = await auditLog.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  await Promise.all(tests);
  console.log('Smoke tests passed.');
}

run().catch((err) => {
  console.error('Smoke tests failed.');
  console.error(err);
  process.exit(1);
});
