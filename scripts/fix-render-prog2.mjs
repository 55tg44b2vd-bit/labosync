import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'lab-workspace-mobile.js');
let t = fs.readFileSync(p, 'utf8');

const good = `  function renderProgQueue() {
    var el = document.getElementById('mob-prog-queue');
    var cnt = document.getElementById('mob-prog-queue-cnt');
    if (!el) return;
    var list = (global.queue || []).slice();
    global.jobs.forEach(function (j) {
      if ((!j.tasks || !j.tasks.length) && j.needsProg) {
        list.push({
          id: 'job_' + j.id,
          jobId: j.id,
          patient: j.patient,
          type: j.type,
          nb: j.nb,
          items: j.items,
          note: j.note,
          cabinet: j.cabinet,
          urgent: j.urgent,
          createdAt: j.createdAt,
          fromJob: true,
        });
      }
    });
    if (cnt) cnt.textContent = list.length ? '(' + list.length + ')' : '';
    if (!list.length) {
      el.innerHTML =
        '<${'di'+'v'} class="empty" style="padding:40px 16px;text-align:center;"><${'di'+'v'} class="empty-icon" style="font-size:2rem;margin-bottom:8px;">✅</${'di'+'v'}><p style="font-size:.92rem;font-weight:600;">Rien à programmer</p><p style="font-size:.78rem;margin-top:8px;line-height:1.45;color:var(--ink-soft);">Créez un travail depuis l’accueil ou l’onglet Travaux.</p></${'di'+'v'}>';
      return;
    }
    el.innerHTML = list
      .map(function (q) {
        var cab = q.cabinet ? global.cabinets.find(function (c) { return c.id === q.cabinet; }) : null;
        return (
          '<article class="mcard" style="margin-bottom:10px;border-left:4px solid var(--accent);">' +
          '<${'di'+'v'} style="font-weight:700;font-size:.95rem;margin-bottom:4px;">' +
          (typeof global.esc === 'function' ? global.esc(q.patient) : q.patient) +
          '</${'di'+'v'}>' +
          '<${'di'+'v'} style="font-size:.78rem;color:var(--ink-soft);margin-bottom:10px;">' +
          (cab ? cab.name : 'Sans cabinet') +
          ' · ' +
          (typeof global.getJobTypeLabel === 'function' ? global.getJobTypeLabel(q) : q.type) +
          '</${'di'+'v'}>' +
          '<button type="button" class="btn btn-primary" data-prog-id="' +
          q.id +
          '" style="min-height:48px;">▶ Planifier en un geste</button>' +
          '</article>'
        );
      })
      .join('');
    el.querySelectorAll('[data-prog-id]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        programQueueItemMobile(btn.getAttribute('data-prog-id'));
        if (typeof global.saveData === 'function') await global.saveData();
        renderProgQueue();
        if (typeof global.renderAll === 'function') global.renderAll();
        mobToast('✅ Travail planifié', 'var(--green)');
      });
    });
  }`;

const fixed = good.replace(/\$\{'di'\+'v'\}/g, 'motion').replace(/<\/?motion>/g, (m) => {
  const tag = 'di' + 'v';
  return m.startsWith('</') ? `</${tag}>` : `<${tag}`;
});

t = t.replace(/  function renderProgQueue\(\) \{[\s\S]*?^  \}/m, fixed);
fs.writeFileSync(p, t);
console.log('ok', /motion/.test(t) ? 'WARN motion left' : 'clean');
