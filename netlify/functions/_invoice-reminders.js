const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';

const REMINDER_STAGES = [
  { key: 'J+3', days: 3, label: 'Relance J+3' },
  { key: 'J+7', days: 7, label: 'Relance J+7' },
  { key: 'J+14', days: 14, label: 'Relance J+14' },
];

function isMainLabRowId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));
}

function defaultBillingSettings() {
  return { autoReminders: false, updatedAt: null };
}

function normalizeBillingSettings(raw) {
  const base = defaultBillingSettings();
  if (!raw || typeof raw !== 'object') return base;
  return {
    autoReminders: !!raw.autoReminders,
    updatedAt: raw.updatedAt || null,
  };
}

function invoiceDueDate(doc) {
  if (!doc || !doc.date) return null;
  const due = new Date(String(doc.date) + 'T12:00:00');
  if (Number.isNaN(due.getTime())) return null;
  due.setDate(due.getDate() + 30);
  return due;
}

function reminderInfoForDoc(doc, now) {
  if (!doc || doc.type !== 'facture' || doc.status !== 'envoye' || !doc.date) return null;
  const due = invoiceDueDate(doc);
  if (!due) return null;
  const days = Math.floor(((now || new Date()) - due) / 86400000);
  if (days < 3) return null;
  const sent = (doc.reminders || []).map((r) => r && r.stage).filter(Boolean);
  const available = REMINDER_STAGES.filter((s) => days >= s.days);
  const next = available.find((s) => sent.indexOf(s.key) < 0);
  if (!next) return null;
  return { daysOverdue: days, dueDate: due, stage: next.key, label: next.label };
}

function buildReminderEmailHtml(doc, labo, portalUrl, stage) {
  const linesHtml = (doc.lines || [])
    .map((l) => {
      const total = (parseFloat(l.qty) || 1) * (parseFloat(l.prix) || 0);
      return (
        '<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;">' +
        String(l.label || '') +
        '</td><td style="padding:6px 10px;text-align:right;border-bottom:1px solid #eee;">' +
        total.toFixed(2).replace('.', ',') +
        ' €</td></tr>'
      );
    })
    .join('');
  const total = Number(doc.total || 0).toFixed(2).replace('.', ',');
  return (
    '<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1c1714;">' +
    '<div style="background:#1c1410;color:#f5f0e8;padding:20px 24px;border-radius:10px 10px 0 0;">' +
    '<h1 style="margin:0;font-size:18px;">Relance facture — ' +
    String(labo.raisonSociale || 'Laboratoire') +
    '</h1></div>' +
    '<div style="background:#fff;border:1px solid #e5ddd2;border-top:none;padding:24px;border-radius:0 0 10px 10px;">' +
    '<p>Bonjour,</p>' +
    '<p>Nous nous permettons de vous relancer concernant la facture <strong>' +
    String(doc.num || '') +
    '</strong> (' +
    stage +
    ') d\'un montant de <strong>' +
    total +
    ' €</strong>.</p>' +
    '<p style="font-size:13px;color:#666;">Si vous avez déjà réglé par virement, merci de ne pas tenir compte de ce message.</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5f0;border-radius:8px;overflow:hidden;">' +
    '<thead><tr style="background:#1c1714;color:#fff;"><th style="padding:8px 10px;text-align:left;font-size:12px;">Prestation</th>' +
    '<th style="padding:8px 10px;text-align:right;font-size:12px;">Montant</th></tr></thead><tbody>' +
    linesHtml +
    '</tbody></table>' +
    (portalUrl
      ? '<div style="text-align:center;margin-top:20px;"><a href="' +
        portalUrl +
        '" style="background:#c8410a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block;">Espace cabinet</a></div>'
      : '') +
    '<p style="margin-top:20px;font-size:12px;color:#888;">Cordialement,<br/><strong>' +
    String(labo.raisonSociale || '') +
    '</strong></p></div></div>'
  );
}

async function sendReminderEmail({ to, subject, html, fromName, resendKey, fromEmail }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + resendKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: (fromName ? fromName + ' <' + fromEmail + '>' : fromEmail),
      to: [to],
      subject,
      html,
    }),
  });
  const result = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(result.message || 'Échec envoi email');
  return result;
}

function markDocReminder(doc, stage, source) {
  doc.reminders = Array.isArray(doc.reminders) ? doc.reminders : [];
  doc.reminders.unshift({
    stage: stage || 'relance',
    source: source || 'auto',
    at: new Date().toISOString(),
  });
}

async function processLabRowForReminders(row, opts) {
  const serviceKey = opts.serviceKey;
  const resendKey = opts.resendKey;
  const fromEmail = opts.fromEmail;
  const dryRun = !!opts.dryRun;
  const now = opts.now || new Date();
  const out = { userId: row.id, sent: 0, skipped: 0, errors: [] };

  if (!row || !row.data || !isMainLabRowId(row.id)) return out;

  const settings = normalizeBillingSettings(row.data.billingSettings);
  if (!settings.autoReminders) {
    out.skipped += 1;
    return out;
  }

  const documents = Array.isArray(row.data.documents) ? row.data.documents : [];
  const cabinets = Array.isArray(row.data.cabinets) ? row.data.cabinets : [];
  const legal = row.data.legalInfo || {};
  const labo = {
    raisonSociale: legal.raison || row.data.laboName || 'Laboratoire',
    email: legal.email || '',
    tel: legal.tel || '',
  };

  let changed = false;

  for (const doc of documents) {
    const info = reminderInfoForDoc(doc, now);
    if (!info) continue;
    const cab = cabinets.find((c) => c && c.id === doc.cabinet);
    const email = cab && cab.email ? String(cab.email).trim() : '';
    if (!email) {
      out.skipped += 1;
      continue;
    }
    const portalUrl =
      cab && cab.portalId ? 'https://labosync.app/cabinet.html?id=' + encodeURIComponent(cab.portalId) : '';
    const subject = 'Relance facture ' + (doc.num || '') + ' — ' + labo.raisonSociale;
    const html = buildReminderEmailHtml(doc, labo, portalUrl, info.stage);

    if (dryRun) {
      out.sent += 1;
      continue;
    }

    try {
      await sendReminderEmail({
        to: email,
        subject,
        html,
        fromName: labo.raisonSociale,
        resendKey,
        fromEmail,
      });
      markDocReminder(doc, info.stage, 'auto');
      changed = true;
      out.sent += 1;
    } catch (e) {
      out.errors.push({ docId: doc.id, message: e.message || 'send failed' });
    }
  }

  if (changed && !dryRun) {
    const payload = Object.assign({}, row.data, {
      documents,
      billingSettings: Object.assign({}, settings, { updatedAt: new Date().toISOString() }),
    });
    await fetch(SB_URL + '/rest/v1/labo_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: row.id,
        data: payload,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  return out;
}

async function runInvoiceRemindersCron(opts) {
  const serviceKey = (opts && opts.serviceKey) || '';
  const resendKey = (opts && opts.resendKey) || '';
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_KEY manquant');
  if (!resendKey && !opts.dryRun) throw new Error('RESEND_API_KEY manquant');

  const fromEmail = (
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    'factures@labosync.app'
  ).trim();

  const r = await fetch(
    SB_URL +
      '/rest/v1/labo_data?select=id,data,updated_at&order=updated_at.desc&limit=800',
    { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } },
  );
  if (!r.ok) throw new Error('Lecture labos impossible (' + r.status + ')');
  const rows = await r.json();
  const summary = { labsScanned: 0, emailsSent: 0, skipped: 0, errors: [] };

  for (const row of rows || []) {
    if (!isMainLabRowId(row.id)) continue;
    summary.labsScanned += 1;
    const result = await processLabRowForReminders(row, {
      serviceKey,
      resendKey,
      fromEmail,
      dryRun: opts.dryRun,
      now: opts.now || new Date(),
    });
    summary.emailsSent += result.sent;
    summary.skipped += result.skipped;
    if (result.errors && result.errors.length) {
      summary.errors.push({ userId: result.userId, errors: result.errors });
    }
  }

  return summary;
}

module.exports = {
  REMINDER_STAGES,
  isMainLabRowId,
  defaultBillingSettings,
  normalizeBillingSettings,
  invoiceDueDate,
  reminderInfoForDoc,
  buildReminderEmailHtml,
  processLabRowForReminders,
  runInvoiceRemindersCron,
};
