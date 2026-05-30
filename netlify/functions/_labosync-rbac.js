const VALID_ROLES = ['admin', 'production', 'billing', 'support'];

const ROLE_PERMS = {
  admin: ['*'],
  production: [
    'workspace:prog',
    'pane:dashboard',
    'pane:saisie',
    'pane:calendrier',
    'pane:historique',
    'pane:stats',
    'pane:attente',
    'pane:impression',
    'pane:messages',
    'pane:cabinets',
    'pane:coursiers',
  ],
  billing: [
    'workspace:admin',
    'pane:dashboard',
    'pane:saisie',
    'pane:cabinets',
    'pane:livraisons',
    'pane:facturation',
    'pane:historique',
    'pane:stats',
    'pane:messages',
    'action:billing_generate',
    'action:billing_credit',
    'action:billing_email',
    'action:data_import',
  ],
  support: ['workspace:admin', 'pane:dashboard', 'pane:cabinets', 'pane:livraisons', 'pane:historique', 'pane:messages'],
};

function normalizeRole(raw) {
  const r = String(raw || '').trim().toLowerCase();
  return VALID_ROLES.includes(r) ? r : 'admin';
}

function resolveLabRole(user) {
  const meta = (user && user.user_metadata) || {};
  return normalizeRole(meta.lab_role || meta.account_role || 'admin');
}

function hasPerm(role, key) {
  const perms = ROLE_PERMS[normalizeRole(role)] || ROLE_PERMS.admin;
  return perms.includes('*') || perms.includes(key);
}

function requireLabPerm(user, key) {
  const role = resolveLabRole(user);
  if (hasPerm(role, key)) return { ok: true, role };
  return {
    ok: false,
    role,
    error: 'Accès refusé pour votre rôle (' + role + ').',
    code: 'FORBIDDEN_ROLE',
  };
}

function canManageRoles(user) {
  return resolveLabRole(user) === 'admin';
}

module.exports = {
  VALID_ROLES,
  ROLE_PERMS,
  normalizeRole,
  resolveLabRole,
  hasPerm,
  requireLabPerm,
  canManageRoles,
};
