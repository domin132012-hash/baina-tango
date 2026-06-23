# Top 1000 中文词典 Overlay — 人工验收包 (50-item)

- **任务**: 用户人工验收 DeepSeek Top 1000 中文 overlay 质量
- **Source candidate**: docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json
- **生成时间 (JST)**: 2026-06-23T23:48:00+09:00
- **Entries**: 500 / Senses: 799
- **抽样策略**: stratified sampling (分层抽样)
- **样本总数**: 50

## 抽样分布

| Bucket | 数量 | 说明 |
|---|---|---|
| visible_common | 20 | shouldDisplay=true 的常见词 |
| hidden_specialized | 10 | shouldDisplay=false 的专业/宗教/古语/罕见义项 |
| risk_queue | 10 | R1/R2 风险队列 P0/P1/P2 |
| low_confidence_or_nhr | 5 | 低置信度或 needs_human_review |
| changed_by_review | 5 | R1/R2 已修改的义项 |
| **Total** | **50** | |

## 如何使用

逐项检查以下内容：
1. **zhGlosses / shortGloss** 是否准确、自然？
2. **usageNote** 是否有用、准确、不过度？
3. **shouldDisplay** 是否合理？（是否误隐藏常见词？是否误展示专业词？）
4. **issueFlags / confidence** 是否合适？

## 评分标准

| 评分 | 含义 |
|---|---|
| **S** | 很好：准确、自然、适合直接给用户看 |
| **C** | 可接受：没有明显问题，虽然不是完美，但不用改 |
| **B** | 小问题：中文不自然、usageNote 不够好、shortGloss 可优化，但不会严重误导 |
| **A** | 严重问题：释义错误、会误导用户、shouldDisplay 明显错误 |

## 验收判定建议

- A = 0 且 B ≤ 5：✅ 建议通过，可继续下一阶段
- A = 0 且 B > 5：⚠️ 需要 reviewed-r3 或中文自然度修正
- A ≥ 1：🔴 暂停扩大批量，先修规则和 candidate

---

## Sample 01 — 一冊 / いっさつ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162680 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一册; 一本 |
| shortGloss | 一册 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 02 — 一酸化炭素 / いっさんかたんそ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162740 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一氧化碳 |
| shortGloss | 一氧化碳 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 03 — 一字 / いちじ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162900 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一个字; 一个字母 |
| shortGloss | 一个字 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 04 — ひと時 / ひととき

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162920 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 片刻; 一会儿; 瞬间 |
| shortGloss | 片刻 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 05 — ひと時 / ひととき

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162920 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 往昔; 曾经; 一段时期 |
| shortGloss | 往昔 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 06 — 一時間 / いちじかん

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162940 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一小时 |
| shortGloss | 一小时 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 07 — 一時金 / いちじきん

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162960 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一次性付款; 一次性金额; 整笔款项 |
| shortGloss | 一次性付款 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 08 — 一時金 / いちじきん

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162960 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 奖金; 一次性奖金 |
| shortGloss | 奖金 |
| usageNote | 多指公司发放的一次性奖金。 |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 09 — 一時的 / いちじてき

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1162980 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 暂时的; 一时的; 短暂的 |
| shortGloss | 暂时的 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 10 — 一式 / いっしき

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163080 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一套; 全套; 整组 |
| shortGloss | 一套 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 11 — 一式 / いっしき

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163080 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 全部; 一切 |
| shortGloss | 全部 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 12 — 一室 / いっしつ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163110 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一个房间; 一间屋子 |
| shortGloss | 一个房间 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 13 — 一手 / いって

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163130 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 唯一方法; 唯一手段 |
| shortGloss | 唯一方法 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 14 — 一手 / いって

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163130 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 独自承担; 一手包办; 垄断 |
| shortGloss | 独自承担 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 15 — 一種 / いっしゅ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163170 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一种; 一类; 品种 |
| shortGloss | 一种 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 16 — 一種 / いっしゅ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163170 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 某种意义上的; 可以说是 |
| shortGloss | 某种意义上的 |
| usageNote | 用于修饰名词，表示不完全准确但类似。 |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 17 — 一種 / いっしゅ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163170 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 有点; 有些; 稍微 |
| shortGloss | 有点 |
| usageNote | 副词用法，表示程度不高。 |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 18 — 一首 / いっしゅ

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163190 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一首（和歌）; 一首诗 |
| shortGloss | 一首（和歌） |
| usageNote | 用于计数和歌、短歌等诗歌。 |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 19 — 一周年 / いっしゅうねん

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163220 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 满一年; 一整年 |
| shortGloss | 满一年 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 20 — 一周年 / いっしゅうねん

| 字段 | 内容 |
|---|---|
| Bucket | visible_common |
| Reason | sd=true 常见词 |
| entryId | jmdict-1163220 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 一周年; 周年纪念 |
| shortGloss | 一周年 |
| usageNote |  |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 21 — 因縁 / いんねん

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1168670 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 因缘（佛教术语） |
| shortGloss | 因缘（佛教术语） |
| usageNote | 佛教哲学概念，指直接原因和间接条件。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | religion;specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 22 — 一手 / いって

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1163130 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一手（棋）; 一步棋 |
| shortGloss | 一手（棋） |
| usageNote | 围棋、将棋等棋类术语。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 23 — ひと時 / ひととき

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1162920 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 两小时 |
| shortGloss | 两小时 |
| usageNote | 古时的一个时辰，相当于现代的两小时。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | archaic |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 24 — 一通り / ひととおり

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1164910 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 一种方法 |
| shortGloss | 一种方法 |
| usageNote |  |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | too_rare |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 25 — 下地 / したじ

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1185920 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 酱油 |
| shortGloss | 酱油 |
| usageNote | 方言或特定语境用法。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | dialect |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 26 — 一石 / いっせき

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1164150 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 一局围棋 |
| shortGloss | 一局围棋 |
| usageNote | 围棋术语。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 27 — 一旦 / いったん

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1164650 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 一天早晨 |
| shortGloss | 一天早晨 |
| usageNote | 古语用法，现代日语中不常用。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | archaic |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 28 — 一段 / いちだん

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1164690 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 一段动词 |
| shortGloss | 一段动词 |
| usageNote | 日语语法术语。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 29 — 一着 / いっちゃく

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1164760 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 一步棋; 一招 |
| shortGloss | 一步棋 |
| usageNote | 围棋、象棋等棋类术语。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 30 — 一通 / いっつう

| 字段 | 内容 |
|---|---|
| Bucket | hidden_specialized |
| Reason | sd=false 专业/宗教/古语 |
| entryId | jmdict-1164900 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 一气通贯 |
| shortGloss | 一气通贯 |
| usageNote | 麻将术语。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 31 — １年生 / いちねんせい

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1165580 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 一年生的 |
| shortGloss | 一年生的 |
| usageNote | 用于植物 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority | P0 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 32 — １年生 / いちねんせい

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1165580 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 一年生植物 |
| shortGloss | 一年生植物 |
| usageNote | 植物学用语 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority | P1 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 33 — 一泊 / いっぱく

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1165700 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 一晚的租赁; 按晚出租 |
| shortGloss | 一晚的租赁 |
| usageNote |  |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 34 — 一匹 / いっぴき

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1166060 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 两反布 |
| shortGloss | 两反布 |
| usageNote | 布匹单位，1匹=2反，现已罕用。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | too_rare |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 35 — 一分 / いちぶ

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1166270 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 十分之一; 百分之一; 1% |
| shortGloss | 十分之一 |
| usageNote | 旧制单位，也指长度单位（约3mm）或货币单位。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | too_rare |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 36 — 一文 / いちもん

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1166340 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 一文（货币单位） |
| shortGloss | 一文（货币单位） |
| usageNote | 日本旧货币单位，现已不用。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | too_rare |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 37 — 一門 / いちもん

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1167020 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 相扑部屋集团 |
| shortGloss | 相扑部屋集团 |
| usageNote | 相扑术语，指同一系统的相扑部屋。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 38 — 一流 / いちりゅう

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1167270 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 一面旗; 一面旗帜 |
| shortGloss | 一面旗 |
| usageNote | 本义，较少使用。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | too_rare |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 39 — 一両 / いちりょう

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1167320 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 一两 |
| shortGloss | 一两 |
| usageNote | 指古代货币单位「両」。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | archaic |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 40 — 一塁 / いちるい

| 字段 | 内容 |
|---|---|
| Bucket | risk_queue |
| Reason | risk queue P0/P1/P2 |
| entryId | jmdict-1167370 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 一座堡垒 |
| shortGloss | 一座堡垒 |
| usageNote | 本义，极少使用。 |
| shouldDisplay | false |
| confidence | low |
| issueFlags | too_rare |
| needs_human_review | false |
| risk labels |  |
| risk priority | P2 |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 41 — 丑 / うし

| 字段 | 内容 |
|---|---|
| Bucket | low_confidence_or_nhr |
| Reason | 低置信度或需人工审查 |
| entryId | jmdict-1172250 |
| senseIndex | 3 |
| pos |  |
| English glosses |  |
| zhGlosses | 北北东 |
| shortGloss | 北北东 |
| usageNote | 方位，用于阴阳道等。 |
| shouldDisplay | false |
| confidence | low |
| issueFlags | specialized;archaic |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 42 — 丑 / うし

| 字段 | 内容 |
|---|---|
| Bucket | low_confidence_or_nhr |
| Reason | 低置信度或需人工审查 |
| entryId | jmdict-1172250 |
| senseIndex | 4 |
| pos |  |
| English glosses |  |
| zhGlosses | 十二月（农历） |
| shortGloss | 十二月 |
| usageNote | 农历第十二个月。 |
| shouldDisplay | false |
| confidence | low |
| issueFlags | specialized;archaic |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 43 — 営む / いとなむ

| 字段 | 内容 |
|---|---|
| Bucket | low_confidence_or_nhr |
| Reason | 低置信度或需人工审查 |
| entryId | jmdict-1173420 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 经营；从事（事业） |
| shortGloss | 经营 |
| usageNote |  |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 44 — 鋭い / するどい

| 字段 | 内容 |
|---|---|
| Bucket | low_confidence_or_nhr |
| Reason | 低置信度或需人工审查 |
| entryId | jmdict-1174890 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 锋利; 尖锐 |
| shortGloss | 锋利 |
| usageNote | 用于刀、爪等。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 45 — 越境 / えっきょう

| 字段 | 内容 |
|---|---|
| Bucket | low_confidence_or_nhr |
| Reason | 低置信度或需人工审查 |
| entryId | jmdict-1175310 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 越境; 非法越境 |
| shortGloss | 越境 |
| usageNote |  |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields |  |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 46 — 応用 / おうよう

| 字段 | 内容 |
|---|---|
| Bucket | changed_by_review |
| Reason | R1/R2 已修改或清除标记 |
| entryId | jmdict-1180060 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 应用（学科） |
| shortGloss | 应用（学科） |
| usageNote | 用于应用物理学、应用语言学等学科名称。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields | issueFlags cleared, confidence bumped (R1 nhr→medium) |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 47 — 横綱 / よこづな

| 字段 | 内容 |
|---|---|
| Bucket | changed_by_review |
| Reason | R1/R2 已修改或清除标记 |
| entryId | jmdict-1180740 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 横纲; 相扑最高级别 |
| shortGloss | 横纲 |
| usageNote | 相扑术语，指最高级别力士。 |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields | issueFlags cleared, confidence bumped (R1 nhr→medium) |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 48 — 下等 / かとう

| 字段 | 内容 |
|---|---|
| Bucket | changed_by_review |
| Reason | R1/R2 已修改或清除标记 |
| entryId | jmdict-1186030 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 低等; 低级; 下等 |
| shortGloss | 低等 |
| usageNote |  |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields | issueFlags cleared, confidence bumped (R1 nhr→medium) |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 49 — 下品 / げひん

| 字段 | 内容 |
|---|---|
| Bucket | changed_by_review |
| Reason | R1/R2 已修改或清除标记 |
| entryId | jmdict-1186230 |
| senseIndex | 1 |
| pos |  |
| English glosses |  |
| zhGlosses | 下流; 粗俗; 低级 |
| shortGloss | 下流 |
| usageNote |  |
| shouldDisplay | false |
| confidence | medium |
| issueFlags | specialized;needs_human_review |
| needs_human_review | true |
| risk labels | needs_human_review |
| risk priority |  |
| changed fields | issueFlags cleared, confidence bumped (R1 nhr→medium) |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

## Sample 50 — 下さる / くださる

| 字段 | 内容 |
|---|---|
| Bucket | changed_by_review |
| Reason | R1/R2 已修改或清除标记 |
| entryId | jmdict-1184280 |
| senseIndex | 2 |
| pos |  |
| English glosses |  |
| zhGlosses | 为我做; 承蒙 |
| shortGloss | 为我（做） |
| usageNote | 敬语，用于对方为自己做某事时，接在动词て形后。 |
| shouldDisplay | true |
| confidence | high |
| issueFlags | none |
| needs_human_review | false |
| risk labels |  |
| risk priority |  |
| changed fields | shortGloss (R1: 为我做→为我（做）) |
| source | docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json |
| **userRating** | _请填写 S/C/B/A_ |
| **userIssueType** | _meaning_error / unnatural_zh / bad_shortGloss / bad_usageNote / wrong_shouldDisplay / other_ |
| **userComment** | _请填写_ |
| **suggestedFix** | _请填写_ |

---

## 人工验收统计

| 评分 | 数量 |
|---|---|
| S | _填写_ |
| C | _填写_ |
| B | _填写_ |
| A | _填写_ |
| 严重问题项 | _填写_ |
| 通过/不通过 | _填写_ |
| 用户总评 | _填写_ |
