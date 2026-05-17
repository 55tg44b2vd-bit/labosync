
/* ══════════════════════════════════════════
   §35 — MESSAGES / CHAT LABO ↔ CABINET
   ══════════════════════════════════════════ */
var _chatCabId = null;
var _chatPortalId = null;
var _chatPollInterval = null;
var _chatUnread = {};
var _chatPollFailures = {};
var _chatPollCooldownUntil = {};
function _canPollChat(portalId){
  if(!portalId) return false;
  return Date.now() >= (_chatPollCooldownUntil[portalId]||0);
}
function _noteChatPollResult(portalId, ok){
  if(!portalId) return;
  if(ok){
    if((_chatPollFailures[portalId]||0)>=3){
      // #region agent log
      // #endregion
    }
    _chatPollFailures[portalId]=0;
    _chatPollCooldownUntil[portalId]=0;
    return;
  }
  _chatPollFailures[portalId]=(_chatPollFailures[portalId]||0)+1;
  if(_chatPollFailures[portalId]>=3){
    // Coupe-circuit: évite de marteler l'API en cas de 500 répétés.
    _chatPollCooldownUntil[portalId]=Date.now()+120000;
    // #region agent log
    // #endregion
  }
}

function openChatModal(cabId){
  const cab = cabinets.find(function(c){return c.id===cabId;});
  if(!cab||!cab.portalId){showToast('❌ Cabinet sans portail','#c0392b');return;}
  _chatCabId = cabId;
  _chatPortalId = cab.portalId;
  document.getElementById('chat-cab-name').textContent = cab.name;
  document.getElementById('chat-cab-dot').style.background = cab.color||'#999';
  document.getElementById('chat-messages').innerHTML = '<div style="text-align:center;color:var(--ink-soft);font-size:.78rem;padding:20px 0;">Chargement…</div>';
  document.getElementById('chat-modal').style.display = 'flex';
  _chatUnread[cabId] = 0;
  updateChatBadge(cabId);
  loadChatMessages(true);
  if(_chatPollInterval) clearInterval(_chatPollInterval);
  _chatPollInterval = setInterval(function(){
    if(document.getElementById('chat-modal').style.display==='flex') loadChatMessages(false);
  }, 8000);
}

function closeChatModal(){
  document.getElementById('chat-modal').style.display = 'none';
  if(_chatPollInterval){clearInterval(_chatPollInterval);_chatPollInterval=null;}
  // Marquer tout comme lu
  if(_chatPortalId) localStorage.setItem('chat_seen_'+_chatPortalId, new Date().toISOString());
  if(_chatCabId){ _chatUnread[_chatCabId]=0; updateChatBadge(_chatCabId); }
  _chatCabId = null;
  _chatPortalId = null;
}

async function loadChatMessages(scrollToBottom){
  if(!_chatPortalId) return;
  if(!_canPollChat(_chatPortalId)) return;
  try{
    const r = await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(_chatPortalId),{headers:_portalApiHeaders()});
    if(!r.ok){
      _noteChatPollResult(_chatPortalId,false);
      if(r.status===401)showToast('Chat : accès refusé — republiez le portail du cabinet','#c0392b');
      else if(scrollToBottom)showToast('Impossible de charger le chat ('+r.status+')','#c0392b');
      return;
    }
    _noteChatPollResult(_chatPortalId,true);
    const rows = await r.json();
    const msgs = (rows[0]&&rows[0].data&&rows[0].data.messages)?rows[0].data.messages:[];
    renderChatMessages(msgs, scrollToBottom);
    if(_chatCabId) _chatUnread[_chatCabId] = 0;
  }catch(e){
    _noteChatPollResult(_chatPortalId,false);
    console.warn('Chat load error',e);
  }
}

function renderChatMessages(msgs, scrollToBottom){
  const el = document.getElementById('chat-messages');
  if(!msgs.length){
    el.innerHTML = '<div style="text-align:center;color:var(--ink-soft);font-size:.78rem;padding:30px 0;">'+t('empty.messages')+'</div>';
    return;
  }
  el.innerHTML = msgs.map(function(m){
    const isLabo = m.sender==='labo';
    const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '';
    const date = m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}) : '';
    let attachHtml = '';
    if(m.image){
      attachHtml = '<img src="'+chatEscH(m.image)+'" style="max-width:220px;max-height:180px;border-radius:8px;display:block;cursor:pointer;" onclick="chatViewImg(this.src)"/>';
    } else if(m.attachment){
      const a = m.attachment;
      if(a.type==='image'){
        attachHtml = '<img src="'+chatEscH(a.url)+'" style="max-width:220px;max-height:180px;border-radius:8px;display:block;cursor:pointer;" onclick="chatViewImg(this.src)"/>';
      } else {
        const ic = a.type==='stl'?'🦷':a.type==='pdf'?'📄':'📎';
        const sz = a.size?_chatHumanSize(a.size):'';
        attachHtml = '<a href="'+chatEscH(a.url)+'" target="_blank" rel="noopener" download="'+chatEscH(a.name||'fichier')+'" style="display:flex;align-items:center;gap:10px;background:'+(isLabo?'rgba(255,255,255,.18)':'var(--bg)')+';border:1px solid '+(isLabo?'rgba(255,255,255,.3)':'var(--border)')+';border-radius:8px;padding:8px 10px;text-decoration:none;color:inherit;max-width:240px;">'+
          '<span style="font-size:1.5rem;line-height:1;flex-shrink:0;">'+ic+'</span>'+
          '<span style="flex:1;min-width:0;"><span style="display:block;font-weight:600;font-size:.84rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+chatEscH(a.name||'fichier')+'</span><span style="display:block;font-size:.7rem;opacity:.85;">'+chatEscH((a.type||'').toUpperCase())+(sz?' · '+sz:'')+' · cliquer pour ouvrir</span></span>'+
        '</a>';
      }
    }
    const bubbleContent = attachHtml
      ? attachHtml + (m.content?'<div style="margin-top:5px;font-size:.82rem;">'+chatRenderContent(m.content,isLabo)+'</div>':'')
      : chatRenderContent(m.content,isLabo);
    const hasMedia = m.image || m.attachment;
    return '<div style="display:flex;flex-direction:column;align-items:'+(isLabo?'flex-end':'flex-start')+';gap:2px;">'
      +'<div style="max-width:78%;background:'+(isLabo?'var(--accent)':'var(--bg)')+';color:'+(isLabo?'#fff':'var(--ink)')+';border-radius:'+(isLabo?'12px 12px 3px 12px':'12px 12px 12px 3px')+';padding:'+(hasMedia?'6px':'8px 12px')+';font-size:.82rem;border:1px solid '+(isLabo?'transparent':'var(--border)')+';word-break:break-word;">'+bubbleContent+'</div>'
      +'<div style="font-size:.62rem;color:var(--ink-soft);padding:0 3px;">'+chatEscH(m.senderName||m.sender)+' · '+date+' '+time+'</div>'
      +'</div>';
  }).join('');
  if(scrollToBottom) el.scrollTop = el.scrollHeight;
}

var _chatPendingPhoto = null;
var _chatPendingAttachment = null;

function _chatHumanSize(bytes){
  if(bytes<1024)return bytes+' o';
  if(bytes<1024*1024)return (bytes/1024).toFixed(0)+' Ko';
  return (bytes/(1024*1024)).toFixed(1)+' Mo';
}

async function _uploadChatFileDesktop(file, portalId){
  const sb = sbClient || supabase.createClient(SB_URL, SB_KEY);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const path = portalId+'/'+Date.now()+'_'+safeName;
  const {data, error} = await sb.storage.from('chat-files').upload(path, file, {cacheControl:'3600', upsert:false});
  if(error) throw error;
  const {data:pub} = sb.storage.from('chat-files').getPublicUrl(path);
  return pub.publicUrl;
}

async function sendChatMsg(){
  if(!_chatPortalId||!_chatCabId) return;
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if(!content && !_chatPendingPhoto && !_chatPendingAttachment) return;
  const laboName = localStorage.getItem('lb_name')||'Laboratoire';
  input.disabled = true;
  // Upload du fichier non-image si présent
  let attachment = null;
  if(_chatPendingAttachment){
    try{
      const url = await _uploadChatFileDesktop(_chatPendingAttachment.file, _chatPortalId);
      attachment = {url:url, name:_chatPendingAttachment.name, size:_chatPendingAttachment.size, type:_chatPendingAttachment.type};
    }catch(e){
      console.error('Upload échoué', e);
      showToast('Erreur d\'envoi du fichier — '+(e.message||''),'#c0392b');
      input.disabled = false;
      return;
    }
  }
  input.value = '';
  const photo = _chatPendingPhoto;
  chatClearPhoto();
  try{
    const body = {action:'chat',portalId:_chatPortalId,sender:'labo',senderName:laboName,content:content};
    if(photo) body.image = photo;
    if(attachment) body.attachment = attachment;
    const r = await fetch('/.netlify/functions/portal',{
      method:'POST',
      headers:_portalApiHeaders(),
      body:JSON.stringify(body)
    });
    if(r.ok){ await loadChatMessages(true); }
    else { showToast(ti('toast.error',{msg:'Échec envoi message'}),'#c0392b'); }
  }catch(e){ showToast(ti('toast.network_error',{msg:String(e).slice(0,50)}),'#c0392b'); }
  input.disabled = false;
  input.focus();
}

function chatFileSelected(input){
  const file = input.files[0];
  if(!file) return;
  input.value = '';
  if(file.size > 50*1024*1024){
    showToast('Fichier trop lourd (max 50 Mo)','#c0392b');
    return;
  }
  const isImage = file.type && file.type.indexOf('image/')===0;
  if(isImage){
    chatCompressImage(file, function(base64){
      _chatPendingPhoto = base64;
      const prev = document.getElementById('chat-photo-preview');
      document.getElementById('chat-photo-img').src = base64;
      document.getElementById('chat-photo-img').style.display = 'block';
      const card = document.getElementById('chat-file-card');if(card)card.style.display='none';
      prev.style.display = 'block';
    });
  } else {
    const ext = (file.name.split('.').pop()||'').toLowerCase();
    const fileType = ext==='stl'?'stl':ext==='obj'?'obj':ext==='ply'?'ply':ext==='pdf'?'pdf':'file';
    _chatPendingAttachment = {file:file, name:file.name, size:file.size, type:fileType};
    const icon = fileType==='stl'?'🦷':fileType==='pdf'?'📄':'📎';
    document.getElementById('chat-file-icon').textContent = icon;
    document.getElementById('chat-file-name').textContent = file.name;
    document.getElementById('chat-file-size').textContent = _chatHumanSize(file.size);
    document.getElementById('chat-photo-img').style.display = 'none';
    document.getElementById('chat-file-card').style.display = 'flex';
    document.getElementById('chat-photo-preview').style.display = 'block';
  }
}

function chatClearPhoto(){
  _chatPendingPhoto = null;
  _chatPendingAttachment = null;
  document.getElementById('chat-photo-preview').style.display = 'none';
  const img = document.getElementById('chat-photo-img');if(img){img.src='';img.style.display='none';}
  const card = document.getElementById('chat-file-card');if(card)card.style.display='none';
}

function chatCompressImage(file, cb){
  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      const MAX = 900;
      let w = img.width, h = img.height;
      if(w > MAX || h > MAX){
        if(w > h){ h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function chatViewImg(src){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  overlay.innerHTML = '<img src="'+src+'" style="max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,.5);"/>';
  overlay.onclick = function(){ document.body.removeChild(overlay); };
  document.body.appendChild(overlay);
}

function chatKeyDown(e){
  const dd = document.getElementById('chat-mention-dd');
  if(dd && dd.style.display!=='none'){
    const items = dd.querySelectorAll('.mention-item');
    const active = dd.querySelector('.mention-item.active');
    if(e.key==='ArrowDown'){
      e.preventDefault();
      const next = active ? active.nextElementSibling : items[0];
      if(active) active.classList.remove('active');
      if(next){next.classList.add('active');next.scrollIntoView({block:'nearest'});}
      return;
    }
    if(e.key==='ArrowUp'){
      e.preventDefault();
      const prev = active ? active.previousElementSibling : items[items.length-1];
      if(active) active.classList.remove('active');
      if(prev){prev.classList.add('active');prev.scrollIntoView({block:'nearest'});}
      return;
    }
    if(e.key==='Enter'||e.key==='Tab'){
      const sel = dd.querySelector('.mention-item.active')||items[0];
      if(sel){e.preventDefault();sel.click();return;}
    }
    if(e.key==='Escape'){chatHideMention('chat-mention-dd');return;}
  }
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMsg();}
}

function chatRenderContent(text, darkBg){
  const escaped = chatEscH(text);
  const mentionColor = darkBg ? '#ffffffcc' : 'var(--accent)';
  const mentionBg = darkBg ? 'rgba(255,255,255,.18)' : 'rgba(90,52,114,.10)';
  const withMentions = escaped.replace(/@([\w\u00C0-\u017E]+(?:_[\w\u00C0-\u017E]+)*)/g, function(match, name){
    const display = name.replace(/_/g,' ');
    return '<span style="font-weight:700;color:'+mentionColor+';background:'+mentionBg+';border-radius:3px;padding:0 3px;">@'+display+'</span>';
  });
  return withMentions.replace(/\n/g,'<br/>');
}

function chatEscH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ── Logique @mention partagée ── */
function chatMentionInput(textarea, ddId, side){
  const query = chatGetMentionQuery(textarea);
  if(query===null){chatHideMention(ddId);return;}
  const patients = side==='labo' ? chatGetLaboPatients() : chatGetPortalPatients();
  const q = query.toLowerCase().replace(/_/g,' ');
  const filtered = patients.filter(function(p){return !q||p.toLowerCase().includes(q);}).slice(0,8);
  if(!filtered.length){chatHideMention(ddId);return;}
  const dd = document.getElementById(ddId);
  dd.innerHTML = filtered.map(function(p,i){
    const slug = p.replace(/\s+/g,'_');
    return '<div class="mention-item" style="padding:8px 12px;cursor:pointer;font-size:.82rem;display:flex;align-items:center;gap:6px;border-radius:'+(i===0?'9px 9px 0 0':i===filtered.length-1?'0 0 9px 9px':'0')+';" onmousedown="chatInsertMention(\''+ddId+'\',\''+escAttrVal(slug)+'\',event)" onmouseover="chatHoverItem(this,\''+ddId+'\')">'
      +'<span style="color:var(--accent);font-weight:700;font-size:.9rem;">@</span>'
      +'<span>'+chatEscH(p)+'</span>'
      +'</div>';
  }).join('');
  dd.style.display='block';
}

function chatGetMentionQuery(textarea){
  const val = textarea.value;
  const pos = textarea.selectionStart;
  const before = val.slice(0,pos);
  const m = before.match(/@([\w\u00C0-\u017E_]*)$/);
  return m ? m[1] : null;
}

function chatGetLaboPatients(){
  if(!_chatCabId) return [];
  const seen = new Set();
  return jobs.filter(function(j){return j.cabinet===_chatCabId;})
    .map(function(j){return j.patient||'';})
    .filter(function(p){return p&&!seen.has(p)&&seen.add(p);});
}
function chatGetPortalPatients(){return [];} // stub côté labo

function chatInsertMention(ddId, slug, e){
  if(e) e.preventDefault();
  const inputId = ddId==='chat-mention-dd' ? 'chat-input' : 'chat-portal-input';
  const input = document.getElementById(inputId);
  const val = input.value;
  const pos = input.selectionStart;
  const before = val.slice(0,pos).replace(/@([\w\u00C0-\u017E_]*)$/,'@'+slug+' ');
  input.value = before + val.slice(pos);
  input.focus();
  input.selectionStart = input.selectionEnd = before.length;
  chatHideMention(ddId);
}

function chatHideMention(ddId){
  const dd = document.getElementById(ddId);
  if(dd) dd.style.display='none';
}

function chatHoverItem(el, ddId){
  const dd = document.getElementById(ddId);
  dd.querySelectorAll('.mention-item').forEach(function(i){i.classList.remove('active');});
  el.classList.add('active');
}

function escAttrVal(s){return String(s||'').replace(/'/g,"\\'");}

function updateChatBadge(cabId){
  // Badge sur le bouton dans la liste cabinets
  const badge = document.getElementById('chat-badge-'+cabId);
  if(badge) badge.style.display = (_chatUnread[cabId]||0)>0 ? 'flex' : 'none';
  // Badge global sur le bouton mode Messages
  const total = Object.values(_chatUnread).reduce(function(a,b){return a+(b||0);},0);
  const modeBadge = document.getElementById('msg-mode-badge');
  if(modeBadge) modeBadge.style.display = total>0 ? 'inline' : 'none';
  // Rafraîchir le pane si ouvert
  if(document.getElementById('pane-messages').classList.contains('on') && !_isRenderingMessagesPane) _queueMessagesPaneRender();
}

/* Données de chat mises en cache pour l'affichage du pane */
var _chatPreview = {}; // {portalId: {lastMsg, lastTime, unreadCount}}
var _isRenderingMessagesPane = false;
var _messagesPaneRerenderQueued = false;
function _queueMessagesPaneRender(){
  if(_messagesPaneRerenderQueued) return;
  _messagesPaneRerenderQueued = true;
  requestAnimationFrame(function(){
    _messagesPaneRerenderQueued = false;
    if(document.getElementById('pane-messages').classList.contains('on') && !_isRenderingMessagesPane){
      // #region agent log
      // #endregion
      renderMessagesPane();
    }
  });
}

async function renderMessagesPane(){
  if(_isRenderingMessagesPane) return;
  _isRenderingMessagesPane = true;
  const el = document.getElementById('messages-cab-list');
  if(!el){_isRenderingMessagesPane=false;return;}
  if(!cabinets.length){
    el.innerHTML = '<div class="empty">'+t('empty.cabinets')+'</div><p style="text-align:center;font-size:.76rem;color:var(--ink-soft);margin-top:8px;">Ajoutez un cabinet dans <strong>Dentistes</strong>, puis publiez son portail.</p>';
    _isRenderingMessagesPane = false;
    return;
  }
  const withPortal=cabinets.filter(function(c){return c.portalId;});
  const withoutPortal=cabinets.filter(function(c){return !c.portalId;});
  if(!withPortal.length){
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--ink-soft);font-size:.84rem;line-height:1.5;">Aucun cabinet avec portail actif.<br/>Allez dans <strong>Dentistes</strong>, ouvrez chaque cabinet et <strong>publiez le portail</strong>.</div>';
  }else{
  el.innerHTML = withPortal.map(function(cab){
    const prev = _chatPreview[cab.portalId]||{};
    const unread = _chatUnread[cab.id]||0;
    const lastMsg = prev.lastMsg||'';
    const lastTime = prev.lastTime ? fmtChatTime(prev.lastTime) : '';
    return '<div onclick="openChatModal(\''+cab.id+'\')" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--border);border-radius:12px;margin-bottom:10px;cursor:pointer;background:var(--surface);transition:box-shadow .15s;" onmouseover="this.style.boxShadow=\'0 2px 12px rgba(0,0,0,.09)\'" onmouseout="this.style.boxShadow=\'none\'">'
      +'<div style="width:44px;height:44px;border-radius:50%;background:'+cab.color+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;flex-shrink:0;">'+chatEscH((cab.name||'?')[0].toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:0;">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">'
          +'<span style="font-weight:600;font-size:.9rem;">'+chatEscH(cab.name)+'</span>'
          +(unread>0?'<span style="background:#e53935;color:#fff;border-radius:99px;padding:1px 8px;font-size:.62rem;font-weight:700;">'+unread+' nouveau'+(unread>1?'x':'')+'</span>':'')
        +'</div>'
        +'<div style="font-size:.78rem;color:var(--ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(lastMsg?chatEscH(lastMsg):'<em>'+t('empty.messages_short')+'</em>')+'</div>'
      +'</div>'
      +(lastTime?'<div style="font-size:.68rem;color:var(--ink-soft);flex-shrink:0;">'+lastTime+'</div>':'')
      +'</div>';
  }).join('');
  }
  if(withoutPortal.length){
    el.innerHTML+=withoutPortal.map(function(cab){
      return '<div style="padding:12px 16px;border:1px dashed var(--border);border-radius:10px;margin-bottom:8px;font-size:.78rem;color:var(--ink-soft);">'
        +chatEscH(cab.name)+' — pas de portail (Dentistes → publier le portail).'
        +'</div>';
    }).join('');
  }
  await Promise.all(withPortal.map(async function(cab){
    if(!_canPollChat(cab.portalId)) return;
    try{
      const r=await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(cab.portalId),{headers:_portalApiHeaders()});
      if(!r.ok){
        _noteChatPollResult(cab.portalId,false);
        if(r.status===401)showToast('Messagerie : accès refusé pour '+cab.name+' — republiez le portail','#c0392b',5000);
        return;
      }
      _noteChatPollResult(cab.portalId,true);
      const rows=await r.json();
      const msgs=(rows[0]&&rows[0].data&&rows[0].data.messages)?rows[0].data.messages:[];
      if(!msgs.length) return;
      const last=msgs[msgs.length-1];
      const lastSeen=localStorage.getItem('chat_seen_'+cab.portalId)||'';
      const unreadCount=msgs.filter(function(m){return m.sender==='cabinet'&&m.createdAt>lastSeen;}).length;
      _chatPreview[cab.portalId]={
        lastMsg:(last.senderName||last.sender)+' : '+last.content.slice(0,60)+(last.content.length>60?'…':''),
        lastTime:last.createdAt,
        unreadCount:unreadCount
      };
      const prevUnread=_chatUnread[cab.id]||0;
      if(unreadCount>0){
        _chatUnread[cab.id]=unreadCount;
        if(prevUnread!==unreadCount) updateChatBadge(cab.id);
      }else if(prevUnread!==0){
        _chatUnread[cab.id]=0;
        updateChatBadge(cab.id);
      }
    }catch(e){}
  }));
  _isRenderingMessagesPane=false;
  if(withPortal.length) _queueMessagesPaneRender();
}

function fmtChatTime(iso){
  if(!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now-d)/3600000;
  if(diffH<1) return Math.round((now-d)/60000)+'min';
  if(diffH<24) return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
}

// Background polling for new cabinet messages (every 30s, modal closed)
var _chatBgInterval = null;
function startChatBgPoll(){
  if(_chatBgInterval) return;
  _chatBgInterval = setInterval(async function(){
    if(document.getElementById('chat-modal').style.display==='flex') return;
    for(const cab of cabinets){
      if(!cab.portalId) continue;
      if(!_canPollChat(cab.portalId)) continue;
      try{
        const r = await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(cab.portalId),{headers:_portalApiHeaders()});
        if(!r.ok){
          _noteChatPollResult(cab.portalId,false);
          continue;
        }
        _noteChatPollResult(cab.portalId,true);
        const rows = await r.json();
        const msgs = (rows[0]&&rows[0].data&&rows[0].data.messages)?rows[0].data.messages:[];
        const cabMsgs = msgs.filter(function(m){return m.sender==='cabinet';});
        if(!cabMsgs.length) continue;
        const lastSeen = localStorage.getItem('chat_seen_'+cab.portalId)||'';
        const unseen = cabMsgs.filter(function(m){return m.createdAt>lastSeen;});
        // Mettre à jour le preview dans tous les cas
        if(msgs.length){
          const last = msgs[msgs.length-1];
          _chatPreview[cab.portalId] = {
            lastMsg: (last.senderName||last.sender)+' : '+last.content.slice(0,60)+(last.content.length>60?'…':''),
            lastTime: last.createdAt,
          };
        }
        if(unseen.length){
          _chatUnread[cab.id] = (_chatUnread[cab.id]||0)+unseen.length;
          updateChatBadge(cab.id);
          const latest = cabMsgs[cabMsgs.length-1].createdAt;
          localStorage.setItem('chat_seen_'+cab.portalId, latest);
          var _dashPane=document.getElementById('pane-dashboard');
          if(_dashPane&&_dashPane.classList.contains('on')&&typeof renderDashboard==='function')renderDashboard();
        }
      }catch(e){ _noteChatPollResult(cab.portalId,false); }
    }
  }, 30000);
}
window.addEventListener('load', function(){setTimeout(startChatBgPoll, 5000);});

/* ══════════════════════════════════════════
   §36 — JOB DETAIL PANEL
   ══════════════════════════════════════════ */
function openJobDetail(jobId){
  const job=jobs.find(function(j){return j.id===jobId;})||archive.find(function(a){return a.id===jobId;});
  if(!job){showToast('Travail introuvable','#c0392b');return;}
  const cab=job.cabinet?cabinets.find(function(c){return c.id===job.cabinet;}):null;
  const jobBdl=bdl.filter(function(b){return b.jobId===jobId;});
  const typeTarif=tarifs.find(function(t){return t.types&&t.types.includes(job.type);});
  const prix=typeTarif?typeTarif.prix:null;

  const fmt=function(d){return d?new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):null;};
  const fmtDt=function(d){return d?new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):null;};

  const tasksHtml=job.tasks&&job.tasks.length
    ?'<div style="margin-top:10px;"><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:6px;">Étapes programmées</div>'
      +job.tasks.map(function(t){
        const late=new Date(t.dueDate)<new Date();
        const tech=getTech(t.tech);
        return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:.8rem;">'
          +'<div style="width:8px;height:8px;border-radius:50%;background:'+tech.color+';flex-shrink:0;"></div>'
          +'<span style="flex:1;">'+escH(t.label)+'</span>'
          +'<span style="color:'+tech.color+';font-size:.72rem;">'+escH(tech.label)+'</span>'
          +'<span style="font-size:.72rem;color:'+(late?'#c0392b':'var(--ink-soft)')+';">'+fmtS(new Date(t.dueDate))+'</span>'
          +(t.done?'<span style="color:#2a6049;font-size:.8rem;">✓</span>':'')
          +'</div>';
      }).join('')+'</div>'
    :'';

  const bdlHtml=jobBdl.length
    ?'<div style="margin-top:14px;"><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:6px;">Bons de livraison</div>'
      +jobBdl.map(function(b){
        return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:.8rem;">'
          +'<span style="font-family:monospace;font-size:.72rem;background:#5a3472;color:#fff;padding:1px 7px;border-radius:4px;">'+escH(b.num)+'</span>'
          +'<span style="flex:1;color:var(--ink-soft);">'+new Date(b.date+'T12:00:00').toLocaleDateString('fr-FR')+'</span>'
          +(b.total?'<span style="color:#c8410a;font-weight:700;">'+b.total.toFixed(2).replace('.',',')+'\u00a0€</span>':'')
          +(b.invoiced?'<span style="font-size:.65rem;background:#e0ede8;color:#2a6049;padding:1px 6px;border-radius:99px;">Facturé</span>':'<span style="font-size:.65rem;background:#dde8f2;color:#1a4a7a;padding:1px 6px;border-radius:99px;">En attente</span>')
          +'</div>';
      }).join('')+'</div>'
    :'';

  const existing=document.getElementById('job-detail-overlay');
  if(existing)existing.remove();

  const overlay=document.createElement('div');
  overlay.id='job-detail-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(28,20,16,.55);display:flex;align-items:flex-end;justify-content:center;';
  overlay.innerHTML=`
    <div id="job-detail-panel" style="background:var(--bg);border-radius:16px 16px 0 0;width:100%;max-width:680px;max-height:85vh;overflow-y:auto;padding:24px 24px 32px;animation:slideUp .25s ease;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
        <div>
          <div style="font-family:'Inter',sans-serif;font-weight:700;font-size:1.25rem;font-weight:700;">${job.urgent?'🔴 ':''}${escH(job.patient)}</div>
          <div style="font-size:.75rem;color:var(--ink-soft);margin-top:3px;">${escH(getJobTypeLabel(job))}${job.nb>1?' · '+job.nb+' éléments':''}</div>
        </div>
        <button onclick="document.getElementById('job-detail-overlay').remove()" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:.8rem;">✕ Fermer</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div style="background:var(--surface);border-radius:9px;padding:10px 12px;">
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:3px;">Créé le</div>
          <div style="font-size:.85rem;font-weight:500;">${fmtDt(job.createdAt)||'—'}</div>
        </div>
        <div style="background:var(--surface);border-radius:9px;padding:10px 12px;">
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:3px;">📦 Livraison prévue</div>
          <div style="font-size:.85rem;font-weight:500;color:${_jobLabDeliveryDate(j)?'#2a6049':'var(--ink-soft)'};">${_fmtJobDeliveryLine(job)||'Non renseignée'}</div>
        </div>
        <div style="background:var(--surface);border-radius:9px;padding:10px 12px;">
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:3px;">🏥 Cabinet</div>
          <div style="font-size:.85rem;font-weight:500;">${cab?escH(cab.name):'—'}</div>
        </div>
        <div style="background:var(--surface);border-radius:9px;padding:10px 12px;">
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:3px;">💶 Prix</div>
          <div style="font-size:.85rem;font-weight:700;color:#c8410a;">${prix!==null?prix.toFixed(2).replace('.',',')+'\u00a0€':'Non configuré'}</div>
        </div>
      </div>
      ${job.note?'<div style="background:#fff8f5;border:1px solid #f0cfc0;border-radius:8px;padding:10px 12px;font-size:.82rem;margin-bottom:12px;"><span style="font-weight:600;">📝 Note :</span> '+escH(job.note)+'</div>':''}
      ${job.trackCode?'<div style="font-family:monospace;font-size:.72rem;color:var(--ink-soft);margin-bottom:10px;">Code : '+escH(job.trackCode)+'</div>':''}
      ${tasksHtml}
      ${bdlHtml}
      ${!jobBdl.length&&cab?'<button onclick="document.getElementById(\'job-detail-overlay\').remove();genBonLivraison(\''+job.id+'\')" style="margin-top:16px;background:#5a3472;color:#fff;border:none;border-radius:9px;padding:10px 20px;font-size:.82rem;cursor:pointer;width:100%;">📦 Générer un bon de livraison</button>':''}
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
}

/* ══ COURSIERS ══ */
const COURIER_API='/.netlify/functions/courier-api';
let _courierLinks=[];
let _cdCabId=null;
let _cdType='pickup';
let _cpStops=[{type:'pickup',cabId:'',address:'',phone:''}];
let _courierRtChannel=null;
let _courierPollTimer=null;
let _courierMissionsSummary=[];

function courierLinksRowId(){return currentUser?'courier_links_'+currentUser.id:'';}
function labCourierIdxRowId(){return currentUser?'lab_courier_idx_'+currentUser.id:'';}

async function getLabAuthToken(){
  if(_cachedAccessToken)return _cachedAccessToken;
  const sess=await sbClient.auth.getSession();
  const t=sess.data&&sess.data.session?sess.data.session.access_token:'';
  if(t)_cachedAccessToken=t;
  return t||'';
}

async function laboDataRowGet(rowId){
  const token=await getLabAuthToken();
  if(!token||!rowId)throw new Error('Session expirée');
  const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+encodeURIComponent(rowId)+'&select=data',{
    headers:{apikey:SB_KEY,Authorization:'Bearer '+token},
  });
  if(!r.ok)throw new Error('Lecture cloud ('+r.status+')');
  const rows=await r.json();
  return rows[0]&&rows[0].data?rows[0].data:null;
}

function saveCourierLinksCache(links){
  try{localStorage.setItem('lb_courier_links_'+currentUser.id,JSON.stringify(links||[]));}catch(e){}
}
function loadCourierLinksCache(){
  try{
    const raw=localStorage.getItem('lb_courier_links_'+(currentUser&&currentUser.id||''));
    return raw?JSON.parse(raw):[];
  }catch(e){return[];}
}

async function listLinkedCouriersLocal(){
  const data=await laboDataRowGet(courierLinksRowId());
  const links=(data&&data.links)||[];
  if(links.length)saveCourierLinksCache(links);
  return links;
}

async function listMissionsLocal(){
  const data=await laboDataRowGet(labCourierIdxRowId());
  return (data&&data.missions)||[];
}

function friendlyCourierErr(msg){
  if(!msg)return 'Erreur inconnue';
  if(msg==='Non authentifié'||msg.indexOf('Non authentifi')>=0){
    return 'Connexion au service coursier impossible. Déconnectez-vous, rechargez la page (Ctrl+F5), puis réessayez.';
  }
  return msg;
}

async function courierApi(action,payload){
  let token=await getLabAuthToken();
  if(!token)throw new Error('Session expirée — reconnectez-vous.');
  let lastErr='';
  for(var attempt=0;attempt<2;attempt++){
    const r=await fetch(COURIER_API,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SB_KEY,Authorization:'Bearer '+token},
      body:JSON.stringify(Object.assign({action:action},payload||{})),
    });
    const j=await r.json().catch(function(){return {};});
    if(r.ok)return j;
    lastErr=j.error||('Erreur '+r.status);
    if(r.status===401&&attempt===0){
      try{
        await sbClient.auth.refreshSession();
        const s2=await sbClient.auth.getSession();
        token=s2.data&&s2.data.session?s2.data.session.access_token:'';
        if(token)_cachedAccessToken=token;
        continue;
      }catch(e){}
    }
    break;
  }
  throw new Error(friendlyCourierErr(lastErr));
}

function courierStatusLabel(st){
  return{offered:'⏳ En attente',accepted:'✓ Acceptée',en_route:'🚗 En route',completed:'✅ Terminée',declined:'✗ Refusée',cancelled:'⊘ Annulée'}[st]||st;
}

function updateCourierNavBadge(missions){
  const list=missions||_courierMissionsSummary||[];
  const pending=list.filter(function(m){return m.status==='offered';}).length;
  const inProgress=list.filter(function(m){return ['accepted','en_route'].includes(m.status);}).length;
  const badge=document.getElementById('courier-tab-badge');
  const sub=document.getElementById('courier-tab-status');
  if(badge){
    if(pending>0){badge.style.display='inline';badge.textContent=pending>9?'9+':String(pending);badge.title='En attente d\'acceptation par le coursier';}
    else if(inProgress>0){badge.style.display='inline';badge.textContent='🚗';badge.style.background='#2a6049';badge.title='Mission(s) en cours';}
    else{badge.style.display='none';badge.style.background='#e53935';}
  }
  if(sub){
    if(pending>0)sub.textContent='⏳ '+pending+' en attente d\'acceptation';
    else if(inProgress>0)sub.textContent='🚗 '+inProgress+' mission(s) en cours';
    else sub.textContent='Missions & dispatch';
  }
  try{
    const base='Labosync';
    document.title=pending>0?'('+pending+') '+base:base;
  }catch(e){}
}

async function refreshCourierMissionsSummary(){
  if(!currentUser)return;
  try{
    const j=await courierApi('listMissions',{scope:'all',limit:80});
    _courierMissionsSummary=j.missions||[];
    updateCourierNavBadge(_courierMissionsSummary);
    notifyLabCourierMissionChanges(_courierMissionsSummary);
    const pane=document.getElementById('pane-coursiers');
    if(pane&&pane.classList.contains('on'))await renderCourierBoard();
  }catch(e){console.warn('refreshCourierMissionsSummary',e);}
}

function startCourierMissionPolling(){
  if(_courierPollTimer)return;
  refreshCourierMissionsSummary();
  _courierPollTimer=setInterval(function(){refreshCourierMissionsSummary();},25000);
}

let _cpDragIdx=null;
let _labCourierNotifySnap=null;

function buildMapsDirectionsUrl(stops){
  const addrs=(stops||[]).map(function(s){
    return String(s.cabAddress||s.cabName||'').trim();
  }).filter(Boolean);
  if(!addrs.length)return '';
  const enc=function(a){return encodeURIComponent(a);};
  if(addrs.length===1)return 'https://www.google.com/maps/dir/?api=1&destination='+enc(addrs[0])+'&travelmode=driving';
  const origin=enc(addrs[0]);
  const dest=enc(addrs[addrs.length-1]);
  let url='https://www.google.com/maps/dir/?api=1&origin='+origin+'&destination='+dest+'&travelmode=driving';
  if(addrs.length>2)url+='&waypoints='+addrs.slice(1,-1).map(enc).join('|');
  return url;
}

function labCourierNotify(title,body,tag){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  if(document.visibilityState==='visible')return;
  try{new Notification(title||'Labosync',{body:body,tag:tag||'labosync-lab-courier',icon:'/icon.svg'});}catch(e){}
}

function notifyLabCourierMissionChanges(all){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const snap={};
  (all||[]).forEach(function(m){snap[m.id]=m.status;});
  if(!_labCourierNotifySnap){_labCourierNotifySnap=snap;return;}
  (all||[]).forEach(function(m){
    const prev=_labCourierNotifySnap[m.id];
    const title=(missionStopsList(m)[0]&&missionStopsList(m)[0].cabName)||'Course';
    if(prev==='offered'&&m.status==='accepted')labCourierNotify('Course acceptée','Le coursier a pris en charge la course.','lab-accept-'+m.id);
    if(prev&&['accepted','en_route'].includes(prev)&&m.status==='completed')labCourierNotify('Course terminée',title,'lab-done-'+m.id);
  });
  _labCourierNotifySnap=snap;
}

function updateCpMapsPreviewBtn(){
  const btn=document.getElementById('btn-cp-maps-preview');
  if(!btn)return;
  const addrs=collectCpStopsPayload().map(function(s){return s.cabAddress||s.cabName;}).filter(Boolean);
  btn.style.display=addrs.length?'':'none';
}

function missionStopsList(m){
  if(Array.isArray(m.stops)&&m.stops.length){
    return m.stops.slice().sort(function(a,b){return(a.order||0)-(b.order||0);});
  }
  if(m.cabName)return[{type:m.type==='delivery'?'delivery':'pickup',cabId:m.cabId||'',cabName:m.cabName,cabPhone:m.cabPhone||'',cabAddress:m.cabAddress||'',status:m.status==='completed'?'done':'pending'}];
  return[];
}

function missionStopsSummaryHtml(m){
  const stops=missionStopsList(m);
  if(stops.length<=1){
    const s0=stops[0]||m;
    const mark=s0.status==='done'?' ✓':'';
    return (s0.type==='delivery'?'📦 Livraison':'📥 Récupération')+' · '+escH(s0.cabName||m.cabName||'')+mark;
  }
  return stops.map(function(s,idx){
    const mark=s.status==='done'?' <span style="color:#2a6049;font-weight:700;">✓</span>':' <span style="color:var(--ink-soft);">○</span>';
    return '<div style="font-size:.76rem;padding:2px 0;">'+(idx+1)+'. '+(s.type==='delivery'?'📦':'📥')+' '+escH(s.cabName)+mark+'</div>';
  }).join('');
}

function cpCabinetOptions(selectedId){
  const sorted=cabinets.slice().sort(function(a,b){return(a.name||'').localeCompare(b.name||'');});
  return '<option value="">— Dentiste —</option>'+
    sorted.map(function(c){
      return '<option value="'+escH(c.id)+'"'+(c.id===selectedId?' selected':'')+'>'+escH(c.name)+'</option>';
    }).join('');
}

function renderCpStops(){
  const el=document.getElementById('cp-stops-list');
  if(!el)return;
  el.innerHTML=_cpStops.map(function(stop,idx){
    const canRemove=_cpStops.length>1;
    return '<div class="cp-stop-row" data-idx="'+idx+'" draggable="true" style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;">'+
        '<span class="cp-drag-handle" title="Glisser pour réordonner" style="cursor:grab;user-select:none;font-size:1rem;line-height:1;color:var(--ink-soft);">⠿</span>'+
        '<span style="font-size:.72rem;font-weight:700;color:var(--ink-soft);flex:1;">Arrêt '+(idx+1)+'</span>'+
        (canRemove?'<button type="button" class="btn btn-b cp-stop-rm" data-idx="'+idx+'" style="font-size:.68rem;padding:2px 8px;">Retirer</button>':'')+
      '</div>'+
      '<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;">'+
        '<button type="button" class="btn cp-stop-type '+(stop.type==='pickup'?'btn-a':'btn-b')+'" data-idx="'+idx+'" data-type="pickup" style="flex:1;min-width:120px;font-size:.74rem;padding:8px;">📥 Récup.</button>'+
        '<button type="button" class="btn cp-stop-type '+(stop.type==='delivery'?'btn-a':'btn-b')+'" data-idx="'+idx+'" data-type="delivery" style="flex:1;min-width:120px;font-size:.74rem;padding:8px;">📦 Livr.</button>'+
      '</div>'+
      '<div class="fl" style="margin-bottom:8px;"><label>Dentiste</label><select class="cp-stop-cab" data-idx="'+idx+'">'+cpCabinetOptions(stop.cabId)+'</select></div>'+
      '<div class="fl"><label>Adresse (optionnel)</label><input type="text" class="cp-stop-addr" data-idx="'+idx+'" value="'+escH(stop.address||'')+'" placeholder="Rue, ville…"/></div>'+
    '</div>';
  }).join('');
  el.querySelectorAll('.cp-stop-type').forEach(function(btn){
    btn.addEventListener('click',function(){
      const i=parseInt(btn.dataset.idx,10);
      if(!isNaN(i)&&_cpStops[i]){_cpStops[i].type=btn.dataset.type==='delivery'?'delivery':'pickup';renderCpStops();}
    });
  });
  el.querySelectorAll('.cp-stop-cab').forEach(function(sel){
    sel.addEventListener('change',function(){
      const i=parseInt(sel.dataset.idx,10);
      if(isNaN(i)||!_cpStops[i])return;
      _cpStops[i].cabId=sel.value;
      const cab=cabinets.find(function(c){return c.id===sel.value;});
      if(cab){
        if(!_cpStops[i].address)_cpStops[i].address=cab.address||'';
        if(!_cpStops[i].phone)_cpStops[i].phone=cab.phone||'';
        renderCpStops();
      }
    });
  });
  el.querySelectorAll('.cp-stop-addr').forEach(function(inp){
    inp.addEventListener('input',function(){
      const i=parseInt(inp.dataset.idx,10);
      if(!isNaN(i)&&_cpStops[i]){_cpStops[i].address=inp.value;updateCpMapsPreviewBtn();}
    });
  });
  el.querySelectorAll('.cp-stop-rm').forEach(function(btn){
    btn.addEventListener('click',function(){
      const i=parseInt(btn.dataset.idx,10);
      if(_cpStops.length>1&&!isNaN(i)){_cpStops.splice(i,1);renderCpStops();}
    });
  });
  el.querySelectorAll('.cp-stop-row').forEach(function(row){
    row.addEventListener('dragstart',function(e){
      _cpDragIdx=parseInt(row.dataset.idx,10);
      row.classList.add('cp-dragging');
      if(e.dataTransfer)e.dataTransfer.effectAllowed='move';
    });
    row.addEventListener('dragend',function(){
      row.classList.remove('cp-dragging');
      el.querySelectorAll('.cp-stop-row').forEach(function(r){r.classList.remove('cp-drag-over');});
      _cpDragIdx=null;
    });
    row.addEventListener('dragover',function(e){
      e.preventDefault();
      row.classList.add('cp-drag-over');
      if(e.dataTransfer)e.dataTransfer.dropEffect='move';
    });
    row.addEventListener('dragleave',function(){row.classList.remove('cp-drag-over');});
    row.addEventListener('drop',function(e){
      e.preventDefault();
      row.classList.remove('cp-drag-over');
      const toIdx=parseInt(row.dataset.idx,10);
      if(_cpDragIdx==null||isNaN(toIdx)||_cpDragIdx===toIdx)return;
      const item=_cpStops.splice(_cpDragIdx,1)[0];
      _cpStops.splice(toIdx,0,item);
      renderCpStops();
    });
  });
  updateCpMapsPreviewBtn();
}

function collectCpStopsPayload(){
  return _cpStops.map(function(stop){
    const cab=cabinets.find(function(c){return c.id===stop.cabId;});
    if(!cab)return null;
    return{
      type:stop.type==='delivery'?'delivery':'pickup',
      cabId:cab.id,
      cabName:cab.name,
      cabPhone:(stop.phone||cab.phone||'').trim(),
      cabAddress:(stop.address||cab.address||'').trim(),
    };
  }).filter(Boolean);
}

async function initCourierPaneForm(){
  const courierSel=document.getElementById('cp-courier');
  const msg=document.getElementById('cp-msg');
  if(!courierSel)return;
  if(!_cpStops.length)_cpStops=[{type:'pickup',cabId:'',address:'',phone:''}];
  renderCpStops();

  if(!cabinets.length&&msg){
    msg.style.color='#d97706';
    msg.textContent='Aucun dentiste enregistré — ajoutez-en dans l\'onglet Dentistes.';
  }

  try{
    const j=await courierApi('listLinkedCouriers');
    _courierLinks=j.couriers||[];
    saveCourierLinksCache(_courierLinks);
  }catch(e){
    console.warn('listLinkedCouriers API',e);
    try{
      _courierLinks=await listLinkedCouriersLocal();
    }catch(e2){
      _courierLinks=loadCourierLinksCache();
    }
    if(!_courierLinks.length){
      courierSel.innerHTML='<option value="">— Aucun coursier —</option>';
      if(msg){
        msg.style.color='#c0392b';
        msg.textContent=friendlyCourierErr(e.message)+' Allez dans Réglages → Coursiers pour ajouter un coursier.';
      }
      return;
    }
    if(msg){
      msg.style.color='#d97706';
      msg.textContent='Liste coursier chargée (mode secours). '+(_courierLinks.length)+' coursier(s).';
    }
  }

  if(!_courierLinks.length){
    courierSel.innerHTML='<option value="">— Aucun coursier —</option>';
    if(msg){
      msg.style.color='#d97706';
      msg.textContent='Aucun coursier rattaché. Cliquez sur « Gérer les coursiers » pour en ajouter un.';
    }
  }else{
    courierSel.innerHTML=_courierLinks.map(function(c,i){
      return '<option value="'+escH(c.courierUserId)+'"'+(i===0?' selected':'')+'>'+escH(c.displayName)+' ('+escH(c.email||'')+')</option>';
    }).join('');
    if(msg&&!msg.textContent)msg.textContent='';
  }
}

async function sendCourierMissionRequest(payload,ui){
  const msgEl=ui&&ui.msgEl;
  const btn=ui&&ui.btn;
  if(btn)btn.disabled=true;
  if(msgEl){msgEl.style.color='var(--ink-soft)';msgEl.textContent='Envoi en cours…';}
  try{
    if(!payload.courierUserId)throw new Error('Choisissez un coursier');
    if(!payload.stops||!payload.stops.length){
      if(!payload.cabName)throw new Error('Ajoutez au moins un arrêt avec un dentiste');
    }
    await courierApi('createMission',payload);
    const n=payload.stops?payload.stops.length:(payload.cabName?1:0);
    showToast('Demande envoyée au coursier !'+(n>1?' ('+n+' arrêts)':''),'#2a6049',3500);
    refreshCourierMissionsSummary();
    if(msgEl){msgEl.style.color='#2a6049';msgEl.textContent='Demande envoyée.';}
    if(ui&&ui.onSuccess)ui.onSuccess();
  }catch(e){
    if(msgEl){msgEl.style.color='#c0392b';msgEl.textContent=e.message;}
    else alert(e.message);
    throw e;
  }finally{
    if(btn)btn.disabled=false;
  }
}


function labBillingMonthOptions(){
  const sel=document.getElementById('lab-courier-billing-month');
  if(!sel)return;
  const opts=[];
  const d=new Date();
  for(let i=0;i<18;i++){
    const y=d.getUTCFullYear();
    const m=d.getUTCMonth();
    const mk=y+'-'+String(m+1).padStart(2,'0');
    const label=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    opts.push('<option value="'+mk+'"'+(i===0?' selected':'')+'>'+label.charAt(0).toUpperCase()+label.slice(1)+'</option>');
    d.setUTCMonth(d.getUTCMonth()-1);
  }
  sel.innerHTML=opts.join('');
}

function syncLabCourierBillingSelectors(){
  const csel=document.getElementById('lab-courier-billing-courier');
  if(!csel)return;
  if(!_courierLinks.length){
    csel.innerHTML='<option value="">— Aucun coursier —</option>';
    return;
  }
  csel.innerHTML=_courierLinks.map(function(c,i){
    return '<option value="'+escH(c.courierUserId)+'"'+(i===0?' selected':'')+'>'+escH(c.displayName)+'</option>';
  }).join('');
  labBillingMonthOptions();
}

function fmtMonthLabelCourier(mk){
  if(!mk)return '';
  const p=mk.split('-');
  if(p.length<2)return mk;
  const dt=new Date(Date.UTC(parseInt(p[0],10),parseInt(p[1],10)-1,1));
  const label=dt.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  return label.charAt(0).toUpperCase()+label.slice(1);
}

function fmtBillingDateCourier(iso){
  if(!iso)return '';
  return new Date(iso).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}

async function loadLabCourierBilling(){
  const el=document.getElementById('lab-courier-billing-result');
  const csel=document.getElementById('lab-courier-billing-courier');
  const msel=document.getElementById('lab-courier-billing-month');
  if(!el||!csel||!msel)return;
  const courierUserId=csel.value;
  if(!courierUserId){
    el.innerHTML='<span style="color:var(--ink-soft);">Choisissez un coursier rattaché.</span>';
    return;
  }
  el.innerHTML='<span style="color:var(--ink-soft);">Chargement…</span>';
  try{
    const j=await courierApi('getCourierBillingForLab',{courierUserId:courierUserId,month:msel.value});
    const b=j.summary||{};
    const name=(b.courier&&b.courier.displayName)||'Coursier';
    const monthLbl=fmtMonthLabelCourier(b.period&&b.period.month);
    if(!b.totalCourses){
      el.innerHTML='<'+D+' style="padding:12px;background:var(--bg);border-radius:8px;color:var(--ink-soft);">Aucune course terminée pour <b>'+escH(name)+'</b> en '+escH(monthLbl)+'.</'+D+'>';
      return;
    }
    let html='<'+D+' style="padding:14px;background:#f0f7f4;border:1px solid #c8e6d4;border-radius:10px;margin-bottom:12px;">'+
      '<'+D+' style="font-weight:700;font-size:1rem;color:#2a6049;">'+b.totalCourses+' course'+(b.totalCourses>1?'s':'')+' terminée'+(b.totalCourses>1?'s':'')+'</'+D+'>'+
      '<'+D+' style="font-size:.78rem;color:#2a6049;margin-top:4px;">'+escH(name)+' · '+escH(monthLbl)+' · '+b.totalPickups+' réc. · '+b.totalDeliveries+' liv.</'+D+'></'+D+'>';
    if((b.missions||[]).length){
      html+='<'+D+' style="font-weight:700;margin-bottom:8px;font-size:.78rem;">Détail</'+D+'>';
      html+=(b.missions||[]).map(function(m,i){
        return '<'+D+' style="padding:8px 0;border-bottom:1px solid var(--border);font-size:.78rem;">'+
          '<b>'+(i+1)+'.</b> '+escH(m.label)+'<br/><span style="color:var(--ink-soft);">'+fmtBillingDateCourier(m.completedAt)+'</span></'+D+'>';
      }).join('');
    }
    el.innerHTML=html;
  }catch(e){
    el.innerHTML='<span style="color:#c0392b;">'+escH(e.message)+'</span>';
  }
}


async function renderCourierLinks(){
  const el=document.getElementById('courier-links-list');
  if(!el)return;
  try{
    const j=await courierApi('listLinkedCouriers');
    _courierLinks=j.couriers||[];
    el.innerHTML=_courierLinks.length?_courierLinks.map(function(c){
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;background:var(--bg);">'+
        '<div><div style="font-weight:600;font-size:.84rem;">'+escH(c.displayName)+'</div><div style="font-size:.72rem;color:var(--ink-soft);">'+escH(c.email)+'</div></div>'+
        '<button type="button" class="btn btn-b" style="font-size:.72rem;padding:4px 10px;" onclick="unlinkCourier(\''+c.courierUserId+'\')">Retirer</button></div>';
    }).join(''):'<div style="font-size:.78rem;color:var(--ink-soft);">Aucun coursier rattaché.</div>';
    syncLabCourierBillingSelectors();
    loadLabCourierBilling().catch(function(){});
  }catch(e){el.innerHTML='<div style="color:#c0392b;font-size:.78rem;">'+escH(e.message)+'</div>';}
}

async function renderCourierBoard(){
  const el=document.getElementById('courier-missions-board');
  if(!el)return;
  try{
    var all=[];
    try{
      const j=await courierApi('listMissions',{scope:'all',limit:80});
      all=j.missions||[];
    }catch(e){
      console.warn('listMissions API',e);
      all=await listMissionsLocal();
      if(!all.length)throw e;
    }
    _courierMissionsSummary=all;
    updateCourierNavBadge(all);
    notifyLabCourierMissionChanges(all);
    const active=all.filter(function(m){return ['offered','accepted','en_route'].includes(m.status);});
    const recent=all.filter(function(m){return ['completed','cancelled','declined'].includes(m.status);}).slice(0,15);
    let html='';
    if(active.length){
      html+='<div style="font-size:.72rem;font-weight:700;color:var(--ink-soft);text-transform:uppercase;margin-bottom:8px;">En cours</div>';
      html+=active.map(function(m){
        const cName=_courierLinks.find(function(c){return c.courierUserId===m.courierUserId;});
        const cLabel=cName?escH(cName.displayName):'Coursier';
        return '<div style="border:1px solid var(--border);border-radius:9px;padding:12px;margin-bottom:8px;background:var(--surface);">'+
          '<div style="font-weight:600;">'+missionStopsSummaryHtml(m)+'</div>'+
          '<div style="font-size:.72rem;color:var(--ink-soft);margin-top:4px;">'+cLabel+' · '+courierStatusLabel(m.status)+'</div>'+
          (m.status!=='completed'&&m.status!=='cancelled'?'<button type="button" class="btn btn-b" style="margin-top:8px;font-size:.7rem;padding:4px 10px;" onclick="cancelCourierMission(\''+m.id+'\')">Annuler</button>':'')+
        '</div>';
      }).join('');
    }else html+='<div style="font-size:.78rem;color:var(--ink-soft);margin-bottom:16px;">Aucune mission active.</div>';
    if(recent.length){
      html+='<div style="font-size:.72rem;font-weight:700;color:var(--ink-soft);text-transform:uppercase;margin:16px 0 8px;">Récent</div>';
      html+=recent.map(function(m){
        return '<div style="font-size:.78rem;padding:8px 0;border-bottom:1px solid var(--border);color:var(--ink-soft);">'+
          missionStopsSummaryHtml(m)+' · '+courierStatusLabel(m.status)+'</div>';
      }).join('');
    }
    el.innerHTML=html;
  }catch(e){
    el.innerHTML='<div style="color:#c0392b;padding:12px;">'+escH(friendlyCourierErr(e.message))+
      '<br/><button type="button" class="btn btn-b" style="margin-top:10px;font-size:.75rem;" onclick="renderCourierBoard()">Réessayer</button></div>';
  }
}

function startCourierLabRealtime(){
  if(!currentUser||_courierRtChannel)return;
  try{
    _courierRtChannel=sbClient.channel('lab-courier-board-'+currentUser.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'labo_data',filter:'id=eq.courier_board_'+currentUser.id},
        function(){refreshCourierMissionsSummary();})
      .subscribe();
  }catch(e){console.warn('startCourierLabRealtime',e);}
}

async function openCourierDispatch(cabId,type){
  _cdCabId=cabId;_cdType=type||'pickup';
  const cab=cabinets.find(function(c){return c.id===cabId;});
  if(!cab){alert('Cabinet introuvable');return;}
  try{
    if(!_courierLinks.length){const j=await courierApi('listLinkedCouriers');_courierLinks=j.couriers||[];}
  }catch(e){alert(e.message);return;}
  if(!_courierLinks.length){
    if(confirm('Aucun coursier rattaché. Ouvrir les réglages pour en ajouter un ?')){
      goSettings();setTimeout(function(){openSettingsSection('coursiers');},200);
    }
    return;
  }
  const sel=document.getElementById('cd-courier');
  sel.innerHTML=_courierLinks.map(function(c,i){
    return '<option value="'+c.courierUserId+'"'+(i===0?' selected':'')+'>'+escH(c.displayName)+'</option>';
  }).join('');
  document.getElementById('cd-title').textContent=(type==='delivery'?'📦 Livraison':'📥 Récupération')+' — '+cab.name;
  document.getElementById('cd-cab-name').value=cab.name;
  document.getElementById('cd-cab-address').value=cab.address||'';
  document.getElementById('cd-cab-phone').value=cab.phone||'';
  document.getElementById('cd-notes').value='';
  document.getElementById('cd-msg').textContent='';
  const mod=document.getElementById('courier-dispatch-modal');
  mod.style.display='flex';
}
function closeCourierDispatch(){document.getElementById('courier-dispatch-modal').style.display='none';}

async function unlinkCourier(courierUserId){
  if(!confirm('Retirer ce coursier de votre laboratoire ?'))return;
  try{
    await courierApi('unlinkCourier',{courierUserId:courierUserId});
    await renderCourierLinks();
    showToast('Coursier retiré','#2a6049');
  }catch(e){alert(e.message);}
}

async function cancelCourierMission(missionId){
  if(!confirm('Annuler cette mission ?'))return;
  try{
    await courierApi('cancelMission',{missionId:missionId});
    renderCourierBoard();
    showToast('Mission annulée','#d97706');
  }catch(e){alert(e.message);}
}

document.getElementById('btn-courier-link')?.addEventListener('click',async function(){
  const email=(document.getElementById('courier-link-email')?.value||'').trim().toLowerCase();
  const msg=document.getElementById('courier-link-msg');
  if(!email){if(msg){msg.style.color='#c0392b';msg.textContent='Email requis';}return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    if(msg){msg.style.color='#c0392b';msg.textContent='Adresse email invalide';}
    return;
  }
  this.disabled=true;
  try{
    await courierApi('linkCourier',{email:email});
    if(msg){msg.style.color='#2a6049';msg.textContent='Coursier ajouté avec succès.';}
    document.getElementById('courier-link-email').value='';
    await renderCourierLinks();
    try{
      const j=await courierApi('listLinkedCouriers');
      _courierLinks=j.couriers||[];
      saveCourierLinksCache(_courierLinks);
    }catch(e){}
    if(document.getElementById('pane-coursiers')&&document.getElementById('pane-coursiers').classList.contains('on'))initCourierPaneForm();
  }catch(e){if(msg){msg.style.color='#c0392b';msg.textContent=e.message;}}
  this.disabled=false;
});

document.getElementById('btn-cd-send')?.addEventListener('click',async function(){
  const cab=cabinets.find(function(c){return c.id===_cdCabId;});
  if(!cab)return;
  const msg=document.getElementById('cd-msg');
  try{
    await sendCourierMissionRequest({
      type:_cdType,
      courierUserId:document.getElementById('cd-courier').value,
      cabId:cab.id,
      cabName:cab.name,
      cabPhone:document.getElementById('cd-cab-phone').value.trim(),
      cabAddress:document.getElementById('cd-cab-address').value.trim(),
      notes:document.getElementById('cd-notes').value.trim(),
    },{msgEl:msg,btn:this,onSuccess:closeCourierDispatch});
  }catch(e){}
});

document.getElementById('btn-cp-add-stop')?.addEventListener('click',function(){
  _cpStops.push({type:'pickup',cabId:'',address:'',phone:''});
  renderCpStops();
});
document.getElementById('lab-courier-billing-courier')?.addEventListener('change',function(){loadLabCourierBilling().catch(function(){});});
document.getElementById('lab-courier-billing-month')?.addEventListener('change',function(){loadLabCourierBilling().catch(function(){});});
document.getElementById('btn-cp-maps-preview')?.addEventListener('click',function(){
  const url=buildMapsDirectionsUrl(collectCpStopsPayload());
  if(url)window.open(url,'_blank','noopener');
  else showToast('Ajoutez au moins une adresse pour l\'itinéraire.','#c0392b');
});
if('Notification' in window&&Notification.permission==='default'){
  try{Notification.requestPermission();}catch(e){}
}
document.getElementById('btn-cp-send')?.addEventListener('click',async function(){
  const msg=document.getElementById('cp-msg');
  const stops=collectCpStopsPayload();
  if(!stops.length){if(msg){msg.style.color='#c0392b';msg.textContent='Ajoutez au moins un arrêt avec un dentiste choisi.';}return;}
  try{
    await sendCourierMissionRequest({
      courierUserId:document.getElementById('cp-courier')?.value,
      stops:stops,
      notes:document.getElementById('cp-notes')?.value.trim()||'',
    },{msgEl:msg,btn:this,onSuccess:function(){
      document.getElementById('cp-notes').value='';
      _cpStops=[{type:'pickup',cabId:'',address:'',phone:''}];
      renderCpStops();
      if(msg)msg.textContent='';
    }});
  }catch(e){}
});
