const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || "doubao-1-5-lite-32k-250115";
const DOUBAO_BASE_URL =
  process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

function normalizeWord(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[　]/g, "");
}

function isPureKana(s) {
  return /^[ぁ-んァ-ンー]+$/.test(String(s || ""));
}

function hasJapanese(s) {
  return /[ぁ-んァ-ン一-龥々ヶー]/.test(String(s || ""));
}

function kanaLength(s) {
  let n = 0;
  for (const ch of String(s || "")) {
    const c = ch.charCodeAt(0);
    if ((c >= 0x3040 && c <= 0x30ff) || c === 0x30fc) n++;
  }
  return n;
}

function toHiragana(s) {
  return String(s || "").replace(/[ァ-ン]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function cleanDefinition(s) {
  let x = String(s || "").trim();

  x = x
    .replace(/[。,.，、]/g, "；")
    .replace(/\s+/g, "")
    .replace(/；+/g, "；")
    .replace(/^；|；$/g, "");

  // 最多保留 15 个汉字/中文字符左右，标点不算太严格
  let out = "";
  let count = 0;

  for (const ch of x) {
    if (ch === "；" || ch === "/" || ch === "、") {
      if (!out.endsWith("；")) out += "；";
      continue;
    }

    out += ch;

    // 中日汉字、假名、英数都算长度，防止输出太长
    count++;
    if (count >= 15) break;
  }

  return out.replace(/；$/g, "") || "未明";
}

function cleanPos(s) {
  const x = String(s || "").trim();
  if (!x) return "词语";
  return x.slice(0, 8);
}

function cleanJsonText(text) {
  let s = String(text || "").trim();

  s = s
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");

  if (first >= 0 && last > first) {
    s = s.slice(first, last + 1);
  }

  return s;
}

function parseAiJson(text) {
  try {
    return JSON.parse(cleanJsonText(text));
  } catch (e) {
    console.error("AI lookup JSON parse failed:", text);
    throw new Error("豆包返回格式解析失败");
  }
}

function chatEndpoint(baseUrl) {
  const base = String(baseUrl || "").replace(/\/+$/, "");
  if (base.endsWith("/chat/completions")) return base;
  return base + "/chat/completions";
}

function buildPrompt(word) {
  return `
你是日语学习词典助手。
请解释下面这个日语词。

严格要求：
1. 只返回 JSON，不要 Markdown，不要解释。
2. word 返回原词。
3. reading 必须是平假名。
4. 如果 reading 超过 10 个假名，仍然返回真实 reading，系统会拒绝。
5. pos 用中文，最多 8 个字。
6. definition 只返回最核心中文释义，最多 15 个汉字，不要例句，不要长解释。
7. 不要输出英文释义。
8. 如果有多个意思，只保留最常用、最重要的 1～3 个，用中文分号隔开。
9. 不确定时也要给最常见释义，不要胡编专有名词。

返回格式：
{
  "word": "検討",
  "reading": "けんとう",
  "pos": "名词・サ变动词",
  "definition": "讨论；研究；考虑"
}

要查询的词：
${word}
`;
}

async function callDoubao(word) {
  if (!DOUBAO_API_KEY) {
    throw new Error("豆包 API Key 未设置");
  }

  const res = await fetch(chatEndpoint(DOUBAO_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + DOUBAO_API_KEY
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是日语词典助手。必须只返回合法 JSON，不要 Markdown，不要多余解释。"
        },
        {
          role: "user",
          content: buildPrompt(word)
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Doubao lookup error:", data);
    const message =
      data.error && data.error.message
        ? data.error.message
        : data.message || JSON.stringify(data).slice(0, 300);
    throw new Error("豆包调用失败：" + message);
  }

  const content =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;

  if (!content) {
    throw new Error("豆包没有返回内容");
  }

  return parseAiJson(content);
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(500, {
        error: "Supabase 后端环境变量未设置"
      });
    }

    const auth = event.headers.authorization || event.headers.Authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return json(401, { error: "请先登录账号" });
    }

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !userData || !userData.user) {
      return json(401, { error: "登录状态无效，请重新登录" });
    }

    const body = JSON.parse(event.body || "{}");
    const inputWord = normalizeWord(body.word);

    if (!inputWord) {
      return json(400, { error: "请输入要查询的词" });
    }

    if (!hasJapanese(inputWord)) {
      return json(400, {
        error: "目前只支持日语单词查词"
      });
    }

    if (inputWord.length > 24) {
      return json(400, {
        error: "输入过长，请输入单个词语"
      });
    }

    if (isPureKana(inputWord) && kanaLength(inputWord) > 10) {
      return json(400, {
        error: "输入过长：假名不能超过 10 个"
      });
    }

    const ai = await callDoubao(inputWord);

    const word = normalizeWord(ai.word || inputWord);
    const reading = toHiragana(normalizeWord(ai.reading || ""));
    const pos = cleanPos(ai.pos || "词语");
    const definition = cleanDefinition(ai.definition || ai.meaning || ai.zh || "");

    if (!reading) {
      return json(500, {
        error: "豆包没有返回假名，请重试"
      });
    }

    if (kanaLength(reading) > 10) {
      return json(400, {
        error: "这个词的假名超过 10 个，暂不支持短查词模式"
      });
    }

    if (!definition || definition === "未明") {
      return json(500, {
        error: "豆包没有返回有效释义"
      });
    }

    return json(200, {
      ok: true,
      source: "doubao",
      model: DOUBAO_MODEL,
      word,
      reading,
      pos,
      definition
    });
  } catch (err) {
    console.error("AI lookup word error:", err);
    return json(500, {
      error: err && err.message ? err.message : "查词失败"
    });
  }
};
