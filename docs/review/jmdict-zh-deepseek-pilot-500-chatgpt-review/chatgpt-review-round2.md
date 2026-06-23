# ChatGPT Review Round 2 - JMdict DeepSeek Top 500

## Scope

本轮基于 `docs/review/jmdict-zh-deepseek-pilot-500-overlay-candidate-reviewed-r1.json` 生成 reviewed-r2 candidate。审查范围仅限用户明确列出的 usageNote、中文自然度、普通常见词表达问题；没有全量审查 841 senses。

本轮没有调用 DeepSeek、Google Translate、Runtime AI，也没有上传 R2、写 D1、部署 Preview/Production 或激活中文 overlay。

## Summary

- corrections: 16
- shouldDisplay false->true: 0
- shouldDisplay true->false: 1
- gloss/shortGloss/usageNote-only changes: 15
- no action / false positive records: 19
- reviewed-r2 remains a local review candidate, not a production overlay.

## 中文自然度修正

- jmdict-1000620 sense 1: 不不 -> 不，不是
- jmdict-1001390 sense 1: 关东煮 -> 关东煮
- jmdict-1001730 sense 1: 拜托 -> 请您
- jmdict-1001890 sense 1: 御好烧 -> 御好烧
- jmdict-1002050 sense 1: 打扰了 -> 打扰了
- jmdict-1002110 sense 1: 女佣 -> 家政人员
- jmdict-1002170 sense 2: 小姐 -> 年轻女性
- jmdict-1002330 sense 2: 老奶奶 -> 老奶奶
- jmdict-1002400 sense 2: 您丈夫 -> 您先生
- jmdict-1002570 sense 2: 再见 -> 先走了
- jmdict-1002750 sense 1: 通话中 -> 正在通话
- jmdict-1002790 sense 1: 遵命 -> 明白了（敬语）
- jmdict-1003660 sense 1: 极限 -> 勉强刚好
- jmdict-1003710 sense 2: 打喷嚏时的咒语 -> 喷嚏咒语
- jmdict-1004040 sense 3: 不稳定 -> 阴沉不定
- jmdict-1004310 sense 3: 嗯 -> 嗯

## usageNote 修正

- jmdict-1000620 sense 1: "表示否定或谦虚" -> "表示否定、否认或谦让。"
- jmdict-1001390 sense 1: "日本料理，用酱油高汤炖煮各种食材" -> "日本料理，把萝卜、鸡蛋等食材放入高汤中炖煮。"
- jmdict-1001730 sense 1: "比「お願いします」更礼貌" -> "比「お願いします」更礼貌。"
- jmdict-1001890 sense 1: "日本煎饼，配料多样" -> "日本料理，把面糊、蔬菜、肉类等煎成饼状。"
- jmdict-1002050 sense 1: "进入别人家或房间时的礼貌用语。" -> "进入别人家、办公室或房间时的礼貌用语。"
- jmdict-1002570 sense 2: "用于告别时。" -> "用于工作、学校等场合告别时。"
- jmdict-1002750 sense 1: "电话用语。" -> "多用于电话语境，表示对方正在通话或线路占线。"
- jmdict-1002790 sense 1: "敬语，用于正式场合。" -> "敬语，用于服务业或正式场合回应对方。"
- jmdict-1003710 sense 2: "日本习俗，有人打喷嚏时说两次以辟邪。" -> "与打喷嚏相关的民俗性说法。"
- jmdict-1004310 sense 3: "感叹词，表示犹豫或思考。" -> "感叹词用法，表示犹豫或思考。"

## shouldDisplay 修正

- jmdict-1004310 sense 3: shouldDisplay true -> false

## No action / false positive

- jmdict-1000940 居らっしゃる sense 1：敬语说明自然，保持。
- jmdict-1000940 居らっしゃる sense 2：敬语说明自然，保持。
- jmdict-1001620 お握り sense 1：usageNote 正常，保持。
- jmdict-1001830 お兄さん sense 2：称呼年轻男性，保持。
- jmdict-1001950 お参り sense 1：常见文化生活词，保持。
- jmdict-1002010 お子様 sense 1：礼貌称呼说明可接受，保持。
- jmdict-1002010 お子様 sense 2：礼貌泛称说明可接受，保持。
- jmdict-1002260 お世話になる sense 1：常见表达，保持。
- jmdict-1002280 お先に sense 3：告别用法说明自然，保持。
- jmdict-1002290 お前 sense 1：粗鲁称呼说明必要，保持。
- jmdict-1002320 お祖父さん sense 2：老年男性称呼可接受，保持。
- jmdict-1002390 お大事に sense 1：祝福语说明自然，保持。
- jmdict-1002500 お土産 sense 1：Round 1 已修正，保持。
- jmdict-1002590 お父さん sense 2：Round 1 已修正，保持。
- jmdict-1002590 お父さん sense 3：Round 1 已修正，保持。
- jmdict-1002650 お母さん sense 2：Round 1 已修正，保持。
- jmdict-1002650 お母さん sense 3：Round 1 已修正，保持。
- jmdict-1002950 敵わない sense 1-3：普通词义，保持。
- jmdict-1002975 かも知れません sense 1：礼貌说明自然，保持。

## Remaining Risks

- 本轮没有覆盖全部 841 senses，只处理 Round 2 明确列出的 16 条 corrections。
- reviewed-r2 仍然保留 28 条 needs_human_review 相关风险，后续需要继续人工抽检。
- reviewed-r2 未激活、未部署、未上传，不能视为 production overlay。

## Suggested Next Review

- 继续审 そ/こ/あ 系列代词和语法项。
- 抽样 reviewed-r2 的 high-frequency ordinary entries。
- 继续处理剩余 `needs_human_review`。
