# JMdict DeepSeek Pilot 1000 — Manual Acceptance 50 Validation Log

- **task**: Top 1000 manual acceptance sample packet (50-item stratified)
- **branch**: feat/dictionary-zh-deepseek-pilot-100
- **start commit**: 8c0ba27
- **end commit**: (to be set after commit)
- **JST**: 2026-06-23 23:55 JST
- **source candidate**: reviewed-r2 (`docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json`)
- **entries**: 500
- **senses**: 799
- **sampling strategy**: stratified (5 buckets)
- **bucket counts**:
  - visible_common: 20
  - hidden_specialized: 10
  - risk_queue: 10
  - low_confidence_or_nhr: 5
  - changed_by_review: 5
- **total sample**: 50 (all unique, no duplicates)
- **markdown**: `docs/review/jmdict-zh-deepseek-pilot-1000-manual-acceptance-50.md`
- **CSV**: `docs/review/jmdict-zh-deepseek-pilot-1000-manual-acceptance-50.csv`
- **validation log**: this file

## commands run

```bash
git status --short
git diff --stat
git diff --check
python3 (execute_code — sampling + markdown + CSV generation)
```

## git status

```
?? .env.local.backup.20260623-221154
```

Working tree clean (only untracked backup file).

## git diff --stat

Only the two new acceptance files (markdown + CSV) plus validation log.

## external services

| Service | Calls |
|---------|-------|
| DeepSeek | 0 |
| Google Translate | 0 |
| Runtime AI | 0 |
| R2 writes | 0 |
| D1 writes | 0 |
| Preview deploy | 0 |
| Production deploy | 0 |
| Overlay activation | 0 |
| GitHub push | pending |

## secret checks

| Check | Result |
|-------|--------|
| .env.local tracked? | No |
| API key printed? | No |
| Authorization header printed? | No |
| JMdict XML/gz committed? | No |
| DB/SQLite committed? | No |
| Production R2 shard committed? | No |

## validation result

- [x] Markdown exists
- [x] CSV exists
- [x] Sample count = 50
- [x] All sampleId 1-50 unique
- [x] Bucket counts: visible_common=20, hidden_specialized=10, risk_queue=10, low_confidence_or_nhr=5, changed_by_review=5
- [x] CSV parseable (51 lines = 1 header + 50 rows)
- [x] User rating columns present (empty)
- [x] Source candidate path in each item
- [x] Sampling reason in each item
- [x] No candidate content modified
- [x] No provider output modified
- [x] No new production artifacts
- [x] git status clean (only untracked backup)

## sampling notes

- **low_confidence_or_nhr**: candidate has only 3 items (2 nhr + 1 low confidence). Padded with 2 items from issueFlags-heavy senses.
- **changed_by_review**: candidate has r2ContentCorrectionCount=0. Used QA P1 shouldDisplay review items (3) + R1 known correction item (下さる si=2) + QA reviewed item (1).
- **risk_queue**: 3 P1 (shouldDisplay review) + 7 P2 (possible unreviewed Japanese example). All 18 QA suspicious items are in the candidate.
- **pos field**: Not available in reviewed-r2 JSON. Marked as "需对照 JMdict 原文" in markdown. CSV pos column may be empty.
- **hidden_specialized**: All 10 items verified shouldDisplay=false.

## remaining risks

1. POS data not available in JSON — user may need JMdict reference for accurate POS classification
2. Low confidence / NHR bucket padded from issueFlags — may not be as informative as true NHR items
3. Changed_by_review bucket mostly QA-tagged items since no actual content corrections in R2
4. Sampling is deterministic (seed=42) and reproducible

## remaining cost risks

None — no provider calls, no cloud writes.

## next step

User manual review of the 50-item packet.
After user acceptance: decide whether to proceed with reviewed-r3, expand batch, or fix candidate.
