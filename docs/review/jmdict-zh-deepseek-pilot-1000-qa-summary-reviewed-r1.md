# JMdict DeepSeek Top 500 QA Summary

- Input review file: docs/review/jmdict-zh-deepseek-pilot-1000-review.md
- Corrected review candidate: docs/review/jmdict-zh-deepseek-pilot-500-review-corrected.md
- Overlay candidate JSON: docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r1.json
- Local package: docs/review/jmdict-zh-deepseek-pilot-1000-local-package-reviewed-r1
- Provider calls during QA: none
- Runtime AI calls: 0
- Google Translate calls: 0
- R2/D1 writes: 0
- Preview deploy: no
- Production deploy: no

## Counts

- entries: 500
- senses: 799
- shouldDisplay=true: 733
- shouldDisplay=false: 66
- confidence=low: 18
- needs_human_review: 15
- Bad findings: 0
- Minor findings: 23
- shouldDisplay review findings: 7

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
- corrected human_corrected count: 30
- corrected needs_human_review count: 22

## Sampled Suspicious Items

| type | rule | entryId | written | reading | sense | current | suggestion |
|---|---|---|---|---|---:|---|---|
| Minor | possible_unreviewed_japanese_example | jmdict-1166220 | 一風 | いっぷう | 1 | 常以「一風変わった」形式使用，意为「风格独特的」。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1166340 | 一文 | いちもん | 1 | 常用于否定形式，如「一文無し」（身无分文）。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1166440 | 一辺倒 | いっぺんとう | 1 | 常以「～に一辺倒」形式使用，表示完全倾向于某事物。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1166460 | 一歩 | いっぽ | 3 | 常以「一歩譲る」等形式使用。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1166950 | 一目 | ひとめ | 2 | 常以「一目でわかる」等形式使用。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1167100 | 一躍 | いちやく | 1 | 常用于「一躍～になる」等表达，表示迅速达到某种状态。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1167270 | 一流 | いちりゅう | 2 | 常以「～一流の」形式使用。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1167650 | 逸らす | そらす | 2 | 常用于「気を逸らす」等表达。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1171820 | 羽目 | はめ | 2 | 常用于「羽目になる」表示陷入困境。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1172400 | 嘘 | うそ | 2 | 如「嘘をつく」指犯错。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1173420 | 営む | いとなむ | 1 | to run (a business); to operate; to conduct; to practice (law, medicine, etc.) / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1174340 | 泳ぐ | およぐ | 2 | 如「人混みを泳ぐ」。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1174340 | 泳ぐ | およぐ | 3 | 如「世の中を泳ぐ」。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1174390 | 英気 | えいき | 2 | 如「英気を養う」。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1174790 | 衛生 | えいせい | 2 | 委婉说法，如「お手洗い」类似。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1174820 | 詠む | よむ | 2 | 如「詩を詠む」。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1174890 | 鋭い | するどい | 1 | sharp (knife, claws, etc.); pointed / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| shouldDisplay review | possible_specialized_shouldDisplay_true | jmdict-1175310 | 越境 | えっきょう | 1 | crossing a border (illegally); border violation; border transgression / shouldDisplay=true / none | 普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1176790 | 演ずる | えんずる | 1 | 「演じる」的书面/古风变体。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |
| Minor | possible_unreviewed_japanese_example | jmdict-1176790 | 演ずる | えんずる | 2 | 「演じる」的书面/古风变体。 | 抽样人工确认例句是否自然；必要时改为概括性 usageNote。 |

## Known Risks

- This is deterministic QA, not a substitute for full human review.
- This candidate is not active and must not be uploaded to R2/D1 without separate approval.
- No Preview or Production deployment is authorized by this QA summary.

