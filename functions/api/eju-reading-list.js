// EJU 阅读题目列表接口（GET，?year=2024&session=1，需登录）
// 返回题目摘要列表（不含 passage 完整内容和答案）

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
    const userId = userData.user.id;

    // 读取年份和回数参数
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    const session = parseInt(url.searchParams.get("session") || "0", 10);
    if (!year || !session) return jsonResp({ error: "缺少 year 或 session 参数" }, 400);

    // 查题目列表（只取必要字段，不含 passage 和 answer）
    const { data: questions, error: qError } = await supabase
      .from("eju_questions")
      .select("id, question_no, question, source, difficulty, tags_json")
      .eq("skill", "reading")
      .eq("year", year)
      .eq("session", session)
      .eq("active", true)
      .order("question_no", { ascending: true });

    if (qError) return jsonResp({ error: "题目查询失败: " + qError.message }, 500);

    // 查该用户是否练过这些题
    const questionIds = (questions || []).map(q => q.id);
    let practicedSet = new Set();
    let wrongSet = new Set();

    if (questionIds.length > 0) {
      const { data: records } = await supabase
        .from("eju_user_records")
        .select("question_id")
        .eq("user_id", userId)
        .in("question_id", questionIds);
      (records || []).forEach(r => practicedSet.add(r.question_id));

      const { data: wrongs } = await supabase
        .from("eju_wrong_book")
        .select("question_id")
        .eq("user_id", userId)
        .eq("resolved", false)
        .in("question_id", questionIds);
      (wrongs || []).forEach(w => wrongSet.add(w.question_id));
    }

    const result = (questions || []).map(q => ({
      id: q.id,
      question_no: q.question_no,
      questionPreview: (q.question || "").slice(0, 60),
      source: q.source,
      difficulty: q.difficulty || "normal",
      tags: (() => { try { return JSON.parse(q.tags_json || "[]"); } catch { return []; } })(),
      practiced: practicedSet.has(q.id),
      isWrong: wrongSet.has(q.id)
    }));

    return jsonResp({ questions: result, year, session });
  } catch (err) {
    return jsonResp({ error: err.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "GET") return onRequestGet(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
