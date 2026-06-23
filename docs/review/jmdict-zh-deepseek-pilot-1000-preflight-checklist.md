# DeepSeek Top 1000 — Preflight Checklist

> 版本：1.0 — Hermes dry-run  
> 生成时间：2026-06-23 20:42 JST  
> 用途：Top 1000 provider run 前必须逐项确认

---

## 执行前检查（必须全部 PASS）

### GitHub / PR 状态

- [ ] PR #12 still draft / open / unmerged
- [ ] Branch is `feat/dictionary-zh-deepseek-pilot-100`
- [ ] No PR ready transition
- [ ] No merge performed

### 环境与密钥安全

- [ ] `.env.local` not tracked by git
- [ ] `DEEPSEEK_API_KEY` not printed in any log or committed file
- [ ] No secret committed (API keys, tokens, service role keys)
- [ ] No Authorization header printed or committed

### R2 / D1 / 部署红线

- [ ] No R2 write (dictionary artifacts bucket untouched)
- [ ] No D1 write (metadata/active version untouched)
- [ ] No Preview deploy
- [ ] No Production deploy
- [ ] No Chinese overlay activation
- [ ] No Runtime AI calls

### DeepSeek 范围限制

- [ ] Top 1000 scope confirmed (not Top 2000, not full JMdict)
- [ ] DeepSeek scope limited to Top 1000 only
- [ ] No Google Translate call
- [ ] `estimate-only` completed before provider run
- [ ] Estimated tokens stay within guardrails:
  - [ ] estimated input tokens ≤ `BAINA_ZH_AI_MAX_INPUT_TOKENS`
  - [ ] estimated output tokens ≤ `BAINA_ZH_AI_MAX_OUTPUT_TOKENS`
  - [ ] estimated total tokens ≤ `BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS`
  - [ ] estimated requests ≤ `BAINA_ZH_AI_MAX_REQUESTS`

### 成本/账单检查

- [ ] billing/quota warning NOT seen (check DeepSeek console at least once before run)
- [ ] No paid/chargeable prompt seen in logs

### Provider 运行限制

- [ ] Provider run requires separate user approval (checklist alone is not approval)
- [ ] max retry ≤ 1 (黄灯场景最多 1 次自动重试)
- [ ] 红灯场景立即停止，0 重试

### 大文件 / Artifact 提交限制

- [ ] No full JMdict XML/gz committed
- [ ] No DB/SQLite committed
- [ ] No production R2 shard committed
- [ ] No complete JMdict JSON committed

### Top 500 现有 Artifact 保护

- [ ] Top 500 original candidate NOT overwritten (`jmdict-zh-deepseek-pilot-500-overlay-candidate.json`)
- [ ] reviewed-r1 candidate NOT overwritten (`jmdict-zh-deepseek-pilot-500-overlay-candidate-reviewed-r1.json`)
- [ ] reviewed-r2 candidate NOT overwritten (`jmdict-zh-deepseek-pilot-500-overlay-candidate-reviewed-r2.json`)
- [ ] reviewed-r1 local package NOT modified
- [ ] reviewed-r2 local package NOT modified

### Top 1000 Artifact 命名

- [ ] Top 1000 artifacts named clearly as local/review only (not production, not active)
- [ ] Overlay candidate contains `status: local_review_only_not_active` or equivalent
- [ ] Usage ledger clearly labeled as estimated or actual tokens

---

## Provider Run 执行流程

```
Phase 1: Preflight (本 checklist)
  └─ 全部 PASS → Phase 2

Phase 2: Estimate-Only
  └─ `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --estimate-only`
  └─ 确认 token / request / cost 估算在 guardrail 内
  └─ 全部 PASS → Phase 3

Phase 3: Provider Run（需用户明确批准）
  └─ `BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_1000_ONLY`
  └─ `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider`
  └─ 黄灯 → 最多 1 次重试
  └─ 红灯 → 立即停止

Phase 4: Post-Run 验证
  └─ Review artifact generated?
  └─ Usage ledger written?
  └─ QA summary generated?
  └─ No R2/D1 write?
  └─ No deploy?
```

---

## Post-Run 验证检查

- [ ] Review artifact (`jmdict-zh-deepseek-pilot-1000-review.md`) generated locally
- [ ] Usage ledger (`jmdict-zh-deepseek-pilot-1000-usage-ledger.json`) written with actual tokens
- [ ] QA summary (`jmdict-zh-deepseek-pilot-1000-qa-summary.md`) generated
- [ ] Overlay candidate (`jmdict-zh-deepseek-pilot-1000-overlay-candidate.json`) status `local_review_only_not_active`
- [ ] Local package (`jmdict-zh-deepseek-pilot-1000-local-package/`) validation PASS
- [ ] No R2 data written (verify via remote check or confirm no Cloudflare API call)
- [ ] No D1 data written
- [ ] PR #12 still draft / open / unmerged
- [ ] `.env.local` still untracked

---

## 版本历史

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-06-23 | Hermes (dry-run) | 初始 preflight checklist |
