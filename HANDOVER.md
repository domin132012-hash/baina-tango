# 交接文档 — EJU 真题试炼 + 远程通知系统

> 本文件面向**完全没有上下文的接手人/代理**。读完即可接手。
> 最后更新：2026-06-16。配套阅读：`AGENTS.md`（开工规则）、`PROJECT_STATUS.md`（当前进度）、`AGENT_WORKLOG.md`（最近动作流水）、`NOTICES_ADMIN.md`（通知后台）。

---

## 0. 一句话概括

百纳日语（baina-tango）是一个 EJU 留考备考的纯静态网页 App。本轮新增了一个「远程可配置消息通知系统」：通知内容存 Cloudflare KV，开发者可通过后台页面发布/禁用通知，不用改仓库代码。

当前真实状态：

- 消息通知：已推送远程配置系统，等待 Cloudflare 绑定 `NOTICES_KV` 和 `ADMIN_NOTICE_TOKEN` 后即可使用。
- 数学1 / 数学2：已完成并上线。
- 理科：2023-1 样板与 bug 修复已上线；2023-2、2022-1、2022-2、2021-1、2021-2 已上线。
- 理科剩余 6 套暂缓：2018-1、2018-2、2019-1、2020-2、2024-1、2025-1。
- 综合科目：2024 一套 MVP 已完成并上线（见下）。
- EJU 記述作文：`feat/eju-essay-integration` 分支已改成双知识库底座，仍是 draft PR #2，不能直接 merge。2026-06-16 已验证入口和未登录 401；登录后真实 analyze/follow-up 仍缺已确认账号验收。

### EJU 記述作文双知识库现状（2026-06-15）

- 前端入口仍然是：`学习 → 真题试炼 → 日本語 → 記述`。
- 当前分支已不再只依赖 `assets/eju-essay.js` 的 runtime patch；`assets/eju.js` 的 `renderEjuJapanese()` 已直接把 `記述` 卡片渲染成可点击入口，`聴読解` 仍保持建设中。
- 当前分支新增 3 个底层模块：
  - `functions/api/eju-essay/_rubric.js`
  - `functions/api/eju-essay/_reference-bank.js`
  - `functions/api/eju-essay/_select-reference.js`
- 评分依据 `rubric` 只来自旧扫描结果的：
  - `rubric.json`
  - `rubric.md`
- 参考素材 `reference bank` 只来自旧扫描结果的：
  - `textbook.json`
  - `structure.json`
  - `notes.json`
  - `notes/`
- `sample_essays.json` 已确认基本为空，当前实现不依赖它。
- prompt 边界已经写死：
  - 评分只能依据 `rubric / 基礎編规则`
  - `reference bank` 只能用于举例、范文方向、补充理由、表达建议
  - 不得因为学生作文不像参考范文就扣分
  - 不得照抄参考素材
- `follow-up.js` 也按同一边界处理：
  - 追问分数/扣分原因 → 主要按 `rubric` 回答
  - 追问例子/范文/理由/表达/改写 → 才启用 `reference bank`
- 结果页现在会显示：
  - `评分依据`
  - `参考素材`
  - 若没匹配到题目，会显示 `未命中具体参考素材，仅使用通用 rubric 评分`
- `functions/_middleware.js` 仍继续注入 `/assets/eju-essay.js`；当前 cache bust 版本是 `20260615-eju-essay-v4-entry-open`。
- 这次只整理了轻量 reference entries，没有把整本 OCR 文本提交进仓库，也没有把 `docmind_result.md` 整段塞进 prompt。
- 2026-06-16 补了最低限度防滥用/稳定性保护：
  - `analyze.js`：请求体最大 30000 字符，题目最大 1000 字符，作文最大 6000 字符；JSON 解析错误返回清晰 400；后端配置或 DeepSeek 上游错误不再把环境变量名、stack 或原始上游消息返回给用户。
  - `follow-up.js`：请求体最大 40000 字符，追问最大 2000 字符，题目最大 1000 字符，作文最大 6000 字符，上一轮批改最大 8000 字符，历史上下文最多 8 条且每条最多 2000 字符；错误同样脱敏。
- 当前 Preview 验收范围：
  - `学习 → 真题试炼 → 日本語 → 記述` 可达，`記述` 显示 `试验开放` 且可点击。
  - 未登录提交 408 字作文时，页面显示 `批改失败：请先登录账号`，`/api/eju-essay/analyze` 返回 401，浏览器 console 无额外全局 JS error。
  - 直接请求 `/api/eju-essay/follow-up` 的空 Bearer 也返回 401。
- 尚未验收：
  - 登录后真实 analyze 成功返回分数、完整批改、`rubricSource`、`matchedReferences`。
  - 登录后 follow-up 按 rubric/reference 分流返回。
  - 刷新后的本地历史，因为未登录批改不会产生成功历史。
  - DeepSeek 环境变量是否在 Preview 已配置，因没有有效登录 token 无法走到 AI 调用。

### 消息通知系统现状（2026-06-14）

- 前端模块：`assets/notices.js`。
- 公开接口：`GET /api/notices`。
- 管理接口：`GET/POST/PUT/DELETE /api/admin/notices`。
- 可视化后台：`/admin/notices.html`。
- KV 绑定名：`NOTICES_KV`。
- KV 单键：`notices:all`。
- 管理员环境变量：`ADMIN_NOTICE_TOKEN`。
- Pages Middleware：`functions/_middleware.js` 在 HTML 响应里注入 `assets/notices.js?v=20260614-notices-kv`。
- 运行逻辑：用户端每次启动拉取通知，前端过滤 `enabled`、`startAt/endAt`、`showOnce`，并按 `priority` 排序。
- 注意：本轮没有直接改 `index.html`，旧硬编码通知块仍在源码中；线上运行时由 `assets/notices.js` 接管并替换成远程通知/空状态。后续如有本地仓库，可再按 `AGENTS.md` 规则用 Python 字节替换彻底清理。

发通知请看：`NOTICES_ADMIN.md`。

### 综合科目（総合科目）现状（2026-06-14）

- 已上线：`humanities/2024-1`（38 题全 4 択，**27 屏含 p3/p7 两张材料页**）。原型在 `assets/eju.js` 的 `EJU_SOGO_PROTOTYPES`，与理科共用 `ejuRikaProtoFor` + 同一套渲染/判分引擎。
- 渲染脚本独立：`scripts/sogo_render_set.py`（**勿套用理科页码**，综合科目页码自己一套）。图片在 `assets/eju-media/humanities/<set>/`。
- **材料页规则（重要）**：综合科目若子题出现「下線部N」，其所依据的大問引导会話/文章页必须作为材料页渲染（`answers:[]`），否则用户无法作答。本卷 p3=問1材料、p7=問2材料。复刻新套时务必先识别材料页。
- **页眉印刷页号**：卷内「総合科目-N」≠ PDF 页号。proto 用 `pageLabel:'総合科目-'` + `pageNumberOffset`（本卷 -2）；UI 同时标注「PDF pN」。
- localStorage key 与理科/数学同前缀但带 `humanities/` 不冲突：`baina-eju-math-paper-humanities/2024-1`。
- 缓存号当前 `20260614-sogo-2024-1-materials-fix`（两处：index.html 的 `eju.js?v=` 与 eju.js 内 `eju-scanned-data.json?v=`）。
- 复刻新套流程见 `SOGO_PLAN.md` 末「后续年份」；**必须用户明确指示才开做**。

---

## 1. 项目基础信息

| 项 | 值 |
|---|---|
| 本地目录 | `/Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango` |
| 仓库 | `github.com/domin132012-hash/baina-tango` |
| 线上 | `https://baina-tango.pages.dev`（Cloudflare Pages，**push 到 main 自动部署**） |
| 技术栈 | 纯静态：`index.html` + `assets/eju.js` + Cloudflare Functions |
| 真题源 PDF | `~/Desktop/ eju高手/绿头EJU资料/EJU过去问/`（注意路径里 `Desktop/ eju高手` 有空格） |
| 后端 | Cloudflare Functions + Supabase + Cloudflare KV（通知系统） |

源 PDF 子目录：

- 数学1：`EJU文科数学（数学1）/`
- 数学2：`EJU理科数学（数学2）/`
- 理科（物理/化学/生物三科合卷）：`EJU理综/`
- 综合科目：`EJU文综/`

---

## 2. 代理开工制度

每个代理开工前必须先读：

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `HANDOVER.md`
4. `AGENT_WORKLOG.md`
5. 相关计划文件（例如 `RIKA_PLAN.md`、`SOGO_PLAN.md`、`NOTICES_ADMIN.md`；不存在就先确认，不要猜）

做完后必须：

- 更新 `PROJECT_STATUS.md`。
- 如影响接手信息，更新 `HANDOVER.md`。
- 追加 `AGENT_WORKLOG.md`。
- 更新相关计划文件。
- commit + push，并汇报 commit hash、验证结果、剩余风险。

任务没有写进 GitHub 文档，不算完成。

---

## 3. 真题试炼架构

用户路径：`学习 tab → 真题试炼 → 选科目（日语/综合/理科/数学）→ 选年份回数 → 答题`。

- 套卷列表由 `assets/eju-scanned-data.json` 的 `sets[]` 驱动。
- `subject` 取值：`math1` / `math2` / `humanities` / `science`。
- 点击某套 → `renderEjuScannedSet(subject,setId)`（`assets/eju.js`）→ 按 key=`subject/setId` 路由：
  - 命中 `EJU_MATH_PAPER_PROTOTYPES` → 数学卷视图（填空答案框）。
  - 命中 `EJU_RIKA_PROTOTYPES` 或 `EJU_SOGO_PROTOTYPES` → 理科/综合卷视图（单选 + 判分）。
