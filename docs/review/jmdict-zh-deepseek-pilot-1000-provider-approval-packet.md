# DeepSeek Top 1000 — Provider Run Approval Packet

> 版本：2.0 — Hermes 前置审批准备
> 生成时间：2026-06-23 21:02 JST
> 用途：用户/Reviewer 批准真正 provider run 前的参考文件  
> **⚠️ 本轮还没有调用 DeepSeek。所有数字均为本地估算。**

---

## 重要声明

- **本轮（Hermes 前置审批准备）未调用 DeepSeek。**
- 本文件是为**下一轮可能的 provider run** 准备的批准材料。
- 所有估算数字均来自本地 `estimate-only`（不调用 provider）。
- 如果下一轮批准，将真正调用 DeepSeek API。

---

## Scope

| 字段 | 值 |
|------|-----|
| scope | **Top 1000 only**（JMdict beta entries 500–999） |
| entries | 500 |
| estimated senses | 799 |
| estimated input tokens | **80,399** |
| estimated output tokens | **111,885** |
| estimated total tokens | **192,284** |
| estimated request count | 25 (20 entries/batch) |
| provider | deepseek |
| model | deepseek-v4-flash |
| prompt | `scripts/dictionary/prompts/jmdict-zh-deepseek-system.md`（含 editorial rules，5,682 chars） |
| source data | JMdict (CC BY-SA 4.0) `jmdict-english-beta-1000-2026-06-17` |

> **参考：Top 500 actual tokens** — input 144,483、output 112,063、total 256,546。  
> 实际 token 可能比预估值高 50%-80%，guardrail 已按最高值加余量配置。

---

## What Is Allowed

| 允许 | 说明 |
|------|------|
| ✅ 调用 DeepSeek API（仅一次） | `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider` |
| ✅ 生成 review artifact | `docs/review/jmdict-zh-deepseek-pilot-1000-review.md` |
| ✅ 生成 usage ledger | `docs/review/jmdict-zh-deepseek-pilot-1000-usage-ledger.json` |
| ✅ 生成 QA summary（本地） | QA checker 自动扫描 |
| ✅ commit + push 到 PR #12 分支 | 本地 artifacts only |

## What Is Forbidden

| 禁止 | 原因 |
|------|------|
| ❌ Google Translate | 不一致的 MT 源 |
| ❌ Runtime AI calls | 离线 batch only |
| ❌ R2 写入 | Preview/Production 绑定共用，无隔离 |
| ❌ D1 写入 | 同上 |
| ❌ Preview 部署 | 同上 |
| ❌ Production 部署 | 同上 |
| ❌ 激活中文 overlay | 同上 |
| ❌ merge PR | PR #12 必须保持 draft/open/unmerged |
| ❌ mark PR ready | 同上 |
| ❌ 提交 `.env.local` | 密钥安全 |
| ❌ 打印/提交 API key | 密钥安全 |
| ❌ 修改 Top 500 原始 candidate | 保持 reviewed artifacts 完整性 |
| ❌ 修改 reviewed-r1 / reviewed-r2 | 同上 |
| ❌ 修改 reviewed local packages | 同上 |

---

## Updated Guardrails (Required Before Run)

⚠️ **当前 guardrail（为 Top 500 配置）不适用于 Top 1000。**

推荐的 guardrail 值（基于 Top 500 actual tokens + 充足余量）：

```bash
export BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_1000_ONLY
export BAINA_ZH_AI_MAX_ENTRIES=500
export BAINA_ZH_AI_MAX_INPUT_TOKENS=150000
export BAINA_ZH_AI_MAX_OUTPUT_TOKENS=220000
export BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS=350000
export BAINA_ZH_AI_MAX_REQUESTS=25
```

### Guardrail 值理由

| 参数 | 推荐值 | 依据 |
|------|--------|------|
| MAX_INPUT_TOKENS | **150,000** | 预估 80K；Top 500 actual 144K；150K 覆盖所有合理场景 |
| MAX_OUTPUT_TOKENS | **220,000** | 预估 112K；Top 500 actual 112K；Top 1000 senses 略少 (799 vs 841)，220K 充足 |
| MAX_TOTAL_TOKENS | **350,000** | 预估 192K；Top 500 actual 256K；350K 给 30%-80% 误差余量 |
| MAX_REQUESTS | **25** | 预估 25 batch；无需更多 |
| MAX_ENTRIES | **500** | 固定（entries 500-999 = 500 entries） |

### ⚠️ 已知脚本兼容问题

脚本 `jmdict-zh-deepseek-pilot.js` 的 `runApprovalForEstimate()` 函数（第 415-418 行）：

```javascript
function runApprovalForEstimate(estimate) {
  if (estimate.entries === 500) return TOP_500_APPROVAL;  // "YES_DEEPSEEK_TOP_500_ONLY"
  if (estimate.entries === REQUIRED_MAX_ENTRIES) return REQUIRED_APPROVAL;
  return REQUIRED_APPROVAL;
}
```

**问题**：Top 1000 有 500 entries，脚本会要求 `BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_500_ONLY`，而不是 `YES_DEEPSEEK_TOP_1000_ONLY`。

**影响**：如果设置 `YES_DEEPSEEK_TOP_1000_ONLY`，`assertRunGuardrails` 会失败并停止。

**解决方案（二选一）**：
- A) 设置 `BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_500_ONLY`（利用现有逻辑，但确保 token guardrail 已更新为 Top 1000 值）
- B) 在 provider run 前更新脚本，新增 `TOP_1000_APPROVAL` 常量，使 `runApprovalForEstimate` 能区分 Top 500 和 Top 1000

**推荐方案 B**：避免 scope 混淆，但需修改脚本代码（仅修改常量定义和判断逻辑，不改变 provider 调用方式）。

---

## Auto-Retry Rules

| 信号灯 | 场景 | 处理 |
|--------|------|------|
| 🟢 绿灯 | 正常生成，schema 验证通过 | 继续 |
| 🟡 黄灯 | schema 小问题（zhGlosses 长度、issueFlags 等） | **最多 1 次自动重试**；第 2 次停止 |
| 🔴 红灯 | API 错误 (4xx/5xx)、账单告警、JSON 格式失败、finish_reason ≠ stop | **立即停止**，0 重试，写失败日志 |

---

## Stop Conditions（必须立即停止）

1. API 返回 4xx/5xx
2. `response.choices[0].message.content` 不是有效 JSON
3. billing/quota/payment/upgrade warning 出现在响应中
4. `finish_reason` 不是 `stop`
5. 超过 max_tokens 限制
6. 网络超时或连接失败
7. **超过以上任何 guardrail 值**

**如果看到任何 billing / paid plan / quota / usage warning / payment / upgrade 相关提示，立即停止，不重试。**

---

## Expected Outputs

成功运行后，本地应生成：

1. `docs/review/jmdict-zh-deepseek-pilot-1000-review.md` — AI review artifact
2. `docs/review/jmdict-zh-deepseek-pilot-1000-usage-ledger.json` — 实际 token 用量
3. QA summary（自动生成，路径由脚本决定）

**不会生成**：
- ❌ overlay candidate JSON（需后续阶段）
- ❌ local package（需后续阶段）
- ❌ R2/D1 写入
- ❌ 部署
- ❌ Top 500 artifact 覆盖

---

## User Approval Checklist

在批准下一轮 provider run 之前，请逐项确认：

- [ ] **我确认允许下一轮调用 DeepSeek API 一次**
- [ ] **我确认范围仅 Top 1000（JMdict entries 500–999，500 entries / 799 senses / 25 requests）**
- [ ] **我确认估算数字：input 80,399 / output 111,885 / total 192,284 tokens**
- [ ] **我确认不允许 Google Translate**
- [ ] **我确认不允许 R2 写入**
- [ ] **我确认不允许 D1 写入**
- [ ] **我确认不允许 Preview 部署**
- [ ] **我确认不允许 Production 部署**
- [ ] **我确认不允许 merge PR**
- [ ] **我确认不允许 mark PR ready**
- [ ] **我确认最多自动重试 1 次（黄灯场景）**
- [ ] **我确认看到 billing/quota/payment 提示必须停止**
- [ ] **我已在 DeepSeek 控制台确认余额/quota 充足**
- [ ] **我确认 guardrail 已更新：MAX_INPUT=150000 / MAX_OUTPUT=220000 / MAX_TOTAL=350000 / MAX_REQUESTS=25**
- [ ] **我确认 approval flag 已设置（需解决脚本兼容问题：见上文）**
- [ ] **我确认脚本会使用更新后的 prompt（含 editorial rules）**
- [ ] **我确认 Top 500 reviewed-r1、reviewed-r2、local packages 不会被覆盖**
- [ ] **我确认 `.env.local` 不会被提交**

---

## 版本历史

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-06-23 | Hermes (dry-run) | 初始 approval packet |
| 2.0 | 2026-06-23 | Hermes (pre-approval review) | 加入 token 估算数字；更新 guardrail 为 150K/220K/350K；加入脚本兼容问题；加入 artifact protection；扩展 checklist 至 18 项 |
