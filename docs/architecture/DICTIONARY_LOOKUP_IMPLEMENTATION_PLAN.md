# Dictionary Lookup Implementation Plan

本文件是 `docs/architecture/DICTIONARY_LOOKUP_PLAN.md` 的执行层计划。目标是把普通查词改成“词典优先、AI 增强”，先做可上线的 JMdict 查词 MVP，再分阶段补中文释义、AI 语境解释和 App 离线包。

本计划不代表本轮已经接入 JMdict、KANJIDIC2、API 或前端逻辑。

## 1. 当前问题

- 现有普通查词如果主要依赖 AI API，会慢、成本高，并且受上游模型、网络、额度和 prompt 稳定性影响。
- 普通查词是高频基础功能，不应该每次都调用 AI。
- 目标是词典优先，AI 增强：词典负责读音、词性、基础释义、义项和来源；AI 只负责语境解释、易混淆词辨析、例句和深度讲解。
- 主词典源计划使用 JMdict。
- 汉字详情计划使用 KANJIDIC2。
- AI 批量中文翻译词典可以作为后续阶段，但不能一上来直接翻译整本词典。
- 网站阶段词典数据放云端，未来 App 阶段再考虑离线 SQLite 词典包。

## 2. 最终体验

用户点词或输入词后：

1. 前端调用 `/api/dictionary/lookup`。
2. 后端先查 JMdict 结构化索引。
3. 命中时立即显示：
   - 表记
   - 读音
   - 词性
   - 英文原始释义
   - 中文释义，如果已有则显示
   - 义项顺序
   - match type，例如 exact / reading / deinflected
   - 来源、版本和 license
4. 查不到时提示“未在词典中找到，可尝试 AI 解释”。
5. 用户点击“AI 解释”后，AI 再结合当前句子、用户问题和候选词典义项解释当前句子里的意思。
6. AI 解释只作为增强层，不覆盖词典义项，也不成为普通查词主流程。

前端展示必须保留 EDRDG / CC BY-SA 4.0 attribution。中文释义若来自 AI，应显示生成或审核状态。

## 3. 分阶段路线

### 阶段 1: JMdict 查词 MVP

目标：让普通查词先走词典，速度和稳定性优先。

范围：

- 接入 JMdict。
- 设计词典 schema 和导入脚本。
- 实现 `/api/dictionary/lookup`。
- 前端查词先走词典。
- 不命中才提示 AI。
- 显示 EDRDG / CC BY-SA 4.0 attribution。
- 保留 JMdict 英文原始释义。
- 不做大规模中文翻译。

建议验收词：

- `努力`: 常见名词/する动词，测试汉字表记和基础义项。
- `食べる`: 测试基本动词。
- `読まなかった`: 测试活用还原到 `読む`。
- `不存在词`: 测试无命中和 AI 提示。

明确不做：

- 不翻译整本词典。
- 不做 App 离线包。
- 不碰 Stripe。
- 不碰作文批改。
- 不改 Cloudflare / Supabase / Stripe / DeepSeek 后台配置，除非后续任务明确要求。

### 阶段 2: 中文释义批量翻译

目标：逐步增加中文释义，但保持质量、成本和 license 可控。

策略：

- 不一次翻译整本词典。
- 先 Top 1,000。
- 再 Top 10,000。
- 再 Top 50,000。
- 优先 EJU 高频词、用户高频查词、真题出现词、百纳已有词库。
- 每条保留 JMdict 英文原始释义。
- 中文释义必须标记 `ai_translated` / `reviewed`。
- 支持抽样人工审核和回滚。

发布规则：

- 未审核中文释义可以作为辅助字段，但不得删除英文原始释义。
- 若中文释义质量不稳定，应只展示英文释义或标明“AI 初翻，待复核”。
- 保守按 CC BY-SA 4.0 管理，不把 AI 中文释义当成完全私有闭源词典数据。

### 阶段 3: AI 语境解释

目标：AI 做老师式解释，不做普通查词底座。

流程：

1. 词典先返回候选 entry / sense。
2. 用户提供当前句子或点击 AI 解释。
3. AI 根据当前句子判断最合适义项。
4. AI 输出语境释义、易混淆词辨析、例句、学习者能懂的解释。
5. AI 输出必须引用词典候选义项，不能凭空新增基础意思。

接口建议：

- `POST /api/dictionary/explain`
  - input: query, sentence, selected entry/sense, user question, dictionary version
  - output: selected sense, explanation, comparison, example sentences, caveats

### 阶段 4: App 离线词典包

目标：未来 App 支持离线查词。

范围：

- 导出 SQLite 包。
- 包含版本号。
- 包含 checksum。
- 包含签名校验。
- 支持增量更新。
- App 本地保留 current 和 previous version，升级失败可回滚。

网站阶段限制：

- 网站阶段不要把整本词典下载到浏览器。
- 浏览器只缓存最近查过的词和少量结果。

## 4. 模型评测计划

不要直接决定翻译整本词典。先抽样 500 到 1000 个词条做模型 A/B 测试。

候选模型至少考虑：

- DeepSeek 低成本模型：用于大批量初翻候选。
- Gemini Flash / Flash-Lite 类模型：用于批量翻译候选。
- OpenAI nano / mini 类模型：用于结构化翻译和格式稳定候选。
- Claude Sonnet：用于抽样质检、困难词复查。

不建议用 Claude Opus / GPT 高价大模型翻整本词典。

评测集构成：

- EJU 高频词。
- 常见多义词。
- 动词和形容词。
- 假名词和汉字词。
- 外来语。
- 易错词和易混淆词。
- JMdict sense 较多的词。

评测指标：

- JSON 是否稳定。
- 是否保留 sense 顺序。
- 中文是否自然。
- 是否乱加原文没有的意思。
- 多义词是否清楚。
- 日语学习者是否看得懂。
- 成本。
- 速度。
- 失败率。

输出格式要求：

```json
{
  "entry_id": "jmdict id",
  "source_version": "version",
  "senses": [
    {
      "sense_order": 1,
      "source_gloss": ["original English gloss"],
      "zh_gloss": ["中文释义"],
      "notes": "optional learner note"
    }
  ]
}
```

评测通过条件由后续任务定义，但至少要先证明结构稳定、sense 顺序不乱、不会批量引入不存在的含义。

## 5. 数据保存计划

### GitHub

只保存：

- import scripts。
- schema / migrations。
- 文档。
- 少量 fixture。
- 小型测试样例。

不保存：

- 整本 JMdict 原始文件。
- 整本 KANJIDIC2 原始文件。
- 全量处理后 SQLite 包。
- 真实用户查词日志。
- secret 或后台导出。

### Cloudflare R2

保存：

- 原始 JMdict / KANJIDIC2 文件。
- 处理后的 SQLite 包。
- manifest。
- checksum。
- 签名文件。

### Cloudflare D1 或其他云端数据库

保存网站查词用的结构化索引：

- entries。
- forms。
- senses。
- source/version metadata。
- 中文释义状态。
- 高频和排序辅助字段。

### 浏览器

只缓存：

- 最近查过的词。
- 少量结果。
- 当前词典版本下的短期 lookup cache。

不保存整本词典。

### 未来 App

- 下载本地 SQLite 离线词典包。
- 校验 manifest / checksum / signature。
- 支持版本切换和增量更新。

## 6. License 策略

- JMdict / KANJIDIC2 使用 EDRDG license，按 CC BY-SA 4.0 管理。
- 可以商用，但必须 attribution。
- 网站查词页必须展示来源与许可。
- App About / Sources 页必须展示来源与许可。
- 数据版本、source URL、license URL 和 attribution text 必须随结果或页面可见。
- 基于 JMdict gloss 生成的 AI 中文释义，保守按 CC BY-SA 4.0 管理。
- 不把 AI 中文释义当成完全私有闭源词典数据。
- 上线前需要最终确认 license 展示方式。

建议 attribution 文案草案：

```text
Dictionary data includes JMdict/KANJIDIC2 from the Electronic Dictionary Research and Development Group (EDRDG), licensed under CC BY-SA 4.0.
```

中文页面可显示：

```text
词典数据包含 EDRDG 的 JMdict/KANJIDIC2，按 CC BY-SA 4.0 许可使用。
```

## 7. 第一阶段 MVP 具体任务拆分

### 发现当前入口

- 找当前项目里查词入口。
- 找当前 AI 查词逻辑。
- 确认调用路径、前端展示位置、错误提示和缓存逻辑。
- 只读相关文件，不做业务重构。

预期重点文件可能包括：

- `functions/api/ai-lookup-word.js`
- `netlify/functions/ai-lookup-word.js`
- 前端词卡或查词 UI 所在文件

### 设计 schema

最小表：

- `dictionary_sources`
- `dictionary_versions`
- `entries`
- `forms`
- `senses`
- `lookup_cache`，可选

字段至少覆盖：

- source。
- version。
- checksum。
- entry id。
- spelling。
- reading。
- part of speech。
- sense order。
- English gloss。
- Chinese gloss。
- translation status。
- review status。
- license attribution。

### 设计 import script

脚本职责：

- 读取 JMdict fixture。
- 解析 entries / forms / senses。
- 保留 sense 顺序。
- 计算 checksum。
- 写入 staging。
- 输出 import report。
- 不把整本原始词典提交到 GitHub。

测试 fixture：

- `努力`
- `食べる`
- `読む`
- 至少一个多义词。

### 设计 lookup API

`GET /api/dictionary/lookup?q=<query>&lang=zh&mode=basic`

返回必须包含：

- query。
- normalized query。
- results。
- match type。
- rank reason。
- source。
- source version。
- license。
- attribution。

失败/空结果：

- 空 query 返回 400。
- 无命中返回空 results 和 `canUseAiExplain: true`。
- 后端词典未配置返回稳定错误，不暴露内部路径或 secret。

### 设计前端展示

默认展示：

- 表记。
- 读音。
- 词性。
- 前 3 个义项。
- 中文释义，如果有。
- 英文原始释义。
- 来源/license。
- “AI 解释”按钮。

交互：

- “展开全部义项”。
- “AI 解释当前句子里的意思”。
- 无命中时只提示可尝试 AI，不自动调用 AI。

### 设计 attribution 展示

必须在查词结果或词典页面显示：

- EDRDG。
- JMdict / KANJIDIC2。
- CC BY-SA 4.0。
- source version 或更新日期。

### 设计测试

测试词：

- `努力`
- `食べる`
- `読まなかった`
- `不存在词`

测试点：

- exact match。
- reading match。
- deinflected match。
- no match。
- license 字段存在。
- 英文 gloss 保留。
- 中文 gloss 缺失时仍可展示英文。
- AI 未被自动调用。

### 明确不做

- 不翻译整本词典。
- 不做 App 离线包。
- 不碰 Stripe。
- 不碰作文批改。
- 不改 Cloudflare / Supabase / Stripe / DeepSeek 后台配置。
- 不处理 `RIKA_PLAN.md`。

## 8. 第一阶段完成定义

阶段 1 可以进入验收的条件：

- `/api/dictionary/lookup` 可对 fixture 和最小导入集返回词典结果。
- 前端普通查词默认走词典。
- 无命中时不会自动调用 AI。
- 查词结果显示 EDRDG / CC BY-SA 4.0 attribution。
- `努力`、`食べる`、`読まなかった`、`不存在词` 测试通过。
- GitHub 只包含脚本、schema、文档和少量 fixture，不包含全量词典文件。
- 外部服务变更已写入 `AGENT_SYNC_BOARD.md` 和 `AGENT_WORKLOG.md`。
