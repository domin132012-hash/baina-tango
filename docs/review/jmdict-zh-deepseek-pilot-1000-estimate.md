# DeepSeek Top 1000 — Estimate Report

> 版本：1.0 — Hermes dry-run estimate-only  
> 生成时间：2026-06-23 20:54 JST  
> 来源：`scripts/dictionary/jmdict-zh-deepseek-estimate-top1000.js`（dry-run helper）  
> **本轮未调用 DeepSeek。所有数字均为本地估算。**

---

## Estimate

| 字段 | 值 |
|------|-----|
| estimated_at_jst | 2026-06-23 20:54 JST |
| source branch | `feat/dictionary-zh-deepseek-pilot-100` |
| source commit | `005f4e81b59ed59681b6bef77c1b4504921cc45a` |
| scope | Top 1000 (JMdict beta entries 500–999) |
| entries | 500 |
| senses | 799 |
| estimated input tokens | **80,399** |
| estimated output tokens | **111,885** |
| estimated total tokens | **192,284** |
| estimated request count | 25 × 20 entries/batch |
| provider | deepseek |
| model | deepseek-v4-flash |
| prompt | `scripts/dictionary/prompts/jmdict-zh-deepseek-system.md` (5,682 chars) |
| source | JMdict (CC BY-SA 4.0) `jmdict-english-beta-1000-2026-06-17` |

---

## Provider Calls

| 检查项 | 值 |
|--------|-----|
| provider calls made | **0** |
| Google Translate calls made | **0** |
| Runtime AI calls | **0** |
| R2/D1 writes | **0** |
| Preview deploy | no |
| Production deploy | no |

---

## Guardrail Check

### 当前 guardrail（Top 500 配置）

| 参数 | 当前值 | 预估 | 结果 |
|------|--------|------|:---:|
| `BAINA_ZH_AI_MAX_ENTRIES` | 500 | 500 | ✅ PASS |
| `BAINA_ZH_AI_MAX_INPUT_TOKENS` | 30,000 | **80,399** | ❌ EXCEEDS |
| `BAINA_ZH_AI_MAX_OUTPUT_TOKENS` | 30,000 | **111,885** | ❌ EXCEEDS |
| `BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS` | 60,000 | **192,284** | ❌ EXCEEDS |
| `BAINA_ZH_AI_MAX_REQUESTS` | 100 | 25 | ✅ PASS |

### 🚨 结论：当前 guardrail 不适用于 Top 1000。必须先更新 guardrail，再批准 provider run。

### 建议 Top 1000 guardrail

| 参数 | 建议值 | 说明 |
|------|--------|------|
| `BAINA_ZH_AI_APPROVE_RUN` | `YES_DEEPSEEK_TOP_1000_ONLY` | 新增批准标记 |
| `BAINA_ZH_AI_MAX_ENTRIES` | 500 | 不变（500 条目 = entries 500-999） |
| `BAINA_ZH_AI_MAX_INPUT_TOKENS` | 92,459 | 预估值 × 1.15 |
| `BAINA_ZH_AI_MAX_OUTPUT_TOKENS` | 123,074 | 预估值 × 1.1 |
| `BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS` | 221,127 | 预估总额 × 1.15 |
| `BAINA_ZH_AI_MAX_REQUESTS` | 25 | 无需更多 |

---

## 与 Top 500 对比

| 指标 | Top 100 | Top 500 | Top 1000 (est.) |
|------|---------|---------|-----------------|
| entries | 100 | 500 | 500 |
| senses | 209 | 841 | 799 |
| request count | 5 | 25 | 25 |
| estimated input tokens | ~26K | — | 80,399 |
| estimated output tokens | ~28K | — | 111,885 |
| estimated total tokens | ~54K | — | 192,284 |
| actual input tokens | 30,544 | 144,483 | — |
| actual output tokens | 27,411 | 112,063 | — |

**注意**：Top 500 的 actual input (144,483) 远高于预估。Top 1000 的 input 可能在 150K–200K 范围内。需在 estimate 上留 15%-50% 余量。

---

## Cost Estimate

| 字段 | 值 |
|------|-----|
| cost estimate available locally | no |
| DeepSeek console verification required | **yes** |
| billing/quota warning seen | **no**（未连接 DeepSeek，无法检查） |
| approval required before provider run | **yes** |

**费用未估算**：项目未配置 DeepSeek pricing。用户必须在 DeepSeek 控制台确认余额/quota 后再批准 provider run。

---

## Guardrail Result

**FAIL — 当前 guardrail (Top 500) 不适用于 Top 1000。**  
必须按建议值更新 `BAINA_ZH_AI_MAX_*` 环境变量后才能批准 provider run。

---

## 版本历史

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-06-23 | Hermes (dry-run) | 初始 estimate 报告 |
