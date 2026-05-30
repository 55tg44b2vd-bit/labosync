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
const courierApi = require('../netlify/functions/courier-api.js');
const labAccess = require('../netlify/functions/lab-access.js');
const r2Storage = require('../netlify/functions/r2-storage.js');
const errorDashboard = require('../netlify/functions/_error-dashboard.js');
const invoiceReminders = require('../netlify/functions/_invoice-reminders.js');
const labRbac = require('../netlify/functions/_labosync-rbac.js');
const invoiceRemindersCron = require('../netlify/functions/invoice-reminders-cron.js');
const labRole = require('../netlify/functions/lab-role.js');

async function run() {
  const tests = [];

  tests.push((async () => {
    const res = await portal.handler({ httpMethod: 'OPTIONS', headers: {} });
    assert.equal(res.statusCode, 200);
  })());

  tests.push((async () => {
    const res = await portal.handler({ httpMethod: 'GET', headers: {}, queryStringParameters: { portalId: '../bad' } });
    assert.equal(res.statusCode, 400);
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

  tests.push((async () => {
    const res = await courierApi.handler({ httpMethod: 'OPTIONS', headers: {} });
    assert.equal(res.statusCode, 200);
  })());

  tests.push((async () => {
    const res = await labAccess.handler({ httpMethod: 'OPTIONS', headers: {} });
    assert.equal(res.statusCode, 200);
  })());

  tests.push((async () => {
    const res = await labAccess.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 401);
  })());

  tests.push((async () => {
    const res = await r2Storage.handler({ httpMethod: 'OPTIONS', headers: {} });
    assert.equal(res.statusCode, 200);
  })());

  tests.push((async () => {
    const res = await r2Storage.handler({ httpMethod: 'GET', headers: {} });
    assert.equal(res.statusCode, 405);
  })());

  tests.push((async () => {
    const fixedNow = new Date('2026-05-30T10:00:00.000Z');
    const payload = errorDashboard.normalizeClientError({
      app: 'desktop',
      message: 'x'.repeat(6000),
      userId: 'user-1',
    }, fixedNow);
    assert.equal(payload.app, 'desktop');
    assert.equal(payload.message.length, 5000);
    assert.equal(payload.createdAt, fixedNow.toISOString());
  })());

  tests.push((async () => {
    const nowMs = Date.parse('2026-05-30T10:00:00.000Z');
    const data = errorDashboard.buildErrorDashboard([
      { id: 'err_1', updated_at: '2026-05-30T09:40:00.000Z', data: { app: 'desktop', page: '/app.html', message: 'boom', createdAt: '2026-05-30T09:40:00.000Z' } },
      { id: 'err_2', updated_at: '2026-05-30T09:45:00.000Z', data: { app: 'desktop', page: '/app.html', message: 'boom', createdAt: '2026-05-30T09:45:00.000Z' } },
      { id: 'err_old', updated_at: '2026-05-28T09:45:00.000Z', data: { app: 'mobile', message: 'old', createdAt: '2026-05-28T09:45:00.000Z' } },
    ], { nowMs, threshold: 2 });
    assert.equal(data.summary.lastHour, 2);
    assert.equal(data.summary.total24h, 2);
    assert.equal(data.summary.status, 'alert');
    assert.equal(data.summary.messages[0].key, 'boom');
  })());

  tests.push((async () => {
    const settings = invoiceReminders.normalizeBillingSettings({ autoReminders: true });
    assert.equal(settings.autoReminders, true);
    const doc = { type: 'facture', status: 'envoye', date: '2026-04-01', reminders: [] };
    const now = new Date('2026-05-30T10:00:00.000Z');
    const info = invoiceReminders.reminderInfoForDoc(doc, now);
    assert.ok(info);
    assert.equal(info.stage, 'J+3');
  })());

  tests.push((async () => {
    assert.equal(labRbac.normalizeRole('billing'), 'billing');
    assert.equal(labRbac.normalizeRole('unknown'), 'admin');
    const denied = labRbac.requireLabPerm({ user_metadata: { lab_role: 'production' } }, 'action:billing_generate');
    assert.equal(denied.ok, false);
    const allowed = labRbac.requireLabPerm({ user_metadata: { lab_role: 'billing' } }, 'action:billing_generate');
    assert.equal(allowed.ok, true);
  })());

  tests.push((async () => {
    const res = await invoiceRemindersCron.handler({ httpMethod: 'POST', headers: {} });
    assert.equal(res.statusCode, 500);
    const body = JSON.parse(res.body);
    assert.ok(body.error);
  })());

  tests.push((async () => {
    const res = await labRole.handler({ httpMethod: 'GET', headers: {} });
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
