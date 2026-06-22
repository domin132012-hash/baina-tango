# JMdict DeepSeek Chinese Pilot 100 QA Findings

- Issue: #11
- PR: #12
- Source review: `docs/review/jmdict-zh-deepseek-pilot-100-review.md`
- QA status: human_review_notes_only
- Created at: 2026-06-23 00:04 JST
- Provider calls in this QA pass: none
- Runtime AI calls: 0
- R2/D1 writes: 0
- Production deploy: no
- Overlay activation: no

## Overall Conclusion

- DeepSeek Top 100 is clearly more suitable than the Google MT baseline for learner-facing Chinese glosses.
- Do not rerun Top 100.
- Do not directly activate the overlay from the current AI review artifact.
- Next step should be generating a human-corrected review artifact or overlay candidate.
- Any R2/D1 write, overlay activation, Production deploy, PR ready transition, or merge must receive separate explicit approval.

## Findings

| # | Entry | Reading | Sense | Source row | Type | Current issue | Suggested correction | Reason |
|---:|---|---|---:|---|---|---|---|---|
| 1 | 物 | もの | 2 | row 81 / line 104 | Bad | `zhGlosses` contains the English word `belongings`. | `所有物；财产；随身物品` | 中文释义中混入英文。 |
| 2 | 言う | いう | 3 | row 60 / line 83 | Bad | `usageNote` includes the unnatural Japanese example `警報が言う（警报响）`. | `用于声音、警报等“发出某种声音”的表达。` | AI 编造或生成了不自然例句。 |
| 3 | 小さい | ちいさい | 3 | row 184 / line 207 | Minor | `低沉的；轻柔的` is not precise enough for `low/soft voice`. | `声音小的；轻声的` | `low/soft voice` 指声音小，不一定是低沉。 |
| 4 | 終わる | おわる | 2 | row 168 / line 191 | Minor | `结束（他动词）` may mislead learners. | `完成；结束` | 不要在无可靠依据时添加词性/自他说明。 |
| 5 | 私 group: 儂 / わし, 私 / し, 私 / わたくし | わし, し, わたくし | review rows 98, 103, 106 | lines 121, 126, 129 | shouldDisplay review | Some correct senses/readings may still be unsuitable for default EJU learner display. In the current artifact, `儂 / わし` is `shouldDisplay=true`, `私 / し` is `shouldDisplay=true`, and `私 / わたくし` sense 3 is `shouldDisplay=true`. | For ordinary EJU learners, default display should be more conservative; where needed set `shouldDisplay=false` and add `too_rare` / `needs_human_review`. | 不是所有正确义项都适合默认展示。 |

## QA Boundary

This file is an audit note only. It does not modify the generated review artifact, does not build an overlay candidate, and does not change runtime lookup behavior.
