const NOTICES_KEY = 'notices:all';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Cache-Control': 'no-store'
    }
  });
}

function safeEqual(a, b) {
  a = String(a || '');
  b = String(b || '');
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0 && b.length > 0;
}

function tokenFrom(request) {
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  return bearer || (request.headers.get('x-admin-token') || '').trim();
}

function requireAdmin(request, env) {
  const expected = env.ADMIN_NOTICE_TOKEN || '';
  if (!expected) return false;
  return safeEqual(tokenFrom(request), expected);
}

async function readBody(request) {
  if (request.method === 'GET') return {};
  return await request.json().catch(() => ({}));
}

async function readNotices(env) {
  const raw = await env.NOTICES_KV.get(NOTICES_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.notices)) return data.notices;
  return [];
}

async function writeNotices(env, notices) {
  await env.NOTICES_KV.put(NOTICES_KEY, JSON.stringify(notices, null, 2));
}

function cleanDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? String(value) : null;
}

function makeId(title) {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const slug = String(title || 'notice').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36) || 'notice';
  return `${date}-${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeNotice(input, old = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const title = source.title !== undefined ? String(source.title || '').trim() : old.title;
  const body = source.body !== undefined ? String(source.body || '').trim() : old.body;
  const next = {
    id: String(source.id || old.id || makeId(title)).trim(),
    type: String(source.type !== undefined ? source.type : (old.type || 'info')).trim() || 'info',
    title: title || '消息通知',
    body: body || '',
    enabled: source.enabled !== undefined ? source.enabled === true : (old.enabled !== undefined ? old.enabled === true : true),
    priority: Number(source.priority !== undefined ? source.priority : (old.priority || 0)),
    startAt: source.startAt !== undefined ? cleanDate(source.startAt) : (old.startAt || null),
    endAt: source.endAt !== undefined ? cleanDate(source.endAt) : (old.endAt || null),
    dismissible: source.dismissible !== undefined ? source.dismissible !== false : (old.dismissible !== undefined ? old.dismissible !== false : true),
    showOnce: source.showOnce !== undefined ? source.showOnce !== false : (old.showOnce !== undefined ? old.showOnce !== false : true)
  };
  if (!Number.isFinite(next.priority)) next.priority = 0;
  return next;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, { ok: true });

  if (!requireAdmin(request, env)) return json(401, { error: 'Unauthorized: ADMIN_NOTICE_TOKEN missing or invalid' });
  if (!env.NOTICES_KV) return json(500, { error: 'NOTICES_KV is not bound. Configure Cloudflare Pages KV binding first.' });

  try {
    const url = new URL(request.url);
    const body = await readBody(request);
    let notices = await readNotices(env);

    if (request.method === 'GET') return json(200, { notices });

    if (request.method === 'POST') {
      const notice = normalizeNotice(body);
      if (!notice.title || !notice.body) return json(400, { error: 'title and body are required' });
      if (notices.some(n => String(n.id) === notice.id)) return json(409, { error: 'notice id already exists' });
      notices.unshift(notice);
      await writeNotices(env, notices);
      return json(200, { ok: true, notice, notices });
    }

    if (request.method === 'PUT') {
      const id = String(body.id || url.searchParams.get('id') || '').trim();
      if (!id) return json(400, { error: 'id is required' });
      const idx = notices.findIndex(n => String(n.id) === id);
      if (idx < 0) return json(404, { error: 'notice not found' });
      const merged = normalizeNotice(Object.assign({}, body, { id }), notices[idx]);
      notices[idx] = merged;
      await writeNotices(env, notices);
      return json(200, { ok: true, notice: merged, notices });
    }

    if (request.method === 'DELETE') {
      const id = String(url.searchParams.get('id') || body.id || '').trim();
      if (!id) return json(400, { error: 'id is required' });
      const before = notices.length;
      notices = notices.filter(n => String(n.id) !== id);
      await writeNotices(env, notices);
      return json(200, { ok: true, deleted: before - notices.length, notices });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin notices error:', err);
    return json(500, { error: err?.message || 'Admin notices failed' });
  }
}
