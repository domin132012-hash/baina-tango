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

function chatEndpoint(baseUrl) {
  const base = String(baseUrl || "").replace(/\/+$/, "");
  if (base.endsWith("/chat/completions")) return base;
  return base + "/chat/completions";
}

function cleanDataUrl(s) {
  const x = String(s || "").trim();
  if (!x.startsWith("data:image/")) throw new Error("图片格式错误，请上传 JPG / PNG / WebP");
  if (x.length > 5.8 * 1024 * 1024) throw new Error("图片太大，请裁切或压缩后再上传");
  return x;
}

function cleanJsonText(text) {
  let s = String(text || "").trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  return s;
}

function parseAiJson(text) {
  try {
    return JSON.parse(cleanJsonText(text));
  } catch (e) {
    console.error("Image AI JSON parse failed:", text);
    throw new Error("豆包返回格式解析失败");
  }
}

function normalizeItem(x) {
  const word = String(x.word || "").trim();
  const definition = String(x.definition || x.meaning || x.zh || "").trim();
  if (!word || !definition) return null;
  return {
    word: word.slice(0, 40),
    reading: String(x.reading || x.kana || "").trim().slice(0, 30),
    pos: String(x.pos || "词语").trim().slice(0, 12),
    definition: definition.slice(0, 30),
    importance: Number(x.importance || 3),
    reason: String(x.reason || "").trim().slice(0, 40)
  };
}

function buildPrompt(maxWords) {
  return `
你是日语学习 App 的图片识别助手。
请从图片中识别适合背诵的日语词汇。

严格要求：
1. 只返回 JSON，不要 Markdown，不要解释。
2. 最多返回 ${maxWords} 个词。
3. 只提取日语单词、词组、汉字词、片假名词，不要整句。
4. reading 必须用平假名。
5. definition 用简体中文，必须精简，最好 2～15 个汉字。
6. 不要输出英文释义。
7. 如果图片是单词表，优先按图片里的单词表提取。
8. 如果图片是文章，提取最值得背的重点词。
9. 不要提取「する、ある、いる、こと、もの、これ、それ」这类低价值词。
10. 如果看不清，不要乱编。

返回格式：
{
  "items": [
    {
      "word": "検討",
      "reading": "けんとう",
      "pos": "名词・サ变动词",
      "definition": "讨论；研究；考虑",
      "importance": 5,
      "reason": "常用重点词"
    }
  ]
}
`;
}

async function callDoubaoVision(imageDataUrl, maxWords, env) {
  const DOUBAO_API_KEY = env.DOUBAO_API_KEY;
  const DOUBAO_BASE_URL = env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const DOUBAO_VISION_MODEL = env.DOUBAO_VISION_MODEL || env.DOUBAO_MODEL;

  if (!DOUBAO_API_KEY) throw new Error("豆包 API Key 未设置");
  if (!DOUBAO_VISION_MODEL) throw new Error("豆包视觉模型 ID 未设置：请添加 DOUBAO_VISION_MODEL");

  const res = await fetch(chatEndpoint(DOUBAO_BASE_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + DOUBAO_API_KEY },
    body: JSON.stringify({
      model: DOUBAO_VISION_MODEL,
      messages: [
        { role: "system", content: "你是日语学习图片识别助手。必须只返回合法 JSON，不要 Markdown。" },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageDataUrl } },
            { type: "text", text: buildPrompt(maxWords) }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1800
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || JSON.stringify(data).slice(0, 300);
    throw new Error("豆包图片识别失败：" + msg);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("豆包没有返回图片识别内容");

  return parseAiJson(content);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") return json(200, { ok: true });
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    if (!env.SUPABASE_URL || !(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY)) {
      return json(500, { error: "Supabase 后端环境变量未设置" });
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
    const imageDataUrl = cleanDataUrl(body.image);
    const maxWords = Math.max(5, Math.min(100, Number(body.maxWords || 30)));

    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from("user_entitlements")
      .select("ai_quota")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entitlementError) return json(500, { error: "读取 AI 次数失败：" + entitlementError.message });

    const aiQuota = Number(entitlement?.ai_quota || 0);
    if (aiQuota <= 0) return json(402, { error: "AI 次数不足，请先购买 AI 次数包" });

    const aiResult = await callDoubaoVision(imageDataUrl, maxWords, env);

    const items = (Array.isArray(aiResult.items) ? aiResult.items : [])
      .map(normalizeItem)
      .filter(Boolean)
      .slice(0, maxWords);

    if (!items.length) return json(400, { error: "图片里没有识别到可导入的日语词条" });

    const { error: updateError } = await supabaseAdmin
      .from("user_entitlements")
      .upsert(
        { user_id: user.id, ai_quota: Math.max(0, aiQuota - 1), updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (updateError) return json(500, { error: "扣除 AI 次数失败：" + updateError.message });

    return json(200, {
      ok: true,
      source: "doubao-image",
      model: env.DOUBAO_VISION_MODEL || env.DOUBAO_MODEL,
      used_ai_quota: 1,
      remaining_ai_quota: Math.max(0, aiQuota - 1),
      items
    });
  } catch (err) {
    console.error("AI image extract error:", err);
    return json(500, { error: err?.message || "图片识别失败" });
  }
}
