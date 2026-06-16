// EJU 記述批改追问接口（POST，需登录）

import { createClient } from "@supabase/supabase-js";
import { RUBRIC_SOURCE, formatRubricForPrompt } from "./_rubric.js";
import {
  questionNeedsReferenceBank,
  questionIsMainlyAboutScoring,
  selectReferences,
  summarizeReferencesForPrompt
} from "./_select-reference.js";

const MAX_BODY_CHARS = 40000;
const MAX_THEME_CHARS = 1000;
const MAX_ESSAY_CHARS = 6000;
const MAX_CRITIQUE_CHARS = 8000;
const MAX_QUESTION_CHARS = 2000;
const MAX_CONTEXT_ITEMS = 8;
const MAX_CONTEXT_ITEM_CHARS = 2000;

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
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_CHARS) {
    return { error: "请求内容过大，请缩短后再提交", status: 413 };
  }
  let text = "";
  try {
    text = await request.text();
  } catch {
    return { error: "请求读取失败", status: 400 };
  }
  if (text.length > MAX_BODY_CHARS) {
    return { error: "请求内容过大，请缩短后再提交", status: 413 };
  }
  try {
    return { body: JSON.parse(text || "{}") };
  } catch {
    return { error: "请求格式错误", status: 400 };
  }
}

async function requireUser(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\b\s*/i, "").trim();
  if (!token) return { user: null, error: "请先登录账号", code: "unauthenticated", status: 401 };
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { user: null, error: "登录服务暂时不可用，请稍后再试", code: "server_not_configured", status: 500 };
  }
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { user: null, error: "登录状态已失效，请重新登录", code: "unauthenticated", status: 401 };
  return { user: data.user, supabase };
}

async function callDeepSeek(env, messages, temperature = 0.35) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("ai_service_not_configured");
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
  if (!res.ok) throw new Error("ai_service_http_" + res.status);
  return data?.choices?.[0]?.message?.content || "";
}

function compactContext(context) {
  if (!Array.isArray(context)) return [];
  return context.slice(-MAX_CONTEXT_ITEMS).map(item => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: String(item.content || "").slice(0, MAX_CONTEXT_ITEM_CHARS)
  })).filter(item => item.content.trim());
}

function buildFollowUpPrompt(input) {
  const question = String(input.question || "").trim();
  const essayTheme = String(input.essayTheme || "").trim();
  const essay = String(input.essay || "").trim();
  const critique = String(input.critique || "").trim();
  const rubricPrompt = formatRubricForPrompt();
  const useReferenceBank = questionNeedsReferenceBank(question);
  const scoringFocus = questionIsMainlyAboutScoring(question);
  const references = useReferenceBank ? selectReferences({ essayTheme, essay }, 3) : [];

  return {
    useReferenceBank,
    references,
    system: [
      "你是 EJU 日本語記述作文老师。",
      "回答必须优先基于同一套 rubric / 基礎編规则。",
      "reference bank 只能在用户明确索要例子、范文方向、理由素材、表达建议或改写建议时使用。",
      "reference bank 不得影响分数判断，不得因为参考素材与学生作文不同就修改分数判断。",
      scoringFocus
        ? "当前问题与扣分或分数解释有关，请重点按 rubric 解释题目理解、主张、根拠、具体例、结构、段落、文体、書き言葉等维度。"
        : "回答要具体、可执行，尽量结合学生原文说明。"
    ].join("\n"),
    brief: [
      "评分依据来源：" + RUBRIC_SOURCE,
      "固定 rubric：",
      rubricPrompt,
      "",
      useReferenceBank
        ? "命中的参考素材（仅供举例、范文方向、补充理由、表达建议，不可参与评分）：\n" + summarizeReferencesForPrompt(references)
        : "本轮未启用 reference bank；如果问题只是扣分解释或分数说明，请不要额外引用范文素材。",
      "",
      "题目：\n" + essayTheme,
      "",
      "学生作文：\n" + essay,
      "",
      "上一轮批改：\n" + critique,
      "",
      "请回答这个追问：\n" + question
    ].join("\n")
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = await requireUser(request, env);
  if (auth.error) return jsonResp({ error: auth.error, code: auth.code || "server_not_configured" }, auth.status || 500);

  const parsed = await readJson(request);
  if (parsed.error) return jsonResp({ error: parsed.error }, parsed.status || 400);
  const body = parsed.body || {};
  const question = String(body.question || "").trim();
  if (!question) return jsonResp({ error: "追问内容不能为空" }, 400);
  if (question.length > MAX_QUESTION_CHARS) return jsonResp({ error: "追问过长，请缩短后再提交" }, 413);

  const essayTheme = String(body.essayTheme || "");
  const essay = String(body.essay || "");
  const critique = String(body.critique || "");
  if (essayTheme.length > MAX_THEME_CHARS) return jsonResp({ error: "题目过长，请缩短后再提交" }, 413);
  if (essay.length > MAX_ESSAY_CHARS) return jsonResp({ error: "作文过长，请缩短后再提交" }, 413);
  if (critique.length > MAX_CRITIQUE_CHARS) return jsonResp({ error: "批改上下文过长，请返回结果页后重新追问" }, 413);
  const history = compactContext(body.context);

  try {
    const followUpPrompt = buildFollowUpPrompt({ question, essayTheme, essay, critique });
    const messages = [
      { role: "system", content: followUpPrompt.system },
      { role: "user", content: followUpPrompt.brief }
    ].concat(history).concat([
      { role: "user", content: question }
    ]);
    const answer = await callDeepSeek(env, messages, 0.35);
    return jsonResp({ ok: true, answer });
  } catch (err) {
    console.error("eju_essay_follow_up_failed", err?.message || String(err));
    return jsonResp({ error: "追问服务暂时不可用，请稍后再试" }, 502);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
