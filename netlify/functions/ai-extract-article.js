const { createClient } = require("@supabase/supabase-js");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function clampText(text, maxChars) {
  text = String(text || "").trim();
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    if (!GEMINI_API_KEY) {
      return json(500, { error: "GEMINI_API_KEY 未设置" });
    }

    const auth = event.headers.authorization || event.headers.Authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return json(401, { error: "请先登录账号" });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData || !userData.user) {
      return json(401, { error: "登录状态无效，请重新登录" });
    }

    const user = userData.user;

    const body = JSON.parse(event.body || "{}");
    const article = clampText(body.article || "", 12000);
    const maxWords = Math.max(5, Math.min(Number(body.maxWords || 30), 80));

    if (!article) {
      return json(400, { error: "文章内容为空" });
    }

    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from("user_entitlements")
      .select("ai_quota")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entitlementError) {
      console.error("Read entitlement error:", entitlementError);
      return json(500, { error: "读取 AI 次数失败" });
    }

    const currentQuota = Number(entitlement && entitlement.ai_quota ? entitlement.ai_quota : 0);

    if (currentQuota <= 0) {
      return json(402, { error: "AI 次数不足，请先购买 AI 次数包" });
    }

    const prompt = `
你是面向中文日语学习者的日语词汇老师。
请从下面的日语文章中提取最值得学习的重点词汇。

要求：
1. 返回 ${maxWords} 个以内。
2. 优先选择 EJU、JLPT、新闻、说明文里常见的重要词。
3. 不要提取太基础的助词、助动词、普通代词。
4. 不要提取乱码、半截词、纯数字。
5. 尽量给出日语原形。
6. reading 使用平假名。
7. definition 使用简体中文，简洁准确。
8. importance 为 1 到 5，5 表示最重要。
9. reason 用简体中文说明为什么这个词值得背。
10. 只返回 JSON，不要写解释性文章。

文章：
${article}
`;

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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
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

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini API error:", geminiData);
      return json(500, {
        error: "Gemini 识别失败：" + (geminiData.error && geminiData.error.message ? geminiData.error.message : "unknown error")
      });
    }

    const text =
      geminiData &&
      geminiData.candidates &&
      geminiData.candidates[0] &&
      geminiData.candidates[0].content &&
      geminiData.candidates[0].content.parts &&
      geminiData.candidates[0].content.parts[0]
        ? geminiData.candidates[0].content.parts[0].text
        : "";

    let parsed;

    try {
      parsed = JSON.parse(cleanJsonText(text));
    } catch (e) {
      console.error("AI JSON parse failed:", text);
      return json(500, { error: "AI 返回格式解析失败" });
    }

    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const cleanedItems = items
      .map((item) => ({
        word: String(item.word || "").trim(),
        reading: String(item.reading || "").trim(),
        definition: String(item.definition || "").trim(),
        importance: Math.max(1, Math.min(Number(item.importance || 3), 5)),
        reason: String(item.reason || "").trim()
      }))
      .filter((item) => item.word && item.definition)
      .slice(0, maxWords);

    if (!cleanedItems.length) {
      return json(500, { error: "AI 没有提取到有效词条" });
    }

    const { error: updateError } = await supabaseAdmin
      .from("user_entitlements")
      .upsert(
        {
          user_id: user.id,
          ai_quota: currentQuota - 1,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "user_id"
        }
      );

    if (updateError) {
      console.error("Deduct AI quota error:", updateError);
      return json(500, { error: "AI 已识别，但扣除次数失败，请联系管理员" });
    }

    return json(200, {
      items: cleanedItems,
      used: 1,
      remaining_ai_quota: currentQuota - 1,
      model: GEMINI_MODEL
    });
  } catch (err) {
    console.error("AI extract error:", err);
    return json(500, {
      error: err && err.message ? err.message : "AI 识别失败"
    });
  }
};
