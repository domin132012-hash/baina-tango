# ChatGPT Review Round 1 — DeepSeek Top 1000

## Scope

Round 1 reviewer decisions for Top 1000 risk queue. Based on editorial rules from `docs/design/jmdict-zh-gloss-editorial-rules.md` and Top 500 lessons learned.

- Source candidate: `docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate.json`
- Review scope: P0 (15 items) + P1 (1 item) + P2 (51 items) = 67 total
- All decisions conservative — mark unresolved when uncertain

## Summary

- P0 items reviewed: 15
- P1 items reviewed: 1
- P2 items reviewed: 51
- Corrections applied: **1** (P1 fixed expression only)
- No action (correct as-is): 66
- Unresolved: 0

## P0 Decisions (needs_human_review = 15)

All 15 P0 items are correctly hidden (shouldDisplay=false) with appropriate issueFlags and informative usageNotes. These are all specialized, archaic, rare, or religion-related senses that should not be shown to ordinary learners. The `needs_human_review` flag is removed after review confirms correctness.

| # | Item | Decision | Rationale |
|---|------|----------|-----------|
| 1 | ひと時 si=3 (archaic two-hour period) | keep_hidden_remove_needs_human_review | Correctly hidden; usageNote explains archaic context |
| 2 | 一旦 si=3 (archaic one morning) | keep_hidden_remove_needs_human_review | Correctly hidden; archaic usage |
| 3 | 一匹 si=2 (rare cloth measure) | keep_hidden_remove_needs_human_review | Correctly hidden; rare measurement unit |
| 4 | 一分 si=1 (old units) | keep_hidden_remove_needs_human_review | Correctly hidden; historical units |
| 5 | 一文 si=3 (old currency) | keep_hidden_remove_needs_human_review | Correctly hidden; obsolete currency |
| 6 | 一門 si=3 (sumo) | keep_hidden_remove_needs_human_review | Correctly hidden; sumo specialization |
| 7 | 泳ぐ si=4 (archaic totter) | keep_hidden_remove_needs_human_review | Correctly hidden; archaic/dialect usage |
| 8 | 駅弁 si=2 (slang) | keep_hidden_remove_needs_human_review | Correctly hidden; slang/adult content |
| 9 | 越年 si=2 (golf) | keep_hidden_remove_needs_human_review | Correctly hidden; golf specialty |
| 10 | 演歌 si=2 (archaic troubadour) | keep_hidden_remove_needs_human_review | Correctly hidden; archaic meaning |
| 11 | 横目 si=2 (paper term) | keep_hidden_remove_needs_human_review | Correctly hidden; paper-making specialty |
| 12 | 横目 si=3 (kanji radical) | keep_hidden_remove_needs_human_review | Correctly hidden; kanji specialty |
| 13 | 王子 si=2 (Shinto) | keep_hidden_remove_needs_human_review | Correctly hidden; Shinto term |
| 14 | 音頭 si=3 (gagaku) | keep_hidden_remove_needs_human_review | Correctly hidden; gagaku specialty |
| 15 | 下地 si=4 (dialect soy sauce) | keep_hidden_remove_needs_human_review | Correctly hidden; dialect usage (common soy sauce is 醤油) |

## P1 Decision (fixed_expression = 1)

| # | Item | Decision | Rationale |
|---|------|----------|-----------|
| 1 | 下さる si=2 (敬语) | **rewrite_gloss** | shortGloss "为我做" sounds unnatural. Change to "为我（做）" which better reflects the 敬语 nuance. Keep zhGlosses as "为我做; 承蒙". usageNote already good. |

## P2 Decisions (51 items)

All 51 P2 items are already correctly hidden (shouldDisplay=false) with appropriate flags. These cover: specialized terms (麻将/将棋/围棋/相扑/花札/高尔夫/印刷/造纸/建筑), archaic/historical units and meanings, religious terms (佛教/神道/基督教), rare/dialect usages. No corrections needed.

Decision: **no_action** for all 51 P2 items.

## Remaining Risks

- This is round 1 (obvious corrections only)
- P2 items received cursory review only
- Subsequent rounds should review shouldDisplay patterns and usageNote quality more thoroughly
