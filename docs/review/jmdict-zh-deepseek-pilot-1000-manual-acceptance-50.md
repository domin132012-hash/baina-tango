# Top 1000 中文词典 Overlay — 人工验收包 (50-item)

- **任务**: JMdict DeepSeek Pilot 1000 中文 overlay candidate 人工验收
- **来源候选**: reviewed-r2 (`docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json`)
- **生成时间**: 2026-06-23 23:57 JST
- **entries**: 500
- **senses**: 799
- **抽样方式**: 分层抽样 (stratified sample)
- **bucket 分布**:
  - visible_common: 20
  - hidden_specialized: 10
  - risk_queue: 10
  - low_confidence_or_nhr: 5
  - changed_by_review: 5
- **总计**: 50 items
- **注意**: pos 字段在 reviewed-r2 JSON 中不可用（未包含在候选数据结构中），请参考 English glosses 推断词性。若需精确词性，可对照 JMdict 原文或 review markdown 表。

---

## 验收说明

请逐一检查以下 50 个义项的中文翻译质量。

### 评分标准

| 评分 | 含义 |
|------|------|
| **S** | 很好：准确、自然、适合直接给用户看 |
| **C** | 可接受：没有明显问题，虽然不是完美，但不用改 |
| **B** | 小问题：中文不自然、usageNote 不够好、shortGloss 可优化，但不会严重误导 |
| **A** | 严重问题：释义错误、会误导用户、shouldDisplay 明显错误 |

### 验收判定

- **A = 0 且 B ≤ 5**：✅ 建议通过，可继续下一阶段
- **A = 0 且 B > 5**：⚠️ 需要 reviewed-r3 或中文自然度修正
- **A ≥ 1**：🔴 暂停扩大批量，先修规则和 candidate

### 问题类型

| 类型 | 说明 |
|------|------|
| `meaning_error` | 释义错误（中文意思不对） |
| `unnatural_zh` | 中文不自然（语法/表达别扭） |
| `bad_shortGloss` | shortGloss 不够好 |
| `bad_usageNote` | usageNote 不够好 |
| `wrong_shouldDisplay` | shouldDisplay 判断错误 |
| `other` | 其他问题（请在备注中说明） |

---

## 抽样说明

- **visible_common (20)**: shouldDisplay=true 常见词，尽量覆盖名词/动词/形容词/副词/常用表达。优先选择学习价值高的常用义项
- **hidden_specialized (10)**: shouldDisplay=false 隐藏义项，覆盖棋类术语/古语/专业词/罕见义项。用于验证隐藏策略是否合理
- **risk_queue (10)**: 来自 R2 QA 抽样的可疑义项（P1: 3 项 shouldDisplay review, P2: 7 项可能的日文例句不自然）
- **low_confidence_or_nhr (5)**: needs_human_review=true 或 confidence=low 的义项。因候选仅 3 项 (2 nhr + 1 low confidence)，从 issueFlags 多的义项补齐 2 项
- **changed_by_review (5)**: R1/R2 审阅中被标记的义项。P1 shouldDisplay 审查项 (3) + R1 明确修正项 (1 下さる si=2) + QA 审查项 (1)。注意 r2ContentCorrectionCount=0，变更主要是标记/审查类，非内容修改

---

## Sample 01 — 一冊 / いっさつ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 (other)
- **entryId**: jmdict-1162680
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一册; 一本
- **shortGloss**: 一册
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 02 — 一酸化炭素 / いっさんかたんそ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 (other)
- **entryId**: jmdict-1162740
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一氧化碳
- **shortGloss**: 一氧化碳
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 03 — 一字 / いちじ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162900
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一个字; 一个字母
- **shortGloss**: 一个字
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 04 — ひと時 / ひととき

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162920
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 片刻; 一会儿; 瞬间
- **shortGloss**: 片刻
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 05 — ひと時 / ひととき

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162920
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 往昔; 曾经; 一段时期
- **shortGloss**: 往昔
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 06 — 一時間 / いちじかん

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162940
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一小时
- **shortGloss**: 一小时
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 07 — 一時金 / いちじきん

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162960
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一次性付款; 一次性金额; 整笔款项
- **shortGloss**: 一次性付款
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 08 — 一時金 / いちじきん

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162960
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 奖金; 一次性奖金
- **shortGloss**: 奖金
- **usageNote**: 多指公司发放的一次性奖金。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 09 — 一時的 / いちじてき

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1162980
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 暂时的; 一时的; 短暂的
- **shortGloss**: 暂时的
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 10 — 一式 / いっしき

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163080
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一套; 全套; 整组
- **shortGloss**: 一套
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 11 — 一式 / いっしき

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163080
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 全部; 一切
- **shortGloss**: 全部
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 12 — 一室 / いっしつ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163110
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一个房间; 一间屋子
- **shortGloss**: 一个房间
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 13 — 一手 / いって

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163130
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 唯一方法; 唯一手段
- **shortGloss**: 唯一方法
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 14 — 一手 / いって

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163130
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 独自承担; 一手包办; 垄断
- **shortGloss**: 独自承担
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 15 — 一種 / いっしゅ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163170
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一种; 一类; 品种
- **shortGloss**: 一种
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 16 — 一種 / いっしゅ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163170
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 某种意义上的; 可以说是
- **shortGloss**: 某种意义上的
- **usageNote**: 用于修饰名词，表示不完全准确但类似。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 17 — 一種 / いっしゅ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163170
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 有点; 有些; 稍微
- **shortGloss**: 有点
- **usageNote**: 副词用法，表示程度不高。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 18 — 一首 / いっしゅ

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163190
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一首（和歌）; 一首诗
- **shortGloss**: 一首（和歌）
- **usageNote**: 用于计数和歌、短歌等诗歌。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 19 — 一周年 / いっしゅうねん

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163220
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 满一年; 一整年
- **shortGloss**: 满一年
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 20 — 一周年 / いっしゅうねん

- **Bucket**: visible_common
- **Reason**: sd=true 常见词 ()
- **entryId**: jmdict-1163220
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一周年; 周年纪念
- **shortGloss**: 一周年
- **usageNote**: （空）
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 21 — ひと時 / ひととき

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (archaic)
- **entryId**: jmdict-1162920
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 两小时
- **shortGloss**: 两小时
- **usageNote**: 古时的一个时辰，相当于现代的两小时。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: archaic
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 22 — 一手 / いって

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1163130
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一手（棋）; 一步棋
- **shortGloss**: 一手（棋）
- **usageNote**: 围棋、将棋等棋类术语。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 23 — 一石 / いっせき

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1164150
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一局围棋
- **shortGloss**: 一局围棋
- **usageNote**: 围棋术语。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 24 — 一旦 / いったん

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (archaic)
- **entryId**: jmdict-1164650
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一天早晨
- **shortGloss**: 一天早晨
- **usageNote**: 古语用法，现代日语中不常用。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: archaic
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 25 — 一段 / いちだん

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1164690
- **senseIndex**: 4
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一段动词
- **shortGloss**: 一段动词
- **usageNote**: 日语语法术语。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 26 — 一着 / いっちゃく

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1164760
- **senseIndex**: 4
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一步棋; 一招
- **shortGloss**: 一步棋
- **usageNote**: 围棋、象棋等棋类术语。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 27 — 一通 / いっつう

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1164900
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一气通贯
- **shortGloss**: 一气通贯
- **usageNote**: 麻将术语。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 28 — 一通り / ひととおり

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (too_rare)
- **entryId**: jmdict-1164910
- **senseIndex**: 4
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一种方法
- **shortGloss**: 一种方法
- **usageNote**: （空）
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: too_rare
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 29 — １年生 / いちねんせい

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1165580
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一年生的
- **shortGloss**: 一年生的
- **usageNote**: 用于植物
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 30 — １年生 / いちねんせい

- **Bucket**: hidden_specialized
- **Reason**: sd=false 隐藏 (specialized)
- **entryId**: jmdict-1165580
- **senseIndex**: 4
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一年生植物
- **shortGloss**: 一年生植物
- **usageNote**: 植物学用语
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 31 — 営む / いとなむ

- **Bucket**: risk_queue
- **Reason**: QA: shouldDisplay review / possible_specialized_shouldDisplay_true
- **entryId**: jmdict-1173420
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 经营；从事（事业）
- **shortGloss**: 经营
- **usageNote**: （空）
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized; needs_human_review
- **needs_human_review**: False
- **risk labels**: possible_specialized_shouldDisplay_true
- **risk priority**: P1
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 32 — 鋭い / するどい

- **Bucket**: risk_queue
- **Reason**: QA: shouldDisplay review / possible_specialized_shouldDisplay_true
- **entryId**: jmdict-1174890
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 锋利; 尖锐
- **shortGloss**: 锋利
- **usageNote**: 用于刀、爪等。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized; needs_human_review
- **needs_human_review**: False
- **risk labels**: possible_specialized_shouldDisplay_true
- **risk priority**: P1
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 33 — 越境 / えっきょう

- **Bucket**: risk_queue
- **Reason**: QA: shouldDisplay review / possible_specialized_shouldDisplay_true
- **entryId**: jmdict-1175310
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 越境; 非法越境
- **shortGloss**: 越境
- **usageNote**: （空）
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized; needs_human_review
- **needs_human_review**: False
- **risk labels**: possible_specialized_shouldDisplay_true
- **risk priority**: P1
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 34 — 一風 / いっぷう

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1166220
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 独特风格; 与众不同
- **shortGloss**: 独特风格
- **usageNote**: 常以「一風変わった」形式使用，意为「风格独特的」。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 35 — 一文 / いちもん

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1166340
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一文钱; 极少的钱
- **shortGloss**: 一文钱
- **usageNote**: 常用于否定形式，如「一文無し」（身无分文）。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 36 — 一辺倒 / いっぺんとう

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1166440
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一边倒; 完全偏向
- **shortGloss**: 一边倒
- **usageNote**: 常以「～に一辺倒」形式使用，表示完全倾向于某事物。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 37 — 一歩 / いっぽ

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1166460
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 少许; 一点点
- **shortGloss**: 少许
- **usageNote**: 常以「一歩譲る」等形式使用。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 38 — 一目 / ひとめ

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1166950
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一览; 全景
- **shortGloss**: 一览
- **usageNote**: 常以「一目でわかる」等形式使用。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 39 — 一躍 / いちやく

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1167100
- **senseIndex**: 1
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一跃; 一下子
- **shortGloss**: 一跃
- **usageNote**: 常用于「一躍～になる」等表达，表示迅速达到某种状态。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 40 — 一流 / いちりゅう

- **Bucket**: risk_queue
- **Reason**: QA: Minor / possible_unreviewed_japanese_example
- **entryId**: jmdict-1167270
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 独特; 特有
- **shortGloss**: 独特
- **usageNote**: 常以「～一流の」形式使用。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 41 — 一塁 / いちるい

- **Bucket**: low_confidence_or_nhr
- **Reason**: low confidence (low)
- **entryId**: jmdict-1167370
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一座堡垒
- **shortGloss**: 一座堡垒
- **usageNote**: 本义，极少使用。
- **shouldDisplay**: False
- **confidence**: low
- **issueFlags**: too_rare
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 42 — 丑 / うし

- **Bucket**: low_confidence_or_nhr
- **Reason**: low confidence (low)
- **entryId**: jmdict-1172250
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 北北东
- **shortGloss**: 北北东
- **usageNote**: 方位，用于阴阳道等。
- **shouldDisplay**: False
- **confidence**: low
- **issueFlags**: specialized; archaic
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 43 — 丑 / うし

- **Bucket**: low_confidence_or_nhr
- **Reason**: low confidence (low)
- **entryId**: jmdict-1172250
- **senseIndex**: 4
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 十二月（农历）
- **shortGloss**: 十二月
- **usageNote**: 农历第十二个月。
- **shouldDisplay**: False
- **confidence**: low
- **issueFlags**: specialized; archaic
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 44 — 一泊 / いっぱく

- **Bucket**: low_confidence_or_nhr
- **Reason**: issue flags: specialized
- **entryId**: jmdict-1165700
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 一晚的租赁; 按晚出租
- **shortGloss**: 一晚的租赁
- **usageNote**: （空）
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: specialized
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 45 — 一匹 / いっぴき

- **Bucket**: low_confidence_or_nhr
- **Reason**: issue flags: too_rare
- **entryId**: jmdict-1166060
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 两反布
- **shortGloss**: 两反布
- **usageNote**: 布匹单位，1匹=2反，现已罕用。
- **shouldDisplay**: False
- **confidence**: medium
- **issueFlags**: too_rare
- **needs_human_review**: False
- **risk labels**: （无）
- **risk priority**: （无）
- **changed fields**: （无）
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 46 — 逸らす / そらす

- **Bucket**: changed_by_review
- **Reason**: 审查变更: QA审查 (无内容变更)
- **entryId**: jmdict-1167650
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 惹恼; 得罪
- **shortGloss**: 惹恼
- **usageNote**: 常用于「気を逸らす」等表达。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: QA审查 (无内容变更)
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 47 — 羽目 / はめ

- **Bucket**: changed_by_review
- **Reason**: 审查变更: QA审查 (无内容变更)
- **entryId**: jmdict-1171820
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 困境; 窘境
- **shortGloss**: 困境
- **usageNote**: 常用于「羽目になる」表示陷入困境。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: QA审查 (无内容变更)
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 48 — 嘘 / うそ

- **Bucket**: changed_by_review
- **Reason**: 审查变更: QA审查 (无内容变更)
- **entryId**: jmdict-1172400
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 错误; 失误
- **shortGloss**: 错误
- **usageNote**: 如「嘘をつく」指犯错。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: QA审查 (无内容变更)
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 49 — 泳ぐ / およぐ

- **Bucket**: changed_by_review
- **Reason**: 审查变更: QA审查 (无内容变更)
- **entryId**: jmdict-1174340
- **senseIndex**: 2
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 挤过（人群）
- **shortGloss**: 挤过
- **usageNote**: 如「人混みを泳ぐ」。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: QA审查 (无内容变更)
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## Sample 50 — 泳ぐ / およぐ

- **Bucket**: changed_by_review
- **Reason**: 审查变更: QA审查 (无内容变更)
- **entryId**: jmdict-1174340
- **senseIndex**: 3
- **pos**: （需对照 JMdict 原文）
- **English glosses**:
- **zhGlosses**: 处世; 谋生
- **shortGloss**: 处世
- **usageNote**: 如「世の中を泳ぐ」。
- **shouldDisplay**: True
- **confidence**: high
- **issueFlags**: none
- **needs_human_review**: False
- **risk labels**: possible_unreviewed_japanese_example
- **risk priority**: P2
- **changed fields**: QA审查 (无内容变更)
- **source**: reviewed-r2

**评分**: _S / C / B / A_　|　**问题类型**: _　|　**备注**: _　|　**建议修正**: _

---

## 验收统计

| 评分 | 数量 |
|------|------|
| S | |
| C | |
| B | |
| A | |

- **严重问题 (A) 数**:
- **小问题 (B) 数**:
- **验收判定**: ⬜ 待填写
- **用户总评**:
