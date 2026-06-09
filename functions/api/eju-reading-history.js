// EJU 阅读历史记录接口（GET，需登录）
// 返回当前用户最近 50 条训练记录

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

    // 可选筛选：年份/回数
    const url = new URL(request.url);
    const year = url.searchParams.get("year") ? parseInt(url.searchParams.get("year"), 10) : null;
    const session = url.searchParams.get("session") ? parseInt(url.searchParams.get("session"), 10) : null;

    // 查训练记录
    let query = supabase
      .from("eju_user_records")
      .select("id, question_id, year, session, timestamp, selected_answer, is_correct, total_elapsed")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (year) query = query.eq("year", year);
    if (session) query = query.eq("session", session);

    const { data: records, error: rError } = await query;
    if (rError) return jsonResp({ error: "查询失败: " + rError.message }, 500);

    // 批量获取题目摘要
    const qIds = [...new Set((records || []).map(r => r.question_id))];
    let questionMap = {};
    if (qIds.length > 0) {
      const { data: qs } = await supabase
        .from("eju_questions")
        .select("id, question_no, question, source")
        .in("id", qIds);
      (qs || []).forEach(q => { questionMap[q.id] = q; });
    }

    const result = (records || []).map(r => {
      const q = questionMap[r.question_id] || {};
      return {
        id: r.id,
        questionId: r.question_id,
        questionNo: q.question_no || null,
        questionPreview: (q.question || "").slice(0, 60),
        source: q.source || `${r.year}年第${r.session}回`,
        year: r.year,
        session: r.session,
        timestamp: r.timestamp,
        selectedAnswer: r.selected_answer,
        isCorrect: r.is_correct,
        totalElapsed: r.total_elapsed
      };
    });

    return jsonResp({ records: result, total: result.length });
  } catch (err) {
    return jsonResp({ error: err.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "GET") return onRequestGet(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
