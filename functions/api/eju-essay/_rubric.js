export const RUBRIC_SOURCE = "速攻トレーニング記述・基礎編 rubric";

export const RUBRIC_ORIGIN_FILES = [
  "rubric.json",
  "rubric.md"
];

export const EJU_ESSAY_RUBRIC = {
  sourceLabel: RUBRIC_SOURCE,
  sourceFiles: RUBRIC_ORIGIN_FILES,
  examSpec: {
    charRange: "400〜500字",
    recommendedTime: "30分",
    fullScore: 50
  },
  scoringAnchors: [
    {
      score: 50,
      band: "S",
      description: "紧扣题目，主张明确，根拠与具体例有说服力，多角度展开，构成和表达都很成熟。"
    },
    {
      score: 45,
      band: "A",
      description: "紧扣题目，主张与根拠清楚，结构有效，表达基本准确。"
    },
    {
      score: 40,
      band: "B",
      description: "大体回应题目，主张与根拠成立，结构妥当，表达不妨碍信息传达。"
    },
    {
      score: 35,
      band: "C",
      description: "没有完全偏题，但根拠妥当性、构成或表达存在明显不足。"
    },
    {
      score: 30,
      band: "D",
      description: "主张或构成不充分，或与题目关联偏弱。"
    },
    {
      score: 25,
      band: "NA",
      description: "未充分满足可正常评分条件。"
    }
  ],
  criteria: [
    { id: "prompt-understanding", label: "题目理解", guidance: "正确理解题目要求，不偏题，必要时回应现状、预测、问题或对立立场。" },
    { id: "claim", label: "主张", guidance: "明确表达自己的立场或结论，避免模糊摇摆。" },
    { id: "reasons", label: "根拠", guidance: "理由要直接支撑主张，不能只写感想或口号。" },
    { id: "examples", label: "具体例", guidance: "能给出贴题的具体例、经验或场景，但不要为了凑字数堆砌例子。" },
    { id: "multiple-angles", label: "多角度", guidance: "能考虑不同角度，二項対立题要触及另一方，问题解决题要兼顾原因与后果。" },
    { id: "structure", label: "序論・本論・結論", guidance: "整体结构完整，开头提出主张，中间展开理由，结尾收束结论。" },
    { id: "paragraphs", label: "段落", guidance: "避免一段到底，段落边界和连接词清楚。" },
    { id: "style", label: "文体", guidance: "全篇保持统一文体，尽量使用书面说明文风格，不混用です・ます体与だ・である体。" },
    { id: "written-japanese", label: "書き言葉", guidance: "避免口语、省略、缩约和随意表达，使用适合记述作文的书面语。" }
  ],
  cautionRules: [
    "字数目标是 400〜500 字；过短答案要扣分，但不要只按字数机械打分。",
    "评分必须优先看题目对应、主张、根拠、具体例、结构和表达是否成立。",
    "文体混在、口语化、长句失控、段落不清、偏题或逻辑矛盾都属于减分点。"
  ]
};

export function formatRubricForPrompt() {
  const spec = EJU_ESSAY_RUBRIC.examSpec;
  const criteria = EJU_ESSAY_RUBRIC.criteria
    .map(function(item) {
      return "- " + item.label + "：" + item.guidance;
    })
    .join("\n");
  const anchors = EJU_ESSAY_RUBRIC.scoringAnchors
    .map(function(item) {
      return "- " + item.score + "点（" + item.band + "）：" + item.description;
    })
    .join("\n");
  const cautions = EJU_ESSAY_RUBRIC.cautionRules
    .map(function(rule) {
      return "- " + rule;
    })
    .join("\n");

  return [
    "评分依据来源：" + EJU_ESSAY_RUBRIC.sourceLabel,
    "考试硬条件：",
    "- 字数：" + spec.charRange,
    "- 时间：" + spec.recommendedTime,
    "- 满分：" + spec.fullScore + "点",
    "评分维度：",
    criteria,
    "分数锚点：",
    anchors,
    "评分提醒：",
    cautions
  ].join("\n");
}
