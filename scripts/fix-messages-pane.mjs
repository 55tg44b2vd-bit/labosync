import fs from 'fs';
import path from 'path';

const file = path.resolve(import.meta.dirname, '../app.html');
let s = fs.readFileSync(file, 'utf8');

const fnStart = 'async function renderMessagesPane(){';
const fnEnd = '  if(withPortal.length) _queueMessagesPaneRender();\n}';
const altEnd = '_queueMessagesPaneRender();\n}';

let startIdx = s.indexOf(fnStart);
let endIdx = s.indexOf('  if(withPortal.length) _queueMessagesPaneRender();\n}', startIdx);
if (endIdx < 0) {
  endIdx = s.indexOf(fnStart);
  endIdx = s.indexOf('_queueMessagesPaneRender();\n}', startIdx);
  endIdx += '_queueMessagesPaneRender();\n}'.length;
} else {
  endIdx += fnEnd.length;
}

const newFn = `async function renderMessagesPane(){
  if(_isRenderingMessagesPane) return;
  _isRenderingMessagesPane = true;
  const el = document.getElementById('messages-cab-list');
  if(!cabinets.length){
    el.innerHTML = '<motion class="empty">'+t('empty.cabinets')+'</motion>';
    _isRenderingMessagesPane = false;
    return;
  }
  const withPortal=cabinets.filter(function(c){return c.portalId;});
  const withoutPortal=cabinets.filter(function(c){return !c.portalId;});
  el.innerHTML = withPortal.map(function(cab){
    const prev = _chatPreview[cab.portalId]||{};
    const unread = _chatUnread[cab.id]||0;
    const lastMsg = prev.lastMsg||'';
    const lastTime = prev.lastTime ? fmtChatTime(prev.lastTime) : '';
    return '<motion onclick="openChatModal(\\''+cab.id+'\\')" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--border);border-radius:12px;margin-bottom:10px;cursor:pointer;background:var(--surface);transition:box-shadow .15s;" onmouseover="this.style.boxShadow=\\'0 2px 12px rgba(0,0,0,.09)\\'" onmouseout="this.style.boxShadow=\\'none\\'">'
      +'<div style="width:44px;height:44px;border-radius:50%;background:'+cab.color+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;flex-shrink:0;">'+chatEscH((cab.name||'?')[0].toUpperCase())+'</motion>'
      +'<div style="flex:1;min-width:0;">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">'
          +'<span style="font-weight:600;font-size:.9rem;">'+chatEscH(cab.name)+'</span>'
          +(unread>0?'<span style="background:#e53935;color:#fff;border-radius:99px;padding:1px 8px;font-size:.62rem;font-weight:700;">'+unread+' nouveau'+(unread>1?'x':'')+'</span>':'')
        +'</div>'
        +'<div style="font-size:.78rem;color:var(--ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(lastMsg?chatEscH(lastMsg):'<em>'+t('empty.messages_short')+'</em>')+'</div>'
      +'</motion>'
      +(lastTime?'<div style="font-size:.68rem;color:var(--ink-soft);flex-shrink:0;">'+lastTime+'</div>':'')
      +'</motion>';
  }).join('');
  if(withoutPortal.length){
    el.innerHTML+=withoutPortal.map(function(cab){
      return '<div style="padding:12px 16px;border:1px dashed var(--border);border-radius:10px;margin-bottom:8px;font-size:.78rem;color:var(--ink-soft);">'
        +chatEscH(cab.name)+' — pas de portail (Paramètres → Dentistes → publier le portail).'
        +'</div>';
    }).join('');
  }
  await Promise.all(withPortal.map(async function(cab){
    if(!_canPollChat(cab.portalId)) return;
    try{
      const r=await fetch('/.netlify/functions/portal?type=chat&portalId='+encodeURIComponent(cab.portalId),{headers:_portalApiHeaders()});
      if(!r.ok){
        _noteChatPollResult(cab.portalId,false);
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
}`;

const cleanFn = newFn.replace(/<\/?motion\b/g, (tag) => tag.replace(/motion/g, 'div'));

if (startIdx < 0) throw new Error('start not found');
s = s.slice(0, startIdx) + cleanFn + s.slice(endIdx);
fs.writeFileSync(file, s);
console.log('OK', startIdx, endIdx);
