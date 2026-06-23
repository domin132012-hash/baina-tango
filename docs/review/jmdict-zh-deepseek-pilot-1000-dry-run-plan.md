# DeepSeek Top 1000 — Dry-Run Plan

> 版本：1.0 — Hermes dry-run  
> 生成时间：2026-06-23 20:42 JST  
> 状态：计划草案，未执行

---

## 1. 目标

为 JMdict 中文 overlay 的下一批 500→1000 条目做**前置规划和规则沉淀**，目标是：

- 在跑 provider 之前，先完善 editorial rules、QA checker 和 risk rules
- 避免重复 Top 500 中已发现的问题
- 确保 Top 1000 的产出质量高于 Top 500

### Top 1000 范围（待确认）

- 条目范围：JMdict 的第 501-1000 条高频条目
- 目标 senses：约 800-900 条
- 预期 request 数：约 10 批

---

## 2. 为什么必须先沉淀规则再跑

基于 Top 500 经验：

| 问题 | 教训 |
|------|------|
| shouldDisplay 过窄（领域词过度隐藏） | Round 1 修正 9 条，Round 2 修正 1 条 |
| 固定寒暄语翻译不准确 | お邪魔/お疲れ/畏まりました 等 3+ 条 |
| 中文自然度不足 | Round 2 修正 15 条 |
| 家庭称呼直译 | お父さん/お母さん/御主人 3+ 条 |
| usageNote 信息不足/不准确 | Round 2 修正多条 |
| R3 仍有 28 条 needs_human_review 未解决 | 其中 8 条 mark_unresolved 必须人工决策 |

**如果直接跑 Top 1000 而不先应用已学经验，预期会有 3%-5% 的相同错误再次出现。**

---

## 3. Top 1000 只允许 local artifacts

| 允许 | 禁止 |
|------|------|
| 本地生成 review artifact | ❌ R2 写入 |
| 本地生成 overlay candidate JSON | ❌ D1 写入 |
| 本地生成 local package | ❌ Preview 部署 |
| 本地生成 usage ledger | ❌ Production 部署 |
| 本地生成 QA summary | ❌ 激活中文 overlay |
| commit + push 到 PR #12 分支 | ❌ merge PR |
| ChatGPT review packet 生成 | ❌ mark PR ready |

---

## 4. 预计阶段

### Phase 1: Prompt & Risk Rules 更新（当前轮 —— Hermes dry-run）

- [x] Editorial rules 文档 (`jmdict-zh-gloss-editorial-rules.md`)
- [x] Lessons learned 文档 (`jmdict-zh-deepseek-top500-lessons-learned.md`)
- [x] Dry-run plan (本文件)
- [x] Preflight checklist
- [x] Risk rules draft
- [ ] Prompt 更新（加入 editorial rules 级别说明）
- [ ] QA checker 草案更新

### Phase 2: Estimate-Only（不调用 provider）

- 运行 `--estimate-only` 估算 Top 1000 token 数和成本
- 检查是否在 guardrail 范围内
- 确认 billing/quota 状态（仅检查是否告警，不实际调用扣费）

### Phase 3: Provider Run（需用户明确批准）

- 用户批准后执行一次 `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider`
- 目标：生成 Top 1000 review artifact
- 强制要求：
  - `--run-provider` 使用 updated prompt
  - 使用 updated editorial rules 作为 system 内容
  - 最大重试 1 次（黄灯 schema 问题）
  - 红灯立即停止（API 错误、时间超限、账单告警）

### Phase 4: QA Summary（本地 only）

- 自动 QA checker 扫描 Top 1000 产出
- 生成 QA findings 报告
- 标记 Bad / Minor / shouldDisplay review 分类

### Phase 5: Overlay Candidate（本地 only）

- 从 reviewed QA findings 生成 overlay candidate JSON
- 生成 local package
- 生成 validation 报告

### Phase 6: ChatGPT Review Packet（本地 only）

- 按 P0/P1/P2 优先级生成 review packet
- 生成 Round 1/2/3 框架（复用 Top 500 流程）
- 包保持本地/PR only，不涉及任何外部服务

---

## 5. 失败处理策略

| 信号灯 | 场景 | 处理 |
|--------|------|------|
| 🟢 绿灯 | 正常生成、schema 验证通过 | 继续下一阶段 |
| 🟡 黄灯 | schema 小问题（zhGlosses 长度、issueFlags 格式等） | 最多自动重试 1 次；不允许第 2 次 |
| 🔴 红灯 | API 错误、账单告警、网络超时、JSON 格式失败 | **立即停止**，不重试，写失败日志 |

### 黄灯定义

- 部分 entries 的 zhGlosses 数组长度异常但可 normalize
- 部分 entryId/senseIndex 不匹配但可修正
- 部分 issueFlags 包含非法值但可归一化

### 红灯定义

- API 返回 4xx/5xx
- `response.choices[0].message.content` 不是有效 JSON
- billing/quota 告警（任何费用类警告）
- `finish_reason` 不是 `stop`
- 超过 max_tokens 限制

---

## 6. 成功后的下一步

完成 Top 1000 local artifacts 后：

1. **ChatGPT review**：按 Top 500 同样流程，生成 review packet → Round 1 → Round 2 → Round 3
2. **reviewed-r1/r2/r3**：逐步修正和复用
3. **再考虑 Preview 隔离方案**：在 Preview/Production R2/D1 绑定隔离问题解决之前，不进行任何 Cloudflare 写入
4. **不 merge PR**：PR #12 在整个 pilot 完成后仍保持 draft/open/unmerged，最终 merge 需另行批准

---

## 7. 后续批次规划（待 Top 1000 完成后讨论）

- Top 2000
- Top 5000
- 全量 JMdict（约 190,000+ 条目）

每批次前都应重复此流程：沉淀上一批的经验 → 更新规则 → 更新 prompt → estimate → provider run。

---

## 8. 版本历史

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-06-23 | Hermes (dry-run) | 初始 dry-run 计划 |
