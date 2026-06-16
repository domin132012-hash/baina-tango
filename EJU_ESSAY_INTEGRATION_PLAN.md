# EJU 記述作文批改嫁接方案

最后更新：2026-06-16
分支：`feat/eju-essay-integration`

## 1. 结论：嫁接到哪里

把 EJU AI 的「作文批改」作为百纳真题试炼里的一个独立技能接入：

```text
学习 tab → 真题试炼 → 日本語 → 記述
```

不要直接塞进「読解」训练器，也不要照搬原项目的 React + Express 架构。

原因：

1. 百纳当前线上架构是 `index.html` + `assets/eju.js` + Cloudflare Pages Functions，不是 React/Vite/Express。
2. 作文批改属于日语大类下的独立技能，和现有「読解」四阶段训练并列最自然。
3. `assets/eju.js` 是当前最高冲突文件，多代理容易撞车；本方案用注入脚本接管「記述」卡片，尽量不碰大文件。
4. AI API 密钥必须留在后端，不能放前端。

## 2. 第一版迁移范围

### 已落底层代码

| 功能 | 文件 | 状态 |
|---|---|---|
| 記述卡片启用 + 作文批改 UI | `assets/eju-essay.js` | 已新增 |
| 批改接口 | `functions/api/eju-essay/analyze.js` | 已新增 |
| 批改追问接口 | `functions/api/eju-essay/follow-up.js` | 已新增 |
| 基礎編评分依据 | `functions/api/eju-essay/_rubric.js` | 2026-06-15 新增 |
| 実践編参考素材库 | `functions/api/eju-essay/_reference-bank.js` | 2026-06-15 新增 |
| 题目匹配器 | `functions/api/eju-essay/_select-reference.js` | 2026-06-15 新增 |
| HTML 注入 | `functions/_middleware.js` | 已追加 `eju-essay.js` 注入 |
| 科目接口 | `functions/api/eju-categories.js` | `writing.available=true` |

### 2026-06-16 验收补丁

- `analyze.js` 已加请求体最大 30000 字符、题目最大 1000 字符、作文最大 6000 字符。
- `follow-up.js` 已加请求体最大 40000 字符、追问最大 2000 字符、题目最大 1000 字符、作文最大 6000 字符、上一轮批改最大 8000 字符、历史上下文最多 8 条且每条最多 2000 字符。
- 两个接口都已把 JSON 解析错误改成清晰 400，把后端配置/DeepSeek 上游错误改成用户可读的通用错误，避免把环境变量名、stack 或上游原文暴露给页面。
- 两个接口都已对 `DEEPSEEK_API_KEY` 做 `trim()` 和格式检查；误填 `Bearer`、外层引号、换行/制表符时返回固定配置错误，避免 `Invalid header value` 直接暴露给用户。
- Cloudflare Pages production secret 已用本地 Keychain raw key 重置；Preview secret 是否正确生效仍需登录后真实批改请求确认。

### 第一版故意不做

| 原 EJU AI 功能 | 暂不迁移原因 |
|---|---|
| 手写 OCR | 需要阿里云 DocMind SDK/轮询/临时文件；Cloudflare Functions 环境与原 Express 不同，先别硬搬。 |
| 教材 PDF 扫描与教材库 | 原系统依赖本地 `data/library/` 文件系统，线上要改 KV/R2/Supabase，不能简单复制。 |
| 教材问答三层检索 | 体量大，容易拖慢主产品；建议等作文批改稳定后单独做。 |
| React 结果页组件 | 百纳不是 React 项目，已改为纯 JS 注入模块。 |

## 3. 当前接口设计（双知识库版）

### POST `/api/eju-essay/analyze`

请求：

```json
{
  "essayTheme": "题目",
  "essay": "学生作文",
  "essayMode": "student",
  "essayCharCount": 421
}
```

返回：

```json
{
  "ok": true,
  "result": "完整批改文本",
  "normalScore": 40,
  "strictScore": 35,
  "summaryLine": "一句话评价",
  "errorRows": [],
  "charCount": 421,
  "rubricSource": "速攻トレーニング記述・基礎編 rubric",
  "matchedReferences": [
    { "id": "ref-binary-friends", "topic": "友だちとの付き合い方", "type": "二項対立" }
  ]
}
```

规则：

- 每次批改固定加载 `rubric`，来源只认旧扫描结果里的 `rubric.json` / `rubric.md`。
- 根据 `essayTheme` 和作文正文，从 `reference_bank` 匹配 1〜3 条参考素材。
- prompt 中明确写死：
  - 评分只能依据 `rubric / 基礎編规则`
  - `reference bank` 只用于举例、范文方向、补充理由、表达建议
  - 不得因为学生作文不像参考范文就扣分
  - 不得照抄参考素材

### POST `/api/eju-essay/follow-up`

请求：

```json
{
  "question": "为什么这里要改？",
  "essayTheme": "题目",
  "essay": "学生作文",
  "critique": "上一轮批改结果",
  "context": []
}
```

返回：

```json
{
  "ok": true,
  "answer": "回答文本"
}
```

追问规则：

- 问“为什么扣分 / 为什么这个分数 / 评分依据”时，优先按 `rubric` 解释。
- 问“给例子 / 范文 / 理由 / 表达 / 怎么改写”时，才带入 `reference_bank`。
- `reference_bank` 不得影响分数判断。

## 4. 必需环境变量

Cloudflare Pages 环境变量：

```text
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com   # 可选
DEEPSEEK_MODEL=deepseek-v4-flash             # 可选
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

注意：

- DeepSeek 密钥只在 Cloudflare Functions 使用，不能进前端。
- 当前接口要求用户登录，前端通过现有 `ejuFetch()` 自动带 Supabase token。
- 如果 Supabase 或 DeepSeek 环境变量缺失，接口会返回清晰失败，不会静默假成功；对用户展示的是通用错误，不暴露环境变量名。

## 5. 前端嫁接方式

当前分支的入口方式是双保险：

1. `assets/eju.js` 的 `renderEjuJapanese()` 已直接把「記述」卡片渲染成可点击入口，文案为 `EJU 記述作文 AI 批改 / 试验开放`。
2. `assets/eju-essay.js` 仍保留 runtime patch 与页面渲染逻辑，防止旧缓存或异步时序导致入口状态回退。
3. 点击后在原 `view-eju-japanese` / `#ejuJapaneseMount` 内渲染作文批改页面。
4. 若 `ejuEssayRenderHome` 尚未就绪，入口会 toast：`作文批改模块加载中，请刷新后重试`。
5. 批改历史先放 localStorage：`baina-eju-essay-history-v1`，最多 30 条。

结果页额外显示：

- `评分依据`：固定文案 `速攻トレーニング記述・基礎編 rubric`
- `参考素材`：显示命中的 `reference id / topic / type`
- 若未命中：显示 `未命中具体参考素材，仅使用通用 rubric 评分`

这个方式的好处是：

- 不直接编辑 `index.html`。
- 不大改 `assets/eju.js`。
- 出问题时删掉 middleware 注入或删除 `assets/eju-essay.js` 即可回滚。

## 6. 给下一个代理的执行步骤

开工前照仓库规则读：

```text
AGENTS.md → PROJECT_STATUS.md → HANDOVER.md → AGENT_WORKLOG.md → EJU_ESSAY_INTEGRATION_PLAN.md
```

然后执行：

1. 切到分支：`feat/eju-essay-integration`。
2. 本地跑语法检查：
   ```bash
   node --check assets/eju-essay.js
   node --check functions/api/eju-essay/analyze.js
   node --check functions/api/eju-essay/follow-up.js
   node --check functions/api/eju-essay/_rubric.js
   node --check functions/api/eju-essay/_reference-bank.js
   node --check functions/api/eju-essay/_select-reference.js
   node --check functions/_middleware.js
   ```
3. 本地/Preview 验证：
   - 进入 `学习 → 真题试炼 → 日本語`。
   - 「記述」卡片应从建设中变成可点击。
   - 输入题目和作文，点击提交批改。
   - 未登录时应提示登录。
   - 登录且环境变量正确时应返回批改结果、分数、错误表。
   - 追问接口可继续回答。
4. 必须有一个已确认邮箱账号完成登录后真实 analyze + follow-up 验收；否则 PR #2 保持 draft，不得 ready/merge。
5. Cloudflare Pages 配置 `DEEPSEEK_API_KEY` 后再合并上线。
6. 验收通过后更新 `PROJECT_STATUS.md`、`HANDOVER.md`、`AGENT_WORKLOG.md`。

## 7. 后续升级路线

### P0：把文字批改跑稳

- 验证 DeepSeek 输出格式稳定。
- 如果错误表解析失败率高，改为二段式：先让 AI 输出 JSON，再用前端渲染。
- 添加使用次数限制，避免滥用 API。

### P1：批改历史上云

新增 Supabase 表，例如：

```sql
create table eju_essay_critiques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  essay_theme text,
  essay text not null,
  essay_mode text not null default 'student',
  char_count integer,
  normal_score integer,
  strict_score integer,
  summary_line text,
  error_rows jsonb,
  critique text not null
);
```

然后增加：

- `GET /api/eju-essay/history`
- `DELETE /api/eju-essay/history/:id`

### P2：手写 OCR

不要直接搬原 Express 版 DocMind 代码。建议做成独立接口：

```text
POST /api/eju-essay/read-handwriting
```

Cloudflare 环境下优先考虑：

- 图片上传到 R2。
- 后端提交阿里云 DocMind URL/文件。
- 轮询结果。
- 返回识别文本。

### P3：把 MVP 双知识库升级成生产版

当前分支已经明确分为两层：

- `rubric`：仅基于 `rubric.json` / `rubric.md` 提炼基础评分依据
- `reference bank`：仅基于 `textbook.json` / `structure.json` / `notes.json` / `notes/` 提炼例子与表达

但这还只是 MVP，后续要补：

- 更细的 reference entry 结构化抽取
- 更稳的题型识别与主题匹配
- 线上可维护的 R2/KV/Supabase 存储方案
- 更严格的输出结构约束，减少 AI 自由发挥

## 8. 风险

1. `reference_bank` 目前是人工整理后的轻量条目，不是整本教材的全结构化库。
2. DeepSeek 输出不是强 JSON，虽然保留了 `<ERRORS_JSON>` 解析，但仍可能失败。
3. middleware 注入会让所有 HTML 页面加载 `eju-essay.js`，脚本已做 no-op/延迟 patch，但上线前仍要看控制台。
4. 第一版历史存在 localStorage，换设备不会同步。
