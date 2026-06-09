// EJU 阅读可用年份/回数接口（GET，无需登录）
// 从 eju_questions 表查询有哪些年份/回数

import { createClient } from "@supabase/supabase-js";

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization"
    }
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("eju_questions")
      .select("year, session")
      .eq("skill", "reading")
      .eq("active", true)
      .order("year", { ascending: false })
      .order("session", { ascending: false });

    if (error) return jsonResp({ error: "数据库查询失败: " + error.message }, 500);

    // 去重
    const seen = new Set();
    const sets = [];
    for (const row of (data || [])) {
      const key = `${row.year}-${row.session}`;
      if (!seen.has(key)) {
        seen.add(key);
        sets.push({ year: row.year, session: row.session });
      }
    }
    return jsonResp({ sets });
  } catch (err) {
    return jsonResp({ error: err.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "GET") return onRequestGet(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
