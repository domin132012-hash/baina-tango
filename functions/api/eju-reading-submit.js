// EJU 阅读提交答案接口（POST，需登录）
// 后端校验答案，保存训练记录，更新错题本

import { createClient } from "@supabase/supabase-js";

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization"
    }
  });
}

function uuidv4() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  const h = Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export async function onRequestPost(context) {
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
    const user = userData.user;

    // 解析请求体
    let body;
    try { body = await request.json(); } catch { return jsonResp({ error: "请求格式错误" }, 400); }
    const { questionId, selectedAnswer, phases, totalElapsed } = body;
    if (!questionId || !selectedAnswer) return jsonResp({ error: "缺少必要参数" }, 400);

    // 查题目基本信息
    const { data: qRow } = await supabase
      .from("eju_questions")
      .select("id, category, skill, year, session")
      .eq("id", questionId)
      .maybeSingle();
    if (!qRow) return jsonResp({ error: "题目不存在" }, 404);

    // 从 eju_answers 表读取正确答案（service role 才能读）
    const { data: ansRow, error: ansError } = await supabase
      .from("eju_answers")
      .select("answer, explanation")
      .eq("question_id", questionId)
      .maybeSingle();

    if (ansError) return jsonResp({ error: "答案查询失败: " + ansError.message }, 500);
    if (!ansRow) return jsonResp({ error: "该题暂无答案记录" }, 404);

    const correctAnswer = ansRow.answer;
    const explanation = ansRow.explanation || "";
    const isCorrect = selectedAnswer === correctAnswer;

    // 保存训练记录
    const recordId = uuidv4();
    const { error: insertErr } = await supabase.from("eju_user_records").insert({
      id: recordId,
      user_id: user.id,
      question_id: questionId,
      category: qRow.category,
      skill: qRow.skill,
      year: qRow.year,
      session: qRow.session,
      timestamp: new Date().toISOString(),
      phases_json: JSON.stringify(phases || {}),
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      total_elapsed: totalElapsed || 0,
      ai_analysis_json: null
    });
    if (insertErr) console.error("[eju-submit] 保存记录失败:", insertErr.message);

    // 更新错题本
    if (!isCorrect) {
      // 答错：upsert 错题记录
      const { data: existWrong } = await supabase
        .from("eju_wrong_book")
        .select("id, wrong_count")
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .maybeSingle();

      if (existWrong) {
        await supabase.from("eju_wrong_book").update({
          wrong_count: (existWrong.wrong_count || 1) + 1,
          last_practiced_at: new Date().toISOString(),
          resolved: false
        }).eq("id", existWrong.id);
      } else {
        await supabase.from("eju_wrong_book").insert({
          id: uuidv4(),
          user_id: user.id,
          question_id: questionId,
          created_at: new Date().toISOString(),
          last_practiced_at: new Date().toISOString(),
          wrong_count: 1,
          resolved: false
        });
      }
    } else {
      // 答对：标记错题为 resolved
      await supabase.from("eju_wrong_book")
        .update({ resolved: true, last_practiced_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("question_id", questionId);
    }

    return jsonResp({ ok: true, isCorrect, correctAnswer, explanation, recordId });
  } catch (err) {
    return jsonResp({ error: err.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
