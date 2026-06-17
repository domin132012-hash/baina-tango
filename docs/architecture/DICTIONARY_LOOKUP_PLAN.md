# Dictionary Lookup Plan

百纳日语查词系统采用“词典优先、AI 增强”的架构：基础释义、读音、词性、常见义项和词形匹配优先来自开源词典；AI 只用于 fallback、语境解释、辨析、例句和深度讲解。本文档是方案设计，不包含代码实现、词典全量翻译或外部平台配置变更。

## 1. 词典源与 License 策略

明确数据源优先级：

- JMdict 为主词典，用于日语词条、读音、词形、词性、英文 gloss 和义项信息。
- KANJIDIC2 为汉字详情，用于汉字读音、部首、笔画、编码、含义等补充信息。
- EDICT / EDICT2 仅作为兼容参考和历史格式参考，不作为新系统主数据源。

License 保守结论：

- EDRDG General Dictionary Licence Statement 当前说明 JMdict、EDICT、KANJIDIC2 等词典文件适用 Creative Commons Attribution-ShareAlike Licence (V4.0)，即 CC BY-SA 4.0。
- CC BY-SA 4.0 允许商用分享和改编，但必须署名 attribution，并且改编、转换、基于原材料构建的贡献必须按相同 license 或兼容 license ShareAlike 分发。
- 网站/App 必须显示 attribution。网站查词结果页或词典功能页应展示来源和 license；App 应在 About / Sources 等页面展示来源、license、版本和链接。
- Web 词典服务必须建立更新流程，至少定期检查并记录版本；EDRDG license 对使用词典文件的软件、WWW server、smartphone app 要求有 regular updating procedure，Web dictionary server 示例要求至少每月更新词典版本。
- 基于 JMdict gloss 生成的 AI 中文释义默认按 CC BY-SA 4.0 管理。
- 不把 AI 中文释义当作完全私有闭源词典数据处理。中文释义应记录来源、生成方式和审核状态，并随对应 source/license/version 一起管理。

参考来源：

- EDRDG General Dictionary Licence Statement: https://www.edrdg.org/edrdg/licence.html
- Creative Commons BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

## 2. 网站阶段架构

网站阶段以云端词典 API 优先，AI 只做 fallback / 语境解释 / 辨析。

查询流程：

```text
user input
  -> normalize
  -> surface form -> deinflection -> dictionary lookup
  -> rank results
  -> return dictionary-first result
  -> optional AI explain
```

核心能力：

- 云端词典 API 先查本地导入的 JMdict / KANJIDIC2 数据，不把普通查词直接交给 AI。
- 缓存高频查询结果，缓存 key 应包含 query、normalized query、词典版本、显示语言和模式。
- AI fallback 只在词典无结果、结果无法覆盖用户问题、或用户主动请求深度解释时调用。
- AI explain 必须使用词典结果、当前句子和用户问题作为上下文，避免重新生成与词典冲突的基础释义。
- 前端默认展示词典结果；AI 增强内容作为附加解释，不能覆盖来源可追溯的词典义项。

建议 API：

- `GET /api/dictionary/lookup?q=<query>&lang=zh&mode=basic`
  - 返回词典优先结果、排序信息、source version、license attribution。
- `POST /api/dictionary/explain`
  - 输入 query、current sentence、selected entry/sense、用户问题。
  - 返回语境解释、辨析、例句或深度讲解。

## 3. 活用还原 / 原形还原层

必须在词典查找前增加活用还原层：

`surface form -> deinflection -> dictionary lookup`

`surface form → deinflection → dictionary lookup`

```text
surface form -> deinflection -> dictionary lookup
```

示例：

- `食べました -> 食べる`
- `読まなかった -> 読む`
- `高かった -> 高い`

MVP 先用规则表：

- 动词ます形、た形、ない形、なかった形、て形的常见规则。
- い形容词过去式、否定式、过去否定式。
- 规则输出候选原形和变形说明，不直接替代原始输入。

后续再接形态分析器：

- 用形态分析器提高长句分词、未知词、复合词和多候选还原的准确性。
- 形态分析器结果仍进入同一套 dictionary lookup 和 ranking，不绕过词典层。

## 4. 查词返回结果排序策略

查词结果按以下策略排序：

1. `exact match`：表记完全匹配优先。
2. `reading match`：读音匹配次之，适合假名输入。
3. `deinflected match`：活用还原命中，保留原始 surface form 与还原说明。
4. `common priority`：JMdict 常见词、常见表记优先。
5. `EJU frequency boost`：EJU 高频词、真题高频词提升排序。
6. `user history boost`：用户历史学习、收藏、错题或近期查询相关词提升排序。

排序必须可解释。API 应返回 match type、rank reason 或等价字段，前端可用于展示“由活用还原命中”“EJU 高频词”等提示。

## 5. 多义词义项展示

basic 模式显示前 3 个义项：

- 义项排序优先依据 JMdict 原始顺序、常用程度、EJU 相关度和查询上下文。
- 每个义项显示词性、中文释义、英文原始 gloss、来源和审核状态。

展开显示全部义项：

- 用户点击展开后显示该 entry 的全部 senses。
- 全部义项仍保留 source/license/version 信息。

AI explain 根据当前句子判断最合适义项：

- 当用户提供当前句子时，AI explain 必须基于句子判断最合适义项。
- AI 输出应说明为什么当前语境更适合某个义项。
- AI 不应删除或隐藏其他义项，只能作为语境推荐层。

## 6. 数据表设计

建议数据表：

- `dictionary_sources`
  - `id`
  - `name`
  - `license`
  - `license_url`
  - `attribution_text`
  - `source_url`
- `dictionary_versions`
  - `id`
  - `source_id`
  - `source_version`
  - `checksum`
  - `imported_at`
  - `status`
- `entries`
  - `id`
  - `source_id`
  - `version_id`
  - `jmdict_entry_id`
  - `primary_spelling`
  - `primary_reading`
  - `is_common`
- `forms`
  - `id`
  - `entry_id`
  - `form`
  - `reading`
  - `form_type`
  - `priority`
- `senses`
  - `id`
  - `entry_id`
  - `sense_order`
  - `part_of_speech`
  - `english_gloss`
  - `chinese_gloss`
  - `translation_status`
  - `review_status`
- `examples`
  - `id`
  - `entry_id`
  - `sense_id`
  - `ja`
  - `zh`
  - `source_id`
  - `license`
- `ai_translations`
  - `id`
  - `sense_id`
  - `source_gloss`
  - `zh_text`
  - `ai_translated`
  - `reviewed`
  - `model`
  - `created_at`

`translation_status` / `review_status` 的 MVP 取值：

- `none`
- `ai_translated`
- `reviewed`

每条中文释义必须保留英文原始释义，不能只保存 AI 中文结果。

## 7. 词典版本更新流程

词典版本更新必须可回滚、可比对、可追踪：

1. 下载新的 source 文件并记录 `source_version`。
2. 计算并记录 `checksum`。
3. 写入 staging import，不直接覆盖线上 active version。
4. 做 diff check：
   - entry 数量变化。
   - sense 数量变化。
   - 常见词数量变化。
   - 删除/新增比例异常。
   - license/attribution 文件是否变化。
5. 通过检查后执行 version switch，把 active version 指向新版本。
6. 保留旧版本用于 rollback。
7. 若线上发现异常，执行 rollback，将 active version 切回上一个通过验证的版本。

版本表至少记录：

- `source_version`
- `checksum`
- `imported_at`
- `status`
- `activated_at`
- `rolled_back_at`

## 8. 批量 AI 翻译流程

不全量一次做中文翻译。

优先级：

1. EJU 高频词。
2. 用户查词高频。
3. 真题出现词。
4. 收藏/错题/学习计划中高频出现的词。
5. 其他常见词。

每条记录必须：

- 保留英文原始释义。
- 中文释义标记 `ai_translated` / `reviewed`。
- 记录生成模型和生成时间。
- 支持人工复核后把 `reviewed` 置为 true 或等价状态。

阶段建议：

- MVP：Top 10,000 词，覆盖 EJU 高频、站内高频查询和真题词。
- 扩展：Top 50,000 词。
- 最后再评估是否需要全量，而不是默认全量翻译。

成本评估使用公式，不在方案里绑定单一供应商价格：

```text
estimated_cost = entries * avg_tokens_per_entry * model_unit_price
```

## 9. App 阶段架构

App 阶段支持 SQLite 离线包：

- 离线包格式：SQLite。
- 包含版本号。
- 支持增量更新。
- 每个离线包和增量包必须有 checksum。
- 下载包必须做签名校验，避免被篡改。
- App 本地保留当前 active version 和上一版，升级失败可回滚。

建议 manifest：

- `package_id`
- `source_version`
- `app_dictionary_version`
- `checksum`
- `signature`
- `created_at`
- `min_app_version`
- `delta_from`

App 查询逻辑与网站保持一致：

```text
local SQLite lookup first
  -> local deinflection
  -> local ranking
  -> optional online AI explain when network is available
```

## 10. MVP 范围

第一阶段 MVP：

- 导入 JMdict 的日英基础词条、读音、表记、词性和英文 gloss。
- 导入 KANJIDIC2 的基础汉字详情。
- 提供云端 lookup API。
- 增加规则表 deinflection。
- basic 模式显示前 3 个义项，支持展开全部义项。
- 实现查词排序：`exact match`、`reading match`、`deinflected match`、`common priority`、`EJU frequency boost`、`user history boost`。
- AI explain 只做 fallback / 语境解释 / 辨析。
- Top 10,000 词中文释义进入 AI 批量翻译与人工复核流程。
- 前端展示 attribution、source version 和 license。

暂不做：

- 不全量翻译整本词典。
- 不把 AI 作为默认查词底座。
- 不引入额外例句语料库，除非完成独立 license 审核。
- 不在 App 阶段前承诺完整离线词典下载。

## 11. 剩余风险

- License 解释上线前仍建议项目方最终确认，尤其是 AI 中文释义是否构成衍生数据的边界。
- JMdict 英文 gloss 到中文释义的质量需要人工抽检，不适合完全自动发布。
- 形态分析器引入后会增加包体、性能和 license 评估成本。
- 用户历史排序必须避免泄露用户隐私，个性化 boost 只能在用户授权和合规范围内使用。
