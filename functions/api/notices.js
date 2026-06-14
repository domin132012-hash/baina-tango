const NOTICES_KEY = 'notices:all';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-store'
    }
  });
}

async function readNotices(env) {
  if (!env.NOTICES_KV) return [];
  const raw = await env.NOTICES_KV.get(NOTICES_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.notices)) return data.notices;
  return [];
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, { ok: true });
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });

  try {
    const notices = await readNotices(env);
    return json(200, { notices });
  } catch (err) {
    console.error('Read notices error:', err);
    return json(200, { notices: [] });
  }
}
