const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {
  laboDataGet,
  verifySupabaseUser,
  verifyPortalToken,
  labOwnsPortal,
} = require('./_labosync-auth');

const ALLOWED_EXT = new Set(['stl', 'obj', 'ply', 'zip', 'pdf', '3mf', '7z', 'rar']);
const CHAT_ALLOWED_EXT = new Set([
  ...ALLOWED_EXT,
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
]);

function r2Config() {
  const accountId = (process.env.R2_ACCOUNT_ID || '').trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
  const bucket = (process.env.R2_BUCKET_NAME || '').trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  const endpoint =
    (process.env.R2_ENDPOINT || '').trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;
  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}

function maxFileBytes() {
  const n = parseInt(process.env.R2_MAX_FILE_BYTES || '', 10);
  return Number.isFinite(n) && n > 0 ? n : 150 * 1024 * 1024;
}

function maxChatFileBytes() {
  const n = parseInt(process.env.R2_CHAT_MAX_FILE_BYTES || '', 10);
  return Number.isFinite(n) && n > 0 ? n : 50 * 1024 * 1024;
}

function getPortalToken(event) {
  const hdr = event.headers || {};
  const lower = {};
  Object.keys(hdr).forEach((k) => {
    lower[String(k).toLowerCase()] = hdr[k];
  });
  return lower['x-portal-token'] || '';
}

function safeFileName(name) {
  const base = String(name || 'fichier')
    .replace(/[/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120);
  return base || 'fichier';
}

function buildObjectKey(labUserId, portalId, caseId, stepId, fileName) {
  const uid = String(labUserId || '').trim();
  const pid = String(portalId || '')
    .trim()
    .toLowerCase();
  const cid = String(caseId || '').trim();
  const sid = String(stepId || '').trim();
  const fn = safeFileName(fileName);
  return `labs/${uid}/portal/${pid}/case/${cid}/step/${sid}/${Date.now()}_${fn}`;
}

function buildChatObjectKey(labUserId, portalId, fileName) {
  const uid = String(labUserId || '').trim();
  const pid = String(portalId || '')
    .trim()
    .toLowerCase();
  const fn = safeFileName(fileName);
  return `labs/${uid}/portal/${pid}/chat/${Date.now()}_${fn}`;
}

function parseObjectKey(key) {
  const raw = String(key || '');
  const chat = raw.match(/^labs\/([^/]+)\/portal\/([^/]+)\/chat\/(.+)$/);
  if (chat) {
    return {
      kind: 'chat',
      labUserId: chat[1],
      portalId: chat[2],
      fileName: chat[3],
    };
  }
  const m = raw.match(/^labs\/([^/]+)\/portal\/([^/]+)\/case\/([^/]+)\/step\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return {
    kind: 'case',
    labUserId: m[1],
    portalId: m[2],
    caseId: m[3],
    stepId: m[4],
    fileName: m[5],
  };
}

function getS3(cfg) {
  return new S3Client({
    region: 'auto',
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

async function resolveLabUserIdForPortal(portalId) {
  const row = await laboDataGet(`portal_${portalId}`);
  if (row && row.data && row.data.labUserId) return String(row.data.labUserId).trim();
  const orders = await laboDataGet(`orders_${portalId}`);
  if (orders && orders.data && orders.data.labUserId) {
    return String(orders.data.labUserId).trim();
  }
  return null;
}

async function authorizeAccess(event, portalId, labUserIdFromKey) {
  const pid = String(portalId || '')
    .trim()
    .toLowerCase();
  if (!pid) return { ok: false, error: 'portalId manquant' };

  const portalToken = getPortalToken(event);
  if (portalToken) {
    const payload = verifyPortalToken(portalToken);
    if (payload && String(payload.portalId).toLowerCase() === pid) {
      const labUserId = await resolveLabUserIdForPortal(pid);
      if (!labUserId) return { ok: false, error: 'Laboratoire introuvable pour ce portail' };
      if (labUserIdFromKey && labUserIdFromKey !== labUserId) {
        return { ok: false, error: 'Chemin fichier invalide' };
      }
      return { ok: true, role: 'cabinet', portalId: pid, labUserId };
    }
    return { ok: false, error: 'Session cabinet expirée' };
  }

  const user = await verifySupabaseUser(event);
  if (!user || !user.id) return { ok: false, error: 'Connexion labo requise' };
  const owns = await labOwnsPortal(user.id, pid);
  if (!owns) return { ok: false, error: 'Accès portail refusé' };
  if (labUserIdFromKey && labUserIdFromKey !== user.id) {
    return { ok: false, error: 'Chemin fichier invalide' };
  }
  return { ok: true, role: 'lab', portalId: pid, labUserId: user.id };
}

async function presignUpload(cfg, key, contentType) {
  const client = getS3(cfg);
  const cmd = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  });
  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 900 });
  return uploadUrl;
}

async function presignDownload(cfg, key) {
  const client = getS3(cfg);
  const cmd = new GetObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
  });
  return getSignedUrl(client, cmd, { expiresIn: 3600 });
}

module.exports = {
  ALLOWED_EXT,
  CHAT_ALLOWED_EXT,
  r2Config,
  maxFileBytes,
  maxChatFileBytes,
  buildObjectKey,
  buildChatObjectKey,
  parseObjectKey,
  safeFileName,
  authorizeAccess,
  resolveLabUserIdForPortal,
  presignUpload,
  presignDownload,
};
