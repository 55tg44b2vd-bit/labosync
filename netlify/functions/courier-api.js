const { SB_URL, buildCors, verifySupabaseUser, getBearerToken } = require('./_labosync-auth');

const SERVICE_KEY = () => (process.env.SUPABASE_SERVICE_KEY || '').trim();

function resolveRole(user) {
  const t = user?.user_metadata?.account_type;
  if (t === 'courier' || t === 'lab') return t;
  if (user?.user_metadata?.labo_name) return 'lab';
  if (user?.user_metadata?.courier_name) return 'courier';
  return 'unknown';
}

function isCourier(user) {
  return resolveRole(user) === 'courier';
}

function isLab(user) {
  return resolveRole(user) === 'lab';
}

async function resolveMissionRole(user) {
  const r = resolveRole(user);
  if (r === 'courier' || r === 'lab') return r;
  const labs = await getCourierLabs(user.id);
  if (labs.length) return 'courier';
  const links = await getLabLinks(user.id);
  if (links.length) return 'lab';
  return 'lab';
}

function labNameFrom(user) {
  return (
    user?.user_metadata?.labo_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Laboratoire'
  );
}

async function sbGet(id) {
  const key = SERVICE_KEY();
  if (!key) return null;
  const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.${encodeURIComponent(id)}&select=data,updated_at`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

function ownerIdForLaboRow(rowId, data) {
  if (data && data.labUserId) return String(data.labUserId);
  if (rowId.startsWith('cm_') && data && data.labUserId) return String(data.labUserId);
  if (rowId.startsWith('courier_links_')) return rowId.slice('courier_links_'.length);
  if (rowId.startsWith('lab_courier_idx_')) return rowId.slice('lab_courier_idx_'.length);
  if (rowId.startsWith('courier_board_')) return rowId.slice('courier_board_'.length);
  if (rowId.startsWith('courier_labs_')) return rowId.slice('courier_labs_'.length);
  if (rowId.startsWith('courier_idx_')) return rowId.slice('courier_idx_'.length);
  if (rowId.startsWith('courier_inbox_')) return rowId.slice('courier_inbox_'.length);
  if (rowId.startsWith('courier_prof_')) return rowId.slice('courier_prof_'.length);
  if (data && data.labUserId) return String(data.labUserId);
  return null;
}

async function sbUpsert(id, data) {
  const key = SERVICE_KEY();
  if (!key) throw new Error('SUPABASE_SERVICE_KEY manquant');
  const payload = Object.assign({}, data || {});
  const ownerId = ownerIdForLaboRow(id, payload);
  if (ownerId) payload.labUserId = ownerId;
  const r = await fetch(`${SB_URL}/rest/v1/labo_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ id, data: payload, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(await r.text());
}

function parseAdminUsers(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.users)) return payload.users;
  if (payload.id && payload.email) return [payload];
  return [];
}

async function findUserByEmail(email) {
  const key = SERVICE_KEY();
  const norm = String(email || '').trim().toLowerCase();
  if (!norm) return null;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY manquant');

  const filterUrls = [
    `${SB_URL}/auth/v1/admin/users?email=${encodeURIComponent(norm)}`,
    `${SB_URL}/auth/v1/admin/users?filter=${encodeURIComponent('email.eq.' + norm)}`,
  ];

  for (const url of filterUrls) {
    try {
      const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
      if (!r.ok) continue;
      const payload = await r.json();
      const found = parseAdminUsers(payload).find((u) => String(u.email || '').trim().toLowerCase() === norm);
      if (found) return found;
    } catch (_) {
      /* essai suivant */
    }
  }

  for (let page = 1; page <= 50; page += 1) {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      if (page === 1) {
        const txt = await r.text().catch(() => '');
        throw new Error('Recherche coursier impossible (Auth admin ' + r.status + '). Vérifiez SUPABASE_SERVICE_KEY sur Netlify.' + (txt ? ' ' + txt.slice(0, 120) : ''));
      }
      break;
    }
    const users = parseAdminUsers(await r.json());
    const found = users.find((u) => String(u.email || '').trim().toLowerCase() === norm);
    if (found) return found;
    if (users.length < 200) break;
  }
  return null;
}

async function ensureCourierAccount(user) {
  if (isCourier(user)) return user;
  if (isLab(user)) return null;
  const key = SERVICE_KEY();
  const meta = { ...(user.user_metadata || {}), account_type: 'courier' };
  if (!meta.display_name && !meta.courier_name) {
    meta.display_name = user.email?.split('@')[0] || 'Coursier';
    meta.courier_name = meta.display_name;
  }
  const r = await fetch(`${SB_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_metadata: meta }),
  });
  if (!r.ok) return user;
  return { ...user, user_metadata: meta };
}

function linksRowId(labUserId) {
  return `courier_links_${labUserId}`;
}

function labsRowId(courierUserId) {
  return `courier_labs_${courierUserId}`;
}

function inboxRowId(courierUserId) {
  return `courier_inbox_${courierUserId}`;
}

function boardRowId(labUserId) {
  return `courier_board_${labUserId}`;
}

function profileRowId(courierUserId) {
  return `courier_prof_${courierUserId}`;
}

function missionRowId(missionId) {
  return `cm_${missionId}`;
}

function genMissionId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function genStopId() {
  return `st_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function parseStop(raw, orderIdx) {
  if (!raw || typeof raw !== 'object') return null;
  const cabName = String(raw.cabName || '').trim().slice(0, 200);
  if (!cabName) return null;
  const status = raw.status === 'done' ? 'done' : 'pending';
  return {
    id: String(raw.id || genStopId()).slice(0, 48),
    order: typeof raw.order === 'number' ? raw.order : orderIdx ?? 0,
    type: raw.type === 'delivery' ? 'delivery' : 'pickup',
    cabId: String(raw.cabId || '').slice(0, 80),
    cabName,
    cabPhone: String(raw.cabPhone || '').slice(0, 40),
    cabAddress: String(raw.cabAddress || '').slice(0, 300),
    notes: String(raw.notes || '').slice(0, 300),
    status,
    completedAt: status === 'done' && raw.completedAt ? String(raw.completedAt) : null,
  };
}

function parseStopsFromBody(body) {
  if (Array.isArray(body.stops) && body.stops.length) {
    return body.stops.map((s, i) => parseStop(s, i)).filter(Boolean).slice(0, 15);
  }
  const single = parseStop(
    {
      type: body.type,
      cabId: body.cabId,
      cabName: body.cabName,
      cabPhone: body.cabPhone,
      cabAddress: body.cabAddress,
      notes: body.notes,
    },
    0
  );
  return single ? [single] : [];
}

function missionStops(mission) {
  if (Array.isArray(mission?.stops) && mission.stops.length) {
    return [...mission.stops].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  if (mission?.cabName) {
    return [
      {
        id: genStopId(),
        order: 0,
        type: mission.type === 'delivery' ? 'delivery' : 'pickup',
        cabId: mission.cabId || '',
        cabName: mission.cabName,
        cabPhone: mission.cabPhone || '',
        cabAddress: mission.cabAddress || '',
        notes: '',
        status: 'pending',
        completedAt: null,
      },
    ];
  }
  return [];
}

function normalizeMissionStops(mission) {
  const stops = missionStops(mission).map((s, i) => ({
    ...s,
    id: s.id || genStopId(),
    order: typeof s.order === 'number' ? s.order : i,
    status: s.status === 'done' ? 'done' : 'pending',
    completedAt: s.status === 'done' ? s.completedAt || null : null,
  }));
  stops.sort((a, b) => a.order - b.order);
  mission.stops = stops;
  applyLegacyMissionFields(mission, stops);
  return stops;
}

function stopsProgress(stops) {
  const list = Array.isArray(stops) ? stops : [];
  const done = list.filter((s) => s.status === 'done').length;
  return { done, total: list.length };
}

function applyLegacyMissionFields(mission, stops) {
  const first = stops[0];
  mission.stops = stops;
  mission.type = stops.length > 1 ? 'multi' : first.type;
  mission.cabId = first.cabId;
  mission.cabName = first.cabName;
  mission.cabPhone = first.cabPhone;
  mission.cabAddress = first.cabAddress;
}

async function getLabLinks(labUserId) {
  const row = await sbGet(linksRowId(labUserId));
  return row?.data?.links || [];
}

async function getCourierLabs(courierUserId) {
  const row = await sbGet(labsRowId(courierUserId));
  return row?.data?.labs || [];
}

async function isCourierLinked(labUserId, courierUserId) {
  const links = await getLabLinks(labUserId);
  return links.some((l) => l.courierUserId === courierUserId && l.status === 'active');
}

async function bumpInbox(courierUserId, missionId, missionSnapshot) {
  const row = await sbGet(inboxRowId(courierUserId));
  const data = row?.data || { version: 0, lastMissionId: null, pending: [] };
  data.version = (data.version || 0) + 1;
  data.lastMissionId = missionId;
  data.lastAt = new Date().toISOString();
  if (missionSnapshot && missionSnapshot.id) {
    data.lastMission = missionSnapshot;
    const pending = Array.isArray(data.pending) ? data.pending.filter((m) => m.id !== missionSnapshot.id) : [];
    if (missionSnapshot.status === 'offered') pending.unshift(missionSnapshot);
    data.pending = pending.slice(0, 30);
  }
  await sbUpsert(inboxRowId(courierUserId), data);
}

async function ensureCourierLabLink(labUserId, courierUserId, labName) {
  const labsRow = await sbGet(labsRowId(courierUserId));
  const labs = labsRow?.data?.labs || [];
  if (!labs.some((l) => l.labUserId === labUserId)) {
    labs.push({
      labUserId,
      labName: labName || 'Laboratoire',
      linkedAt: new Date().toISOString(),
    });
    await sbUpsert(labsRowId(courierUserId), { labs });
  }
}

async function repairCourierLabsForCourier(courierUserId) {
  let labs = await getCourierLabs(courierUserId);
  if (labs.length) return labs;

  const key = SERVICE_KEY();
  const r = await fetch(
    `${SB_URL}/rest/v1/labo_data?select=id,data&id=like.courier_links_%25&limit=300`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!r.ok) return labs;
  const rows = await r.json();
  if (!Array.isArray(rows)) return labs;

  for (const row of rows) {
    if (!row.id || !String(row.id).startsWith('courier_links_')) continue;
    const labUserId = String(row.id).slice('courier_links_'.length);
    const links = row.data?.links || [];
    const link = links.find((l) => l.courierUserId === courierUserId && l.status === 'active');
    if (!link || labs.some((l) => l.labUserId === labUserId)) continue;
    const labIdx = await sbGet(labIdxId(labUserId));
    const sampleMission = (labIdx?.data?.missions || []).find((m) => m.courierUserId === courierUserId);
    labs.push({
      labUserId,
      labName: sampleMission?.labName || 'Laboratoire',
      linkedAt: link.linkedAt || new Date().toISOString(),
    });
  }

  if (labs.length) await sbUpsert(labsRowId(courierUserId), { labs });
  return labs;
}

async function bumpBoard(labUserId) {
  const row = await sbGet(boardRowId(labUserId));
  const data = row?.data || { version: 0 };
  data.version = (data.version || 0) + 1;
  data.lastAt = new Date().toISOString();
  await sbUpsert(boardRowId(labUserId), data);
}

async function loadMission(missionId) {
  const row = await sbGet(missionRowId(missionId));
  return row?.data || null;
}

function courierIdxId(courierUserId) {
  return `courier_idx_${courierUserId}`;
}

function labIdxId(labUserId) {
  return `lab_courier_idx_${labUserId}`;
}

async function syncMissionIndexes(mission) {
  if (!mission || !mission.id) return;
  const courierRow = await sbGet(courierIdxId(mission.courierUserId));
  const cData = courierRow?.data || { missions: [] };
  cData.missions = [mission, ...(cData.missions || []).filter((m) => m.id !== mission.id)].slice(0, 150);
  await sbUpsert(courierIdxId(mission.courierUserId), cData);

  const labRow = await sbGet(labIdxId(mission.labUserId));
  const lData = labRow?.data || { missions: [] };
  lData.missions = [mission, ...(lData.missions || []).filter((m) => m.id !== mission.id)].slice(0, 150);
  await sbUpsert(labIdxId(mission.labUserId), lData);
}

async function saveMission(mission) {
  if (mission) normalizeMissionStops(mission);
  await sbUpsert(missionRowId(mission.id), mission);
  await syncMissionIndexes(mission);
}

function mergeMissionsById(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const m of list || []) {
      if (m && m.id) map.set(m.id, m);
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

async function fetchCourierMissionsFromLabIndexes(courierUserId) {
  let labs = await getCourierLabs(courierUserId);
  if (!labs.length) labs = await repairCourierLabsForCourier(courierUserId);
  let all = [];
  for (const lab of labs) {
    const row = await sbGet(labIdxId(lab.labUserId));
    const list = (row?.data?.missions || []).filter((m) => m.courierUserId === courierUserId);
    all = all.concat(list);
  }
  return all;
}

async function fetchCourierMissions(courierUserId) {
  const row = await sbGet(courierIdxId(courierUserId));
  let missions = row?.data?.missions || [];
  const fromLabs = await fetchCourierMissionsFromLabIndexes(courierUserId);
  missions = mergeMissionsById(missions, fromLabs);
  const inbox = await sbGet(inboxRowId(courierUserId));
  const inboxData = inbox?.data || {};
  if (Array.isArray(inboxData.pending)) {
    missions = mergeMissionsById(missions, inboxData.pending.filter((m) => m.courierUserId === courierUserId));
  }
  if (inboxData.lastMission && inboxData.lastMission.courierUserId === courierUserId) {
    missions = mergeMissionsById([inboxData.lastMission], missions);
  }
  const lastId = inboxData.lastMissionId;
  if (lastId && !missions.some((m) => m.id === lastId)) {
    const m = await loadMission(lastId);
    if (m && m.courierUserId === courierUserId) {
      missions = mergeMissionsById([m], missions);
      await syncMissionIndexes(m);
    }
  }
  return missions;
}

async function requireLabUser(user) {
  if (isLab(user)) return true;
  if (isCourier(user)) return false;
  return (await resolveMissionRole(user)) === 'lab';
}

function filterMissionsByScope(missions, scope) {
  const list = Array.isArray(missions) ? missions : [];
  if (scope === 'offered') return list.filter((m) => m.status === 'offered');
  if (scope === 'active') return list.filter((m) => ['offered', 'accepted', 'en_route'].includes(m.status));
  if (scope === 'history') {
    return list.filter((m) => ['completed', 'cancelled', 'declined'].includes(m.status));
  }
  return list;
}

function monthKey(iso) {
  return String(iso || '').slice(0, 7);
}

function resolveBillingPeriod(body) {
  const month = String(body?.month || '').trim();
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    const from = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    return { month, from: from.toISOString(), to: to.toISOString() };
  }
  const fromRaw = body?.from ? new Date(body.from) : null;
  const toRaw = body?.to ? new Date(body.to) : null;
  if (fromRaw && toRaw && !Number.isNaN(fromRaw.getTime()) && !Number.isNaN(toRaw.getTime())) {
    return { month: monthKey(fromRaw.toISOString()), from: fromRaw.toISOString(), to: toRaw.toISOString() };
  }
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const from = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  const mk = `${y}-${String(m + 1).padStart(2, '0')}`;
  return { month: mk, from: from.toISOString(), to: to.toISOString() };
}

function missionBillingLabel(mission) {
  const stops = missionStops(mission);
  if (stops.length > 1) {
    const names = stops.map((s) => s.cabName).filter(Boolean).slice(0, 3);
    return `Course multi-arrêts (${stops.length})${names.length ? ` · ${names.join(' → ')}` : ''}`;
  }
  const s = stops[0];
  const typ = (s?.type || mission.type) === 'delivery' ? 'Livraison' : 'Récupération';
  return `${typ} · ${s?.cabName || mission.cabName || ''}`;
}

function countMissionStopTypes(mission) {
  const stops = missionStops(mission);
  let pickups = 0;
  let deliveries = 0;
  stops.forEach((st) => {
    if (st.type === 'delivery') deliveries += 1;
    else pickups += 1;
  });
  if (!pickups && !deliveries) {
    if (mission.type === 'delivery') deliveries = 1;
    else pickups = 1;
  }
  return { pickups, deliveries, stopCount: stops.length || 1 };
}

function parseBillingRate(val) {
  const rate = parseFloat(val);
  return Number.isFinite(rate) && rate >= 0 ? Math.round(rate * 100) / 100 : null;
}

function cleanText(val, max = 300) {
  return String(val || '').trim().slice(0, max);
}

function cleanBool(val, fallback = false) {
  return typeof val === 'boolean' ? val : fallback;
}

function cleanSelect(val, allowed, fallback) {
  const raw = cleanText(val, 40);
  return allowed.includes(raw) ? raw : fallback;
}

function cleanNonNegativeNumber(val) {
  if (val === undefined || val === null || val === '') return null;
  const n = parseFloat(val);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : null;
}

function publicCourierProfile(prof) {
  const p = prof || {};
  return {
    displayName: p.displayName || '',
    phone: p.phone || '',
    recoveryEmail: p.recoveryEmail || '',
    emergencyContactName: p.emergencyContactName || '',
    emergencyContactPhone: p.emergencyContactPhone || '',
    availabilityStatus: p.availabilityStatus || 'active',
    workingDays: p.workingDays || '',
    workingHours: p.workingHours || '',
    vacationUntil: p.vacationUntil || '',
    homeAddress: p.homeAddress || '',
    serviceZones: p.serviceZones || '',
    radiusKm: typeof p.radiusKm === 'number' && p.radiusKm >= 0 ? p.radiusKm : null,
    acceptPickup: p.acceptPickup !== false,
    acceptDelivery: p.acceptDelivery !== false,
    acceptMultiStop: p.acceptMultiStop !== false,
    missionNotes: p.missionNotes || '',
    preferredNavApp: p.preferredNavApp || 'google_maps',
    billingCompany: p.billingCompany || '',
    billingSiret: p.billingSiret || '',
    billingAddress: p.billingAddress || '',
    billingIban: p.billingIban || '',
    billingPaymentNote: p.billingPaymentNote || '',
    billingRatePerCourse:
      typeof p.billingRatePerCourse === 'number' && p.billingRatePerCourse >= 0 ? p.billingRatePerCourse : null,
    billingRatePerExtraStop:
      typeof p.billingRatePerExtraStop === 'number' && p.billingRatePerExtraStop >= 0 ? p.billingRatePerExtraStop : null,
    docPermit: !!p.docPermit,
    docInsurance: !!p.docInsurance,
    docVehicleRegistration: !!p.docVehicleRegistration,
    docIdentity: !!p.docIdentity,
    docNotes: p.docNotes || '',
  };
}

function readCourierBillingRates(prof) {
  const base =
    typeof prof?.billingRatePerCourse === 'number' && prof.billingRatePerCourse >= 0
      ? prof.billingRatePerCourse
      : null;
  const extra =
    typeof prof?.billingRatePerExtraStop === 'number' && prof.billingRatePerExtraStop >= 0
      ? prof.billingRatePerExtraStop
      : null;
  return { base, extra };
}

/** Forfait 1er arrêt + supplément par arrêt au-delà (si extra défini), sinon forfait fixe par course. */
function missionBillingAmount(stopCount, rates) {
  const n = Math.max(1, stopCount || 1);
  const { base, extra } = rates || {};
  if (base == null) return null;
  if (extra != null && extra > 0) {
    return Math.round((base + Math.max(0, n - 1) * extra) * 100) / 100;
  }
  return Math.round(base * 100) / 100;
}

function applyBillingRatesToSummary(summary, rates) {
  const { base, extra } = rates;
  summary.ratePerCourse = base;
  summary.ratePerExtraStop = extra;
  let total = 0;
  let hasAmount = false;
  for (const m of summary.missions || []) {
    m.amount = missionBillingAmount(m.stopCount, rates);
    if (m.amount != null) {
      hasAmount = true;
      total += m.amount;
    }
  }
  summary.estimatedTotal = hasAmount ? Math.round(total * 100) / 100 : null;
  return summary;
}

function buildBillingSummary(missions, period) {
  const fromT = new Date(period.from).getTime();
  const toT = new Date(period.to).getTime();
  const completed = (missions || []).filter((m) => {
    if (m.status !== 'completed' || !m.completedAt) return false;
    const t = new Date(m.completedAt).getTime();
    return t >= fromT && t <= toT;
  });
  const byLabMap = new Map();
  let totalPickups = 0;
  let totalDeliveries = 0;
  const lines = [];
  for (const m of completed) {
    const counts = countMissionStopTypes(m);
    totalPickups += counts.pickups;
    totalDeliveries += counts.deliveries;
    const labId = m.labUserId || 'unknown';
    const labName = m.labName || 'Laboratoire';
    if (!byLabMap.has(labId)) {
      byLabMap.set(labId, {
        labUserId: labId,
        labName,
        courses: 0,
        pickups: 0,
        deliveries: 0,
        stops: 0,
      });
    }
    const lab = byLabMap.get(labId);
    lab.courses += 1;
    lab.pickups += counts.pickups;
    lab.deliveries += counts.deliveries;
    lab.stops += counts.stopCount;
    lines.push({
      id: m.id,
      completedAt: m.completedAt,
      labUserId: labId,
      labName,
      label: missionBillingLabel(m),
      pickups: counts.pickups,
      deliveries: counts.deliveries,
      stopCount: counts.stopCount,
    });
  }
  lines.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  return {
    period,
    totalCourses: completed.length,
    totalPickups,
    totalDeliveries,
    totalStops: totalPickups + totalDeliveries,
    byLab: Array.from(byLabMap.values()).sort((a, b) => b.courses - a.courses),
    missions: lines,
  };
}

async function fetchLabCompletedMissionsForCourier(labUserId, courierUserId) {
  const row = await sbGet(labIdxId(labUserId));
  return (row?.data?.missions || []).filter(
    (m) => m.courierUserId === courierUserId && m.status === 'completed'
  );
}

async function updateCourierStatsOnComplete(mission) {
  const row = await sbGet(profileRowId(mission.courierUserId));
  const prof = row?.data || { stats: {} };
  const s = prof.stats || {};
  s.totalCompleted = (s.totalCompleted || 0) + 1;
  const stops = missionStops(mission);
  let pu = 0;
  let de = 0;
  stops.forEach((st) => {
    if (st.type === 'delivery') de += 1;
    else pu += 1;
  });
  if (!pu && !de) {
    if (mission.type === 'pickup') pu = 1;
    else de = 1;
  }
  s.pickups = (s.pickups || 0) + pu;
  s.deliveries = (s.deliveries || 0) + de;
  const mk = monthKey(mission.completedAt);
  if (!s.byMonth) s.byMonth = {};
  if (!s.byMonth[mk]) s.byMonth[mk] = { total: 0, pickup: 0, delivery: 0 };
  s.byMonth[mk].total += 1;
  s.byMonth[mk].pickup += pu;
  s.byMonth[mk].delivery += de;
  if (!s.byLab) s.byLab = {};
  const labKey = mission.labUserId || mission.labName || 'unknown';
  s.byLab[labKey] = (s.byLab[labKey] || 0) + 1;
  if (!s.byLabNames) s.byLabNames = {};
  if (mission.labName) s.byLabNames[labKey] = mission.labName;
  if (!s.byMonthByLab) s.byMonthByLab = {};
  if (!s.byMonthByLab[labKey]) s.byMonthByLab[labKey] = {};
  if (!s.byMonthByLab[labKey][mk]) s.byMonthByLab[labKey][mk] = { courses: 0, pickup: 0, delivery: 0 };
  s.byMonthByLab[labKey][mk].courses += 1;
  s.byMonthByLab[labKey][mk].pickup += pu;
  s.byMonthByLab[labKey][mk].delivery += de;
  if (mission.acceptedAt && mission.createdAt) {
    const mins = (new Date(mission.acceptedAt) - new Date(mission.createdAt)) / 60000;
    if (mins >= 0 && mins < 24 * 60) {
      s.acceptSamples = (s.acceptSamples || []).slice(-99);
      s.acceptSamples.push(Math.round(mins));
      s.avgAcceptMin =
        Math.round(s.acceptSamples.reduce((a, b) => a + b, 0) / s.acceptSamples.length) || 0;
    }
  }
  prof.stats = s;
  await sbUpsert(profileRowId(mission.courierUserId), prof);
}

exports.handler = async (event) => {
  const headers = buildCors(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!SERVICE_KEY()) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Service non configuré' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const action = body.action;
  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Non authentifié' }) };
  }

  try {
    if (action === 'getProfile') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const row = await sbGet(profileRowId(user.id));
      const prof = row?.data || {};
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          profile: {
            displayName: prof.displayName || user.user_metadata?.display_name || '',
            phone: prof.phone || '',
            email: user.email,
            recoveryEmail: prof.recoveryEmail || '',
            emergencyContactName: prof.emergencyContactName || '',
            emergencyContactPhone: prof.emergencyContactPhone || '',
            availabilityStatus: prof.availabilityStatus || 'active',
            workingDays: prof.workingDays || '',
            workingHours: prof.workingHours || '',
            vacationUntil: prof.vacationUntil || '',
            homeAddress: prof.homeAddress || '',
            serviceZones: prof.serviceZones || '',
            radiusKm: typeof prof.radiusKm === 'number' && prof.radiusKm >= 0 ? prof.radiusKm : null,
            acceptPickup: prof.acceptPickup !== false,
            acceptDelivery: prof.acceptDelivery !== false,
            acceptMultiStop: prof.acceptMultiStop !== false,
            missionNotes: prof.missionNotes || '',
            preferredNavApp: prof.preferredNavApp || 'google_maps',
            notifyNewMission: prof.notifyNewMission !== false,
            notifyMissionChanged: prof.notifyMissionChanged !== false,
            notifyMissionCancelled: prof.notifyMissionCancelled !== false,
            compactMode: !!prof.compactMode,
            billingCompany: prof.billingCompany || '',
            billingSiret: prof.billingSiret || '',
            billingAddress: prof.billingAddress || '',
            billingIban: prof.billingIban || '',
            billingPaymentNote: prof.billingPaymentNote || '',
            docPermit: !!prof.docPermit,
            docInsurance: !!prof.docInsurance,
            docVehicleRegistration: !!prof.docVehicleRegistration,
            docIdentity: !!prof.docIdentity,
            docNotes: prof.docNotes || '',
            stats: prof.stats || {},
            billingRatePerCourse:
              typeof prof.billingRatePerCourse === 'number' && prof.billingRatePerCourse >= 0
                ? prof.billingRatePerCourse
                : null,
            billingRatePerExtraStop:
              typeof prof.billingRatePerExtraStop === 'number' && prof.billingRatePerExtraStop >= 0
                ? prof.billingRatePerExtraStop
                : null,
          },
        }),
      };
    }

    if (action === 'saveProfile') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const row = await sbGet(profileRowId(user.id));
      const prof = row?.data || { stats: {} };
      prof.displayName = cleanText(body.displayName || prof.displayName || '', 120);
      prof.phone = cleanText(body.phone, 40);
      prof.recoveryEmail = cleanText(body.recoveryEmail, 160);
      prof.emergencyContactName = cleanText(body.emergencyContactName, 120);
      prof.emergencyContactPhone = cleanText(body.emergencyContactPhone, 40);
      prof.availabilityStatus = cleanSelect(body.availabilityStatus, ['active', 'paused', 'inactive'], 'active');
      prof.workingDays = cleanText(body.workingDays, 160);
      prof.workingHours = cleanText(body.workingHours, 120);
      prof.vacationUntil = cleanText(body.vacationUntil, 20);
      prof.homeAddress = cleanText(body.homeAddress, 300);
      prof.serviceZones = cleanText(body.serviceZones, 600);
      prof.radiusKm = cleanNonNegativeNumber(body.radiusKm);
      prof.acceptPickup = cleanBool(body.acceptPickup, true);
      prof.acceptDelivery = cleanBool(body.acceptDelivery, true);
      prof.acceptMultiStop = cleanBool(body.acceptMultiStop, true);
      prof.missionNotes = cleanText(body.missionNotes, 600);
      prof.preferredNavApp = cleanSelect(body.preferredNavApp, ['google_maps', 'waze', 'apple_maps', 'other'], 'google_maps');
      prof.notifyNewMission = cleanBool(body.notifyNewMission, true);
      prof.notifyMissionChanged = cleanBool(body.notifyMissionChanged, true);
      prof.notifyMissionCancelled = cleanBool(body.notifyMissionCancelled, true);
      prof.compactMode = cleanBool(body.compactMode, false);
      prof.billingCompany = cleanText(body.billingCompany, 160);
      prof.billingSiret = cleanText(body.billingSiret, 40);
      prof.billingAddress = cleanText(body.billingAddress, 500);
      prof.billingIban = cleanText(body.billingIban, 80);
      prof.billingPaymentNote = cleanText(body.billingPaymentNote, 500);
      prof.docPermit = cleanBool(body.docPermit, false);
      prof.docInsurance = cleanBool(body.docInsurance, false);
      prof.docVehicleRegistration = cleanBool(body.docVehicleRegistration, false);
      prof.docIdentity = cleanBool(body.docIdentity, false);
      prof.docNotes = cleanText(body.docNotes, 500);
      if (body.billingRatePerCourse !== undefined && body.billingRatePerCourse !== null && body.billingRatePerCourse !== '') {
        prof.billingRatePerCourse = parseBillingRate(body.billingRatePerCourse);
      }
      if (
        body.billingRatePerExtraStop !== undefined &&
        body.billingRatePerExtraStop !== null &&
        body.billingRatePerExtraStop !== ''
      ) {
        prof.billingRatePerExtraStop = parseBillingRate(body.billingRatePerExtraStop);
      }
      prof.updatedAt = new Date().toISOString();
      await sbUpsert(profileRowId(user.id), prof);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'listLinkedCouriers') {
      if (!(await requireLabUser(user))) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte laboratoire requis' }) };
      }
      const links = await getLabLinks(user.id);
      const couriers = await Promise.all(
        links.map(async (link) => {
          const profRow = await sbGet(profileRowId(link.courierUserId));
          const profile = publicCourierProfile(profRow?.data || {});
          return {
            ...link,
            displayName: profile.displayName || link.displayName,
            phone: profile.phone || link.phone || '',
            profile,
          };
        })
      );
      return { statusCode: 200, headers, body: JSON.stringify({ couriers }) };
    }

    if (action === 'listLinkedLabs') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      let labs = await getCourierLabs(user.id);
      if (!labs.length) labs = await repairCourierLabsForCourier(user.id);
      return { statusCode: 200, headers, body: JSON.stringify({ labs }) };
    }

    if (action === 'linkCourier') {
      if (!(await requireLabUser(user))) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte laboratoire requis' }) };
      }
      const email = String(body.email || '').trim().toLowerCase();
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email requis' }) };
      }
      let found;
      try {
        found = await findUserByEmail(email);
      } catch (lookupErr) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({ error: lookupErr.message || 'Recherche du compte coursier impossible.' }),
        };
      }
      if (!found) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error:
              'Aucun compte trouvé avec cet email. Le coursier doit créer son compte sur labosync.app/courier (pas sur l\'app laboratoire), avec exactement la même adresse email, puis vous pourrez l\'ajouter ici.',
          }),
        };
      }
      if (found.id === user.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Vous ne pouvez pas vous ajouter vous-même. Utilisez l\'email du compte coursier (inscrit sur labosync.app/courier).',
          }),
        };
      }
      if (isLab(found)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error:
              'Cet email est déjà un compte laboratoire. Le coursier doit s\'inscrire sur labosync.app/courier avec une autre adresse email (ou un email dédié coursier).',
          }),
        };
      }
      const courierUser = (await ensureCourierAccount(found)) || found;
      if (!isCourier(courierUser) && !courierUser.user_metadata?.courier_name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error:
              'Ce compte n\'est pas un profil coursier. Demandez au coursier de créer un compte sur labosync.app/courier (bouton « Créer un compte coursier »).',
          }),
        };
      }
      const linksRow = await sbGet(linksRowId(user.id));
      const links = linksRow?.data?.links || [];
      const linkedId = courierUser.id;
      if (links.some((l) => l.courierUserId === linkedId)) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, already: true }) };
      }
      const displayName =
        courierUser.user_metadata?.display_name ||
        courierUser.user_metadata?.courier_name ||
        courierUser.email?.split('@')[0] ||
        'Coursier';
      links.push({
        courierUserId: linkedId,
        email: courierUser.email,
        displayName,
        status: 'active',
        linkedAt: new Date().toISOString(),
      });
      await sbUpsert(linksRowId(user.id), { links, labUserId: user.id });
      await ensureCourierLabLink(user.id, linkedId, labNameFrom(user));

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, courier: { courierUserId: linkedId, email: courierUser.email, displayName } }) };
    }

    if (action === 'unlinkCourier') {
      if (!(await requireLabUser(user))) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte laboratoire requis' }) };
      }
      const courierUserId = String(body.courierUserId || '');
      const linksRow = await sbGet(linksRowId(user.id));
      const links = (linksRow?.data?.links || []).filter((l) => l.courierUserId !== courierUserId);
      await sbUpsert(linksRowId(user.id), { links });
      const labsRow = await sbGet(labsRowId(courierUserId));
      const labs = (labsRow?.data?.labs || []).filter((l) => l.labUserId !== user.id);
      await sbUpsert(labsRowId(courierUserId), { labs });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'createMission') {
      if (!(await requireLabUser(user))) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte laboratoire requis' }) };
      }
      const courierUserId = String(body.courierUserId || '');
      if (!courierUserId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Coursier requis' }) };
      }
      if (!(await isCourierLinked(user.id, courierUserId))) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Coursier non rattaché à ce laboratoire' }) };
      }
      const stops = parseStopsFromBody(body);
      if (!stops.length) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Au moins un arrêt (dentiste) est requis' }) };
      }
      const mission = {
        id: genMissionId(),
        status: 'offered',
        labUserId: user.id,
        labName: labNameFrom(user),
        courierUserId,
        notes: String(body.notes || '').slice(0, 500),
        createdAt: new Date().toISOString(),
        offeredAt: new Date().toISOString(),
      };
      applyLegacyMissionFields(mission, stops);
      await saveMission(mission);
      await ensureCourierLabLink(user.id, courierUserId, mission.labName);
      await bumpInbox(courierUserId, mission.id, mission);
      await bumpBoard(user.id);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mission }) };
    }

    if (action === 'listMissions') {
      const scope = body.scope || 'all';
      const limit = Math.min(parseInt(body.limit, 10) || 120, 200);
      const role = await resolveMissionRole(user);

      if (role === 'courier') {
        let missions = await fetchCourierMissions(user.id);
        missions = filterMissionsByScope(missions, scope).slice(0, limit);
        return { statusCode: 200, headers, body: JSON.stringify({ missions }) };
      }

      if (role === 'lab') {
        const row = await sbGet(labIdxId(user.id));
        let missions = (row?.data?.missions || []).sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        missions = filterMissionsByScope(missions, scope).slice(0, limit);
        return { statusCode: 200, headers, body: JSON.stringify({ missions }) };
      }

      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Accès refusé' }) };
    }

    if (action === 'acceptMission') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const mission = await loadMission(body.missionId);
      if (!mission) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mission introuvable' }) };
      }
      if (mission.courierUserId !== user.id) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Mission assignée à un autre coursier' }) };
      }
      if (mission.status !== 'offered') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mission déjà traitée' }) };
      }
      mission.status = 'accepted';
      mission.acceptedAt = new Date().toISOString();
      normalizeMissionStops(mission);
      mission.stops.forEach((s) => {
        s.status = 'pending';
        s.completedAt = null;
      });
      await saveMission(mission);
      await bumpInbox(mission.courierUserId, mission.id, mission);
      await bumpBoard(mission.labUserId);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mission }) };
    }

    if (action === 'declineMission') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const mission = await loadMission(body.missionId);
      if (!mission || mission.courierUserId !== user.id) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mission introuvable' }) };
      }
      if (mission.status !== 'offered') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mission non déclinable' }) };
      }
      mission.status = 'declined';
      mission.declinedAt = new Date().toISOString();
      await saveMission(mission);
      await bumpInbox(mission.courierUserId, mission.id, mission);
      await bumpBoard(mission.labUserId);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mission }) };
    }

    if (action === 'completeStop') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const mission = await loadMission(body.missionId);
      if (!mission || mission.courierUserId !== user.id) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mission introuvable' }) };
      }
      if (!['accepted', 'en_route'].includes(mission.status)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Acceptez la course avant de valider un arrêt' }) };
      }
      const stops = normalizeMissionStops(mission);
      const stopId = String(body.stopId || '');
      const stopIdx = parseInt(body.stopIndex, 10);
      const stop = stops.find((s) => s.id === stopId) || (Number.isFinite(stopIdx) ? stops[stopIdx] : null);
      if (!stop) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Arrêt introuvable' }) };
      }
      if (stop.status === 'done') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Arrêt déjà validé' }) };
      }
      if (mission.status === 'accepted') {
        mission.status = 'en_route';
        mission.enRouteAt = mission.enRouteAt || new Date().toISOString();
      }
      stop.status = 'done';
      stop.completedAt = new Date().toISOString();
      const prog = stopsProgress(stops);
      if (prog.done >= prog.total && prog.total > 0) {
        mission.status = 'completed';
        mission.completedAt = new Date().toISOString();
        await updateCourierStatsOnComplete(mission);
      }
      await saveMission(mission);
      await bumpInbox(mission.courierUserId, mission.id, mission);
      await bumpBoard(mission.labUserId);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mission, progress: prog }) };
    }

    if (action === 'setMissionStatus') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const mission = await loadMission(body.missionId);
      if (!mission || mission.courierUserId !== user.id) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mission introuvable' }) };
      }
      const next = body.status;
      if (next === 'en_route') {
        if (!['accepted', 'en_route'].includes(mission.status)) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Étape invalide' }) };
        }
        mission.status = 'en_route';
        mission.enRouteAt = new Date().toISOString();
      } else if (next === 'completed') {
        if (!['accepted', 'en_route'].includes(mission.status)) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Étape invalide' }) };
        }
        normalizeMissionStops(mission);
        mission.stops.forEach((s) => {
          s.status = 'done';
          s.completedAt = s.completedAt || new Date().toISOString();
        });
        mission.status = 'completed';
        mission.completedAt = new Date().toISOString();
        await updateCourierStatsOnComplete(mission);
      } else {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Statut invalide' }) };
      }
      await saveMission(mission);
      await bumpInbox(mission.courierUserId, mission.id, mission);
      await bumpBoard(mission.labUserId);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mission }) };
    }

    if (action === 'cancelMission') {
      if (!(await requireLabUser(user))) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte laboratoire requis' }) };
      }
      const mission = await loadMission(body.missionId);
      if (!mission || mission.labUserId !== user.id) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mission introuvable' }) };
      }
      if (['completed', 'cancelled'].includes(mission.status)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mission déjà terminée' }) };
      }
      mission.status = 'cancelled';
      mission.cancelledAt = new Date().toISOString();
      await saveMission(mission);
      await bumpInbox(mission.courierUserId, mission.id, mission);
      await bumpBoard(mission.labUserId);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mission }) };
    }

    if (action === 'getStats') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const row = await sbGet(profileRowId(user.id));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ stats: row?.data?.stats || {} }),
      };
    }

    if (action === 'getBillingSummary') {
      if ((await resolveMissionRole(user)) !== 'courier') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte coursier requis' }) };
      }
      const period = resolveBillingPeriod(body);
      const missions = await fetchCourierMissions(user.id);
      const summary = buildBillingSummary(missions, period);
      const row = await sbGet(profileRowId(user.id));
      applyBillingRatesToSummary(summary, readCourierBillingRates(row?.data || {}));
      summary.courierName =
        row?.data?.displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Coursier';
      return { statusCode: 200, headers, body: JSON.stringify({ summary }) };
    }

    if (action === 'getCourierBillingForLab') {
      if (!(await requireLabUser(user))) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Compte laboratoire requis' }) };
      }
      const courierUserId = String(body.courierUserId || '');
      if (!courierUserId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Coursier requis' }) };
      }
      const links = await getLabLinks(user.id);
      const link = links.find((l) => l.courierUserId === courierUserId);
      if (!link) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Coursier non rattaché' }) };
      }
      const period = resolveBillingPeriod(body);
      const missions = await fetchLabCompletedMissionsForCourier(user.id, courierUserId);
      const summary = buildBillingSummary(missions, period);
      const profRow = await sbGet(profileRowId(courierUserId));
      applyBillingRatesToSummary(summary, readCourierBillingRates(profRow?.data || {}));
      summary.courier = {
        courierUserId,
        displayName: link.displayName,
        email: link.email,
      };
      return { statusCode: 200, headers, body: JSON.stringify({ summary }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Action inconnue' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Erreur serveur' }),
    };
  }
};
