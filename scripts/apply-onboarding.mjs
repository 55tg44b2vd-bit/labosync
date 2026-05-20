import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'app.html');
const D = 'di' + 'v';
let s = fs.readFileSync(appPath, 'utf8');
const start = s.indexOf('function runOnboardingWizard');
const end = s.indexOf('/* Lance l\'onboarding au démarrage');
if (start < 0 || end < 0) {
  console.error('markers not found', start, end);
  process.exit(1);
}

const snippet = `function runOnboardingWizard(){
  if(document.getElementById('onb-overlay'))return;
  if(_tourActive)return;
  var total=3, step=1;
  var overlay=document.createElement('${D}');
  overlay.id='onb-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af);z-index:9997;display:flex;align-items:center;justify-content:center;padding:24px;';
  function close(done){try{if(done)localStorage.setItem('lb_onboarding_done','1');}catch(e){}overlay.remove();}
  function stepLabel(n,title){return '<${D} style="font-size:.86rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Étape '+n+' sur '+total+' · '+title+'</${D}>';}
  function render(){
    var body='';
    if(step===1){
      body=stepLabel(1,'Premier dentiste')+
        '<h2 style="margin:0 0 12px 0;font-size:1.6rem;font-weight:800;color:#0f172a;">Ajoutez un dentiste 👥</h2>'+
        '<p style="margin:0 0 22px 0;font-size:1rem;color:#475569;line-height:1.55;">Chaque dentiste a son espace pour vous envoyer des commandes et recevoir bons de livraison et factures.</p>'+
        '<button id="onb-go-cabs" type="button" style="width:100%;text-align:left;background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:12px;padding:16px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;margin-bottom:20px;">'+
          '<span style="font-size:1.6rem;">👥</span>'+
          '<span style="flex:1;"><strong style="display:block;color:#0c4a6e;font-size:1.04rem;margin-bottom:3px;">Ouvrir « Mes dentistes »</strong><span style="font-size:.86rem;color:#475569;">Remplissez le formulaire puis passez à l\\'étape suivante.</span></span>'+
          '<span style="color:#0284c7;font-size:1.3rem;">→</span>'+
        '</button>'+
        '<${D} style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;">'+
          '<button id="onb-skip" type="button" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;text-decoration:underline;">Plus tard</button>'+
          '<button id="onb-skip-step" type="button" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;text-decoration:underline;">Passer</button>'+
          '<button id="onb-next" type="button" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Étape suivante →</button>'+
        '</${D}>';
    }else if(step===2){
      body=stepLabel(2,'Premier prix')+
        '<h2 style="margin:0 0 12px 0;font-size:1.6rem;font-weight:800;color:#0f172a;">Configurez un prix 💰</h2>'+
        '<p style="margin:0 0 22px 0;font-size:1rem;color:#475569;line-height:1.55;">Indiquez le prix de vos travaux (couronne, inlay…) pour que les factures se calculent automatiquement.</p>'+
        '<button id="onb-go-tarifs" type="button" style="width:100%;text-align:left;background:#fef9c3;border:1.5px solid #fde047;border-radius:12px;padding:16px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;margin-bottom:20px;">'+
          '<span style="font-size:1.6rem;">💰</span>'+
          '<span style="flex:1;"><strong style="display:block;color:#854d0e;font-size:1.04rem;margin-bottom:3px;">Ouvrir « Prix des travaux »</strong><span style="font-size:.86rem;color:#475569;">Saisissez au moins un prix puis enregistrez.</span></span>'+
          '<span style="color:#a16207;font-size:1.3rem;">→</span>'+
        '</button>'+
        '<${D} style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;">'+
          '<button id="onb-back" type="button" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;">← Retour</button>'+
          '<button id="onb-skip-step" type="button" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;text-decoration:underline;">Passer</button>'+
          '<button id="onb-next" type="button" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Étape suivante →</button>'+
        '</${D}>';
    }else if(step===3){
      body=stepLabel(3,'Premier travail')+
        '<h2 style="margin:0 0 12px 0;font-size:1.6rem;font-weight:800;color:#0f172a;">Saisissez un travail 📋</h2>'+
        '<p style="margin:0 0 22px 0;font-size:1rem;color:#475569;line-height:1.55;">Enregistrez votre premier travail : code patient, type, dentiste. Vous émettrez le bon de livraison quand vous le décidez.</p>'+
        '<button id="onb-go-saisie" type="button" style="width:100%;text-align:left;background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:16px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;margin-bottom:20px;">'+
          '<span style="font-size:1.6rem;">📋</span>'+
          '<span style="flex:1;"><strong style="display:block;color:#14532d;font-size:1.04rem;margin-bottom:3px;">Ouvrir « Mes travaux »</strong><span style="font-size:.86rem;color:#475569;">Créez un travail avec le bouton + Enregistrer.</span></span>'+
          '<span style="color:#16a34a;font-size:1.3rem;">→</span>'+
        '</button>'+
        '<${D} style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;">'+
          '<button id="onb-back" type="button" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;">← Retour</button>'+
          '<button id="onb-finish" type="button" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Terminer et commencer</button>'+
        '</${D}>';
    }
    overlay.innerHTML='<${D} style="background:#fff;border-radius:18px;padding:36px 40px;max-width:540px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.4);">'+body+'</${D}>';
    var skipAll=document.getElementById('onb-skip');
    if(skipAll)skipAll.onclick=function(){close(true);};
    var back=document.getElementById('onb-back');
    if(back)back.onclick=function(){step=Math.max(1,step-1);render();};
    var skip=document.getElementById('onb-skip-step');
    if(skip)skip.onclick=function(){step=Math.min(total,step+1);render();};
    var next=document.getElementById('onb-next');
    if(next)next.onclick=function(){step=Math.min(total,step+1);render();};
    var cabs=document.getElementById('onb-go-cabs');
    if(cabs)cabs.onclick=function(){
      var tab=document.querySelector('.tab[data-pane="cabinets"]');
      if(tab)tab.click();
    };
    var tar=document.getElementById('onb-go-tarifs');
    if(tar)tar.onclick=function(){
      if(typeof goSettings==='function')goSettings();
      setTimeout(function(){if(typeof openSettingsSection==='function')openSettingsSection('tarifs');},400);
    };
    var saisie=document.getElementById('onb-go-saisie');
    if(saisie)saisie.onclick=function(){
      var tab=document.querySelector('.tab[data-pane="saisie"]');
      if(tab)tab.click();
    };
    var fin=document.getElementById('onb-finish');
    if(fin)fin.onclick=function(){close(true);};
  }
  document.body.appendChild(overlay);
  render();
}
`;

s = s.slice(0, start) + snippet + s.slice(end);

// Remove tour step about mobile notifications
s = s.replace(
  /\n  \{target:null,title:"Notifications sur mobile 📱",[\s\S]*?Play Store\."\},\n/,
  '\n'
);

fs.writeFileSync(appPath, s);
console.log('onboarding 3 steps OK, tour notifications removed');
