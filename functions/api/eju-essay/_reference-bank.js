export const REFERENCE_BANK_SOURCE = "速攻トレーニング記述・実践編 reference bank";

export const REFERENCE_BANK_ORIGIN_FILES = [
  "textbook.json",
  "structure.json",
  "notes.json",
  "notes/"
];

export const REFERENCE_BANK = [
  {
    id: "ref-binary-friends",
    type: "二項対立",
    topic: "友だちとの付き合い方",
    keywords: ["友だち", "友人", "交友", "付き合い", "深く", "多くの人", "人間関係"],
    promptSummary: "在『多くの人と広く付き合う』和『少数の人と深く付き合う』之间选立场，并兼顾另一方。",
    usableReasons: [
      "广泛交友能接触不同价值观，扩大视野。",
      "深交少数人有利于建立长期信赖与稳定支持。"
    ],
    usefulExpressions: [
      "私はAの立場をとる。",
      "確かにBにも利点はあるが、",
      "以上の理由から、"
    ],
    modelStructure: [
      "主張",
      "理由1",
      "理由2",
      "反対意見への理解と反論",
      "結論"
    ],
    source: "textbook/notes pages 11-15"
  },
  {
    id: "ref-binary-medicine",
    type: "二項対立",
    topic: "薬の服用",
    keywords: ["薬", "服用", "病気", "医者", "副作用", "自然治愈", "治療"],
    promptSummary: "讨论生病后应立即吃药，还是尽量少依赖药物。",
    usableReasons: [
      "及时服药可以防止症状恶化并尽快恢复。",
      "过度依赖药物可能带来副作用，也会削弱自我调节意识。"
    ],
    usefulExpressions: [
      "その理由は、",
      "たとえば、",
      "～という人もいるが、"
    ],
    modelStructure: [
      "开头表明支持吃药或少吃药",
      "从健康恢复或副作用角度展开",
      "承认另一方的担忧",
      "结论重申立场"
    ],
    source: "textbook/notes pages 11-15"
  },
  {
    id: "ref-binary-supplements",
    type: "二項対立",
    topic: "サプリメント",
    keywords: ["サプリ", "サプリメント", "营养", "栄養", "健康食品", "食生活"],
    promptSummary: "围绕是否为了营养而依赖补充剂，比较便利性与饮食均衡。",
    usableReasons: [
      "补充剂方便，适合时间紧或特定营养不足的人。",
      "天然饮食更均衡，也能避免过度依赖单一保健品。"
    ],
    usefulExpressions: [
      "便利だという面もある。",
      "一方で、",
      "私は～ほうが望ましいと考える。"
    ],
    modelStructure: [
      "主張",
      "便利性或风险说明",
      "另一方优点与限制",
      "结论"
    ],
    source: "textbook/notes pages 11-15"
  },
  {
    id: "ref-binary-manga-education",
    type: "二項対立",
    topic: "教育上におけるマンガの効果",
    keywords: ["マンガ", "漫画", "教育", "教科書", "学習", "理解しやすい", "教材"],
    promptSummary: "讨论教材中是否应引入漫画，以提高理解度还是避免分散注意力。",
    usableReasons: [
      "漫画能降低理解门槛，帮助初学者进入复杂主题。",
      "漫画过多可能削弱深度阅读与独立思考。"
    ],
    usefulExpressions: [
      "理解しやすくなる。",
      "集中力を妨げるおそれがある。",
      "しかし、使い方次第である。"
    ],
    modelStructure: [
      "提出支持或反对漫画介入",
      "说明教学效果",
      "回应反方关于浅化学习的担心",
      "结论"
    ],
    source: "textbook/notes pages 11-15"
  },
  {
    id: "ref-binary-work-life",
    type: "二項対立",
    topic: "仕事と個人の生活",
    keywords: ["仕事", "生活", "ワークライフ", "残業", "家庭", "私生活", "働き方"],
    promptSummary: "讨论工作优先还是个人生活优先，适合展开效率、幸福感和长期发展。",
    usableReasons: [
      "重视私人生活有助于长期身心稳定与持续产出。",
      "强调工作优先有时能提升竞争力和短期成果。"
    ],
    usefulExpressions: [
      "長期的に見ると、",
      "心身の負担",
      "持続可能な働き方"
    ],
    modelStructure: [
      "明确价值取向",
      "从效率与幸福感两角度举理由",
      "回应另一方合理点",
      "收束结论"
    ],
    source: "textbook/notes pages 21-25"
  },
  {
    id: "ref-binary-women-only-car",
    type: "二項対立",
    topic: "女性専用車両",
    keywords: ["女性専用車両", "专用车厢", "痴漢", "安全", "公平", "公共交通"],
    promptSummary: "讨论女性专用车厢是否必要，适合从安全保护与公平性两面展开。",
    usableReasons: [
      "专用车厢能提高安全感，减少骚扰风险。",
      "也有人担心会造成新的区隔或公平争议。"
    ],
    usefulExpressions: [
      "被害を防ぐ",
      "公平性の観点から",
      "一定の効果がある"
    ],
    modelStructure: [
      "表明立场",
      "说明社会背景",
      "承认公平性质疑并回应",
      "结论"
    ],
    source: "textbook/notes pages 21-25"
  },
  {
    id: "ref-problem-communication-tools",
    type: "予測・問題解決",
    topic: "コミュニケーションのツール",
    keywords: ["コミュニケーション", "手紙", "メール", "SNS", "連络", "交流", "ツール"],
    promptSummary: "预测某种沟通工具会不会消失，或比较不同媒介对关系质量的影响。",
    usableReasons: [
      "数码工具速度快、成本低，适合日常联络。",
      "纸质或面对面方式保留情感与正式感，不会完全消失。"
    ],
    usefulExpressions: [
      "今後は～が増えるだろう。",
      "完全になくなるとは限らない。",
      "利便性の一方で、"
    ],
    modelStructure: [
      "预测结论",
      "理由1：技术便利性",
      "理由2：传统方式保留的价值",
      "总结"
    ],
    source: "textbook/notes pages 21-25"
  },
  {
    id: "ref-problem-part-time",
    type: "予測・問題解決",
    topic: "高校生のアルバイト",
    keywords: ["アルバイト", "打工", "高校生", "勉強", "収入", "生活費", "学業"],
    promptSummary: "分析高中生打工增加的利弊，或提出减少学习受影响的对策。",
    usableReasons: [
      "适度打工能培养责任感和社会经验。",
      "打工时间过长会侵蚀学习与休息，甚至影响升学。"
    ],
    usefulExpressions: [
      "生活費を補う",
      "学業に支障が出る",
      "時間を制限する必要がある"
    ],
    modelStructure: [
      "提出问题或立场",
      "说明原因",
      "提出解决办法",
      "结论"
    ],
    source: "textbook/notes pages 21-25"
  },
  {
    id: "ref-problem-global-warming",
    type: "予測・問題解決",
    topic: "地球の温暖化",
    keywords: ["温暖化", "地球環境", "环境", "CO2", "省エネ", "再生可能", "気候変動"],
    promptSummary: "适合写环境恶化的后果与对策，或预测未来生活方式变化。",
    usableReasons: [
      "极端天气和生态破坏会直接影响日常生活与产业。",
      "节能、制度改革和个人习惯改变需要同时推进。"
    ],
    usefulExpressions: [
      "深刻な影響を及ぼす",
      "個人の努力だけでは不十分だ",
      "社会全体で取り組む必要がある"
    ],
    modelStructure: [
      "指出未来风险",
      "说明原因与影响",
      "提出对策",
      "总结"
    ],
    source: "textbook/notes pages 21-25"
  },
  {
    id: "ref-problem-death-penalty",
    type: "予測・問題解決",
    topic: "死刑制度",
    keywords: ["死刑", "制度", "犯罪", "冤罪", "被害者", "治安", "刑罰"],
    promptSummary: "围绕死刑制度未来走向展开，强调未来预测、理由和让步反驳。",
    usableReasons: [
      "支持存续者常从被害者感情和治安担忧出发。",
      "支持废止者常从冤罪风险和生命权角度展开。"
    ],
    usefulExpressions: [
      "今後も～だろう。",
      "確かに～という意見もある。しかし、",
      "以上の理由で～と考える。"
    ],
    modelStructure: [
      "未来判断",
      "理由1",
      "理由2",
      "让步反驳",
      "结论"
    ],
    source: "textbook/notes pages 36-40"
  },
  {
    id: "ref-problem-endangered-species",
    type: "予測・問題解決",
    topic: "絶滅のおそれのある動植物",
    keywords: ["絶滅", "動植物", "保護", "生物多様性", "生态", "環境保全"],
    promptSummary: "讨论是否应保护濒危物种，适合写生态价值、成本和长期影响。",
    usableReasons: [
      "保护生物多样性有长期生态和人类生活价值。",
      "保护需要成本，但放任灭绝会造成更大损失。"
    ],
    usefulExpressions: [
      "将来に大きな影響を残す",
      "費用がかかるとしても",
      "保護は必要だと考える"
    ],
    modelStructure: [
      "主张或预测",
      "生态理由",
      "成本或现实反论",
      "结论"
    ],
    source: "textbook/notes pages 36-40"
  }
];
