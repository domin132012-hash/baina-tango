/* ===== EJU MODULE START ===== */
// EJU 真题试炼前端逻辑
// 依赖：index.html 中的 supabaseClient / switchView / toast / apiUrl / $

// =====================================================================
// A. 全局变量
// =====================================================================
var ejuPhase = '';          // '' | 'structure' | 'questionRead' | 'locate' | 'answer'
var ejuSeconds = 0;
var ejuPaused = false;
var ejuTimerInterval = null;
var ejuCurrentQ = null;     // 当前题目对象
var ejuPhaseStartTime = 0;  // 当前阶段开始时间戳
var ejuElapsed = {};        // { structure:20, questionRead:5, ... }
var ejuStructureType = '';
var ejuSummary = '';
var ejuQuestionType = '';
var ejuEvidence = '';
var ejuSelectedAnswer = '';
var ejuSubmitted = false;
var ejuCurrentSets = [];    // 可用年份/回数列表
var ejuCurrentList = [];    // 当前选集的题目列表
var ejuCurrentYear = 0;
var ejuCurrentSession = 0;

var EJU_PHASE_DURATIONS = { structure: 20, questionRead: 5, locate: 20, answer: 30 };
var EJU_STRUCTURE_TYPES = ['主张型', '说明型', '对比型', '事例型', '原因结果型', '其他'];
var EJU_QUESTION_TYPES = ['作者主张题', '理由题', '内容一致题', '指示词题', '空欄补充题', '细节定位题'];

// =====================================================================
// G. 辅助函数
// =====================================================================

function ejuUUID() {
  var arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  var h = Array.from(arr).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}

async function ejuGetToken() {
  try {
    if (!window.supabaseClient) return '';
    var res = await supabaseClient.auth.getSession();
    return (res.data && res.data.session && res.data.session.access_token) || '';
  } catch(e) { return ''; }
}

async function ejuFetch(path, opts) {
  var token = await ejuGetToken();
  var headers = Object.assign({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }, (opts && opts.headers) || {});
  var finalOpts = Object.assign({}, opts || {}, { headers: headers });
  var url = (typeof apiUrl === 'function') ? apiUrl(path.replace('/api/', '')) : path;
  var res = await fetch(url, finalOpts);
  if (!res.ok) {
    var errText = await res.text().catch(function() { return 'unknown error'; });
    var errObj;
    try { errObj = JSON.parse(errText); } catch(e) { errObj = { error: errText }; }
    throw Object.assign(new Error(errObj.error || ('HTTP ' + res.status)), { code: errObj.code, status: res.status });
  }
  return res.json();
}

function ejuEsc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ejuFormatSec(sec) {
  sec = Math.round(sec || 0);
  if (sec < 60) return sec + 's';
  return Math.floor(sec/60) + 'm' + (sec%60) + 's';
}

// =====================================================================
// B. Hub 渲染
// =====================================================================

async function initEjuHub() {
  var el = document.getElementById('view-exam-trial');
  if (!el) return;
  var mount = el.querySelector('#ejuHubMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载科目列表…</p>';
  try {
    var data = await ejuFetch('/api/eju-categories');
    var cats = data.categories || [];
    var html = '<div class="eju-cat-grid">';
    cats.forEach(function(cat) {
      var disabled = !cat.available;
      html += '<button class="eju-cat-card' + (disabled ? ' disabled' : '') + '"'
        + (disabled ? ' disabled' : ' onclick="ejuSelectCategory(\'' + ejuEsc(cat.id) + '\')"')
        + '>';
      html += '<div class="hub-icon">' + ejuCatIcon(cat.id) + '</div>';
      html += '<strong>' + ejuEsc(cat.labelZh || cat.label) + '</strong>';
      html += '<span>' + ejuEsc(cat.label) + '</span>';
      if (disabled) html += '<span class="pill" style="margin-top:8px;font-size:11px">建设中</span>';
      html += '</button>';
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
  }
}

function ejuCatIcon(id) {
  var icons = { japanese: '🇯🇵', sogo: '📊', science: '🔬', math: '📐' };
  return icons[id] || '📝';
}

function ejuSelectCategory(catId) {
  if (catId === 'japanese') {
    switchView('eju-japanese');
    renderEjuJapanese();
  } else {
    if (typeof toast === 'function') toast('该科目暂未开放，敬请期待');
  }
}

function renderEjuJapanese() {
  var el = document.getElementById('view-eju-japanese');
  if (!el) return;
  var mount = el.querySelector('#ejuJapaneseMount');
  if (!mount) return;
  mount.innerHTML = ''
    + '<div class="eju-skill-grid">'
    + '<button class="eju-skill-card" id="ejuReadingSkillBtn" onclick="loadEjuReadingSets()">'
    + '<div class="eju-skill-icon">📖</div>'
    + '<div class="eju-skill-info">'
    + '<div class="eju-skill-title">読解</div>'
    + '<div class="eju-skill-desc">日语阅读四阶段训练</div>'
    + '</div>'
    + '<span class="eju-cat-badge">开放中</span>'
    + '</button>'
    + '<button class="eju-skill-card disabled" disabled>'
    + '<div class="eju-skill-icon">🎧</div>'
    + '<div class="eju-skill-info">'
    + '<div class="eju-skill-title">聴読解</div>'
    + '<div class="eju-skill-desc">建设中</div>'
    + '</div>'
    + '<span class="eju-cat-badge soon">建设中</span>'
    + '</button>'
    + '<button class="eju-skill-card disabled" disabled>'
    + '<div class="eju-skill-icon">✍️</div>'
    + '<div class="eju-skill-info">'
    + '<div class="eju-skill-title">記述</div>'
    + '<div class="eju-skill-desc">建设中</div>'
    + '</div>'
    + '<span class="eju-cat-badge soon">建设中</span>'
    + '</button>'
    + '</div>';
  var readingBtn = document.getElementById('ejuReadingSkillBtn');
  if (readingBtn) readingBtn.onclick = loadEjuReadingSets;
}

// =====================================================================
// C. 年份/回数选择 + 题目列表
// =====================================================================

async function loadEjuReadingSets() {
  switchView('eju-reading-select');
  var el = document.getElementById('view-eju-reading-select');
  if (!el) return;
  var mount = el.querySelector('#ejuReadingSelectMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载年份列表…</p>';
  try {
    var data = await ejuFetch('/api/eju-reading-sets');
    var sets = data.sets || [];
    if (!sets.length) {
      mount.innerHTML = '<p style="color:#8b86a3">暂无题目，管理员尚未上传题库。</p>';
      return;
    }
    // 按年份分组
    var byYear = {};
    sets.forEach(function(s) {
      if (!byYear[s.year]) byYear[s.year] = [];
      byYear[s.year].push(s.session);
    });
    var html = '<div class="eju-year-grid">';
    Object.keys(byYear).sort(function(a,b){return b-a;}).forEach(function(y) {
      byYear[y].sort().forEach(function(s) {
        html += '<button class="eju-year-card" onclick="loadEjuReadingList(' + y + ',' + s + ')">';
        html += '<strong>' + ejuEsc(y) + ' 年</strong>';
        html += '<span>第 ' + ejuEsc(s) + ' 回</span>';
        html += '</button>';
      });
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    if (e.code === 'unauthenticated') {
      mount.innerHTML = '<p style="color:#f05b7b">请先登录账号才能访问题库。</p>';
    } else {
      mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    }
  }
}

async function loadEjuReadingList(year, session) {
  ejuCurrentYear = year;
  ejuCurrentSession = session;
  switchView('eju-reading-list');
  var el = document.getElementById('view-eju-reading-list');
  if (!el) return;
  var title = el.querySelector('#ejuReadingListTitle') || el.querySelector('#ejuListTitle');
  if (title) title.textContent = year + ' 年第 ' + session + ' 回 · 読解題一覧';
  var mount = el.querySelector('#ejuReadingListMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载题目列表…</p>';
  try {
    var data = await ejuFetch('/api/eju-reading-list?year=' + year + '&session=' + session);
    ejuCurrentList = data.questions || [];
    if (!ejuCurrentList.length) {
      mount.innerHTML = '<p style="color:#8b86a3">该年份/回数暂无题目。</p>';
      return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">';
    ejuCurrentList.forEach(function(q, i) {
      var tags = (q.tags || []).map(function(t) {
        return '<span class="pill" style="font-size:11px">' + ejuEsc(t) + '</span>';
      }).join(' ');
      var practiced = q.practiced ? '<span class="pill ok" style="font-size:11px">已练</span>' : '';
      var wrong = q.isWrong ? '<span class="pill due" style="font-size:11px">错题</span>' : '';
      html += '<div class="eju-question-card">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">';
      html += '<span style="font-weight:900;color:#4d4770">第 ' + (q.question_no || (i+1)) + ' 题</span>';
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap">' + practiced + wrong + tags + '</div>';
      html += '</div>';
      html += '<p style="color:#756c9d;font-size:14px;line-height:1.6;margin:0 0 10px">' + ejuEsc(q.questionPreview) + (q.questionPreview && q.questionPreview.length >= 60 ? '…' : '') + '</p>';
      html += '<button class="primary" style="width:100%;padding:10px" onclick="startEjuReadingTrain(' + JSON.stringify(ejuEsc(q.id)) + ')">开始训练</button>';
      html += '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    if (e.code === 'unauthenticated') {
      mount.innerHTML = '<p style="color:#f05b7b">请先登录账号才能访问题库。</p>';
    } else {
      mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    }
  }
}

// =====================================================================
// D. 训练状态机 + 计时器
// =====================================================================

async function startEjuReadingTrain(questionId) {
  // 检查登录
  var token = await ejuGetToken();
  if (!token) {
    if (typeof toast === 'function') toast('请先登录账号，然后再开始训练');
    return;
  }

  switchView('eju-reading-train');
  var mount = document.getElementById('ejuTrainMount');
  if (mount) mount.innerHTML = '<p style="color:#8b86a3;padding:20px 0;text-align:center">加载题目…</p>';

  try {
    var data = await ejuFetch('/api/eju-reading-question?id=' + encodeURIComponent(questionId));
    ejuCurrentQ = data.question;
  } catch(e) {
    if (mount) mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    return;
  }

  // 重置所有训练状态
  ejuPhase = '';
  ejuElapsed = {};
  ejuStructureType = '';
  ejuSummary = '';
  ejuQuestionType = '';
  ejuEvidence = '';
  ejuSelectedAnswer = '';
  ejuSubmitted = false;
  ejuPaused = false;

  // 进入第一阶段
  ejuGoPhase('structure');
}

function ejuGoPhase(phase) {
  ejuStopTimer();
  if (ejuPhaseStartTime > 0) {
    // 保存上一阶段耗时
    ejuElapsed[ejuPhase] = Math.round((Date.now() - ejuPhaseStartTime) / 1000);
  }
  ejuPhase = phase;
  ejuPhaseStartTime = Date.now();
  ejuPaused = false;
  renderEjuTrain();
  if (EJU_PHASE_DURATIONS[phase] > 0) {
    ejuStartTimer(EJU_PHASE_DURATIONS[phase]);
  }
}

function ejuAdvancePhase() {
  var order = ['structure', 'questionRead', 'locate', 'answer'];
  var idx = order.indexOf(ejuPhase);
  if (idx >= 0 && idx < order.length - 1) {
    // 保存当前阶段用户输入
    ejuSavePhaseInput();
    ejuGoPhase(order[idx + 1]);
  } else if (ejuPhase === 'answer') {
    ejuHandleSubmit(false);
  }
}

function ejuSavePhaseInput() {
  var phase = ejuPhase;
  if (phase === 'structure') {
    var stEl = document.getElementById('ejuStructureTypeInput');
    if (stEl) ejuStructureType = stEl.value || '';
    var sumEl = document.getElementById('ejuSummaryInput');
    if (sumEl) ejuSummary = sumEl.value || '';
  } else if (phase === 'questionRead') {
    var qtEl = document.getElementById('ejuQuestionTypeInput');
    if (qtEl) ejuQuestionType = qtEl.value || '';
  } else if (phase === 'locate') {
    var evEl = document.getElementById('ejuEvidenceInput');
    if (evEl) ejuEvidence = evEl.value || '';
  }
}

function renderEjuTrain() {
  var mount = document.getElementById('ejuTrainMount');
  if (!mount || !ejuCurrentQ) return;

  var q = ejuCurrentQ;
  var phaseLabels = {
    structure: '①骨架判断',
    questionRead: '②读题干',
    locate: '③定位根据',
    answer: '④选择答案'
  };
  var phaseOrder = ['structure', 'questionRead', 'locate', 'answer'];

  // Phase bar
  var phaseBarHtml = '<div class="eju-phase-bar">';
  phaseOrder.forEach(function(p, i) {
    var cls = 'eju-phase-step';
    var idx = phaseOrder.indexOf(ejuPhase);
    if (i < idx) cls += ' done';
    else if (i === idx) cls += ' active';
    phaseBarHtml += '<div class="' + cls + '">' + ejuEsc(phaseLabels[p]) + '</div>';
  });
  phaseBarHtml += '</div>';

  // Timer
  var total = EJU_PHASE_DURATIONS[ejuPhase] || 0;
  var pct = total > 0 ? Math.max(0, Math.min(100, Math.round(ejuSeconds / total * 100))) : 0;
  var timerCls = 'eju-timer';
  if (total > 0 && ejuSeconds <= Math.floor(total * 0.25)) timerCls += ' danger';
  else if (total > 0 && ejuSeconds <= Math.floor(total * 0.5)) timerCls += ' warn';
  var timerHtml = total > 0
    ? '<div class="' + timerCls + '" id="ejuTimerDisplay">'
      + '<div class="eju-timer-ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="rgba(124,92,255,.12)" stroke-width="4"/><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="' + Math.round(2*Math.PI*17) + '" stroke-dashoffset="' + Math.round(2*Math.PI*17*(1-pct/100)) + '" transform="rotate(-90 20 20)"/></svg></div>'
      + '<span class="eju-timer-num" id="ejuTimerNum">' + ejuSeconds + '</span>'
      + (ejuPaused ? '<span class="eju-timer-label">已暂停</span>' : '')
      + '</div>'
    : '';

  // 阶段内容
  var contentHtml = '';
  if (ejuPhase === 'structure') {
    contentHtml = '<div class="eju-passage" id="ejuPassageEl">' + ejuEsc(q.passage) + '</div>'
      + '<div style="margin-top:14px">'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">文章类型（骨架判断）</label>'
      + '<select id="ejuStructureTypeInput" style="margin-bottom:10px">'
      + '<option value="">— 请选择 —</option>'
      + EJU_STRUCTURE_TYPES.map(function(t) {
          return '<option value="' + ejuEsc(t) + '"' + (ejuStructureType===t?' selected':'') + '>' + ejuEsc(t) + '</option>';
        }).join('')
      + '</select>'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">一句话概括文章大意（可选）</label>'
      + '<textarea id="ejuSummaryInput" placeholder="简要描述文章主旨…" style="min-height:60px">' + ejuEsc(ejuSummary) + '</textarea>'
      + '</div>';
  } else if (ejuPhase === 'questionRead') {
    contentHtml = '<div class="eju-passage" style="max-height:120px" id="ejuPassageEl">' + ejuEsc(q.passage) + '</div>'
      + '<div style="margin-top:14px;padding:16px;background:rgba(124,92,255,.06);border-radius:18px;border:1px solid rgba(124,92,255,.14)">'
      + '<div style="font-size:13px;color:#8b86a3;font-weight:700;margin-bottom:8px">题干</div>'
      + '<div style="font-weight:850;color:#30294d;line-height:1.7">' + ejuEsc(q.question) + '</div>'
      + '</div>'
      + '<div style="margin-top:14px">'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">题型判断</label>'
      + '<select id="ejuQuestionTypeInput">'
      + '<option value="">— 请选择 —</option>'
      + EJU_QUESTION_TYPES.map(function(t) {
          return '<option value="' + ejuEsc(t) + '"' + (ejuQuestionType===t?' selected':'') + '>' + ejuEsc(t) + '</option>';
        }).join('')
      + '</select>'
      + '</div>';
  } else if (ejuPhase === 'locate') {
    contentHtml = '<div class="eju-passage" id="ejuPassageEl">' + ejuEsc(q.passage) + '</div>'
      + '<div style="margin-top:14px;padding:14px;background:rgba(124,92,255,.06);border-radius:16px;border:1px solid rgba(124,92,255,.12);color:#756c9d;font-size:14px;line-height:1.65">'
      + '<b style="color:#4d4770">题干：</b>' + ejuEsc(q.question)
      + '</div>'
      + '<div style="margin-top:12px">'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">定位根据句（从文章中找到关键语句粘贴到这里）</label>'
      + '<textarea id="ejuEvidenceInput" placeholder="将你认为是答题根据的文章原文粘贴或输入到这里…" style="min-height:80px">' + ejuEsc(ejuEvidence) + '</textarea>'
      + '</div>';
  } else if (ejuPhase === 'answer') {
    var opts = q.options || {};
    contentHtml = '<div style="margin-bottom:12px;padding:14px;background:rgba(124,92,255,.06);border-radius:16px;border:1px solid rgba(124,92,255,.12)">'
      + '<div style="font-size:13px;color:#8b86a3;font-weight:700;margin-bottom:6px">题目</div>'
      + '<div style="font-weight:850;color:#30294d;line-height:1.7">' + ejuEsc(q.question) + '</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:10px">';
    ['1','2','3','4'].forEach(function(k) {
      if (!opts[k]) return;
      var sel = ejuSelectedAnswer === k;
      contentHtml += '<button class="eju-option' + (sel?' selected':'') + '" onclick="ejuSelectAnswer(' + JSON.stringify(k) + ')">'
        + '<span style="font-weight:900;min-width:22px;display:inline-block">(' + k + ')</span> '
        + ejuEsc(opts[k])
        + '</button>';
    });
    contentHtml += '</div>';
  }

  // 操作按钮
  var isLast = ejuPhase === 'answer';
  var btnHtml = '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">'
    + (ejuPaused
        ? '<button class="primary" onclick="ejuTogglePause()">继续</button>'
        : '<button class="ghost" onclick="ejuTogglePause()">暂停</button>')
    + '<button class="primary" style="flex:1" onclick="ejuAdvancePhase()">'
    + (isLast ? '提交答案' : '下一阶段')
    + '</button>'
    + '</div>';

  // 来源信息
  var metaHtml = '<div style="font-size:12px;color:#9086ac;margin-bottom:10px">'
    + ejuEsc(q.source || '') + (q.question_no ? ' · 第 '+q.question_no+' 题' : '')
    + '</div>';

  mount.innerHTML = phaseBarHtml
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 6px">'
    + '<div style="font-weight:900;color:#5a3df0;font-size:15px">' + ejuEsc(phaseLabels[ejuPhase] || '') + '</div>'
    + timerHtml
    + '</div>'
    + metaHtml
    + contentHtml
    + btnHtml;
}

function ejuSelectAnswer(key) {
  ejuSelectedAnswer = key;
  // 更新选项高亮（不重新渲染整个页面，避免清空输入）
  document.querySelectorAll('.eju-option').forEach(function(btn) {
    btn.classList.remove('selected');
  });
  var btns = document.querySelectorAll('.eju-option');
  var opts = (ejuCurrentQ && ejuCurrentQ.options) ? ejuCurrentQ.options : {};
  var k = 0;
  ['1','2','3','4'].forEach(function(num) {
    if (!opts[num]) return;
    if (btns[k]) {
      if (num === key) btns[k].classList.add('selected');
    }
    k++;
  });
}

function ejuTogglePause() {
  ejuPaused = !ejuPaused;
  if (ejuPaused) {
    ejuStopTimer();
  } else {
    ejuStartTimer(ejuSeconds);
  }
  // 只更新按钮区域
  var mount = document.getElementById('ejuTrainMount');
  if (mount) {
    var btnArea = mount.querySelector('[data-eju-buttons]');
    if (!btnArea) {
      // 重新渲染（只有第一次需要）
      renderEjuTrain();
      return;
    }
  }
  renderEjuTrain();
}

async function ejuHandleSubmit(timedOut) {
  if (ejuSubmitted) return;
  ejuSubmitted = true;
  ejuStopTimer();
  ejuSavePhaseInput();

  // 记录最后阶段耗时
  ejuElapsed[ejuPhase] = Math.round((Date.now() - ejuPhaseStartTime) / 1000);

  var totalElapsed = Object.values(ejuElapsed).reduce(function(a, b) { return a + b; }, 0);

  var mount = document.getElementById('ejuTrainMount');
  if (mount) mount.innerHTML = '<p style="color:#8b86a3;text-align:center;padding:20px 0">提交中…</p>';

  try {
    var data = await ejuFetch('/api/eju-reading-submit', {
      method: 'POST',
      body: JSON.stringify({
        questionId: ejuCurrentQ.id,
        selectedAnswer: ejuSelectedAnswer,
        phases: {
          structure: { elapsed: ejuElapsed.structure || 0, structureType: ejuStructureType, summary: ejuSummary },
          questionRead: { elapsed: ejuElapsed.questionRead || 0, questionType: ejuQuestionType },
          locate: { elapsed: ejuElapsed.locate || 0, evidence: ejuEvidence },
          answer: { elapsed: ejuElapsed.answer || 0, selectedAnswer: ejuSelectedAnswer }
        },
        totalElapsed: totalElapsed
      })
    });
    renderEjuResult(data.isCorrect, data.correctAnswer, data.explanation, data.recordId);
  } catch(e) {
    if (mount) mount.innerHTML = '<p style="color:#f05b7b">提交失败：' + ejuEsc(e.message) + '。<br><button class="ghost" style="margin-top:12px" onclick="ejuSubmitted=false;ejuHandleSubmit(false)">重试</button></p>';
  }
}

// =====================================================================
// Timer
// =====================================================================

function ejuStartTimer(secs) {
  ejuStopTimer();
  ejuSeconds = secs;
  ejuUpdateTimerDisplay();
  ejuTimerInterval = setInterval(ejuTickTimer, 1000);
}

function ejuStopTimer() {
  if (ejuTimerInterval) {
    clearInterval(ejuTimerInterval);
    ejuTimerInterval = null;
  }
}

function ejuTickTimer() {
  if (ejuPaused) return;
  ejuSeconds -= 1;
  if (ejuSeconds <= 0) {
    ejuSeconds = 0;
    ejuStopTimer();
    ejuUpdateTimerDisplay();
    // 超时自动进入下一阶段
    if (ejuPhase === 'answer') {
      ejuHandleSubmit(true);
    } else {
      ejuAdvancePhase();
    }
    return;
  }
  ejuUpdateTimerDisplay();
}

function ejuUpdateTimerDisplay() {
  var numEl = document.getElementById('ejuTimerNum');
  if (numEl) numEl.textContent = ejuSeconds;

  // 更新 SVG ring
  var timerEl = document.getElementById('ejuTimerDisplay');
  if (timerEl) {
    var total = EJU_PHASE_DURATIONS[ejuPhase] || 1;
    var pct = Math.max(0, Math.min(100, Math.round(ejuSeconds / total * 100)));
    var circle = timerEl.querySelector('circle:last-child');
    if (circle) {
      var dashLen = Math.round(2 * Math.PI * 17);
      circle.setAttribute('stroke-dashoffset', Math.round(dashLen * (1 - pct/100)));
    }
    // 颜色状态
    timerEl.className = 'eju-timer';
    if (ejuSeconds <= Math.floor(total * 0.25)) timerEl.classList.add('danger');
    else if (ejuSeconds <= Math.floor(total * 0.5)) timerEl.classList.add('warn');
  }
}

// =====================================================================
// E. 结果页
// =====================================================================

function renderEjuResult(isCorrect, correctAnswer, explanation, recordId) {
  switchView('eju-reading-result');
  var mount = document.getElementById('ejuResultMount');
  if (!mount) return;

  var q = ejuCurrentQ || {};
  var opts = q.options || {};

  var statusIcon = isCorrect ? '✅' : '❌';
  var statusText = isCorrect ? '回答正确！' : '回答错误';
  var statusColor = isCorrect ? 'var(--green)' : 'var(--red)';

  // 各阶段耗时
  var phaseRows = [
    { key: 'structure', label: '①骨架判断', input: ejuStructureType ? ('类型：' + ejuStructureType) : '' },
    { key: 'questionRead', label: '②读题干', input: ejuQuestionType ? ('题型：' + ejuQuestionType) : '' },
    { key: 'locate', label: '③定位根据', input: ejuEvidence ? ejuEvidence.slice(0,40)+'…' : '' },
    { key: 'answer', label: '④选择答案', input: ejuSelectedAnswer ? ('选了 ('+ejuSelectedAnswer+')' + (opts[ejuSelectedAnswer]?' '+opts[ejuSelectedAnswer].slice(0,20)+'…':'')) : '' }
  ];

  var phaseHtml = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">';
  phaseRows.forEach(function(row) {
    phaseHtml += '<div class="eju-score-row">'
      + '<span class="eju-score-label">' + ejuEsc(row.label) + '</span>'
      + '<span class="eju-score-time">' + ejuFormatSec(ejuElapsed[row.key] || 0) + '</span>'
      + (row.input ? '<span class="eju-score-input">' + ejuEsc(row.input) + '</span>' : '')
      + '</div>';
  });
  phaseHtml += '</div>';

  // 正确答案区
  var ansHtml = '<div style="margin-top:16px;padding:16px;border-radius:18px;background:rgba(32,180,134,.08);border:1px solid rgba(32,180,134,.22)">'
    + '<div style="font-size:13px;color:#20b486;font-weight:800;margin-bottom:8px">正确答案：(' + ejuEsc(correctAnswer) + ')</div>'
    + '<div style="color:#30294d;line-height:1.7">' + ejuEsc((opts[correctAnswer] || '')) + '</div>'
    + (explanation ? '<div style="margin-top:10px;font-size:13px;color:#756c9d;line-height:1.65">' + ejuEsc(explanation) + '</div>' : '')
    + '</div>';

  var html = '<div style="text-align:center;padding:20px 0 12px">'
    + '<div style="font-size:48px;margin-bottom:8px">' + statusIcon + '</div>'
    + '<div style="font-size:24px;font-weight:950;color:' + statusColor + ';letter-spacing:-.03em">' + ejuEsc(statusText) + '</div>'
    + '<div style="color:#8b86a3;font-size:14px;margin-top:6px">' + ejuEsc(q.source||'') + (q.question_no?' · 第'+q.question_no+'题':'') + '</div>'
    + '</div>'
    + ansHtml
    + '<div style="margin-top:16px"><h3 style="margin:0 0 4px;font-size:16px">各阶段用时</h3>'
    + phaseHtml + '</div>'
    + '<div id="ejuAiAnalysisMount" style="margin-top:16px"></div>'
    + '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">'
    + '<button class="ghost" style="flex:1" onclick="switchView(\'eju-reading-list\')">返回题目列表</button>'
    + '<button class="primary" style="flex:1" onclick="startEjuReadingTrain(' + JSON.stringify(ejuEsc(q.id||'')) + ')">重新练习</button>'
    + '</div>';

  mount.innerHTML = html;
}

// =====================================================================
// F. 历史记录
// =====================================================================

async function loadEjuHistory() {
  var mount = document.getElementById('ejuHistoryMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载记录…</p>';
  try {
    var data = await ejuFetch('/api/eju-reading-history');
    var records = data.records || [];
    if (!records.length) {
      mount.innerHTML = '<div class="empty-message"><div class="empty-icon">📋</div><b>暂无训练记录</b><p>开始训练后，记录会出现在这里。</p></div>';
      return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:10px">';
    records.forEach(function(r) {
      var icon = r.isCorrect ? '✅' : '❌';
      var date = r.timestamp ? new Date(r.timestamp).toLocaleDateString('zh-CN') : '';
      html += '<div class="eju-question-card" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">'
        + '<div>'
        + '<div style="font-size:13px;color:#9086ac;margin-bottom:4px">' + ejuEsc(r.source||'') + ' · 第' + (r.questionNo||'?') + '题 · ' + ejuEsc(date) + '</div>'
        + '<div style="font-size:14px;color:#4d4770;line-height:1.6">' + ejuEsc(r.questionPreview || '') + '</div>'
        + '</div>'
        + '<div style="text-align:right">'
        + '<div style="font-size:20px">' + icon + '</div>'
        + '<div style="font-size:12px;color:#9086ac">' + ejuFormatSec(r.totalElapsed) + '</div>'
        + '<button class="ghost" style="margin-top:6px;padding:6px 10px;font-size:12px" onclick="startEjuReadingTrain(' + JSON.stringify(ejuEsc(r.questionId)) + ')">重练</button>'
        + '</div>'
        + '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    if (e.code === 'unauthenticated') {
      mount.innerHTML = '<p style="color:#f05b7b">请先登录账号。</p>';
    } else {
      mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    }
  }
}

/* ===== EJU MODULE END ===== */
