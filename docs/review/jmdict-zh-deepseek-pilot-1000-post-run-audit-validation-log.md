# Post-Run Audit Validation Log — DeepSeek Top 1000

## Task
- task name: Post-run audit for Top 1000 provider run
- branch: `feat/dictionary-zh-deepseek-pilot-100`
- start commit: `719652a572d41f2e6368f8608e4a094c1f937203`
- end commit: (to be filled after commit)
- JST time: 2026-06-23 22:54 JST

---

## 审计 1：actual input tokens vs guardrail

### 事实

| 指标 | 值 |
|------|-----|
| estimate-only result (estimatedInputTokens) | 155,774 |
| original guardrail MAX_INPUT_TOKENS | 150,000 |
| estimate exceeded original guardrail? | **是** (155,774 > 150,000) |
| guardrail updated before provider run? | **是** → 200,000 |
| updated guardrail MAX_INPUT_TOKENS | 200,000 |
| actual input tokens (successful run) | 158,669 |
| actual exceeded UPDATED guardrail? | **否** (158,669 < 200,000) |

### 结论

- **estimate 阶段发现 original guardrail (150K) 不足** → 已正确上调至 200K
- **actual tokens (158,669) 未超过 updated guardrail (200K)**
- 脚本只校验 **estimate** 是否超过 guardrail（`assertEstimateLimits`），不对 actual post-run tokens 做二次校验
- **判定：PASS_WITH_GUARDRAIL_NOTE** — estimate 超过 initial recommended guardrail；pre-run 正确更新后通过；actual 在 updated guardrail 内

### 建议后续修复

- `runProvider` 结束后应增加 post-run guardrail check：检查 `actualUsage.totalTokens` 是否超过 `maxTotalTokens`
- 如果 actual 超过 guardrail，应在 validation log 中标记 `GUARDRAIL_DEVIATION_POST_RUN`，不是安静 PASS

---

## 审计 2：DeepSeek 调用次数 / retry 口径

### 事件时间线

| # | 事件 | API 调用 | 结果 |
|---|------|:---:|------|
| 1 | **Attempt 1**（religion flag schema fail） | **部分** | `validateProviderOutput` 发现 `issueFlags` 含 `religion`（不在旧 `ALLOWED_FLAGS` 中），在 per-batch validation 处抛出。该 batch 的 API 请求已发出（billable），但处理在此停止 |
| 2 | **Fix** | 0 | 新增 `religion` 到 `ALLOWED_FLAGS`，更新 prompt schema |
| 3 | **Attempt 2**（成功） | **25** | 全部 25 batch 通过；actual tokens 158,669/107,219 |

### 口径

| 指标 | 值 | 说明 |
|------|:---:|------|
| DeepSeek provider attempts | **2** | attempt 1 (failed) + attempt 2 (succeeded) |
| Successful provider runs | **1** | attempt 2 |
| Successful run request count | **25** | attempt 2 的 batch 数 |
| Failed attempt billable requests | **≥1, ≤25** | attempt 1 的部分 batch；确切数未知（无单独 ledger） |
| Retry 触发原因 | 黄灯 | schema 问题（`religion` flag），非 provider 故障 |
| Retry 次数 | **1** | 符合黄灯最多 1 次规则 |

### 修正

上一轮报告中 "DeepSeek 调用次数：1" **不准确**。应写：

```text
DeepSeek provider attempts: 2 (1 failed + 1 succeeded)
Successful provider runs: 1
Billable requests (successful run): 25
Failed attempt billable requests: unknown (≥1, batch-level failure)
Total billable requests across attempts: ≥26, ≤50
```

---

## 审计 3：artifact 完整性

### 检查结果

| Artifact | 大小/状态 | 结果 |
|----------|-----------|:---:|
| `review.md` | 196,813 bytes (823 lines) | ✅ |
| `qa-summary.md` | 6,461 bytes | ✅ |
| `overlay-candidate.json` | 377,190 bytes | ✅ |
| `local-package/manifest.json` | 4,111 bytes | ✅ |
| `local-package/shards/` | 16 shards | ✅ |
| `local-package/checksum.txt` | present | ✅ |
| `local-package/validation.md` | present | ✅ |
| `chatgpt-review/` | 22 files | ✅ |
| `chatgpt-review/review-chunk-NNN.md` | 16 chunks | ✅ |
| `chatgpt-review/review-index.md` | indexes all 16 | ✅ |
| `chatgpt-review/README.md` | present | ✅ |
| `chatgpt-review/review-risk-queue.md` | P0=15, P1=1, P2=45 | ✅ |
| `chatgpt-review/machine-check-summary.md` | Bad=0, Minor=23, sdReview=7 | ✅ |

### ChatGPT Review Chunk 字段检查

每个 review item 包含：
- ✅ entryId
- ✅ written
- ✅ reading
- ✅ senseIndex
- ✅ original English glosses
- ✅ zhGlosses
- ✅ shortGloss
- ✅ usageNote
- ✅ shouldDisplay
- ✅ confidence
- ✅ issueFlags
- ✅ machine risk labels
- ✅ ChatGPT review blank field
- ⚠️ `pos` (part of speech) — 未单独列在 chunk 表中；存在于 source review.md 的原始行中但 chunk generator 未提取

### 建议

后续可补充 `pos` 字段到 chunk 表以方便 reviewer 判断。

---

## 审计 4：安全检查

| 检查项 | 结果 |
|--------|:---:|
| .env.local tracked by git | ❌ no ✅ |
| API key in git diff | ❌ no ✅ |
| Authorization header in committed files | ❌ no ✅ |
| provider raw response committed | ❌ no ✅ |
| complete prompt raw input committed | ❌ no ✅ |
| JMdict XML/gz committed | ❌ no ✅ |
| DB/SQLite committed | ❌ no ✅ |
| production R2 shard committed | ❌ no ✅ |
| large files (max: 873K translation-input.json) | ✅ expected |
| secret scan | ✅ CLEAN |

---

## External Services (this audit round)

| Service | Calls |
|---------|:---:|
| DeepSeek calls | **0** |
| Google Translate | 0 |
| Runtime AI | 0 |
| R2 writes | 0 |
| D1 writes | 0 |
| Preview/Production deploy | 0 |

---

## Validation Result

**PASS_WITH_GUARDRAIL_NOTE**

注记：
1. estimate (155,774) exceeded original recommended guardrail (150,000); guardrail correctly updated to 200,000 before provider run
2. actual (158,669) within updated guardrail
3. DeepSeek provider attempts = 2, not 1; previous reports undercounted
4. All artifacts present and structurally complete
5. All security checks PASS

---

## Remaining Risks

| 风险 | 说明 |
|------|------|
| Token guardrail post-run check | 脚本不校验 actual tokens；建议后续加入 |
| Call count underreported | 上一轮报告写 "1 call" 实际为 2 attempts |
| Attempt 1 billable requests | 未知确切数（batch-level failure 后停止） |
| Top 500 R3 | 28 needs_human_review 未解决 |
| R2/D1 isolation | Cloudflare 写入仍被阻止 |

## Remaining Cost Risks

- Attempt 1 的部分 API 调用已计费（≥1 batch, ≤25 batches）；DeepSeek 控制台为计费权威来源

## Next Step

1. 统一状态文档口径（call count、guardrail note）
2. ChatGPT review Top 1000 risk queue
3. 考虑脚本改进：post-run actual-vs-guardrail check

---

## 版本历史

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-06-23 | Hermes | Post-run audit |
