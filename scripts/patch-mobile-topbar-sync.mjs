import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');
const tag = 'di' + 'v';

if (!t.includes('topbar-lab-logo')) {
  t = t.replace(
    '.topbar-sync{font-size:.65rem;color:var(--ink-soft);}',
    `.topbar-brand-block{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}
.topbar-lab-logo{width:36px;height:36px;border-radius:10px;object-fit:contain;background:#fff;border:1px solid var(--border);flex-shrink:0;}
.topbar-title-wrap{min-width:0;}
.topbar-brand{font-weight:800;font-size:.92rem;color:var(--ink);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.topbar-brand span{color:var(--accent);}
.sync-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:transparent;}
.sync-dot--ok{background:var(--green);}
.sync-dot--busy{background:var(--orange);animation:pulse-sync 1s ease infinite;}
.sync-dot--err{background:var(--red);}
@keyframes pulse-sync{50%{opacity:.35}}
#sync-status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.topbar-sync{font-size:.65rem;color:var(--ink-soft);}`
  );

  t = t.replace(
    `<${tag} class="topbar">\n    <${tag} class="topbar-brand">Labo<span>sync</span> <span id="mob-workspace-badge"`,
    `<${tag} class="topbar">
    <${tag} class="topbar-brand-block">
      <img id="mob-lab-logo" class="topbar-lab-logo" alt="" style="display:none;"/>
      <${tag} class="topbar-title-wrap">
        <${tag} class="topbar-brand" id="mob-topbar-title">Labo<span>sync</span></${tag}>
        <span id="mob-workspace-badge"`
  );

  t = t.replace(
    'style="display:none;">Administratif</span></div>\n    <motion class="topbar-sync"',
    `style="display:none;">Administratif</span>
      </${tag}>
    </${tag}>
    <span id="sync-dot" class="sync-dot" role="status" aria-label=""></span>
    <${tag} class="topbar-sync"`
  );
}

if (!t.includes('mob-pin-forgot')) {
  t = t.replace(
    '<button type="button" class="btn btn-secondary" id="mob-admin-pin-cancel"',
    `<p style="margin:12px 0 0;text-align:center;"><button type="button" id="mob-pin-forgot" style="background:none;border:none;color:var(--accent);font-size:.78rem;font-weight:600;cursor:pointer;text-decoration:underline;">Code oublié ?</button></p>
    <${tag} id="mob-pin-recover" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
      <p style="font-size:.78rem;color:var(--ink-soft);margin-bottom:10px;line-height:1.45;">Confirmez avec le <strong>mot de passe Labosync</strong> du compte, puis choisissez un nouveau code.</p>
      <${tag} class="field"><label for="mob-pin-recover-password">Mot de passe du compte</label><input type="password" id="mob-pin-recover-password" autocomplete="current-password"/></${tag}>
      <${tag} class="field"><label for="mob-pin-recover-new">Nouveau code (4 à 8 chiffres)</label><input type="password" id="mob-pin-recover-new" inputmode="numeric" maxlength="8"/></${tag}>
      <button type="button" class="btn btn-primary" id="mob-pin-recover-ok">Réinitialiser le code</button>
    </${tag}>
    <button type="button" class="btn btn-secondary" id="mob-admin-pin-cancel"`
  );
}

fs.writeFileSync(p, t);
console.log('patch-mobile-topbar-sync ok');
