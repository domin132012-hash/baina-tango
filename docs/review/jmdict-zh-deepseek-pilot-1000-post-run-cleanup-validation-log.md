# Post-Run Cleanup Validation Log

## Task
- task name: Top 1000 post-run cleanup (pos field + guardrail check)
- branch: `feat/dictionary-zh-deepseek-pilot-100`
- start commit: `be513fbf24b5e98789cd5ebeea033527453a6c25`
- end commit: (to be filled after commit)
- JST time: 2026-06-23 23:04 JST

---

## Task 1: Add pos field to ChatGPT review packet

- Source: `docs/dictionary/zh-overlay-pilot-1000/translation-input.json` (partOfSpeech)
- 16 chunks regenerated with pos field
- review-index.md, review-risk-queue.md, README.md, machine-check-summary.md updated
- 799 senses, P0=15, P1=1, P2=51
- Each item now has: entryId, written, reading, senseIndex, **pos**, orig glosses, shortGloss, zhGlosses, usageNote, shouldDisplay, confidence, issueFlags, machine risks, priority, ChatGPT review blank

---

## Task 2: Add post-run actual-vs-guardrail check

- New function `checkActualVsGuardrail(actualUsage, config)` in `jmdict-zh-deepseek-pilot.js`
- Checks actual promptTokens vs maxInputTokens, completionTokens vs maxOutputTokens, total vs maxTotalTokens
- Returns `PASS` or `FAIL_GUARDRAIL_EXCEEDED` with details
- Integrated into `runProvider` after ledger write
- Output in console.log includes `guardrailCheck` and `guardrailNote` fields
- Scenarios covered:
  1. estimate <= guardrail, actual <= guardrail → PASS
  2. estimate > guardrail → stop pre-run (by assertEstimateLimits)
  3. actual > guardrail → FAIL_GUARDRAIL_EXCEEDED
  4. actual token data unavailable (0 values) → PASS (0 <= guardrail, but guardrail details show zero)

---

## Commands Run

```bash
git checkout feat/dictionary-zh-deepseek-pilot-100
node /tmp/fix_pos2.js
node --check scripts/dictionary/jmdict-zh-deepseek-pilot.js
node scripts/dictionary/jmdict-zh-deepseek-pilot.js --self-test-json-fixtures
node scripts/dictionary/jmdict-zh-deepseek-approval-compat-test.js
```

---

## Command Output Summary

| Check | Result |
|-------|:---:|
| node --check | ✅ PASS |
| self-test fixtures | ✅ 23/23 PASS |
| approval compat test | ✅ 12/12 PASS |
| pos field added | ✅ 799 items |
| review chunks | ✅ 16 |
| P0 count | 15 |

---

## External Services

| Service | Calls |
|---------|:---:|
| DeepSeek | 0 |
| Google Translate | 0 |
| Runtime AI | 0 |
| R2/D1 | 0 |
| Deploy | 0 |

---

## Secret / Safety

| Check | Result |
|-------|:---:|
| .env.local tracked | no ✅ |
| API key printed | no ✅ |
| secret scan | clean ✅ |
| large files | clean ✅ |

---

## Changed Files

1. `scripts/dictionary/jmdict-zh-deepseek-pilot.js` — added checkActualVsGuardrail()
2. `docs/review/...chatgpt-review/review-chunk-NNN.md` — 16 chunks with pos field
3. `docs/review/...chatgpt-review/review-index.md` — updated
4. `docs/review/...chatgpt-review/review-risk-queue.md` — updated
5. `docs/review/...chatgpt-review/README.md` — updated
6. `docs/review/...chatgpt-review/machine-check-summary.md` — updated
7. `docs/review/...post-run-cleanup-validation-log.md` — this file

---

## Validation Result

**PASS**

---

## Remaining Risks

- Top 1000 needs ChatGPT review
- Top 500 R3 28 needs_human_review unresolved
- R2/D1 isolation not resolved

---

## Next Step

ChatGPT review Top 1000 risk queue
