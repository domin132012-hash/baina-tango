import { createClient } from "@supabase/supabase-js";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}

function maskCode(code) {
  const s = normalizeCode(code);
  if (s.length <= 8) return "****";
  return s.slice(0, 4) + "****" + s.slice(-4);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") return json(200, { ok: true });
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    if (!env.SUPABASE_URL || !(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY)) {
      return json(500, { error: "Supabase 后端环境变量未设置" });
    }

    if (!env.DEVELOPER_REDEEM_CODE) {
      return json(500, { error: "开发者兑换码环境变量未设置：DEVELOPER_REDEEM_CODE" });
    }

    const supabaseAdmin = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY
    );

    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json(401, { error: "请先登录账号" });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) return json(401, { error: "登录状态无效，请重新登录" });

    const user = userData.user;
    const body = await request.json().catch(() => ({}));
    const inputCode = normalizeCode(body.code);
    const devCode = normalizeCode(env.DEVELOPER_REDEEM_CODE);

    if (!inputCode) return json(400, { error: "请输入兑换码" });
    if (inputCode !== devCode) return json(400, { error: "兑换码无效" });

    const now = new Date().toISOString();

    const { data: oldEntitlement, error: readError } = await supabaseAdmin
      .from("user_entitlements")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readError) {
      console.error("Read entitlement error:", readError);
      return json(500, { error: "读取用户权益失败" });
    }

    const oldWordBonus = Number(oldEntitlement?.word_limit_bonus || 0);
    const oldAiQuota = Number(oldEntitlement?.ai_quota || 0);
    const nextWordBonus = Math.max(oldWordBonus, 999999);
    const nextAiQuota = Math.max(oldAiQuota, 999999);

    const { error: upsertError } = await supabaseAdmin
      .from("user_entitlements")
      .upsert(
        { user_id: user.id, word_limit_bonus: nextWordBonus, ai_quota: nextAiQuota, updated_at: now },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Developer redeem upsert error:", upsertError);
      return json(500, { error: "写入开发者权益失败：" + upsertError.message });
    }

    return json(200, {
      ok: true,
      message: "开发者兑换成功：已开启近似无限单词上限和 AI 次数",
      label: "开发者无限权益",
      maskedCode: maskCode(inputCode),
      word_limit_bonus: nextWordBonus,
      ai_quota: nextAiQuota
    });
  } catch (err) {
    console.error("Redeem code error:", err);
    return json(500, { error: err?.message || "兑换失败" });
  }
}
