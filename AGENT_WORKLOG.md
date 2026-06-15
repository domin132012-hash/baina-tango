# Agent Worklog

This file is the durable handoff ledger for AI agents working on this repository.

Every agent must append an entry before finishing a non-trivial task. Keep entries factual and short enough for the next agent to scan quickly.

Entry template:

```md
## YYYY-MM-DD / Agent / Task name

### Task
- ...

### Files changed
- ...

### Validation
- ...

### Risks / next steps
- ...

### Commit
- `hash`
```

---

## 2026-06-14 / ChatGPT / 远程可配置消息通知系统

### Task
- 将消息通知从硬编码展示升级为远程可配置：用户端读取 KV，管理员通过受保护接口和后台页面管理通知。
- 由于本次通过 GitHub connector 直接改仓库，未直接做 `index.html` Python 字节替换；改用 Cloudflare Pages Middleware 在 HTML 响应末尾注入通知前端模块。

### Files changed
- `assets/notices.js` — 用户端通知模块：拉取 `/api/notices`，过滤 enabled/time/showOnce，排序，渲染通知，红点，关闭状态持久化。
- `functions/api/notices.js` — 公开 GET 接口，从 `NOTICES_KV` 的 `notices:all` 读取通知；未绑定时返回空数组。
- `functions/api/admin/notices.js` — 受 `ADMIN_NOTICE_TOKEN` 保护的 GET/POST/PUT/DELETE 管理接口。
- `functions/_middleware.js` — 对 HTML 响应注入 `/assets/notices.js?v=20260614-notices-kv`。
- `admin/notices.html` — 可视化通知后台。
- `NOTICES_ADMIN.md` — 使用说明与 curl 示例。
- `PROJECT_STATUS.md` / `HANDOVER.md` — 更新交接信息。

### Validation
- 本地语法检查：`node --check` 通过 `assets/notices.js`、`functions/api/notices.js`、`functions/api/admin/notices.js`、`functions/_middleware.js`。
- 由于当前会话没有 Cloudflare 环境权限，未能实际创建 KV namespace / 设置 Pages 环境变量 / 线上点后台实测。

### Risks / next steps
- 必须在 Cloudflare Pages 里配置 `NOTICES_KV` 和 `ADMIN_NOTICE_TOKEN` 后，后台写入才可用。
- `index.html` 源码里的旧静态通知块仍存在；线上运行时会被 `assets/notices.js` 接管并替换。后续有本地仓库时，可再用 Python 字节替换彻底删除旧 HTML 和旧 JS。
- Middleware 是运行时注入，若 Cloudflare Pages Functions 未启用或部署失败，旧硬编码通知仍会显示。

### Commits
- `ff68c0b` `feat(notices): add remote notice frontend module`
- `54d815e` `feat(notices): add public notices API`
- `cc9ebba` `feat(notices): add protected notices CRUD API`
- `2c19946` `feat(notices): inject notice module through Pages middleware`
- `0234354` `feat(notices): add visual notices admin page`
- `c8d3d04` `docs(notices): add admin usage guide`
- `99a975f` `docs(notices): update project status`
- `00505c0` `docs(notices): update handover`

---

## 2026-06-14 / Claude (Opus 4.8) / 综合科目 2024 材料页修复 (materials-fix)

### Task
- 修复线上反馈：综合科目 2024 第一屏直接显示「下線部1/2」设问，缺前面的材料/文章页，题目不完整。仅修 `humanities/2024-1`。

### 复现 / 根因（/diagnose）
- 复现：proto pages 从 `4` 起，第一屏即 p4（解答1·2），下線部1〜4 无所指。
- 根因：p3=問1 会話材料、p7=問2 文章材料（各含下線部1〜4 → 解答 1-4 / 5-8）。旧版「子题面自含、不渲染引导页」判断错误，材料页必须显示否则无法作答。8x 读图确认 p3 页眉「総合科目-1」、p7「総合科目-5」。

### Files changed
- `scripts/sogo_render_set.py` — pages 加入 `3`、`7`（保留 merge[8,9]/[22,23]）；重渲染新增 `page-003.png`、`page-007.png`，原图 md5 未变。
- `assets/eju.js` —
  - `EJU_SOGO_PROTOTYPES['humanities/2024-1']`：pages 加 3/7；新增显式 `problems`（27 屏），材料屏 `{page:3,label:'問1 材料',answers:[]}`、`{page:7,label:'問2 材料',answers:[]}`；`pageLabel` 改 `総合科目-`，加 `pageNumberOffset:-2`。
  - `ejuRenderRikaView`：计算印刷页号 `printedPage = sourcePage + pageNumberOffset`；材料屏显示「資料」而非「解答」；offset≠0 时标注「PDF pN」。
  - `runEjuTests`：综合断言更新（27 屏 / 2 材料屏 / pageLabel `総合科目-` / 仍 38 题）。
  - JSON 缓存号 → `20260614-sogo-2024-1-materials-fix`。
- `index.html` — `eju.js?v=` → `20260614-sogo-2024-1-materials-fix`（Python 字节替换）。
- `SOGO_PLAN.md` / `PROJECT_STATUS.md` 更新。

### Validation
- `node --check assets/eju.js` ✅；vm 跑 `runEjuTests` 0 失败 ✅。
- preview：第一屏=問1 材料页「総合科目 · 資料 · 総合科目-1（PDF p3 · 1/27）」，会話文可见 ✅；解答 1·2 在第 2 屏「総合科目-2（PDF p4）」✅；問2 材料页（p7）在解答 5 之前 ✅；27 屏导航（問1材料/1·2/3/4/問2材料/5…38）✅；27/27 题图 HTTP 200 ✅；满分 38/38 ✅；故意错第 10 题 37/38 ✅；控制台无 error ✅。

### Risks / next steps
- 仅 `humanities/2024-1`。其它综合年份未做，需用户明确指示。
- 答案序列与解答番号数量未变（仍 38）。
- 本轮 push 同时带上 Codex 已完成并本地提交的 `8b09231`（未部署年份灰色建设中 UI，HEAD 上、origin 未有），两者在 `assets/eju.js` 上层叠，已确认 Codex 任务结束后再动手。

### Commit
- `fix(eju): include humanities 2024 material pages`（哈希以实际 push 为准）

---

## 2026-06-14 / Claude (Opus 4.8) / 综合科目 2024 MVP

### Task
- 完成「综合科目（総合科目）2024 一套 MVP」：能作答 / 保存 / 採点 / 上线。仅此一套，不碰理科剩余套、不做旧年份综合。

### Files changed
- `assets/eju.js` — 新增 `EJU_SOGO_PROTOTYPES['humanities/2024-1']`（单科目 sogo，38 题全 `opts:4`，title「総合科目 · 2024年」，pageLabel「総合-」）；新增 `ejuRikaProtoFor(key)=EJU_RIKA_PROTOTYPES[key]||EJU_SOGO_PROTOTYPES[key]` 并替换 4 处直接查表（renderEjuRikaPractice / ejuRikaGo / ejuRikaJump / ejuRenderRikaView）+ renderEjuScannedSet 路由；ejuRenderRikaView 用 `proto.pageLabel` 去 '理科-' 硬编码 + 单科目隐藏切换条；runEjuTests 增综合断言；JSON 缓存号 → `20260614-sogo-2024-1`。
- `index.html` — `eju.js?v=` → `20260614-sogo-2024-1`（Python 字节替换，未手改）。
- `scripts/sogo_render_set.py`（新增）— 仿 rika_render_set.py，用综合科目自己的页码（**未套理科**）；跨页竖接 page-008=[8,9]、page-022=[22,23]。
- `assets/eju-media/humanities/2024-1/page-NNN.png`（新增 25 张，DPI150 裁白边/去页脚）。
- `SOGO_PLAN.md` 标注已实现；`PROJECT_STATUS.md` / `HANDOVER.md` / `TASK_PLAN.md` 更新。

### 答案核验（非猜测）
- PDF 32 页纯图。8x 渲染 p32 正解表，分左右两列分段读图；p31 末页确认「39～60 はマークしないでください」→ 实际作答番号 1-38，全部 4 択（正解值全 ≤4）。
- 答案序列：`4,4,3,2,3,2,4,4,1,3,1,1,2,4,1,3,1,2,2,2,3,3,1,4,3,2,4,1,1,2,3,4,1,2,3,1,3,4`

### Validation
- `node --check assets/eju.js` ✅；vm 跑 `runEjuTests` 自检 0 失败 ✅。
- preview（python http.server 8731）：进入「総合科目 · 2024年」练习页（非 OCR 浏览）✅；25 屏导航（1·2 … 38）✅；25/25 题图 HTTP 200 ✅；单选保存到 localStorage `baina-eju-math-paper-humanities/2024-1` ✅；官方答案採点 38/38 满分 ✅；故意错第 10 题 → 37/38 扣分 ✅；控制台无 error ✅。

### Risks / next steps
- 仅 `humanities/2024-1` 一套。其余综合年份（2008~2023、2025）未做，需用户明确指示。
- 大問引导文章页 p3(問1)/p7(問2) 未渲染（MVP 决策，子题面自含）；后续如需上下文可补引导页。
- 理科剩余 6 套仍暂停。与 Codex 不要同时改 `assets/eju.js`。

### Commit
- `feat(eju): add humanities 2024 practice MVP`（rebase 到 origin/main 后 push，哈希以实际为准）

---

## 2026-06-14 / ChatGPT / Handoff制度を追加

### Task
- Added a repository-level agent start checklist.
- Added this persistent worklog so future agents leave visible GitHub traces.
- Synced public docs to the current known EJU 真题试炼 direction.

### Current state recorded
- Math1 / Math2 真题试炼 are treated as already deployed workstreams.
- Science 已完成并上线：2023-1 bug 修复、2023-2、2022-1、2022-2、2021-1、2021-2.
- Science 剩余：2018-1、2018-2、2019-1、2020-2、2024-1、2025-1，当前暂缓。
- New active direction requested by user：综合科目 2024 MVP. User assigned this to Claude; not yet verified on `main` at the time of this entry.

### Files changed
- `AGENTS.md`
- `AGENT_WORKLOG.md`
- `PROJECT_STATUS.md`
- `HANDOVER.md`

### Validation
- Documentation-only change. No app code changed.
- No PDF rendering, no image assets, no `assets/eju.js` changes.

### Risks / next steps
- Claude may be working locally on 综合科目 2024; later agents should pull/rebase before editing docs or `assets/eju.js`.
- Future task prompts should include the standard "开工前必读" header from `AGENTS.md`.

### Commit
- `784f2d7`

---

## 2026-06-15 / Codex / EJU 記述作文双知识库改造

### Task
- 将 EJU 記述作文批改从单一 prompt 改成双知识库结构：`rubric` 负责评分依据，`reference bank` 负责例子、范文方向、理由素材和表达建议。
- 明确复用旧扫描结果，不重新 OCR 整本 PDF；`sample_essays.json` 已确认基本为空，因此没有作为依赖接入。

### Files changed
- `functions/api/eju-essay/_rubric.js` — 新增基礎編评分依据，固定整理 400〜500 字、30 分、50 点制、题目理解、主张、根拠、具体例、多角度、序論/本論/結論、段落、文体、書き言葉。
- `functions/api/eju-essay/_reference-bank.js` — 新增実践編参考素材库，按题型/话题/关键词/题目摘要/可用理由/常用表达/范文结构整理轻量条目。
- `functions/api/eju-essay/_select-reference.js` — 新增题目匹配与追问分类逻辑。
- `functions/api/eju-essay/analyze.js` — 固定加载 `rubric`，按题目命中 1〜3 条参考素材，并把 `rubricSource` / `matchedReferences` 返回给前端。
- `functions/api/eju-essay/follow-up.js` — 扣分解释优先按 `rubric`，只有问例子/范文/表达/改写时才启用 `reference bank`。
- `assets/eju-essay.js` — 结果页新增 `评分依据` 与 `参考素材` 展示，并把新字段保存到本地历史。
- `EJU_ESSAY_INTEGRATION_PLAN.md` / `PROJECT_STATUS.md` / `HANDOVER.md` — 更新为双知识库现状与边界说明。

### Validation
- `node --check functions/api/eju-essay/analyze.js`
- `node --check functions/api/eju-essay/follow-up.js`
- `node --check functions/api/eju-essay/_rubric.js`
- `node --check functions/api/eju-essay/_reference-bank.js`
- `node --check functions/api/eju-essay/_select-reference.js`
- `node --check assets/eju-essay.js`

### Risks / next steps
- `reference_bank` 目前是基于旧扫描结果人工整理的轻量条目，足够支撑 MVP，但还不是完整生产版素材库。
- 本轮未做 Cloudflare Preview 实机提交流程，也未复测登录后 DeepSeek 批改链路；若继续验收，应在带 `DEEPSEEK_API_KEY` 的 Preview 环境再跑一次。
- branch 仍然是 draft PR #2，未合并 main。

### Commit
- `a7ca291`
