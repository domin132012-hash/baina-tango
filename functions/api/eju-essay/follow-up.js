// EJU 記述批改追问接口（POST，需登录）

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

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

async function requireUser(request, env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { user: null, error: "Supabase 环境变量未配置" };
  }
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { user: null, error: "请先登录账号", code: "unauthenticated", status: 401 };
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { user: null, error: "登录状态已失效，请重新登录", code: "unauthenticated", status: 401 };
  return { user: data.user, supabase };
}

async function callDeepSeek(env, messages, temperature = 0.35) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY 未配置");
  const baseUrl = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const res = await fetch(baseUrl + "/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + apiKey
    },
    body: JSON.stringify({ model, messages, stream: false, temperature })
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: { message: text } }; }
  if (!res.ok) throw new Error(data?.error?.message || ("DeepSeek HTTP " + res.status));
  return data?.choices?.[0]?.message?.content || "";
}

function compactContext(context) {
  if (!Array.isArray(context)) return [];
  return context.slice(-8).map(item => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: String(item.content || "").slice(0, 2000)
  })).filter(item => item.content.trim());
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = await requireUser(request, env);
  if (auth.error) return jsonResp({ error: auth.error, code: auth.code || "server_not_configured" }, auth.status || 500);

  const body = await readJson(request);
  if (!body) return jsonResp({ error: "请求格式错误" }, 400);
  const question = String(body.question || "").trim();
  if (!question) return jsonResp({ error: "追问内容不能为空" }, 400);
  if (question.length > 2000) return jsonResp({ error: "追问过长，请缩短后再提交" }, 413);

  const essayTheme = String(body.essayTheme || "").slice(0, 1000);
  const essay = String(body.essay || "").slice(0, 6000);
  const critique = String(body.critique || "").slice(0, 8000);
  const history = compactContext(body.context);

  try {
    const messages = [
      { role: "system", content: "你是 EJU 日本語記述作文老师。回答要具体、可执行，优先解释学生哪里错、为什么错、怎么改。" },
      { role: "user", content: "题目：\n" + essayTheme + "\n\n学生作文：\n" + essay + "\n\n上一轮批改：\n" + critique }
    ].concat(history).concat([
      { role: "user", content: question }
    ]);
    const answer = await callDeepSeek(env, messages, 0.35);
    return jsonResp({ ok: true, answer });
  } catch (err) {
    return jsonResp({ error: err?.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
