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

function clampText(text, maxChars) {
  text = String(text || "").trim();
  return text.length > maxChars ? text.slice(0, maxChars) : text;
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
    console.error("AI JSON parse failed:", text);
    throw new Error("AI 返回格式解析失败");
  }
}

function normalizeItems(items, maxWords) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      word: String(item.word || item.surface || "").trim(),
      reading: String(item.reading || item.kana || "").trim(),
      definition: String(item.definition || item.meaning || "").trim(),
      importance: Math.max(1, Math.min(Number(item.importance || 3), 5)),
      reason: String(item.reason || "").trim()
    }))
    .filter((item) => item.word && item.definition)
    .slice(0, maxWords);
}

function buildPrompt(article, maxWords) {
  return `
你是面向中文日语学习者的日语词汇老师。
请从下面的日语文章中提取最值得学习的重点词汇。

要求：
1. 返回 ${maxWords} 个以内。
2. 优先选择 EJU、JLPT、新闻、说明文、大学入试文章中常见的重要词。
3. 不要提取太基础的助词、助动词、普通代词。
4. 不要提取乱码、半截词、纯数字。
5. 尽量给出日语原形。
6. reading 必须使用平假名。
7. definition 使用简体中文，简洁准确。
8. importance 为 1 到 5，5 表示最重要。
9. reason 用简体中文说明为什么这个词值得背。
10. 只返回 JSON，不要返回 Markdown，不要返回解释性文章。

返回格式必须是：
{
  "items": [
    {
      "word": "検討",
      "reading": "けんとう",
      "definition": "讨论；研究；仔细考虑",
      "importance": 5,
      "reason": "文章中用于表达研究方案或讨论政策，考试和新闻中常见。"
    }
  ]
}

文章：
${article}
`;
}

function chatEndpoint(baseUrl) {
  const base = String(baseUrl || "").replace(/\/+$/, "");
  if (base.endsWith("/chat/completions")) return base;
  return base + "/chat/completions";
}

async function callDoubao(prompt, env) {
  const DOUBAO_API_KEY = env.DOUBAO_API_KEY;
  const DOUBAO_MODEL = env.DOUBAO_MODEL || "doubao-1-5-lite-32k-250115";
  const DOUBAO_BASE_URL = env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

  if (!DOUBAO_API_KEY) throw new Error("豆包 API Key 未设置");

  const res = await fetch(chatEndpoint(DOUBAO_BASE_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + DOUBAO_API_KEY },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages: [
        { role: "system", content: "你是日语词汇提取助手。必须只返回合法 JSON，不要返回 Markdown。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4096
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error?.message || data.message || JSON.stringify(data).slice(0, 300);
    throw new Error("豆包调用失败：" + message);
  }

  let content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) content = content.map((x) => x.text || x.content || "").join("");
  if (!content) throw new Error("豆包没有返回内容");

  const parsed = parseAiJson(content);
  return { provider: "doubao", model: DOUBAO_MODEL, items: parsed.items || [] };
}

async function callGemini(prompt, env) {
  const GEMINI_API_KEY = env.GEMINI_API_KEY;
  const GEMINI_MODEL = env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!GEMINI_API_KEY) throw new Error("Gemini API Key 未设置");

  const responseSchema = {
    type: "OBJECT",
    properties: {
      items: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            word: { type: "STRING" },
            reading: { type: "STRING" },
            definition: { type: "STRING" },
            importance: { type: "INTEGER" },
            reason: { type: "STRING" }
          },
          required: ["word", "reading", "definition", "importance", "reason"]
        }
      }
    },
    required: ["items"]
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema
        }
      })
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error?.message || JSON.stringify(data).slice(0, 300);
    throw new Error("Gemini 调用失败：" + message);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini 没有返回内容");

  const parsed = parseAiJson(text);
  return { provider: "gemini", model: GEMINI_MODEL, items: parsed.items || [] };
}

function getProviderOrder(requestedProvider, defaultProvider) {
  if (requestedProvider === "doubao") return ["doubao"];
  if (requestedProvider === "gemini") return ["gemini"];
  const first = defaultProvider === "gemini" ? "gemini" : "doubao";
  return [first, first === "doubao" ? "gemini" : "doubao"];
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
    const article = clampText(body.article || "", 12000);
    const maxWords = Math.max(5, Math.min(Number(body.maxWords || 30), 80));
    const requestedProvider = String(body.provider || "auto").toLowerCase();

    if (!article) return json(400, { error: "文章内容为空" });

    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from("user_entitlements")
      .select("ai_quota")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entitlementError) {
      console.error("Read entitlement error:", entitlementError);
      return json(500, { error: "读取 AI 次数失败" });
    }

    const currentQuota = Number(entitlement?.ai_quota || 0);
    if (currentQuota <= 0) return json(402, { error: "AI 次数不足，请先购买 AI 次数包" });

    const prompt = buildPrompt(article, maxWords);
    const providerOrder = getProviderOrder(requestedProvider, env.AI_DEFAULT_PROVIDER || "doubao");

    let lastError = null;
    let aiResult = null;

    for (const provider of providerOrder) {
      try {
        if (provider === "doubao") aiResult = await callDoubao(prompt, env);
        else if (provider === "gemini") aiResult = await callGemini(prompt, env);
        break;
      } catch (e) {
        lastError = e;
        console.error("Provider failed:", provider, e);
      }
    }

    if (!aiResult) throw lastError || new Error("所有 AI 模型调用失败");

    const cleanedItems = normalizeItems(aiResult.items, maxWords);
    if (!cleanedItems.length) return json(500, { error: aiResult.provider + " 没有提取到有效词条" });

    const { error: updateError } = await supabaseAdmin
      .from("user_entitlements")
      .update({ ai_quota: currentQuota - 1, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Deduct AI quota error:", updateError);
      return json(500, { error: "AI 已识别，但扣除次数失败，请联系管理员" });
    }

    return json(200, {
      items: cleanedItems,
      used: 1,
      remaining_ai_quota: currentQuota - 1,
      provider: aiResult.provider,
      model: aiResult.model
    });
  } catch (err) {
    console.error("AI extract error:", err);
    return json(500, { error: err?.message || "AI 识别失败" });
  }
}
