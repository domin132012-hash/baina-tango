# DeepSeek Top 1000 — Risk Rules Draft

> 版本：1.0 — Hermes dry-run  
> 生成时间：2026-06-23 20:42 JST  
> 用途：Top 1000 provider run 前识别已知风险类型并建立处理规则

---

## 1. 固定表达风险

### 风险描述

日语固定寒暄语在翻译时容易机械处理，导致学习者在实际场景中使用错误表达。

### 已知高风险条目类型（基于 Top 500）

- お邪魔します → 误写 "失陪了"
- お疲れ様 → 误写 "晚安" 
- 畏まりました → 误写 "遵命"（过于古语）
- お願いいたします → shortGloss 只写 "拜托"（丢失礼貌程度）
- お大事に → 缺少 usageNote
- お世話になる → 直译可能不自然
- お先に → 缺少场景说明

### 规则

1. Top 1000 生成后，QA checker 必须专项扫描这 7+ 个固定寒暄语
2. 任何这些条目的 shortGloss/usageNote 需要人工对比 editorial rules 速查表
3. AI 生成值与 editorial rules 不一致时 → 人工修正

---

## 2. 中文自然度风险

### 风险描述

DeepSeek 可能在直译英文 gloss 时选择较生硬/较旧/带偏见的中文词汇。

### 已知高危模式

| 类型 | 例子 | 风险 |
|------|------|------|
| 家庭称呼 | wife → "妻子"（非"孩子他妈"） | 语境不对 |
| 旧用语 | "女佣" 而非 "家政人员" | 带时代/歧视感 |
| 方言词 | "老大娘" 而非 "老奶奶" | 非标准中文 |
| 古语化 | "遵命" 而非 "明白了" | 现代口语中不自然 |
| 抽象词直译 | "极限" 而非 "勉强刚好" | 不符合日常表达 |

### 规则

1. Prompt 中明确要求：优先使用现代自然中文口语词汇
2. QA checker 应有 "旧/歧视/方言用语" 黑名单扫描
3. shortGloss 优先自然中文对应词而非字典式解释

---

## 3. usageNote 风险

### 风险描述

- usageNote 信息不足（场景过于笼统）
- usageNote 不准确（编造了不自然的日语例句或场景）
- 需要 usageNote 的固定表达却留空

### 已知问题模式

| 问题 | 例子 |
|------|------|
| 过于笼统 | "用于告别时" → 应细化到 "用于工作、学校等场合告别时" |
| 场景不对 | "电话用语" → 应细化到 "多用于电话语境，表示对方正在通话或线路占线" |
| 缺少礼貌程度 | 敬语表达缺少礼貌程度说明 |
| 民俗词过度描述 | "说两次以辟邪" → 应简化为 "与打喷嚏相关的民俗性说法" |
| 空值 | 固定寒暄语没有 usageNote |

### 规则

1. QA checker 检查：高频固定表达是否有 usageNote
2. usageNote 内容检查：是否描述了使用场景
3. 如果有 "敬语/口语/古语/专业用语" 标签，usageNote 需体现
4. usageNote 不应包含编造的日语例句

---

## 4. shouldDisplay 过宽风险

### 风险描述

罕见/古语/宗教/专业义项被错误标记为 shouldDisplay=true。

### 已知高危类型

| 类型 | 特征 | 处理 |
|------|------|------|
| 佛教专门义项 | 如 阿弥陀、愛(agape)、愛(attachment craving) | shouldDisplay=false |
| 古语义项 | 如 お前(古语)、哀れむ(古语) | shouldDisplay=false |
| 旧感叹词 | 罕见/过时感叹词用法 | shouldDisplay=false |
| 法律细分 | 诉讼案件、意思表示(法律术语) | shouldDisplay=false |
| 论坛/网络小众 | 如 安価(论坛回帖) | shouldDisplay=false |
| 缩写/暗号用法 | 如 愛→Ireland(IRA) | shouldDisplay=false |

### 规则

1. QA checker 应扫描所有 `shouldDisplay=true` 且 `issueFlags` 含 `specialized/archaic/religion` 的义项
2. 这些义项应逐一人工确认是否真的应该展示
3. 默认保守：可疑项优先隐藏

---

## 5. shouldDisplay 过窄风险

### 风险描述

医学/法律/教育领域的基础常用词被错误标记为 shouldDisplay=false。

### 已知高危模式

| 领域 | 应展示的例子 |
|------|------------|
| 医学 | 医療、医学、医薬品、医学部 |
| 法律 | 違法、法律（通用义） |
| 教育 | 医学部、医科大学 |

### 规则

1. 不能仅因 `pos` 标签或领域关联就隐藏
2. 判断标准：这个词义是否是现代日语中高频使用且对 EJU/N2-N3 学习者有价值的？
3. QA checker 应扫描所有 `shouldDisplay=false` 且 `issueFlags` 含 `specialized` 但实际是高频词的义项

---

## 6. 专业/古语/佛教/法律/医学风险

### 风险描述

这些领域的义项需要特殊的判断标准，不能一刀切。

### 分类处理表

| 领域 | 默认 shouldDisplay | 例外 |
|------|:---:|------|
| 佛教专门义项 | false | — |
| 古语义项 | false | — |
| 法律细分义项 | false | 違法 这种现代常用词 → true |
| 医学制度/组织/职位细分 | false | 医療、医学 这种基础词 → true |
| 专业术语（过窄） | false | — |
| 罕见感叹词/前缀 | false | — |

### 规则

1. 带 `archaic` flag 的义项默认 shouldDisplay=false
2. 带 `religion` flag（佛教/基督教专门义项）默认 shouldDisplay=false
3. 带 `specialized` flag 但条目本身是高频现代词的 → 人工判断
4. 不确定的 → confidence=low + needs_human_review

---

## 7. R3 Unresolved 类似项风险

### 风险描述

Top 500 Round 3 有 28 条 needs_human_review，其中 8 条 mark_unresolved。
这些条目在 reviewed-r3 完成之前，代表了已知风险类型。

### R3 风险映射到 Top 1000

| R3 风险类型 | 数量 | Top 1000 可能遇到的类似项 |
|------------|------|--------------------------|
| specialized（领域不明） | 25 | 大量 |
| too_rare（罕见用法） | 7 | 中等 |
| religion（宗教） | 7 | 中等 |
| archaic（古语） | 3 | 少 |
| legal（法律） | 3 | 少 |
| medical（医学） | 3 | 少 |
| abbreviation（缩略语） | 2 | 少 |

### 规则

1. Top 1000 的 QA checker 应复用 R3 的风险分类体系
2. 同类风险应产生 consistent 的处理（如所有佛教义项都 shouldDisplay=false）
3. 不要在 Top 1000 中"重新发明" shouldDisplay 判断

---

## 8. Top 1000 Review Queue 优先级建议

完成 Top 1000 provider run 后，ChatGPT review 应按以下优先级处理：

| 优先级 | 类别 | 说明 |
|--------|------|------|
| P0 | 固定寒暄语专项 | 复用 editorial rules 速查表，不必全量重新 review |
| P0 | shouldDisplay 专项 | 扫描领域标签，处理过窄/过宽 |
| P1 | 中文自然度 | shortGloss + zhGlosses 自然度 |
| P1 | usageNote 质量 | 场景说明完整度和准确性 |
| P2 | 普通高频词抽样 | 随机抽样检查整体质量 |
| P3 | R3-unresolved 类似项 | 参照 R3 经验处理同类风险 |

---

## 9. 总风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|------|:---:|:---:|---------|
| 固定寒暄语错误 | 中 | 中 | QA checker 专项扫描 + editorial rules 速查表 |
| 中文自然度不足 | 中 | 低-中 | 旧用语黑名单 + shortGloss 自然度检查 |
| usageNote 信息不足 | 高 | 低 | 空值检查 + 场景完整性检查 |
| shouldDisplay 过宽 | 中 | 中 | 领域词专项扫描 |
| shouldDisplay 过窄 | 低-中 | 中 | 高频基础词二次判断 |
| 宗教/古语/专业细分风险 | 中 | 低 | 按分类表统一处理 |
| 费用/账单风险 | 低 | 高 | estimate-only 优先 + billing check |

---

## 版本历史

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-06-23 | Hermes (dry-run) | 初始 risk rules draft |
