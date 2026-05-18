import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'labo-mobile.html');
let t = fs.readFileSync(p, 'utf8');
const tag = 'di' + 'v';

const oldProg = `    <!-- ── PROGRAMMATION ── -->
    <${tag} class="view" id="view-prog">
      <${tag} style="margin-bottom:14px;">
        <${tag} style="font-size:1.05rem;font-weight:700;">File à programmer <span id="mob-prog-queue-cnt" style="color:var(--accent);"></span></${tag}>
        <p style="font-size:.78rem;color:var(--ink-soft);margin-top:4px;line-height:1.45;">Chaque travail créé en <strong>Administratif</strong> apparaît ici. Touchez le bouton pour le planifier en un geste.</p>
      </${tag}>
      <${tag} id="mob-prog-queue"></${tag}>
    </${tag}>`;

const newProg = `    <!-- ── PROGRAMMATION (file rapide) ── -->
    <${tag} class="view" id="view-prog">
      <${tag} style="margin-bottom:14px;">
        <${tag} style="font-size:1.05rem;font-weight:700;">À programmer <span id="mob-prog-queue-cnt" style="color:var(--accent);"></span></${tag}>
        <p style="font-size:.78rem;color:var(--ink-soft);margin-top:4px;line-height:1.45;">Videz la file en un geste. Pour le planning détaillé (techniciens, dates), utilisez la version ordinateur.</p>
      </${tag}>
      <p id="mob-prog-desktop-hint" class="mob-prog-hint" role="note">🖥️ Planning complet : version ordinateur (Réglages → Programmation).</p>
      <${tag} id="mob-prog-queue"></${tag}>
    </${tag}>`;

if (t.includes('mob-prog-desktop-hint')) {
  console.log('prog hint already present');
} else if (t.includes('File à programmer')) {
  t = t.replace(
    /    <!-- ── PROGRAMMATION ── -->[\s\S]*?id="mob-prog-queue"><\/div>\s*<\/div>/,
    newProg
  );
}

if (!t.includes('.mob-prog-hint{')) {
  t = t.replace(
    '#btn-mob-workspace-switch{',
    '.mob-prog-hint{font-size:.72rem;color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 12px;margin-bottom:14px;line-height:1.45;}\n#btn-mob-workspace-switch{'
  );
}

// Hub masqué par défaut (secours uniquement)
if (!t.includes('#mobile-workspace-hub[aria-hidden')) {
  t = t.replace(
    '#mobile-workspace-hub{',
    '#mobile-workspace-hub[aria-hidden="true"]{display:none!important;}\n#mobile-workspace-hub{'
  );
}

t = t.replace(
  '<div id="mobile-workspace-hub" role="dialog"',
  '<div id="mobile-workspace-hub" aria-hidden="true" role="dialog"'
);

fs.writeFileSync(p, t);
console.log('patch-mobile-ux ok');
