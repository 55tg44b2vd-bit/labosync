/**
 * Messagerie portail — table portal_messages (si déployée) ou repli labo_data legacy.
 */
const { SB_URL, laboDataGet, laboDataUpsert, findLabUserIdForPortal } = require('./_labosync-auth');
const { r2Config, presignDownload } = require('./_r2-storage');

const MAX_MESSAGES = 500;
const MAX_CONTENT = 5000;
const MAX_IMAGE = 3_000_000;

let _useRelational = null;

function serviceKey() {
  return (process.env.SUPABASE_SERVICE_KEY || '').trim();
}

function sbHeaders(extra) {
  const key = serviceKey();
  return Object.assign(
    {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    extra || {}
  );
}

async function sbRequest(path, opts) {
  const key = serviceKey();
  if (!key) return { ok: false, status: 503, text: 'SUPABASE_SERVICE_KEY manquant' };
  const res = await fetch(`${SB_URL}${path}`, Object.assign({}, opts, { headers: sbHeaders(opts && opts.headers) }));
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text };
}

function isMissingTable(res) {
  if (!res || res.ok) return false;
  const t = String(res.text || '');
  return (
    res.status === 404 ||
    t.includes('PGRST205') ||
    t.includes('portal_messages') ||
    t.includes('schema cache')
  );
}

async function detectRelational() {
  if (_useRelational !== null) return _useRelational;
  const probe = await sbRequest('/rest/v1/portal_messages?select=id&limit=1', { method: 'GET' });
  if (probe.ok) {
    _useRelational = true;
    return true;
  }
  if (isMissingTable(probe)) {
    _useRelational = false;
    return false;
  }
  _useRelational = false;
  return false;
}

function normPortalId(portalId) {
  return String(portalId || '').trim().toLowerCase();
}

function newMessageId() {
  return Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function clampStr(value, maxLen) {
  return String(value || '').slice(0, maxLen);
}

function toClientMessage(row) {
  if (!row) return null;
  const m = {
    id: row.id,
    sender: row.sender,
    senderName: row.sender_name || row.sender,
    content: row.content || '',
    createdAt: row.created_at || row.createdAt,
  };
  if (row.image) m.image = row.image;
  if (row.attachment) m.attachment = row.attachment;
  return m;
}

async function enrichMessageAttachments(messages) {
  const cfg = r2Config();
  if (!cfg || !Array.isArray(messages)) return messages;
  for (const m of messages) {
    const a = m && m.attachment;
    if (!a || !a.storageKey) continue;
    const storageKey = a.storageKey;
    try {
      a.url = await presignDownload(cfg, storageKey);
      a.urlExpiresAt = new Date(Date.now() + 3500 * 1000).toISOString();
    } catch (e) {
      console.warn('[portal-chat] presign attachment', storageKey, e);
    }
  }
  return messages;
}

function countUnread(messages, readerRole, readAt) {
  const seen = readAt ? new Date(readAt).getTime() : 0;
  const other = readerRole === 'lab' ? 'cabinet' : 'labo';
  return messages.filter(function (m) {
    if (m.sender !== other) return false;
    const t = m.createdAt ? new Date(m.createdAt).getTime() : 0;
    return t > seen;
  }).length;
}

async function resolveLabUserId(portalId, hint) {
  if (hint) return String(hint);
  const row = await laboDataGet('portal_' + portalId);
  if (row?.data?.labUserId) return String(row.data.labUserId);
  return findLabUserIdForPortal(portalId);
}

/* ── Legacy (labo_data) ─────────────────────────────────────────────────── */

async function legacyReadChatRow(portalId) {
  const pid = normPortalId(portalId);
  const ids = ['chat_' + pid];
  const raw = String(portalId || '').trim();
  if (raw && raw.toLowerCase() !== pid) ids.push('chat_' + raw);
  for (const id of ids) {
    const row = await laboDataGet(id);
    if (row?.data) return { rowId: id, data: row.data, updated_at: row.updated_at };
  }
  return { rowId: 'chat_' + pid, data: { messages: [] }, updated_at: null };
}

async function legacyReadReceipts(portalId) {
  const pid = normPortalId(portalId);
  const row = await laboDataGet('chat_reads_' + pid);
  const d = row?.data || {};
  return {
    labReadAt: d.labReadAt || null,
    cabinetReadAt: d.cabinetReadAt || null,
    labUserId: d.labUserId || null,
  };
}

async function legacyWriteReceipts(portalId, patch, labUserId) {
  const pid = normPortalId(portalId);
  const prev = await legacyReadReceipts(portalId);
  const data = Object.assign({}, prev, patch, { labUserId: labUserId || prev.labUserId });
  await laboDataUpsert('chat_reads_' + pid, data);
  return data;
}

async function legacyList(portalId) {
  const chat = await legacyReadChatRow(portalId);
  const reads = await legacyReadReceipts(portalId);
  let messages = Array.isArray(chat.data.messages) ? chat.data.messages.slice(-MAX_MESSAGES) : [];
  messages = await enrichMessageAttachments(messages);
  return {
    messages,
    reads,
    unread: {
      lab: countUnread(messages, 'lab', reads.labReadAt),
      cabinet: countUnread(messages, 'cabinet', reads.cabinetReadAt),
    },
    updated_at: chat.updated_at,
    labUserId: chat.data.labUserId || reads.labUserId,
  };
}

async function legacyInsert(portalId, msg, labUserId) {
  const pid = normPortalId(portalId);
  const chat = await legacyReadChatRow(portalId);
  const existing = Array.isArray(chat.data.messages) ? chat.data.messages : [];
  const trimmed = [...existing, msg].slice(-MAX_MESSAGES);
  const uid = labUserId || chat.data.labUserId || (await resolveLabUserId(pid, null));
  await laboDataUpsert(chat.rowId || 'chat_' + pid, {
    messages: trimmed,
    labUserId: uid,
    lastMessageAt: msg.createdAt,
  });
  if (uid) {
    try {
      await laboDataUpsert('portal_owner_' + pid, { labUserId: uid, portalId: pid });
    } catch (e) {
      console.warn('[portal-chat] portal_owner', e);
    }
  }
  await touchRealtimeSignal(pid, uid);
  return msg;
}

async function touchRealtimeSignal(portalId, labUserId) {
  const pid = normPortalId(portalId);
  try {
    const row = await laboDataGet('chat_' + pid);
    const prev = row?.data || {};
    await laboDataUpsert('chat_' + pid, {
      labUserId: labUserId || prev.labUserId,
      messages: Array.isArray(prev.messages) ? prev.messages.slice(-5) : [],
      signalAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[portal-chat] touchRealtimeSignal', e);
  }
}

/* ── Relational ─────────────────────────────────────────────────────────── */

async function relationalGetReads(portalId) {
  const pid = normPortalId(portalId);
  const res = await sbRequest(
    `/rest/v1/portal_chat_reads?portal_id=eq.${encodeURIComponent(pid)}&select=lab_read_at,cabinet_read_at,lab_user_id`,
    { method: 'GET' }
  );
  if (!res.ok || !Array.isArray(res.json) || !res.json.length) {
    return { labReadAt: null, cabinetReadAt: null, labUserId: null };
  }
  const r = res.json[0];
  return {
    labReadAt: r.lab_read_at,
    cabinetReadAt: r.cabinet_read_at,
    labUserId: r.lab_user_id,
  };
}

async function relationalUpsertReads(portalId, patch, labUserId) {
  const pid = normPortalId(portalId);
  const prev = await relationalGetReads(portalId);
  const body = {
    portal_id: pid,
    lab_user_id: labUserId || prev.labUserId,
    lab_read_at: patch.labReadAt !== undefined ? patch.labReadAt : prev.labReadAt,
    cabinet_read_at: patch.cabinetReadAt !== undefined ? patch.cabinetReadAt : prev.cabinetReadAt,
    updated_at: new Date().toISOString(),
  };
  await sbRequest('/rest/v1/portal_chat_reads', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(body),
  });
  return {
    labReadAt: body.lab_read_at,
    cabinetReadAt: body.cabinet_read_at,
    labUserId: body.lab_user_id,
  };
}

async function relationalList(portalId, sinceIso) {
  const pid = normPortalId(portalId);
  let path =
    `/rest/v1/portal_messages?portal_id=eq.${encodeURIComponent(pid)}&select=id,portal_id,sender,sender_name,content,image,attachment,created_at&order=created_at.asc&limit=${MAX_MESSAGES}`;
  if (sinceIso) {
    path += `&created_at=gt.${encodeURIComponent(sinceIso)}`;
  }
  const res = await sbRequest(path, { method: 'GET' });
  if (!res.ok) throw new Error(res.text || 'Lecture messages');
  let messages = (res.json || []).map(toClientMessage);
  messages = await enrichMessageAttachments(messages);
  const reads = await relationalGetReads(portalId);
  return {
    messages,
    reads,
    unread: {
      lab: countUnread(messages, 'lab', reads.labReadAt),
      cabinet: countUnread(messages, 'cabinet', reads.cabinetReadAt),
    },
    updated_at: messages.length ? messages[messages.length - 1].createdAt : null,
    labUserId: reads.labUserId,
  };
}

async function relationalInsert(portalId, msg, labUserId) {
  const pid = normPortalId(portalId);
  const uid = labUserId || (await resolveLabUserId(pid, null));
  const row = {
    id: msg.id,
    portal_id: pid,
    lab_user_id: uid,
    sender: msg.sender,
    sender_name: msg.senderName,
    content: msg.content || '',
    created_at: msg.createdAt,
  };
  if (msg.image) row.image = msg.image;
  if (msg.attachment) row.attachment = msg.attachment;
  const res = await sbRequest('/rest/v1/portal_messages', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(res.text || 'Insertion message');
  if (uid) await relationalUpsertReads(portalId, {}, uid);
  await touchRealtimeSignal(pid, uid);
  return msg;
}

async function migrateLegacyToRelational(portalId) {
  const pid = normPortalId(portalId);
  const legacy = await legacyReadChatRow(portalId);
  const messages = Array.isArray(legacy.data.messages) ? legacy.data.messages : [];
  if (!messages.length) return;
  const uid = legacy.data.labUserId || (await resolveLabUserId(pid, null));
  const reads = await legacyReadReceipts(portalId);
  for (const m of messages.slice(-MAX_MESSAGES)) {
    const row = {
      id: m.id || newMessageId(),
      portal_id: pid,
      lab_user_id: uid,
      sender: m.sender,
      sender_name: m.senderName || m.sender,
      content: m.content || '',
      created_at: m.createdAt || new Date().toISOString(),
    };
    if (m.image) row.image = m.image;
    if (m.attachment) row.attachment = m.attachment;
    await sbRequest('/rest/v1/portal_messages', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify(row),
    });
  }
  await relationalUpsertReads(
    portalId,
    { labReadAt: reads.labReadAt, cabinetReadAt: reads.cabinetReadAt },
    uid
  );
}

/* ── Public API ───────────────────────────────────────────────────────────── */

async function listChat(portalId, opts) {
  opts = opts || {};
  const since = opts.since || null;
  if (await detectRelational()) {
    try {
      const existing = await sbRequest(
        `/rest/v1/portal_messages?portal_id=eq.${encodeURIComponent(normPortalId(portalId))}&select=id&limit=1`,
        { method: 'GET' }
      );
      if (existing.ok && Array.isArray(existing.json) && !existing.json.length) {
        await migrateLegacyToRelational(portalId);
      }
      return await relationalList(portalId, since);
    } catch (e) {
      console.warn('[portal-chat] relational list fallback', e);
    }
  }
  return legacyList(portalId);
}

function buildChatResponse(bundle) {
  return [
    {
      data: {
        messages: bundle.messages,
        reads: bundle.reads,
        unread: bundle.unread,
        labUserId: bundle.labUserId,
      },
      updated_at: bundle.updated_at,
    },
  ];
}

async function insertChatMessage(portalId, fields, auth) {
  const { sender, senderName, content, image, attachment } = fields;
  const msg = {
    id: newMessageId(),
    sender,
    senderName: clampStr(senderName || sender, 80),
    content: clampStr(content || '', MAX_CONTENT),
    createdAt: new Date().toISOString(),
  };
  if (image) msg.image = image;
  if (attachment && attachment.storageKey) {
    msg.attachment = {
      storage: 'r2',
      storageKey: clampStr(attachment.storageKey, 512),
      name: clampStr(attachment.name || 'fichier', 200),
      size: parseInt(attachment.size, 10) || 0,
      type: clampStr(attachment.type || 'file', 40),
    };
  } else if (attachment && attachment.url) {
    msg.attachment = {
      url: clampStr(attachment.url, 2048),
      name: clampStr(attachment.name || 'fichier', 200),
      size: parseInt(attachment.size, 10) || 0,
      type: clampStr(attachment.type || 'file', 40),
      storage: attachment.storage || 'legacy',
    };
  }
  const labUserId = auth.userId || (await resolveLabUserId(normPortalId(portalId), null));
  if (await detectRelational()) {
    try {
      await relationalInsert(portalId, msg, labUserId);
      return msg;
    } catch (e) {
      console.warn('[portal-chat] relational insert fallback', e);
    }
  }
  await legacyInsert(portalId, msg, labUserId);
  return msg;
}

async function markChatRead(portalId, readerRole) {
  const now = new Date().toISOString();
  const patch =
    readerRole === 'lab' || readerRole === 'labo'
      ? { labReadAt: now }
      : { cabinetReadAt: now };
  const labUserId = await resolveLabUserId(normPortalId(portalId), null);
  if (await detectRelational()) {
    try {
      return await relationalUpsertReads(portalId, patch, labUserId);
    } catch (e) {
      console.warn('[portal-chat] relational markRead fallback', e);
    }
  }
  return legacyWriteReceipts(portalId, patch, labUserId);
}

module.exports = {
  listChat,
  buildChatResponse,
  insertChatMessage,
  markChatRead,
  MAX_CONTENT,
  MAX_IMAGE,
};
