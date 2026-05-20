import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const appPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
let t = fs.readFileSync(appPath, 'utf8');
const D = 'di' + 'v';

if (!t.includes('labo-logo-input')) {
  t = t.replace(
    '        <h2 data-i18n="h2.settings.labname">🏷️ Nom du laboratoire</h2>',
    `        <h2 data-i18n="h2.settings.labname">🏷️ Nom du laboratoire</h2>`
  );
  t = t.replace(
    '          <button class="btn btn-a" id="btn-labo-name-save" data-i18n="btn.save">Enregistrer</button>\n        </' +
      D +
      '>\n      </' +
      D +
      '>\n      <' +
      D +
      ' class="card">\n        <h2>💳 Mon abonnement Labosync</h2>',
    `          <button class="btn btn-a" id="btn-labo-name-save" data-i18n="btn.save">Enregistrer</button>
        </${D}>
      </${D}>
      <${D} class="card">
        <h2>🖼️ Logo du laboratoire</h2>
        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:12px;">Affiché sur mobile et les documents. PNG ou JPG, max ~200 Ko.</p>
        <img id="labo-logo-preview" alt="" style="display:none;max-width:120px;max-height:64px;border-radius:10px;border:1px solid var(--border);margin-bottom:12px;object-fit:contain;background:#fff;"/>
        <input type="file" id="labo-logo-input" accept="image/png,image/jpeg,image/webp" style="margin-bottom:10px;font-size:.8rem;"/>
        <${D} style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" class="btn btn-a" id="btn-labo-logo-save">Enregistrer le logo</button>
          <button type="button" class="btn btn-b" id="btn-labo-logo-clear">Retirer</button>
        </${D}>
      </${D}>
      <${D} class="card">
        <h2>💳 Mon abonnement Labosync</h2>`
  );
}

if (!t.includes('admin-pin-recover')) {
  t = t.replace(
    '      <button type="button" class="btn btn-b" id="btn-admin-pin-cancel">Retour</button>\n    </' + D + '>\n  </' + D + '>\n</' + D + '>\n<header>',
    `      <button type="button" class="btn btn-b" id="btn-admin-pin-cancel">Retour</button>
    </${D}>
    <p style="margin:14px 0 0;text-align:center;"><button type="button" id="admin-pin-forgot" style="background:none;border:none;color:var(--accent);font-size:.78rem;font-weight:600;cursor:pointer;text-decoration:underline;">Code oublié ?</button></p>
    <${D} id="admin-pin-recover" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
      <p style="font-size:.78rem;color:var(--ink-soft);margin-bottom:10px;line-height:1.45;">Confirmez avec le <strong>mot de passe Labosync</strong>, puis choisissez un nouveau code administratif.</p>
      <${D} class="fl" style="margin-bottom:10px;"><label>Mot de passe du compte</label><input type="password" id="admin-pin-recover-password" autocomplete="current-password"/></${D}>
      <${D} class="fl" style="margin-bottom:10px;"><label>Nouveau code (4 à 8 chiffres)</label><input type="password" id="admin-pin-recover-new" inputmode="numeric" maxlength="8"/></${D}>
      <button type="button" class="btn btn-a" id="btn-admin-pin-recover">Réinitialiser le code</button>
    </${D}>
  </${D}>
</${D}>
<header>`
  );
}

if (!t.includes('laboLogo:localStorage')) {
  t = t.replace(
    '      laboName:localStorage.getItem(\'lb_name\')||\'\',\n      jobs,archive,cabinets,syns,scanHist,waiting,conges,absences,',
    "      laboName:localStorage.getItem('lb_name')||'',\n      laboLogo:localStorage.getItem('lb_logo')||'',\n      jobs,archive,cabinets,syns,scanHist,waiting,conges,absences,"
  );
  t = t.replace(
    '    if(p.laboName)localStorage.setItem(\'lb_name\',p.laboName);',
    "    if(p.laboName)localStorage.setItem('lb_name',p.laboName);\n    if(p.laboLogo)localStorage.setItem('lb_logo',p.laboLogo);\n    else if(p.laboLogo===null)localStorage.removeItem('lb_logo');\n    if(typeof refreshHeaderLabBranding==='function')refreshHeaderLabBranding();"
  );
}

if (!t.includes('function refreshHeaderLabBranding')) {
  t = t.replace(
    "document.getElementById('btn-labo-name-save').addEventListener('click',function(){",
    `function refreshHeaderLabBranding(){
  var h=document.getElementById('header-labname');
  if(!h)return;
  var name=(localStorage.getItem('lb_name')||'').trim();
  if(name){h.innerHTML=escH(name);}else{h.innerHTML='Labo<span>sync</span>';}
}
function resizeLabLogoFile(file,cb){
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var max=256,w=img.width,h=img.height;
      if(w>max||h>max){if(w>h){h=Math.round(h*max/w);w=max;}else{w=Math.round(w*max/h);h=max;}}
      var c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      cb(c.toDataURL('image/jpeg',0.85));
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
}
(function(){
  var inp=document.getElementById('labo-logo-input');
  var prev=document.getElementById('labo-logo-preview');
  var saved=localStorage.getItem('lb_logo');
  if(prev&&saved&&saved.indexOf('data:image')===0){prev.src=saved;prev.style.display='block';}
  var saveBtn=document.getElementById('btn-labo-logo-save');
  var clearBtn=document.getElementById('btn-labo-logo-clear');
  if(saveBtn)saveBtn.addEventListener('click',function(){
    if(!inp||!inp.files||!inp.files[0]){showToast('Choisissez une image','#d97706');return;}
    resizeLabLogoFile(inp.files[0],function(dataUrl){
      if(dataUrl.length>280000){showToast('Image trop lourde — choisissez un fichier plus petit','#c0392b');return;}
      localStorage.setItem('lb_logo',dataUrl);
      if(prev){prev.src=dataUrl;prev.style.display='block';}
      refreshHeaderLabBranding();
      if(typeof scheduleSave==='function')scheduleSave();
      if(typeof cloudSave==='function')cloudSave();
      showToast('Logo enregistré','#2a6049');
    });
  });
  if(clearBtn)clearBtn.addEventListener('click',function(){
    localStorage.removeItem('lb_logo');
    if(prev){prev.style.display='none';prev.removeAttribute('src');}
    if(inp)inp.value='';
    if(typeof scheduleSave==='function')scheduleSave();
    if(typeof cloudSave==='function')cloudSave();
    showToast('Logo retiré','#2a6049');
  });
})();
document.getElementById('btn-labo-name-save').addEventListener('click',function(){`
  );
}

fs.writeFileSync(appPath, t);
console.log('patch-app-logo-pin ok');
