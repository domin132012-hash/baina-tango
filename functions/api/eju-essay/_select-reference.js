import { REFERENCE_BANK } from "./_reference-bank.js";

const EXAMPLE_REQUEST_RE = /(例子|例句|举例|给我例|給我例|范文|解答例|参考素材|參考素材|参考|參考|论据|論拠|根拠|給.*理由|给.*理由|提供.*理由|表达|表現|改写|改寫|润色|潤色|怎么写|怎麼寫|怎么改|怎麼改|rewrite|example|model)/i;
const SCORE_EXPLANATION_RE = /(为什么扣分|為什麼扣分|为什么这个分数|為什麼這個分數|怎么判分|怎麼判分|评分依据|評分依據|为什么|為什麼|扣分|分数|分數|score|rubric)/i;

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function detectEssayType(text) {
  if (!text) return "";
  if (/どちら|二つの意見|賛成|反対|A>|B>|二項対立/i.test(text)) return "二項対立";
  if (/今後|予測|問題|解決|どうなる|減らす|増える|対策|原因/i.test(text)) return "予測・問題解決";
  return "";
}

function scoreReference(entry, haystack, essayType) {
  let score = 0;
  let hits = 0;
  entry.keywords.forEach(function(keyword) {
    if (!keyword) return;
    if (haystack.includes(normalizeText(keyword))) {
      hits += 1;
      score += keyword.length >= 4 ? 3 : 2;
    }
  });
  if (essayType && entry.type === essayType) score += 2;
  if (hits === 0) return 0;
  return score;
}

export function selectReferences(input, max = 3) {
  const theme = String(input?.essayTheme || "");
  const essay = String(input?.essay || "");
  const haystack = normalizeText(theme + "\n" + essay);
  const essayType = detectEssayType(theme || essay);

  const ranked = REFERENCE_BANK
    .map(function(entry) {
      return {
        entry,
        score: scoreReference(entry, haystack, essayType)
      };
    })
    .filter(function(item) {
      return item.score > 0;
    })
    .sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.id.localeCompare(b.entry.id);
    })
    .slice(0, max)
    .map(function(item) {
      return item.entry;
    });

  return ranked;
}

export function summarizeReferencesForPrompt(references) {
  if (!Array.isArray(references) || references.length === 0) return "未命中具体参考素材。";
  return references.map(function(ref, index) {
    return [
      (index + 1) + ". " + ref.id,
      "题型：" + ref.type,
      "话题：" + ref.topic,
      "题目摘要：" + ref.promptSummary,
      "可用理由：" + ref.usableReasons.join(" / "),
      "常用表达：" + ref.usefulExpressions.join(" / "),
      "范文结构：" + ref.modelStructure.join(" → ")
    ].join("\n");
  }).join("\n\n");
}

export function publicReferenceSummary(reference) {
  return {
    id: reference.id,
    type: reference.type,
    topic: reference.topic,
    source: reference.source
  };
}

export function questionNeedsReferenceBank(question) {
  return EXAMPLE_REQUEST_RE.test(String(question || ""));
}

export function questionIsMainlyAboutScoring(question) {
  return SCORE_EXPLANATION_RE.test(String(question || ""));
}
