/* ===== EJU ESSAY MODULE START =====
 * 目的：把 EJU 記述作文批改嫁接到百纳的「学习 → 真题试炼 → 日本語」页。
 * 方式：不改 index.html、不重构 assets/eju.js；本脚本由 Cloudflare middleware 注入，运行时启用「記述」卡片。
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'baina-eju-essay-history-v1';
  var state = {
    essayTheme: '',
    essay: '',
    essayMode: 'student',
    critique: null,
    result: '',
    errorRows: null,
    normalScore: null,
    strictScore: null,
    summaryLine: '',
    charCount: 0,
    rubricSource: '',
    matchedReferences: [],
    followInput: '',
    thread: []
  };

  function esc(str) {
    if (typeof ejuEsc === 'function') return ejuEsc(str);
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function jsString(str) {
    if (typeof ejuJsString === 'function') return ejuJsString(str);
    return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
  }

  function toastMsg(msg) {
    if (typeof toast === 'function') toast(msg);
    else alert(msg);
  }

  function setTitle(text) {
    if (typeof ejuSetSubjectTitle === 'function') ejuSetSubjectTitle(text);
    else {
      var title = document.getElementById('ejuSubjectTitle');
      if (title) title.textContent = text;
    }
  }

  function countChars(text) {
    return String(text || '').replace(/[\s\n\r\t]/g, '').length;
  }

  async function essayFetch(path, opts) {
    if (typeof ejuFetch === 'function') return ejuFetch(path, opts);
    var res = await fetch(path, Object.assign({
      headers: { 'Content-Type': 'application/json' }
    }, opts || {}));
    var text = await res.text();
    var data;
    try { data = JSON.parse(text); } catch(e) { data = { error: text }; }
    if (!res.ok) throw Object.assign(new Error(data.error || ('HTTP ' + res.status)), { status: res.status, code: data.code });
    return data;
  }

  function historyList() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch(e) { return []; }
  }

  function saveHistory(item) {
    var list = historyList();
    list.unshift(item);
    list = list.slice(0, 30);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e) {}
  }

  function deleteHistory(id) {
    var list = historyList().filter(function(item) { return item.id !== id; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e) {}
    renderEssayHome();
  }

  function loadHistory(id) {
    var item = historyList().find(function(row) { return row.id === id; });
    if (!item) return;
    state.essayTheme = item.essayTheme || '';
    state.essay = item.essay || '';
    state.essayMode = item.essayMode || 'student';
    state.result = item.result || '';
    state.normalScore = item.normalScore;
    state.strictScore = item.strictScore;
    state.summaryLine = item.summaryLine || '';
    state.errorRows = item.errorRows || null;
    state.charCount = item.charCount || countChars(state.essay);
    state.rubricSource = item.rubricSource || '';
    state.matchedReferences = Array.isArray(item.matchedReferences) ? item.matchedReferences : [];
    state.thread = [];
    renderEssayResult();
  }

  function mount() {
    if (typeof switchView === 'function') switchView('eju-japanese');
    setTitle('日本語 · 記述');
    var view = document.getElementById('view-eju-japanese');
    return view ? view.querySelector('#ejuJapaneseMount') : null;
  }

  function injectStyle() {
    if (document.getElementById('ejuEssayStyle')) return;
    var style = document.createElement('style');
    style.id = 'ejuEssayStyle';
    style.textContent = [
      '.eju-essay-shell{display:grid;gap:14px}',
      '.eju-essay-card{background:rgba(255,255,255,.86);border:1px solid rgba(124,92,255,.14);border-radius:20px;padding:16px;box-shadow:0 10px 28px rgba(105,80,200,.08)}',
      '.eju-essay-label{display:block;font-size:13px;color:#8178a4;font-weight:900;margin:0 0 7px}',
      '.eju-essay-textarea{width:100%;box-sizing:border-box;border:1px solid rgba(124,92,255,.18);background:#fff;border-radius:16px;padding:12px 13px;font:inherit;color:#30294d;outline:0;resize:vertical}',
      '.eju-essay-input{width:100%;box-sizing:border-box;border:1px solid rgba(124,92,255,.18);background:#fff;border-radius:14px;padding:11px 12px;font:inherit;color:#30294d;outline:0}',
      '.eju-essay-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:#8178a4;font-size:12px}',
      '.eju-essay-score-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}',
      '.eju-essay-score{background:rgba(124,92,255,.07);border:1px solid rgba(124,92,255,.14);border-radius:16px;padding:12px}',
      '.eju-essay-score b{font-size:28px;color:#5d43e8}',
      '.eju-essay-result{white-space:pre-wrap;line-height:1.78;color:#332b4f;font-size:14px}',
      '.eju-essay-error-table{width:100%;border-collapse:separate;border-spacing:0 8px;font-size:13px}',
      '.eju-essay-error-table td,.eju-essay-error-table th{text-align:left;vertical-align:top;padding:10px;background:#fff;border-top:1px solid rgba(124,92,255,.12);border-bottom:1px solid rgba(124,92,255,.12)}',
      '.eju-essay-error-table th{color:#756c9d;font-weight:900;background:rgba(124,92,255,.06)}',
      '.eju-essay-error-table td:first-child,.eju-essay-error-table th:first-child{border-left:1px solid rgba(124,92,255,.12);border-radius:12px 0 0 12px}',
      '.eju-essay-error-table td:last-child,.eju-essay-error-table th:last-child{border-right:1px solid rgba(124,92,255,.12);border-radius:0 12px 12px 0}',
      '.eju-essay-history{display:grid;gap:8px}',
      '.eju-essay-history-item{display:flex;justify-content:space-between;gap:10px;align-items:center;background:rgba(255,255,255,.78);border:1px solid rgba(124,92,255,.12);border-radius:14px;padding:10px 12px}',
      '.eju-essay-thread{display:grid;gap:8px}',
      '.eju-essay-bubble{padding:10px 12px;border-radius:14px;line-height:1.65;white-space:pre-wrap}',
      '.eju-essay-bubble.user{background:rgba(124,92,255,.08);color:#332b4f}',
      '.eju-essay-bubble.assistant{background:#fff;border:1px solid rgba(124,92,255,.12);color:#332b4f}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function renderEssayHome() {
    injectStyle();
    var m = mount();
    if (!m) return;
    state.charCount = countChars(state.essay);
    var histories = historyList();
    var historyHtml = histories.length ? histories.slice(0, 8).map(function(item) {
      var title = item.essayTheme || '未命名题目';
      var score = item.strictScore || item.normalScore || '-';
      return '<div class="eju-essay-history-item">'
        + '<button class="ghost" style="text-align:left;flex:1" onclick="ejuEssayLoadHistory(\'' + jsString(item.id) + '\')">'
        + '<b>' + esc(title.slice(0, 28)) + '</b><br><span style="font-size:12px;color:#8b86a3">' + esc(item.createdAt || '') + ' · 严格 ' + esc(score) + '/50 · ' + esc(item.charCount || '-') + '字</span>'
        + '</button>'
        + '<button class="ghost" onclick="ejuEssayDeleteHistory(\'' + jsString(item.id) + '\')">删除</button>'
        + '</div>';
    }).join('') : '<p style="color:#8b86a3;margin:0">还没有批改历史。先交一篇作文，历史就会在这里出现。</p>';

    m.innerHTML = ''
      + '<div class="eju-essay-shell">'
      + '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">'
      + '<button class="ghost" onclick="ejuEssayBackToJapanese()">← 返回日本語</button>'
      + '<span class="pill ok" style="font-size:11px">AI 批改底座 v2</span>'
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<label class="eju-essay-label">题目 / テーマ</label>'
      + '<input id="ejuEssayThemeInput" class="eju-essay-input" placeholder="例：インターネットの利用について、あなたの意見を述べなさい。" value="' + esc(state.essayTheme) + '">'
      + '<div style="height:12px"></div>'
      + '<label class="eju-essay-label">作文本文</label>'
      + '<textarea id="ejuEssayInput" class="eju-essay-textarea" rows="13" placeholder="ここに日本語の作文を入力…">' + esc(state.essay) + '</textarea>'
      + '<div class="eju-essay-meta" style="justify-content:space-between;margin-top:10px">'
      + '<span>当前字数：<b id="ejuEssayCharCount">' + state.charCount + '</b> 字（空白不计）</span>'
      + '<label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="ejuEssayModelMode"' + (state.essayMode === 'model' ? ' checked' : '') + '> 范文分析模式</label>'
      + '</div>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">'
      + '<button class="primary" onclick="ejuEssayAnalyze()">提交批改</button>'
      + '<button class="ghost" onclick="ejuEssayClearDraft()">清空</button>'
      + '</div>'
      + '<p style="color:#8b86a3;font-size:12px;line-height:1.7;margin:12px 0 0">说明：当前先接入文字作文批改。手写 OCR 和教材问答不放进第一版，避免把整个系统一次性搬炸。</p>'
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">最近批改历史</div>'
      + '<div class="eju-essay-history">' + historyHtml + '</div>'
      + '</div>'
      + '</div>';

    var essayEl = document.getElementById('ejuEssayInput');
    var themeEl = document.getElementById('ejuEssayThemeInput');
    var modeEl = document.getElementById('ejuEssayModelMode');
    var countEl = document.getElementById('ejuEssayCharCount');
    if (essayEl) essayEl.addEventListener('input', function() {
      state.essay = essayEl.value;
      state.charCount = countChars(state.essay);
      if (countEl) countEl.textContent = String(state.charCount);
    });
    if (themeEl) themeEl.addEventListener('input', function() { state.essayTheme = themeEl.value; });
    if (modeEl) modeEl.addEventListener('change', function() { state.essayMode = modeEl.checked ? 'model' : 'student'; });
  }

  function renderEssayLoading() {
    var m = mount();
    if (!m) return;
    m.innerHTML = '<div class="eju-essay-card"><p style="color:#8b86a3;margin:0">AI 正在批改中…</p><p style="color:#8b86a3;font-size:12px;line-height:1.7">这一步会调用 DeepSeek。不要刷新页面。</p></div>';
  }

  async function analyzeEssay() {
    var themeEl = document.getElementById('ejuEssayThemeInput');
    var essayEl = document.getElementById('ejuEssayInput');
    var modeEl = document.getElementById('ejuEssayModelMode');
    state.essayTheme = themeEl ? themeEl.value.trim() : state.essayTheme;
    state.essay = essayEl ? essayEl.value.trim() : state.essay;
    state.essayMode = modeEl && modeEl.checked ? 'model' : 'student';
    state.charCount = countChars(state.essay);
    if (!state.essay) return toastMsg('作文不能为空');
    renderEssayLoading();
    try {
      var data = await essayFetch('/api/eju-essay/analyze', {
        method: 'POST',
        body: JSON.stringify({
          essayTheme: state.essayTheme,
          essay: state.essay,
          essayMode: state.essayMode,
          essayCharCount: state.charCount
        })
      });
      state.result = data.result || '';
      state.normalScore = data.normalScore;
      state.strictScore = data.strictScore;
      state.summaryLine = data.summaryLine || '';
      state.errorRows = data.errorRows;
      state.charCount = data.charCount || state.charCount;
      state.rubricSource = data.rubricSource || '';
      state.matchedReferences = Array.isArray(data.matchedReferences) ? data.matchedReferences : [];
      state.thread = [];
      var item = {
        id: String(Date.now()),
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        essayTheme: state.essayTheme,
        essay: state.essay,
        essayMode: state.essayMode,
        result: state.result,
        normalScore: state.normalScore,
        strictScore: state.strictScore,
        summaryLine: state.summaryLine,
        errorRows: state.errorRows,
        charCount: state.charCount,
        rubricSource: state.rubricSource,
        matchedReferences: state.matchedReferences
      };
      saveHistory(item);
      renderEssayResult();
    } catch(e) {
      var m = mount();
      if (m) m.innerHTML = '<div class="eju-essay-card"><p style="color:#f05b7b">批改失败：' + esc(e.message) + '</p><button class="ghost" onclick="ejuEssayRenderHome()">返回编辑</button></div>';
    }
  }

  function errorTableHtml(rows) {
    if (rows === null || rows === undefined) return '<p style="color:#f05b7b">⚠️ 错误表解析失败，但完整批改文本仍可查看。</p>';
    if (!Array.isArray(rows) || rows.length === 0) return '<p style="color:#8b86a3">✅ 未检测到明显必改项。</p>';
    return '<div style="overflow:auto"><table class="eju-essay-error-table">'
      + '<thead><tr><th>原文</th><th>类型</th><th>建议修改</th><th>理由</th></tr></thead><tbody>'
      + rows.map(function(row) {
        var tag = row.severity === 'high' ? '必改' : (row.severity === 'low' ? '可保留' : '建议改');
        return '<tr><td>' + esc(row.original) + '</td><td><b>' + esc(row.issue || '-') + '</b><br><span style="font-size:11px;color:#8b86a3">' + esc(row.mustFix || tag) + '</span></td><td>' + esc(row.correction) + '</td><td>' + esc(row.reason) + '</td></tr>';
      }).join('')
      + '</tbody></table></div>';
  }

  function threadHtml() {
    if (!state.thread.length) return '';
    return '<div class="eju-essay-thread">' + state.thread.map(function(msg) {
      return '<div class="eju-essay-bubble ' + (msg.role === 'assistant' ? 'assistant' : 'user') + '">' + esc(msg.content) + '</div>';
    }).join('') + '</div>';
  }

  function matchedReferencesHtml() {
    if (!Array.isArray(state.matchedReferences) || state.matchedReferences.length === 0) {
      return '<p style="color:#8b86a3;margin:0">未命中具体参考素材，仅使用通用 rubric 评分。</p>';
    }
    return '<div class="eju-essay-history">' + state.matchedReferences.map(function(ref) {
      return '<div class="eju-essay-history-item"><div><b>' + esc(ref.id || '-') + '</b><br><span style="font-size:12px;color:#8b86a3">' + esc(ref.topic || '-') + ' · ' + esc(ref.type || '-') + '</span></div><span class="pill" style="font-size:11px">' + esc(ref.type || '参考') + '</span></div>';
    }).join('') + '</div>';
  }

  function renderEssayResult() {
    injectStyle();
    var m = mount();
    if (!m) return;
    var strict = state.strictScore == null ? '-' : state.strictScore;
    var normal = state.normalScore == null ? '-' : state.normalScore;
    m.innerHTML = ''
      + '<div class="eju-essay-shell">'
      + '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">'
      + '<button class="ghost" onclick="ejuEssayRenderHome()">← 返回编辑</button>'
      + '<button class="ghost" onclick="ejuEssayBackToJapanese()">返回日本語</button>'
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div class="eju-essay-score-grid">'
      + '<div class="eju-essay-score"><span>严格評価</span><br><b>' + esc(strict) + '</b><span>/50</span></div>'
      + '<div class="eju-essay-score"><span>普通評価</span><br><b>' + esc(normal) + '</b><span>/50</span></div>'
      + '<div class="eju-essay-score"><span>字数</span><br><b>' + esc(state.charCount) + '</b><span>字</span></div>'
      + '</div>'
      + (state.summaryLine ? '<p style="font-weight:900;color:#30294d;margin:14px 0 0">' + esc(state.summaryLine) + '</p>' : '')
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">评分依据</div>'
      + '<p style="margin:0;color:#332b4f;line-height:1.7">' + esc(state.rubricSource || '速攻トレーニング記述・基礎編 rubric') + '</p>'
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">参考素材</div>'
      + matchedReferencesHtml()
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">错误修正表</div>'
      + errorTableHtml(state.errorRows)
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">完整批改</div>'
      + '<div class="eju-essay-result">' + esc(state.result) + '</div>'
      + '</div>'
      + '<div class="eju-essay-card">'
      + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">继续追问</div>'
      + threadHtml()
      + '<textarea id="ejuEssayFollowInput" class="eju-essay-textarea" rows="3" placeholder="例：为什么这里不能用このように？ / 帮我把第一段改自然一点。">' + esc(state.followInput) + '</textarea>'
      + '<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap"><button class="primary" onclick="ejuEssayFollowUp()">发送追问</button></div>'
      + '</div>'
      + '</div>';
  }

  async function followUp() {
    var input = document.getElementById('ejuEssayFollowInput');
    var q = input ? input.value.trim() : '';
    if (!q) return toastMsg('请输入追问内容');
    state.thread.push({ role: 'user', content: q });
    state.thread.push({ role: 'assistant', content: '思考中…' });
    renderEssayResult();
    try {
      var data = await essayFetch('/api/eju-essay/follow-up', {
        method: 'POST',
        body: JSON.stringify({
          question: q,
          essayTheme: state.essayTheme,
          essay: state.essay,
          critique: state.result,
          context: state.thread.filter(function(x) { return x.content !== '思考中…'; })
        })
      });
      state.thread[state.thread.length - 1] = { role: 'assistant', content: data.answer || '' };
      state.followInput = '';
      renderEssayResult();
    } catch(e) {
      state.thread[state.thread.length - 1] = { role: 'assistant', content: '追问失败：' + e.message };
      renderEssayResult();
    }
  }

  function clearDraft() {
    state.essayTheme = '';
    state.essay = '';
    state.essayMode = 'student';
    state.critique = null;
    state.result = '';
    state.errorRows = null;
    state.normalScore = null;
    state.strictScore = null;
    state.summaryLine = '';
    state.charCount = 0;
    state.rubricSource = '';
    state.matchedReferences = [];
    state.thread = [];
    renderEssayHome();
  }

  function backToJapanese() {
    if (typeof switchView === 'function') switchView('eju-japanese');
    if (typeof window.__bainaOriginalRenderEjuJapanese === 'function') window.__bainaOriginalRenderEjuJapanese();
    else if (typeof renderEjuJapanese === 'function') renderEjuJapanese();
    setTimeout(enableEssayCard, 0);
  }

  function enableEssayCard() {
    var view = document.getElementById('view-eju-japanese');
    if (!view) return;
    var cards = view.querySelectorAll('.eju-skill-card');
    cards.forEach(function(card) {
      var title = card.querySelector('.eju-skill-title');
      if (!title || title.textContent.trim() !== '記述') return;
      card.disabled = false;
      card.classList.remove('disabled');
      card.id = 'ejuEssaySkillBtn';
      card.onclick = renderEssayHome;
      var desc = card.querySelector('.eju-skill-desc');
      if (desc) desc.textContent = 'EJU 記述作文 AI 批改';
      var badge = card.querySelector('.eju-cat-badge');
      if (badge) {
        badge.textContent = '试验开放';
        badge.classList.remove('soon');
      }
    });
  }

  function patchJapaneseRenderer() {
    if (window.__bainaEssayPatched) return;
    var original = window.renderEjuJapanese;
    if (typeof original !== 'function') return;
    window.__bainaOriginalRenderEjuJapanese = original;
    window.renderEjuJapanese = function() {
      original.apply(this, arguments);
      enableEssayCard();
    };
    window.__bainaEssayPatched = true;
    enableEssayCard();
  }

  window.ejuEssayRenderHome = renderEssayHome;
  window.ejuEssayAnalyze = analyzeEssay;
  window.ejuEssayFollowUp = followUp;
  window.ejuEssayClearDraft = clearDraft;
  window.ejuEssayBackToJapanese = backToJapanese;
  window.ejuEssayLoadHistory = loadHistory;
  window.ejuEssayDeleteHistory = deleteHistory;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchJapaneseRenderer);
  } else {
    patchJapaneseRenderer();
  }
  setTimeout(patchJapaneseRenderer, 300);
})();
/* ===== EJU ESSAY MODULE END ===== */
