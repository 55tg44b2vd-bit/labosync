import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const appPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'app.html');
let s = readFileSync(appPath, 'utf8');

if (!s.includes('poste-preset-select')) {
  const cleanCard = `      <motion.div class="card">
        <h2>🖥️ Profil de ce poste</h2>
        <p style="font-size:.74rem;color:var(--ink-soft);margin-bottom:12px;line-height:1.45;">À configurer <strong>une fois par ordinateur</strong> (accueil ou programmation). Même compte labo sur tous les postes — ce réglage ouvre le bon espace au démarrage.</p>
        <div style="display:flex;gap:10px;align-items:flex-end;max-width:480px;flex-wrap:wrap;">
          <div class="fl" style="flex:1;min-width:220px;">
            <label>Type de poste</label>
            <select id="poste-preset-select">
              <option value="">Choix manuel (hub Gestion / Atelier)</option>
              <option value="accueil">Accueil — saisie des travaux</option>
              <option value="prog">Programmation atelier</option>
            </select>
          </div>
          <button type="button" class="btn btn-a" id="btn-poste-preset-save">Enregistrer pour ce poste</button>
        </div>
        <p id="poste-preset-msg" style="font-size:.74rem;color:var(--ink-soft);margin-top:8px;min-height:16px;"></p>
      </div>
    </motion.div>

`.replace(/<\/?motion\.div/g, (m) => m.replace('motion.', ''));
  const labo = '    <div id="settings-sec-labo" class="settings-section">';
  const idx = s.indexOf(labo);
  if (idx < 0) throw new Error('settings-sec-labo not found');
  s = s.slice(0, idx) + cleanCard + s.slice(idx);
}

const mergeFn = `
function _mergeCloudRecords(localArr,remoteArr){
  if(typeof LabMultiPoste!=='undefined'&&LabMultiPoste.mergeRecords)return LabMultiPoste.mergeRecords(localArr,remoteArr);
  return remoteArr||localArr||[];
}
function _setSyncStatus(st, detail){
  if(typeof LabMultiPoste!=='undefined'&&LabMultiPoste.setSyncStatus)LabMultiPoste.setSyncStatus(st,detail);
}
async function _fetchServerLabPayload(userId,token){
  const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+userId+'&select=data,updated_at',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}});
  if(!r.ok)return null;
  const rows=await r.json();
  if(!rows||!rows[0])return null;
  return rows[0];
}
`;

if (!s.includes('_mergeCloudRecords')) {
  s = s.replace('// Sauvegarde toutes les données du labo vers Supabase', mergeFn + '\n// Sauvegarde toutes les données du labo vers Supabase');
}

const oldConflict = `          if(serverTime>knownTime+1000){
            // On met à jour le repère temporel mais on NE restaure PAS —
            // l'état local (avec le nouveau travail) doit l'emporter.
            console.warn('Conflit ignoré — sauvegarde locale prioritaire');
            _serverUpdatedAt=rows[0].updated_at;
          }`;

const newConflict = `          if(serverTime>knownTime+1000){
            const remote=await _fetchServerLabPayload(userId,token);
            if(remote&&remote.data){
              jobs=_mergeCloudRecords(jobs,remote.data.jobs||[]);
              queue=_mergeCloudRecords(queue,remote.data.queue||[]);
              syncWindowLabData();
              syncWindowQueue();
              localStorage.setItem('lb_jobs',JSON.stringify(jobs));
              localStorage.setItem('lb_queue',JSON.stringify(queue));
              console.log('Fusion multi-poste avant sauvegarde');
            }
            _serverUpdatedAt=remote&&remote.updated_at?remote.updated_at:rows[0].updated_at;
          }`;

if (s.includes(oldConflict)) s = s.replace(oldConflict, newConflict);

if (!s.includes("_setSyncStatus('syncing')")) {
  s = s.replace(
    "  _isSaving=true;\n  msg.textContent=t('toast.saving');",
    "  _isSaving=true;\n  _setSyncStatus('syncing');\n  msg.textContent=t('toast.saving');"
  );
}

if (!s.includes("_setSyncStatus('synced')")) {
  s = s.replace(
    "      localStorage.setItem('lb_last_save',now);\n      // Mettre à jour la référence",
    "      localStorage.setItem('lb_last_save',now);\n      _setSyncStatus('synced');\n      // Mettre à jour la référence"
  );
}

const oldJobs = '    if(p.jobs)jobs=p.jobs;';
const newJobs = `    if(p.jobs){
      jobs=_initialRestoreDone&&silent?_mergeCloudRecords(jobs,p.jobs):p.jobs;
    }`;
if (s.includes(oldJobs) && !s.includes('_mergeCloudRecords(jobs,p.jobs)')) {
  s = s.replace(oldJobs, newJobs);
}

const oldQueue =
  "    if(p.queue){queue=p.queue;localStorage.setItem('lb_queue',JSON.stringify(p.queue));}";
const newQueue = `    if(p.queue){
      queue=_initialRestoreDone&&silent?_mergeCloudRecords(queue,p.queue):p.queue;
      localStorage.setItem('lb_queue',JSON.stringify(queue));
      if(typeof syncWindowQueue==='function')syncWindowQueue();
    }`;
if (s.includes(oldQueue)) s = s.replace(oldQueue, newQueue);

const oldRt = `        await cloudRestore(true);
        render();
        refreshTechSelects();refreshTypeSelects();applyProgMode();
        if(msg){msg.style.color='#2a6049';msg.textContent=t('btn.synced');}`;

const newRt = `        _setSyncStatus('remote');
        await cloudRestore(true);
        if(typeof LabMultiPoste!=='undefined'&&LabMultiPoste.applyRemoteSync)LabMultiPoste.applyRemoteSync();
        else{render();refreshTechSelects();refreshTypeSelects();applyProgMode();}
        _setSyncStatus('synced','Autre poste');
        if(msg){msg.style.color='#2a6049';msg.textContent=t('btn.synced');}`;

if (s.includes(oldRt)) s = s.replace(oldRt, newRt);

const bindHook =
  "if(typeof LabMultiPoste!=='undefined'&&LabMultiPoste.bindPostePresetSettings)LabMultiPoste.bindPostePresetSettings();";
if (!s.includes('bindPostePresetSettings')) {
  s = s.replace('function _maybeRunOnboarding(){', bindHook + '\nfunction _maybeRunOnboarding(){');
}

writeFileSync(appPath, s);
console.log('patch-multi-poste-ui OK');
