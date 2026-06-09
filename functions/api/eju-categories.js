// EJU 科目分类接口（GET，无需登录）
// 返回科目列表及各科目可用技能

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

const CATEGORIES = [
  {
    id: "japanese",
    label: "日本語",
    labelZh: "日语",
    available: true,
    skills: [
      { id: "reading", label: "読解", labelZh: "阅读", available: true },
      { id: "listening", label: "聴読解", labelZh: "听力", available: false },
      { id: "writing", label: "記述", labelZh: "写作", available: false }
    ]
  },
  { id: "sogo", label: "総合科目", labelZh: "综合科目", available: false, skills: [] },
  { id: "science", label: "理科", labelZh: "理科", available: false, skills: [] },
  { id: "math", label: "数学", labelZh: "数学", available: false, skills: [] }
];

export async function onRequestGet(context) {
  if (context.request.method === "OPTIONS") {
    return jsonResp({ ok: true });
  }
  return jsonResp({ categories: CATEGORIES });
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return jsonResp({ ok: true });
  if (context.request.method === "GET") return onRequestGet(context);
  return jsonResp({ error: "Method not allowed" }, 405);
}
