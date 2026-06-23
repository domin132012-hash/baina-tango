# JMdict DeepSeek Top 100 Overlay Candidate Validation

- Input file: `docs/review/jmdict-zh-deepseek-pilot-100-review-corrected.md`
- Output JSON file: `docs/review/jmdict-zh-deepseek-pilot-100-overlay-candidate.json`
- Status: local_review_only_not_active
- Provider calls: none
- Runtime AI calls: 0
- R2/D1 writes: 0
- Production deploy: no
- Overlay active: no
- This candidate is not active and must not be uploaded to R2/D1 without separate approval.

## Counts

- entries: 100
- senses: 209
- shouldDisplay=true: 166
- shouldDisplay=false: 43
- human_corrected: 7
- ai_generated_unreviewed: 202
- needs_human_review: 3

## Validation

- JSON.parse: pass
- entryId non-empty: pass
- senseIndex non-empty: pass
- shortGloss non-empty: pass
- zhGlosses arrays: pass
- shouldDisplay booleans: pass
- confidence enum high/medium/low: pass
- issueFlags arrays: pass
- reviewStatus present: pass
- shouldDisplay=false count matches corrected summary: pass
- needs_human_review count matches corrected summary: pass
- secret/API key content included: no
- large DB/R2 shard/JMdict XML/gz included: no
- validation pass/fail: PASS

## Known Risks

- This is a local/PR review candidate only, not a formal active overlay.
- No runtime lookup code consumes this file yet.
- No R2/D1 write, Production deploy, overlay activation, PR ready transition, or merge is authorized by this candidate.
- Further human approval is required before any upload, activation, or deploy step.

## Sample Human-Corrected Rows

| entryId | writtenForm | reading | senseIndex | reviewStatus | reviewerNote |
|---|---|---|---:|---|---|
| jmdict-1587040 | 言う | いう | 3 | human_corrected | 删除不自然例句，改为概括性用法说明。 |
| jmdict-1502390 | 物 | もの | 2 | human_corrected | 中文释义中混入英文，已改为全中文释义。 |
| jmdict-2015370 | 儂 | わし | 1 | human_corrected | 普通 EJU 学习者默认展示需更保守。 |
| jmdict-2728300 | 私 | し | 1 | human_corrected | 普通 EJU 学习者默认展示需更保守。 |
| jmdict-2842390 | 私 | わたくし | 3 | human_corrected | 正确义项不等于适合默认展示，需人工复核。 |
| jmdict-1589600 | 終わる | おわる | 2 | human_corrected | 删除无可靠依据的他动词标注。 |
| jmdict-1347750 | 小さい | ちいさい | 3 | human_corrected | 修正 low/soft voice 义项，避免误解为低沉。 |
