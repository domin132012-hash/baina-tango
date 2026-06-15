// EJU 記述作文批改接口（POST，需登录）
// Cloudflare Pages Functions 版本：不搬 Express server.mjs，只迁移核心批改链路。

import { createClient } from "@supabase/supabase-js";
import { EJU_ESSAY_RUBRIC, RUBRIC_SOURCE, formatRubricForPrompt } from "./_rubric.js";
import { selectReferences, summarizeReferencesForPrompt, publicReferenceSummary } from "./_select-reference.js";

const SCORE_LADDER = [0, 10, 20, 25, 30, 35, 40, 45, 50];

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

function countJapaneseChars(text) {
  return String(text || "").replace(/[\s\n\r\t]/g, "").length;
}

function nearestScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return SCORE_LADDER.reduce((best, x) => Math.abs(x - n) < Math.abs(best - n) ? x : best, SCORE_LADDER[0]);
}

function extractScore(text, kind) {
  const re = kind === "strict"
    ? /严格[評评]価[：:]\s*(\d+)\s*\/\s*50/
    : /普通[評评]価[：:]\s*(\d+)\s*\/\s*50/;
  const m = String(text || "").match(re);
  return m ? nearestScore(m[1]) : null;
}

function extractSummary(text) {
  const m = String(text || "").match(/一句话评价[：:]\s*([^\n]+)/);
  return m ? m[1].trim() : "";
}

function extractErrors(text) {
  const raw = String(text || "");
  let jsonText = "";
  const xml = raw.match(/<ERRORS_JSON>\s*([\s\S]*?)\s*<\/ERRORS_JSON>/i);
  if (xml) jsonText = xml[1].trim();
  if (!jsonText) {
    const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced) jsonText = fenced[1].trim();
  }
  if (!jsonText) return null;
  try {
    const parsed = JSON.parse(jsonText);
    const rows = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.errors) ? parsed.errors : null);
    if (!rows) return null;
    return rows.map(row => ({
      original: String(row.original || ""),
      issue: String(row.issue || row.type || ""),
      severity: ["high", "medium", "low"].includes(row.severity) ? row.severity : "medium",
      mustFix: String(row.mustFix || "建议改"),
      correction: String(row.correction || ""),
      reason: String(row.reason || "")
    })).filter(row => row.original || row.correction || row.reason);
  } catch {
    return null;
  }
}

function buildCritiquePrompt(input) {
  const theme = String(input.essayTheme || "").trim();
  const essay = String(input.essay || "").trim();
  const charCount = Number.isFinite(Number(input.essayCharCount)) ? Number(input.essayCharCount) : countJapaneseChars(essay);
  const essayMode = input.essayMode === "model" ? "model" : "student";
  const references = Array.isArray(input.references) ? input.references : [];
  const rubricPrompt = formatRubricForPrompt();
  const referencePrompt = summarizeReferencesForPrompt(references);
  const spec = EJU_ESSAY_RUBRIC.examSpec;

  return [
    "你是 EJU 日本語『記述』评分辅助老师，面向中文母语学习者。",
    "评分只能依据 rubric / 基礎編规则，绝不能依据参考范文相似度来扣分。",
    "reference bank 只可用于举例、范文方向、补充理由、表达建议，不能参与评分。",
    "不得因为学生作文不像参考素材就扣分，不得要求照抄参考素材。",
    "请按 JASSO 记述评分档位进行批改：0/10/20/25/30/35/40/45/50。",
    "普通評価=预测区间上限，严格評価=预测区间下限；两者通常相差 5 分。",
    "字数规则以基礎編为准：400〜500 字目标；350〜399 普通分上限 35；300〜349 上限 30；250〜299 上限 25；250 未满上限 20。",
    "如果字数合格、题目回应完整、观点明确、结构完整、有具体例且 high 错误 ≤1，则普通評価通常不应低于40，严格評価通常不应低于35。",
    "错误严重级别：high=根本语法/活用/意义错误；medium=助词/搭配/动词选择等建议改；low=风格建议或可保留表达。",
    "不要把自然但不够高级的表达强行判成 high。",
    "输出必须使用下面固定结构，不要省略标题：",
    "【作文モード】学生作文批改模式 或 范文分析模式",
    "【題目類型判定】题目类型 + 评价视点",
    "【総合評価】\n普通評価：XX/50（X档）\n严格評価：XX/50（X档）\n一句话评价：...\n字数：" + charCount + "字 / 等级：...",
    "【题目対応】完成情况 + 不足",
    "【主な減点 Top5】1〜5 条主要扣分",
    "【誤り修正】\n<ERRORS_JSON>\n[{\"original\":\"原文片段\",\"issue\":\"语法/词汇/搭配/表达/结构/字数\",\"severity\":\"high|medium|low\",\"mustFix\":\"必改|建议改|可保留\",\"correction\":\"建议修改\",\"reason\":\"中文理由\"}]\n</ERRORS_JSON>",
    "【提升到40分的优先修改】3条优先行动",
    "【改写版 — 原意保持版（目标30〜35分）】",
    "【改写版 — 40分目标版（目标35〜40分）】",
    "",
    "固定评分依据（rubric / 基礎編）：",
    rubricPrompt,
    "",
    "命中的参考素材（仅供举例、理由、表达、范文方向，不可参与评分）：",
    referencePrompt,
    "",
    "作文模式：" + (essayMode === "model" ? "范文分析模式" : "学生作文批改模式"),
    "题目：" + (theme || "（未填写）"),
    "前端精确字数：" + charCount + "字。禁止自行重新统计字数。",
    "本题目标字数区间：" + spec.charRange + "；考试时间：" + spec.recommendedTime + "；满分：" + spec.fullScore + "点。",
    "学生作文：\n" + essay
  ].join("\n");
}

async function requireUser(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\b\s*/i, "").trim();
  if (!token) return { user: null, error: "请先登录账号", code: "unauthenticated", status: 401 };
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { user: null, error: "Supabase 环境变量未配置" };
  }
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { user: null, error: "登录状态已失效，请重新登录", code: "unauthenticated", status: 401 };
  return { user: data.user, supabase };
}

async function callDeepSeek(env, messages, temperature = 0.3) {
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

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = await requireUser(request, env);
  if (auth.error) return jsonResp({ error: auth.error, code: auth.code || "server_not_configured" }, auth.status || 500);

  const body = await readJson(request);
  if (!body) return jsonResp({ error: "请求格式错误" }, 400);
  const essay = String(body.essay || "").trim();
  if (!essay) return jsonResp({ error: "作文不能为空" }, 400);
  if (essay.length > 6000) return jsonResp({ error: "作文过长，请缩短后再提交" }, 413);

  try {
    const charCount = Number.isFinite(Number(body.essayCharCount)) ? Number(body.essayCharCount) : countJapaneseChars(essay);
    const matchedReferences = selectReferences({ essayTheme: body.essayTheme, essay }, 3);
    const prompt = buildCritiquePrompt(Object.assign({}, body, {
      essay,
      essayCharCount: charCount,
      references: matchedReferences
    }));
    const result = await callDeepSeek(env, [
      { role: "system", content: "你是严谨的 EJU 日本語記述评分老师。必须按用户指定格式输出。" },
      { role: "user", content: prompt }
    ], 0.25);

    const errorRows = extractErrors(result);
    return jsonResp({
      ok: true,
      result,
      normalScore: extractScore(result, "normal"),
      strictScore: extractScore(result, "strict"),
      summaryLine: extractSummary(result),
      errorRows,
      charCount,
      rubricSource: RUBRIC_SOURCE,
      matchedReferences: matchedReferences.map(publicReferenceSummary)
    });
  } catch (err) {
    return jsonResp({ error: err?.message || String(err) }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
