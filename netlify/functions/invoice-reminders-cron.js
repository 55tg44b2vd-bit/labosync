const { runInvoiceRemindersCron } = require('./_invoice-reminders');

exports.handler = async (event) => {
  const SERVICE_KEY = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  const RESEND_KEY = (process.env.RESEND_API_KEY || '').trim();
  const CRON_SECRET = (process.env.INVOICE_REMINDERS_CRON_SECRET || process.env.CRON_SECRET || '').trim();

  const headers = { 'Content-Type': 'application/json' };

  const isScheduled = event && event.headers && event.headers['x-nf-event'] === 'schedule';
  const provided =
    (event.headers && (event.headers['x-cron-secret'] || event.headers['X-Cron-Secret'])) || '';
  let bodySecret = '';
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    bodySecret = body.secret || '';
  } catch (_) {}

  if (CRON_SECRET && !isScheduled) {
    const ok = provided === CRON_SECRET || bodySecret === CRON_SECRET;
    if (!ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Secret cron invalide' }) };
    }
  }

  try {
    const summary = await runInvoiceRemindersCron({
      serviceKey: SERVICE_KEY,
      resendKey: RESEND_KEY,
      dryRun: false,
    });
    console.log('[invoice-reminders-cron]', JSON.stringify(summary));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, summary }) };
  } catch (e) {
    console.error('[invoice-reminders-cron]', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message || 'Erreur relances automatiques' }),
    };
  }
};
