# JMdict DeepSeek Top 500 QA Summary

- Input review file: docs/review/jmdict-zh-deepseek-pilot-500-review.md
- Corrected review candidate: docs/review/jmdict-zh-deepseek-pilot-500-review-corrected.md
- Overlay candidate JSON: docs/review/jmdict-zh-deepseek-pilot-500-overlay-candidate.json
- Local package: docs/review/jmdict-zh-deepseek-pilot-500-local-package
- Provider calls during QA: none
- Runtime AI calls: 0
- Google Translate calls: 0
- R2/D1 writes: 0
- Preview deploy: no
- Production deploy: no

## Counts

- entries: 500
- senses: 841
- shouldDisplay=true: 771
- shouldDisplay=false: 70
- confidence=low: 4
- needs_human_review: 32
- Bad findings: 0
- Minor findings: 7
- shouldDisplay review findings: 14

## Required Checks

- mixed English in Chinese glosses: not found
- possible unnatural Japanese examples: found
- shouldDisplay possibly too broad: found
- specialized / too_rare / archaic / dialect reasonableness: heuristic check completed
- counter mistranslation as 计数器: not found
- matter mistranslation as 物质: not found
- follow mistranslation as 跟随: not found

## QA Conclusion

- PASS_WITH_REVIEW: Bad findings 0 is within threshold 10; deterministic safety corrections may be used for local review candidate.
- corrected human_corrected count: 21
- corrected needs_human_review count: 46

## Sampled Suspicious Items

| type | rule | entryId | written | reading | sense | current | suggestion |
|---|---|---|---|---|---:|---|---|
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1387990 | 先生 | せんせい | 2 | sensei; title or form of address for a teacher, master, doctor, lawyer, etc. / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1000940 | 居らっしゃる | いらっしゃる | 1 | 「いる」「くる」「いく」的敬语 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1000940 | 居らっしゃる | いらっしゃる | 2 | 「ている」的敬语 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1001730 | お願いいたします | おねがいいたします | 1 | 比「お願いします」更礼貌 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1002975 | かも知れません | かもしれません | 1 | 比「かもしれない」更礼貌。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1006830 | 其の | その | 2 | 用于序数，如「その二」意为「第二」。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1154910 | 闇 | やみ | 4 | black market; shady trading; underhand transactions; illegal channels / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1157090 | 為さる | なさる | 1 | 「する」的敬语。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1158960 | 違法 | いほう | 1 | illegal; illicit; unlawful / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1159710 | 医 | い | 1 | medicine; the healing art; healing; curing / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1159770 | 医科 | いか | 1 | medical science; medical department / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1159810 | 医学 | いがく | 1 | medicine; medical science / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1159880 | 医学部 | いがくぶ | 1 | faculty of medicine; college of medicine; department of medicine; school of medicine; medical school / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1159920 | 医局 | いきょく | 1 | medical office (esp. in a hospital); doctor's office / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1159940 | 医師会 | いしかい | 1 | medical association / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1160030 | 医大 | いだい | 1 | medical university; medical college; medical school / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1160040 | 医長 | いちょう | 1 | medical director; chief physician / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1160100 | 医薬 | いやく | 1 | medicine; (pharmaceutical) drug; medical treatment / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1160110 | 医薬品 | いやくひん | 1 | medical and pharmaceutical products; medicinal supplies; drugs; pharmaceuticals; medicine / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1160140 | 医療 | いりょう | 1 | medical treatment; medical care / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |

## Known Risks

- This is deterministic QA, not a substitute for full human review.
- This candidate is not active and must not be uploaded to R2/D1 without separate approval.
- No Preview or Production deployment is authorized by this QA summary.

