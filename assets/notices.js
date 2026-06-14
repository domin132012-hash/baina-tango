(function(){
  'use strict';

  var API_PREFIX = location.hostname.endsWith('.netlify.app') ? '/.netlify/functions' : '/api';
  var DISMISSED_KEY = 'baina-tango-notice-dismissed';
  var READ_KEY = 'baina-tango-notice-read';
  var state = { all: [], visible: [], loaded: false };

  function byId(id){ return document.getElementById(id); }
  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }
  function readJsonArray(key){
    try{
      var data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data.map(String) : [];
    }catch(e){ return []; }
  }
  function writeJsonArray(key, arr){
    try{ localStorage.setItem(key, JSON.stringify(Array.from(new Set(arr.map(String))))); }catch(e){}
  }
  function iconFor(type){
    return ({ version:'💬', tip:'📌', info:'🔔', warning:'⚠️', maintenance:'🛠️', event:'📅', success:'✅' })[String(type||'').toLowerCase()] || '🔔';
  }
  function parseTime(value){
    if(value === null || value === undefined || value === '') return null;
    var t = new Date(value).getTime();
    return Number.isFinite(t) ? t : null;
  }
  function normalizeNotice(raw){
    raw = raw && typeof raw === 'object' ? raw : {};
    var id = String(raw.id || '').trim();
    if(!id) id = 'notice-' + Math.random().toString(36).slice(2);
    return {
      id: id,
      type: String(raw.type || 'info'),
      title: String(raw.title || '消息通知'),
      body: String(raw.body || ''),
      enabled: raw.enabled === true,
      priority: Number(raw.priority || 0),
      startAt: raw.startAt || null,
      endAt: raw.endAt || null,
      dismissible: raw.dismissible !== false,
      showOnce: raw.showOnce !== false,
      time: raw.time || raw.footer || '百纳日语团队'
    };
  }
  function currentVisible(notices){
    var now = Date.now();
    var dismissed = new Set(readJsonArray(DISMISSED_KEY));
    return notices.map(normalizeNotice).filter(function(n){
      if(n.enabled !== true) return false;
      if(!n.id) return false;
      if(n.showOnce === true && dismissed.has(n.id)) return false;
      var start = parseTime(n.startAt);
      var end = parseTime(n.endAt);
      if(start !== null && now < start) return false;
      if(end !== null && now > end) return false;
      return true;
    }).sort(function(a,b){ return Number(b.priority||0) - Number(a.priority||0) || String(b.id).localeCompare(String(a.id)); });
  }
  function ensureNoticeList(){
    var card = document.querySelector('#notifyModal .notify-card');
    if(!card) return null;
    var list = byId('noticeList');
    if(!list){
      var head = card.querySelector('.notify-head');
      card.querySelectorAll('.notice-message,.empty-message').forEach(function(el){ el.remove(); });
      list = document.createElement('div');
      list.id = 'noticeList';
      list.className = 'notice-list';
      if(head) head.insertAdjacentElement('afterend', list);
      else card.appendChild(list);
    }
    return list;
  }
  function renderEmpty(list){
    list.innerHTML = '<div class="empty-message"><div class="empty-icon">🔕</div><b>暂无新消息</b><span>有新通知时会在这里显示。</span></div>';
  }
  function renderNotices(){
    var list = ensureNoticeList();
    if(!list) return;
    state.visible = currentVisible(state.all);
    if(!state.visible.length){ renderEmpty(list); return; }
    list.innerHTML = state.visible.map(function(n){
      var closeBtn = n.dismissible ? '<button class="ghost" data-dismiss-notice="'+escapeHtml(n.id)+'" aria-label="关闭通知" title="关闭通知" style="margin-left:auto;padding:4px 9px;border-radius:999px;line-height:1">×</button>' : '';
      var period = '';
      if(n.startAt || n.endAt){
        var from = n.startAt ? String(n.startAt).slice(0,10) : '现在';
        var to = n.endAt ? String(n.endAt).slice(0,10) : '长期';
        period = '｜' + from + ' → ' + to;
      }
      return '<div class="notice-message" data-notice-id="'+escapeHtml(n.id)+'">'
        + '<div class="notice-title"><span class="notice-icon">'+escapeHtml(iconFor(n.type))+'</span><span>'+escapeHtml(n.title)+'</span>'+closeBtn+'</div>'
        + '<div style="white-space:pre-wrap">'+escapeHtml(n.body)+'</div>'
        + '<div class="notice-time">'+escapeHtml(n.time || '百纳日语团队')+escapeHtml(period)+'</div>'
        + '</div>';
    }).join('');
  }
  async function loadNotices(){
    var controller = new AbortController();
    var timer = setTimeout(function(){ try{ controller.abort(); }catch(e){} }, 4500);
    try{
      var res = await fetch(API_PREFIX + '/notices', { method:'GET', cache:'no-store', signal: controller.signal });
      if(!res.ok) return [];
      var data = await res.json().catch(function(){ return {}; });
      if(Array.isArray(data)) return data;
      if(Array.isArray(data.notices)) return data.notices;
      return [];
    }catch(e){
      return [];
    }finally{
      clearTimeout(timer);
    }
  }
  async function initBainaNotices(){
    ensureNoticeList();
    var list = byId('noticeList');
    if(list) renderEmpty(list);
    bindNoticeEvents();
    state.all = await loadNotices();
    state.loaded = true;
    renderNotices();
    updateNotifyBadge();
  }
  function updateNotifyBadge(){
    var btn = byId('notifyBtn');
    if(!btn) return;
    state.visible = currentVisible(state.all);
    var read = new Set(readJsonArray(READ_KEY));
    var hasUnread = state.visible.some(function(n){ return !read.has(n.id); });
    btn.classList.toggle('has-unread', hasUnread);
  }
  function openNotify(){
    renderNotices();
    var modal = byId('notifyModal');
    if(modal) modal.classList.remove('hidden');
    var read = readJsonArray(READ_KEY);
    state.visible.forEach(function(n){ read.push(n.id); });
    writeJsonArray(READ_KEY, read);
    updateNotifyBadge();
  }
  function closeNotify(){
    var modal = byId('notifyModal');
    if(modal) modal.classList.add('hidden');
  }
  function dismissNotice(id){
    var notice = state.visible.find(function(n){ return n.id === id; });
    if(notice && notice.showOnce === true){
      var dismissed = readJsonArray(DISMISSED_KEY);
      dismissed.push(id);
      writeJsonArray(DISMISSED_KEY, dismissed);
    }
    state.all = state.all.filter(function(n){ return String(n.id) !== String(id); });
    renderNotices();
    updateNotifyBadge();
  }
  function bindNoticeEvents(){
    var btn = byId('notifyBtn');
    var closeBtn = byId('closeNotifyBtn');
    var modal = byId('notifyModal');
    if(btn) btn.onclick = openNotify;
    if(closeBtn) closeBtn.onclick = closeNotify;
    if(modal){
      modal.onclick = function(e){
        var dismiss = e.target && e.target.dataset ? e.target.dataset.dismissNotice : '';
        if(dismiss){ dismissNotice(dismiss); return; }
        if(e.target && e.target.id === 'notifyModal') closeNotify();
      };
    }
  }

  window.openNotify = openNotify;
  window.closeNotify = closeNotify;
  window.updateNotifyBadge = updateNotifyBadge;
  window.initBainaNotices = initBainaNotices;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBainaNotices, { once:true });
  else initBainaNotices();
})();
