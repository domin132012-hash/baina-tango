// EJU 阅读单题接口（GET，?id=2024-1-r-001，需登录）
// 返回单题完整内容（不含答案）

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
  const { request, env } = context;
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // 验证用户登录
    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token) return jsonResp({ error: "请先登录账号", code: "unauthenticated" }, 401);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return jsonResp({ error: "登录状态已失效，请重新登录", code: "unauthenticated" }, 401);
    }

    // 读取 id 参数
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    if (!id) return jsonResp({ error: "缺少 id 参数" }, 400);

    // 查题目（不含 answer）
    const { data: q, error: qError } = await supabase
      .from("eju_questions")
      .select("id, question_no, passage, question, options_json, source, difficulty, tags_json, year, session")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();

    if (qError) return jsonResp({ error: "查询失败: " + qError.message }, 500);
    if (!q) return jsonResp({ error: "题目不存在或已下线" }, 404);

    let options;
    try { options = JSON.parse(q.options_json); } catch { options = {}; }
    let tags;
    try { tags = JSON.parse(q.tags_json || "[]"); } catch { tags = []; }

    return jsonResp({
      question: {
        id: q.id,
        question_no: q.question_no,
        passage: q.passage,
        question: q.question,
        options,
        source: q.source,
        difficulty: q.difficulty || "normal",
        tags,
        year: q.year,
        session: q.session
      }
    });
  } catch (err) {
    return jsonResp({ error: err.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "GET") return onRequestGet(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
