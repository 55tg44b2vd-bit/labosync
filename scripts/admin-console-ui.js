/* Labosync — Console admin & support plateforme (/admin) */
(function () {
  'use strict';

  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SB_KEY = 'sb_publishable_vUJCiePex3KYK5CS3SezGw_60mzxHa8';
  const SECRET_KEY = 'lb_admin_console_secret';

  const ALERT_LABELS = {
    blocked: 'Bloqué',
    past_due: 'Impayé',
    checkout: 'Checkout',
    trial_expiring: 'Essai <7j',
    trial_expired: 'Essai expiré',
    access_expired: 'Accès expiré',
    inactive: 'Inactif 30j+',
    email_unconfirmed: 'Email non confirmé',
  };

  const NOTE_TEMPLATES = [
    'Essai prolongé — client contacté par email.',
    'Problème synchro cloud — résolu.',
    'Relance paiement Stripe envoyée.',
    'Compte démo — suivi commercial.',
    'Bug signalé — en cours d’investigation.',
  ];

  let sb = null;
  let accessToken = null;
  let adminEmail = null;
  let overviewData = null;
  let selectedUserId = null;
  let requiresSecret = false;
  let activeTab = 'accounts';
  let statPreset = '';
  let auditsLoaded = false;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return iso;
    }
  }

  function fmtDateInput(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toISOString().slice(0, 10);
    } catch (_) {
      return '';
    }
  }

  function statusLabel(sub) {
    if (!sub) return { text: 'Aucun abo', cls: 'st-none' };
    if (sub.blocked) return { text: 'Bloqué', cls: 'st-blocked' };
    const s = sub.status || '';
    const map = {
      active: ['Actif', 'st-active'],
      trialing: ['Essai', 'st-trial'],
      past_due: ['Impayé', 'st-warn'],
      unpaid: ['Impayé', 'st-warn'],
      canceled: ['Annulé', 'st-muted'],
      checkout_pending: ['Checkout', 'st-warn'],
    };
    if (map[s]) return { text: map[s][0], cls: map[s][1] };
    return { text: s || '—', cls: 'st-muted' };
  }

  function alertIcons(alerts) {
    if (!alerts || !alerts.length) return '<span style="color:#cbd5e1;">·</span>';
    return alerts
      .map(function (a) {
        return '<span title="' + esc(ALERT_LABELS[a] || a) + '">⚠</span>';
      })
      .join('');
  }

  function getAdminSecret() {
    try {
      return sessionStorage.getItem(SECRET_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  function setAdminSecret(v) {
    try {
      if (v) sessionStorage.setItem(SECRET_KEY, v);
      else sessionStorage.removeItem(SECRET_KEY);
    } catch (_) {}
  }

  async function adminApi(action, extra) {
    const body = Object.assign({ action: action }, extra || {});
    const secret = getAdminSecret();
    if (secret) body.adminSecret = secret;
    const r = await fetch('/.netlify/functions/admin-console', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
        'X-Admin-Secret': secret,
      },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      const err = new Error(j.error || 'Erreur ' + r.status);
      err.code = j.code;
      throw err;
    }
    return j;
  }

  function copyText(text, label) {
    const t = String(text || '');
    if (!t) return;
    navigator.clipboard
      .writeText(t)
      .then(function () {
        setGlobalMsg((label || 'Copié') + ' dans le presse-papiers.');
      })
      .catch(function () {
        window.prompt('Copier :', t);
      });
  }

  function showLogin() {
    $('login-screen').style.display = 'flex';
    $('app-screen').style.display = 'none';
  }

  function showApp() {
    $('login-screen').style.display = 'none';
    $('app-screen').style.display = 'block';
    if (adminEmail) $('admin-user-label').textContent = adminEmail;
  }

  function setLoginError(msg) {
    const el = $('login-error');
    if (!el) return;
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }

  function setGlobalMsg(msg, isErr) {
    const el = $('global-msg');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isErr ? '#b91c1c' : '#166534';
  }

  async function initSupabase() {
    if (sb) return sb;
    if (typeof supabase === 'undefined' || !supabase.createClient) {
      throw new Error('Supabase non chargé');
    }
    sb = supabase.createClient(SB_URL, SB_KEY);
    return sb;
  }

  async function restoreSession() {
    await initSupabase();
    const { data } = await sb.auth.getSession();
    if (!data || !data.session) return false;
    accessToken = data.session.access_token;
    adminEmail = data.session.user && data.session.user.email;
    try {
      const v = await adminApi('verify');
      requiresSecret = !!v.requiresSecret;
      $('secret-wrap').style.display = requiresSecret ? 'block' : 'none';
      showApp();
      await loadOverview();
      return true;
    } catch (e) {
      await sb.auth.signOut();
      accessToken = null;
      return false;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    const email = ($('login-email') && $('login-email').value.trim()) || '';
    const password = ($('login-password') && $('login-password').value) || '';
    const secret = ($('login-secret') && $('login-secret').value.trim()) || '';
    if (!email || !password) {
      setLoginError('Email et mot de passe requis.');
      return;
    }
    if (secret) setAdminSecret(secret);
    $('btn-login').disabled = true;
    try {
      await initSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
      if (error) throw error;
      accessToken = data.session.access_token;
      adminEmail = data.user.email;
      const v = await adminApi('verify');
      requiresSecret = !!v.requiresSecret;
      if (requiresSecret && !getAdminSecret()) {
        $('secret-wrap').style.display = 'block';
        setLoginError('Code console requis (ADMIN_CONSOLE_SECRET).');
        return;
      }
      showApp();
      await loadOverview();
    } catch (err) {
      setLoginError(err.message || 'Connexion impossible');
      try {
        await sb.auth.signOut();
      } catch (_) {}
    } finally {
      $('btn-login').disabled = false;
    }
  }

  async function handleLogout() {
    try {
      if (sb) await sb.auth.signOut();
    } catch (_) {}
    accessToken = null;
    overviewData = null;
    selectedUserId = null;
    auditsLoaded = false;
    setAdminSecret('');
    showLogin();
  }

  async function loadOverview() {
    setGlobalMsg('Chargement…', false);
    const j = await adminApi('overview');
    overviewData = j.data;
    renderSummary(overviewData.summary);
    renderAllTables();
    setGlobalMsg('');
  }

  function getItems() {
    return (overviewData && overviewData.items) || [];
  }

  function filterItems(opts) {
    const onlyAttention = opts && opts.onlyAttention;
    const q = (($('search-input') && $('search-input').value) || '').trim().toLowerCase();
    const st = ($('filter-status') && $('filter-status').value) || '';
    const preset = statPreset || (($('filter-preset') && $('filter-preset').value) || '');
    return getItems().filter(function (row) {
      const sub = row.subscription || {};
      const email = (row.email || sub.email || '').toLowerCase();
      const id = (row.userId || '').toLowerCase();
      const tags = (row.adminTags || []).join(' ').toLowerCase();
      if (q && email.indexOf(q) < 0 && id.indexOf(q) < 0 && tags.indexOf(q) < 0) return false;
      if (onlyAttention && !row.needsAttention) return false;
      if (st === 'blocked') return !!sub.blocked;
      if (st && (!sub.status || sub.status !== st)) return false;
      if (preset === 'attention') return row.needsAttention;
      if (preset && row.alerts && row.alerts.indexOf(preset) >= 0) return true;
      if (preset && (!row.alerts || row.alerts.indexOf(preset) < 0)) return false;
      return true;
    });
  }

  function renderSummary(s) {
    if (!s) return;
    $('stat-users').textContent = s.usersTotal;
    $('stat-attention').textContent = s.needsAttention != null ? s.needsAttention : '—';
    $('stat-trial-soon').textContent = s.trialExpiring != null ? s.trialExpiring : '—';
    $('stat-active').textContent = s.activeSubs;
    $('stat-trial').textContent = s.trialingSubs;
    $('stat-blocked').textContent = s.blockedUsers;
    $('stat-pastdue').textContent = s.pastDueSubs;
    $('stat-inactive').textContent = s.inactiveUsers != null ? s.inactiveUsers : '—';
    document.querySelectorAll('.stat').forEach(function (el) {
      const p = el.getAttribute('data-preset') || '';
      el.classList.toggle('on', p === statPreset);
    });
  }

  function renderUserRow(row, cols) {
    const sub = row.subscription || {};
    const st = statusLabel(sub);
    const trialEnd = sub.trialEndsAt || sub.trialEnd || '';
    const tags = (row.adminTags || [])
      .map(function (t) {
        return '<span class="tag">' + esc(t) + '</span>';
      })
      .join('');
    const alerts = (row.alerts || [])
      .map(function (a) {
        return '<span class="badge st-warn" style="margin:1px;">' + esc(ALERT_LABELS[a] || a) + '</span>';
      })
      .join(' ');
    if (cols === 'attention') {
      return (
        '<tr data-uid="' +
        esc(row.userId) +
        '" class="user-row' +
        (row.userId === selectedUserId ? ' on' : '') +
        '">' +
        '<td class="alert-dots">' +
        alertIcons(row.alerts) +
        '</td>' +
        '<td><div class="email-cell">' +
        esc(row.email || sub.email || '—') +
        '</div>' +
        tags +
        '<div class="id-cell mono">' +
        esc(row.userId) +
        '</div></td>' +
        '<td>' +
        alerts +
        '</td>' +
        '<td><span class="badge ' +
        st.cls +
        '">' +
        esc(st.text) +
        '</span></td>' +
        '<td><button type="button" class="btn-sm" data-open="' +
        esc(row.userId) +
        '">Ouvrir</button></td>' +
        '</tr>'
      );
    }
    return (
      '<tr data-uid="' +
      esc(row.userId) +
      '" class="user-row' +
      (row.userId === selectedUserId ? ' on' : '') +
      '">' +
      '<td class="alert-dots">' +
      alertIcons(row.alerts) +
      '</td>' +
      '<td><div class="email-cell">' +
      esc(row.email || sub.email || '—') +
      '</div>' +
      tags +
      '<div class="id-cell mono">' +
      esc(row.userId).slice(0, 8) +
      '…</div></td>' +
      '<td><span class="badge ' +
      st.cls +
      '">' +
      esc(st.text) +
      '</span></td>' +
      '<td>' +
      esc(fmtDate(trialEnd)) +
      '</td>' +
      '<td>' +
      esc(fmtDate(row.lastSignInAt)) +
      '</td>' +
      '<td><button type="button" class="btn-sm" data-open="' +
      esc(row.userId) +
      '">Fiche</button></td>' +
      '</tr>'
    );
  }

  function bindTableRows(tbody) {
    if (!tbody) return;
    tbody.querySelectorAll('[data-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openUser(btn.getAttribute('data-open'));
      });
    });
    tbody.querySelectorAll('.user-row').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        openUser(tr.getAttribute('data-uid'));
      });
    });
  }

  function renderTable(tbody, items, mode) {
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Aucun compte</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(function (row) {
      return renderUserRow(row, mode);
    }).join('');
    bindTableRows(tbody);
  }

  function renderAllTables() {
    renderTable($('users-tbody'), filterItems(), 'accounts');
    renderTable($('attention-tbody'), filterItems({ onlyAttention: true }), 'attention');
  }

  async function loadAudits() {
    const el = $('audit-list');
    if (!el) return;
    el.innerHTML = '<p style="padding:20px;color:#64748b;">Chargement…</p>';
    try {
      const j = await adminApi('list_audits', { limit: 80 });
      const items = j.items || [];
      if (!items.length) {
        el.innerHTML = '<p style="padding:20px;color:#64748b;">Aucune action enregistrée.</p>';
        return;
      }
      el.innerHTML = items
        .map(function (it) {
          const uid = it.payload && it.payload.userId;
          return (
            '<div class="audit-item">' +
            '<div class="audit-meta">' +
            esc(fmtDate(it.at)) +
            ' · <strong>' +
            esc(it.action) +
            '</strong> · ' +
            esc(it.actorEmail || '') +
            '</div>' +
            (uid
              ? '<button type="button" class="btn-sm audit-open" data-uid="' +
                esc(uid) +
                '">Compte ' +
                esc(String(uid).slice(0, 8)) +
                '…</button> '
              : '') +
            '<span style="font-size:.78rem;color:#64748b;">' +
            esc(JSON.stringify(it.payload || {}).slice(0, 200)) +
            '</span></div>'
          );
        })
        .join('')
      el.querySelectorAll('.audit-open').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openUser(btn.getAttribute('data-uid'));
        });
      });
      auditsLoaded = true;
    } catch (e) {
      el.innerHTML = '<p style="padding:20px;color:#b91c1c;">' + esc(e.message) + '</p>';
    }
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-tab') === tab);
    });
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.toggle('on', p.id === 'panel-' + tab);
    });
    if (tab === 'activity' && !auditsLoaded) loadAudits();
    if (tab === 'attention') renderAllTables();
  }

  async function openUser(userId) {
    if (!userId) return;
    selectedUserId = userId;
    renderAllTables();
    $('detail-backdrop').classList.add('open');
    $('detail-panel').classList.add('open');
    $('detail-body').innerHTML = '<p style="color:#64748b;">Chargement…</p>';
    try {
      const j = await adminApi('user_detail', { userId: userId });
      renderDetail(j);
    } catch (e) {
      $('detail-body').innerHTML = '<p style="color:#b91c1c;">' + esc(e.message) + '</p>';
    }
  }

  function closeDetail() {
    selectedUserId = null;
    $('detail-panel').classList.remove('open');
    $('detail-backdrop').classList.remove('open');
    renderAllTables();
  }

  function healthItem(ok, label, neutral) {
    if (neutral) {
      return '<div class="health-item" style="background:#fef3c7;color:#92400e;">~ ' + esc(label) + '</div>';
    }
    return '<div class="health-item ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓' : '✗') + ' ' + esc(label) + '</div>';
  }

  function renderDetail(j) {
    const u = j.user || {};
    const sub = j.subscription || {};
    const st = statusLabel(sub);
    const notes = j.adminNotes || [];
    const tags = j.adminTags || [];
    const lab = j.labStats || {};
    const health = j.health || {};
    const connect = j.stripeConnect || {};
    const urls = j.stripeUrls || {};
    const alerts = j.alerts || [];
    const trialVal = fmtDateInput(sub.trialEndsAt || sub.trialEnd);

    $('detail-title').textContent = (u.email || sub.email || 'Compte').split('@')[0];

    let html =
      '<div class="detail-section"><h3>Santé du compte</h3><div class="health-grid">' +
      healthItem(health.emailConfirmed, 'Email confirmé') +
      healthItem(health.hasActiveAccess, 'Accès actif') +
      healthItem(health.hasCloudData, 'Données cloud') +
      healthItem(health.stripeConnectLinked, 'Paiements cabinets (Connect)') +
      (health.stripeSubscriptionLinked
        ? healthItem(true, 'Abo Labosync (client Stripe)')
        : health.stripeSubscriptionExpected
          ? healthItem(false, 'Abo Labosync — essai (pas encore facturé)', true)
          : healthItem(false, 'Abo Labosync — sans client Stripe')) +
      '</div>';
    if (alerts.length) {
      html +=
        '<p style="margin-top:10px;">' +
        alerts
          .map(function (a) {
            return '<span class="badge st-warn">' + esc(ALERT_LABELS[a] || a) + '</span>';
          })
          .join(' ') +
        '</p>';
    }
    html += '</div>';

    html +=
      '<div class="detail-section"><h3>Identité</h3>' +
      '<div class="copy-row"><span>' +
      esc(u.email) +
      '</span> <button type="button" class="btn-sm" data-copy="' +
      esc(u.email) +
      '">Copier email</button></div>' +
      '<div class="copy-row"><code class="mono">' +
      esc(u.id) +
      '</code> <button type="button" class="btn-sm" data-copy="' +
      esc(u.id) +
      '">Copier ID</button></div>' +
      '<p><strong>Inscription</strong> ' +
      esc(fmtDate(u.created_at)) +
      '</p>' +
      '<p><strong>Dernière connexion</strong> ' +
      esc(fmtDate(u.last_sign_in_at)) +
      '</p></div>';

    html +=
      '<div class="detail-section"><h3>Laboratoire (cloud)</h3>' +
      (lab.labName ? '<p><strong>Nom</strong> ' + esc(lab.labName) + '</p>' : '') +
      '<p><strong>Travaux</strong> ' +
      esc(lab.jobs) +
      ' · <strong>Cabinets</strong> ' +
      esc(lab.cabinets) +
      ' · <strong>File</strong> ' +
      esc(lab.queue) +
      ' · <strong>Portails</strong> ' +
      esc(lab.portals) +
      '</p>' +
      '<p><strong>Dernière synchro</strong> ' +
      esc(fmtDate(lab.lastSync)) +
      '</p>';
    if (lab.recentErrors && lab.recentErrors.length) {
      html += '<p style="margin-top:8px;font-weight:600;font-size:.78rem;">Erreurs récentes</p>';
      lab.recentErrors.forEach(function (er) {
        html +=
          '<div class="err-item">' +
          esc(fmtDate(er.at)) +
          ' — ' +
          esc((er.message || '').slice(0, 120)) +
          (er.page ? ' <span style="opacity:.7;">(' + esc(er.page) + ')</span>' : '') +
          '</div>';
      });
    } else {
      html += '<p style="font-size:.78rem;color:#64748b;">Aucune erreur client récente.</p>';
    }
    html += '</div>';

    html +=
      '<div class="detail-section"><h3>Paiements cabinets (Stripe Connect)</h3>' +
      (connect.connected
        ? '<p style="color:#166534;font-weight:600;">✓ Compte connecté</p>' +
          '<p class="mono" style="word-break:break-all;"><strong>acct</strong> ' +
          esc(connect.stripeAccountId) +
          '</p>' +
          (connect.connectedAt
            ? '<p><strong>Connecté le</strong> ' + esc(fmtDate(connect.connectedAt)) + '</p>'
            : '') +
          (connect.livemode != null
            ? '<p><strong>Mode</strong> ' + (connect.livemode ? 'Production' : 'Test') + '</p>'
            : '')
        : '<p style="color:#64748b;">Non connecté — Réglages → Paiements en ligne dans l’app labo.</p>') +
      (urls.connectAccount
        ? '<a class="btn-link" href="' +
          esc(urls.connectAccount) +
          '" target="_blank" rel="noopener">Ouvrir compte Connect dans Stripe ↗</a>'
        : '') +
      '</div>';

    html +=
      '<div class="detail-section"><h3>Abonnement Labosync <span class="badge ' +
      st.cls +
      '">' +
      esc(st.text) +
      '</span></h3>' +
      '<p style="font-size:.78rem;color:#64748b;margin-bottom:8px;">Facturation de l’accès à Labosync (essai / abonnement), distinct des paiements cabinets.</p>' +
      '<p><strong>Fin essai</strong> ' +
      esc(fmtDate(sub.trialEndsAt || sub.trialEnd)) +
      '</p>' +
      '<p><strong>Accès offert</strong> ' +
      esc(fmtDate(sub.grantedAccessUntil)) +
      '</p>' +
      '<p><strong>Plan</strong> ' +
      esc(sub.plan || '—') +
      '</p>' +
      '<p class="mono" style="word-break:break-all;"><strong>Stripe sub</strong> ' +
      esc(sub.stripeSubscriptionId || '—') +
      '</p>' +
      '<p class="mono" style="word-break:break-all;"><strong>Stripe client</strong> ' +
      esc(sub.stripeCustomerId || '—') +
      '</p>';
    if (urls.customer) {
      html +=
        '<a class="btn-link" href="' +
        esc(urls.customer) +
        '" target="_blank" rel="noopener">Ouvrir client Stripe ↗</a><br/>';
    }
    if (urls.subscription) {
      html +=
        '<a class="btn-link" href="' +
        esc(urls.subscription) +
        '" target="_blank" rel="noopener">Ouvrir abonnement Stripe ↗</a>';
    }
    if (sub.blocked) {
      html += '<p style="color:#b91c1c;margin-top:8px;"><strong>Bloqué</strong> ' + esc(sub.blockedReason || '') + '</p>';
    }
    html += '</div>';

    html +=
      '<div class="detail-section"><h3>Tags</h3><div>' +
      (tags.length
        ? tags.map(function (t) {
            return '<span class="tag">' + esc(t) + '</span>';
          }).join('')
        : '<span style="color:#64748b;font-size:.82rem;">Aucun tag</span>') +
      '</div><div class="tags-edit"><input type="text" id="tags-input" placeholder="vip, demo, bug-sync…" value="' +
      esc(tags.join(', ')) +
      '"/><button type="button" class="btn-sm" id="btn-save-tags">Enregistrer tags</button></div></div>';

    html +=
      '<div class="detail-section"><h3>Support — accès &amp; auth</h3><div class="action-grid">' +
      '<label style="font-size:.78rem;color:#64748b;">Prolonger essai jusqu’au</label>' +
      '<input type="date" id="trial-until-input" value="' +
      esc(trialVal) +
      '" style="padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;"/>' +
      '<button type="button" class="btn btn-a" data-act="set_trial_until">Appliquer fin d’essai</button>' +
      '<button type="button" class="btn btn-b" data-act="grant_month">+ 30 jours offerts</button>' +
      '<button type="button" class="btn btn-b" data-act="grant_days">+ jours personnalisés</button>' +
      '<button type="button" class="btn btn-b" data-act="auth_link" data-link="recovery">Lien réinitialisation MDP</button>' +
      '<button type="button" class="btn btn-b" data-act="auth_link" data-link="signup">Lien confirmation email</button>' +
      '</div></div>';

    html +=
      '<div class="detail-section"><h3>Abonnement — Stripe</h3><div class="action-grid">' +
      '<button type="button" class="btn btn-b" data-act="sync_stripe">Synchroniser Stripe</button>' +
      '<button type="button" class="btn btn-b" data-act="cancel_subscription">Annuler (fin de période)</button>' +
      '<button type="button" class="btn btn-danger" data-act="cancel_subscription_now">Annuler immédiatement</button>' +
      '</div></div>';

    html +=
      '<div class="detail-section"><h3>Modération</h3><div class="action-grid">' +
      '<button type="button" class="btn btn-danger" data-act="set_blocked" data-blocked="1">Bloquer le compte</button>' +
      (sub.blocked
        ? '<button type="button" class="btn btn-a" data-act="set_blocked" data-blocked="0">Débloquer</button>'
        : '') +
      '</div></div>';

    html +=
      '<div class="detail-section"><h3>Notes internes</h3><div class="note-templates">' +
      NOTE_TEMPLATES.map(function (t, i) {
        return '<button type="button" class="note-tpl" data-tpl="' + i + '">' + esc(t.slice(0, 42)) + '…</button>';
      }).join('') +
      '</div><div class="notes-list">' +
      (notes.length
        ? notes
            .map(function (n) {
              return (
                '<div class="note-item"><div class="note-meta">' +
                esc(fmtDate(n.at)) +
                ' · ' +
                esc(n.by || '') +
                '</div><div>' +
                esc(n.text) +
                '</div></div>'
              );
            })
            .join('')
        : '<p style="color:#64748b;font-size:.82rem;">Aucune note</p>') +
      '</div><textarea id="note-input" rows="3" placeholder="Nouvelle note…" style="width:100%;margin-top:8px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;"></textarea>' +
      '<button type="button" class="btn btn-b" id="btn-add-note" style="margin-top:8px;">Ajouter la note</button></div>';

    $('detail-body').innerHTML = html;

    $('detail-body').querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        copyText(btn.getAttribute('data-copy'), 'Copié');
      });
    });

    $('detail-body').querySelectorAll('.note-tpl').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const inp = $('note-input');
        if (inp) inp.value = NOTE_TEMPLATES[parseInt(btn.getAttribute('data-tpl'), 10)] || '';
      });
    });

    const tagsBtn = $('btn-save-tags');
    if (tagsBtn) {
      tagsBtn.addEventListener('click', function () {
        const raw = ($('tags-input') && $('tags-input').value) || '';
        adminApi('set_tags', { userId: u.id, tags: raw.split(',').map(function (t) { return t.trim(); }).filter(Boolean) })
          .then(function () {
            setGlobalMsg('Tags enregistrés.');
            return loadOverview().then(function () { return openUser(u.id); });
          })
          .catch(function (e) { setGlobalMsg(e.message, true); });
      });
    }

    $('detail-body').querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        runAction(btn.getAttribute('data-act'), btn.getAttribute('data-blocked'), btn.getAttribute('data-link'));
      });
    });

    const noteBtn = $('btn-add-note');
    if (noteBtn) {
      noteBtn.addEventListener('click', function () {
        const text = ($('note-input') && $('note-input').value.trim()) || '';
        if (!text) return;
        adminApi('append_note', { userId: u.id, email: u.email, note: text })
          .then(function () {
            openUser(u.id);
            setGlobalMsg('Note enregistrée.');
          })
          .catch(function (e) { setGlobalMsg(e.message, true); });
      });
    }
  }

  function runAction(action, blockedFlag, linkType) {
    if (!selectedUserId) return;
    const extra = { userId: selectedUserId };

    if (action === 'set_blocked') {
      extra.blocked = blockedFlag === '1';
      if (extra.blocked) {
        const reason = window.prompt('Motif du blocage (optionnel) :', '');
        if (reason === null) return;
        extra.reason = reason;
      }
    }
    if (action === 'grant_days') {
      const days = window.prompt('Nombre de jours à offrir :', '14');
      if (days === null) return;
      extra.days = parseInt(days, 10) || 0;
      if (!extra.days) return;
    }
    if (action === 'set_trial_until') {
      const inp = $('trial-until-input');
      const d = inp && inp.value;
      if (!d) {
        setGlobalMsg('Choisissez une date de fin d’essai.', true);
        return;
      }
      extra.trialEndsAt = new Date(d + 'T23:59:59').toISOString();
      if (!window.confirm('Prolonger l’essai jusqu’au ' + d + ' ?')) return;
      return adminApi(action, extra)
        .then(function () {
          setGlobalMsg('Essai mis à jour.');
          auditsLoaded = false;
          return loadOverview().then(function () { return openUser(selectedUserId); });
        })
        .catch(function (e) { setGlobalMsg(e.message, true); });
    }
    if (action === 'auth_link') {
      extra.linkType = linkType || 'recovery';
      return adminApi('auth_link', extra)
        .then(function (j) {
          copyText(j.link, 'Lien ' + (linkType || 'recovery'));
        })
        .catch(function (e) { setGlobalMsg(e.message, true); });
    }
    if (action !== 'auth_link' && !window.confirm('Confirmer : ' + action + ' ?')) return;
    adminApi(action, extra)
      .then(function () {
        setGlobalMsg('Action effectuée.');
        auditsLoaded = false;
        return loadOverview().then(function () { return openUser(selectedUserId); });
      })
      .catch(function (e) { setGlobalMsg(e.message, true); });
  }

  function exportCsv() {
    const items = getItems();
    if (!items.length) {
      setGlobalMsg('Aucune donnée à exporter.', true);
      return;
    }
    const header = ['email', 'userId', 'status', 'blocked', 'trialEnd', 'grantedUntil', 'lastSignIn', 'tags', 'alerts'];
    const lines = [header.join(';')];
    items.forEach(function (row) {
      const sub = row.subscription || {};
      lines.push(
        [
          row.email || sub.email || '',
          row.userId,
          sub.status || '',
          sub.blocked ? '1' : '0',
          sub.trialEndsAt || sub.trialEnd || '',
          sub.grantedAccessUntil || '',
          row.lastSignInAt || '',
          (row.adminTags || []).join('|'),
          (row.alerts || []).join('|'),
        ]
          .map(function (c) {
            return '"' + String(c).replace(/"/g, '""') + '"';
          })
          .join(';'),
      );
    });
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'labosync-comptes-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setGlobalMsg('Export CSV téléchargé.');
  }

  function bindEvents() {
    $('login-form').addEventListener('submit', handleLogin);
    $('btn-logout').addEventListener('click', handleLogout);
    $('btn-refresh').addEventListener('click', function () {
      auditsLoaded = false;
      loadOverview().catch(function (e) { setGlobalMsg(e.message, true); });
    });
    $('btn-export').addEventListener('click', exportCsv);
    $('search-input').addEventListener('input', renderAllTables);
    $('filter-status').addEventListener('change', renderAllTables);
    $('filter-preset').addEventListener('change', function () {
      statPreset = '';
      renderAllTables();
    });
    $('detail-close').addEventListener('click', closeDetail);
    $('detail-backdrop').addEventListener('click', closeDetail);
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-tab'));
      });
    });
    document.querySelectorAll('.stat[data-preset]').forEach(function (el) {
      el.addEventListener('click', function () {
        const p = el.getAttribute('data-preset') || '';
        statPreset = statPreset === p ? '' : p;
        const fp = $('filter-preset');
        if (fp) fp.value = statPreset;
        renderSummary(overviewData && overviewData.summary);
        renderAllTables();
        if (statPreset === 'attention') switchTab('attention');
        else switchTab('accounts');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDetail();
    });
  }

  async function boot() {
    bindEvents();
    const ok = await restoreSession();
    if (!ok) showLogin();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
