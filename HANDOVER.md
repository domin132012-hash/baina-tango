# 交接文档 — EJU 真题试炼 + 远程通知系统 + 記述作文批改

> 本文件面向**完全没有上下文的接手人/代理**。读完即可接手。
> 最后更新：2026-06-23。配套阅读：`AGENTS.md`（开工规则）、`PROJECT_STATUS.md`（当前进度）、`AGENT_SYNC_BOARD.md`（实时同步看板）、`AGENT_WORKLOG.md`（最近动作流水）、`NOTICES_ADMIN.md`（通知后台）。

---

## 0. 一句话概括

百纳日语（baina-tango）是一个 EJU 留考备考的纯静态网页 App。本轮新增了一个「远程可配置消息通知系统」：通知内容存 Cloudflare KV，开发者可通过后台页面发布/禁用通知，不用改仓库代码。

当前真实状态：

- 消息通知：已推送远程配置系统，等待 Cloudflare 绑定 `NOTICES_KV` 和 `ADMIN_NOTICE_TOKEN` 后即可使用。
- 数学1 / 数学2：已完成并上线。
- 理科：2023-1 样板与 bug 修复已上线；2023-2、2022-1、2022-2、2021-1、2021-2 已上线。
- 理科剩余 6 套暂缓：2018-1、2018-2、2019-1、2020-2、2024-1、2025-1。
- 综合科目：2024 一套 MVP 已完成并上线（见下）。
- EJU 記述作文：PR #2 已在用户完成真实 Cloudflare Branch Preview 验收后合并到 `main`，Production 已部署 active。入口为 `学习 → 真题试炼 → 日本語 → 記述`。
- 词典优先查词：架构计划在 `docs/architecture/DICTIONARY_LOOKUP_PLAN.md`，执行计划在 `docs/architecture/DICTIONARY_LOOKUP_IMPLEMENTATION_PLAN.md`。PR #4 已合并到 `main`，merge commit `c340f75a5f8cf51dac691732a9c66e50cd22af09`，当时上线的是 JMdict 小型 fixture MVP。当前 Production 已由 PR #6 R2 shard lookup 接管：命中词典不默认调用 AI，未命中只提示可尝试 AI 解释。
- JMdict 1,000-entry beta：Issue #5 / PR #6 已 merge 到 `main`，数据在 `functions/api/dictionary/_beta-data.js`，由官方 `JMdict_e.gz` 通过 `scripts/dictionary/jmdict-import-spike.js` 抽取生成，约 1,000 条、约 500 KiB。英文 gloss 来自 JMdict 原始数据，中文释义为 `null`，不使用 AI 生成/翻译/改写词条。Production 当前使用 R2 shard lookup；beta fallback 仅保留为 binding 缺失/失败时的安全降级路径。
- 登录后五栏导航：PR #13 `feat(ui): restructure post-login navigation` 已按用户批准从 `feat/post-login-nav-restructure` 标记 ready 并 merge 到 `main`。Merge commit `d6312b85a158d08421a9b06b59b711df258fdd5a`；Cloudflare Production deployment `d0d93ecd-bf01-44ce-8c6a-e0345b3a5b92` source `d6312b8` Active；canonical URL `https://baina-tango.pages.dev` 已通过浏览器验证。底部为 `学习 / 词库 / 首页 / 社区 / 我的`；`読解` 不显示 raw 404 HTML；`記述` home 可打开但未提交批改；综合科目 2024-1 扫描卷可打开题图。Validation log: `docs/review/post-login-nav-restructure-production-deploy-validation-log.md`。本轮未调用 DeepSeek/Google Translate/Runtime AI，未写 R2/D1，未激活 overlay，未触碰 PR #12。
- EJU 官方扫描卷本地导入：2026-06-29 在独立 worktree `feat/eju-official-exam-import` 上新增 scan-browser 模式，随后按 総合科目 2024-1 金标准继续升级部分套卷为可作答 + 可判分。当前新增 graded practice：総合科目 2025-1 / 2023-2 / 2022-1、理科 2025-1；既有可判分卷继续保留：総合科目 2024-1，理科 2021-1、2021-2、2022-1、2022-2、2023-1、2023-2。没有可靠标准答案或页码映射的扫描卷保持 scan-browser / `needs_review`，不得硬猜答案；`science/2019-1` 因扫描索引 `status=fail` 且有 OCR error page 保持建设中。本轮未 deploy、未 push、未写 R2/D1、未调用 DeepSeek/Google Translate/Runtime AI，未触碰 JMdict Top 50K dirty worktree。
- 完整 JMdict R2 sharded lookup：Issue #8 已用官方 `JMdict_e.gz` `2026-06-18` 生成 English-only R2 shards 并上传到 R2 bucket `baina-dictionary-artifacts`：active prefix `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/`，source SHA-256 `77cc98c43209d56e2ad44438a61ca02ce081ff083c58c5e87e4bc288cd860610`，512 shard objects，约 `632,040,903` bytes，最大 shard `1,768,374` bytes。D1 database `baina-dictionary`（id `5e8eeeda-0029-4c2e-958e-845ea0020c6e`）只写入 metadata schema 和 active version，不写 full entries/forms/senses；D1 full import 仍禁止，除非另有 cost-safe plan。Preview 已验证 `dictionarySource=r2-shard`，`食べられる` count `1`，全部要求测试词 `aiCalled=false`。PR #6 merge commit `c94735925798c604321631e1caa36c2f2c3190be` 已合并；Production Pages config 已绑定 `DICTIONARY_R2` -> `baina-dictionary-artifacts`、`DICTIONARY_DB` -> `baina-dictionary`，canonical Production smoke 已通过：`dictionarySource=r2-shard`、`食べられる` count `1`、required terms 全部 `aiCalled=false`。完整 JMdict/XML/大型 JSON/SQLite/DB artifact 不得提交 GitHub；不得使用 AI 生成、翻译、改写、编造词条；不要执行 D1 full import。
- 登录后主界面五栏导航历史：Issue #11 的 UI 专用分支 `feat/post-login-nav-restructure` 从 `main` 的 `ebc320317e6ef212a38a53a603191c419aca527c` 创建，不能与词典 overlay 分支 `feat/dictionary-zh-deepseek-pilot-100` 混用。实现 commit `1f0759015a701c38c20f0bca8a38e02870b07abd` 将底部导航改为 `学习 / 词库 / 首页 / 社区 / 我的`；EJU 深层 bugfix 从 `7d995556dcfa27ebdb61953235de0133a464f418` 开始，最终 PR head `d5f7264a1e30f81da5f5b01b4e0f1dbb057e918e`。本地验证日志：`docs/review/post-login-nav-restructure-eju-deep-link-validation-log.md`；Production 部署验证日志：`docs/review/post-login-nav-restructure-production-deploy-validation-log.md`。
- 代理 closeout 机制：`docs/ops/AGENT_CLOSEOUT_CHECKLIST.md` 是非平凡任务收尾必读文件。任务完成前必须更新 GitHub 文档、commit + push、远端校验，并用 JST 记录时间。

### EJU 記述作文双知识库现状（2026-06-17）

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
  - `analyze.js`：请求体最大 30000 字符，题目最大 1000 字符，作文最大 6000 字符；JSON 解析错误返回清晰 400；后端配置或 DeepSeek 上游错误不再把环境变量名、stack 或原始上游消息返回给用户；`DEEPSEEK_API_KEY` 会先 `trim()`，误填 `Bearer`、引号或控制字符会返回固定配置错误，不再把 `Invalid header value` 暴露给页面。
  - `follow-up.js`：请求体最大 40000 字符，追问最大 2000 字符，题目最大 1000 字符，作文最大 6000 字符，上一轮批改最大 8000 字符，历史上下文最多 8 条且每条最多 2000 字符；错误同样脱敏，并使用同一套 DeepSeek key 格式防护。
  - Cloudflare：Preview 和 Production 都已配置 `DEEPSEEK_API_KEY` secret；`SUPABASE_SERVICE_ROLE_KEY` 为 secret；`SUPABASE_URL` 为普通变量。只记录是否配置，不能记录值。
- PR #2 合并状态：
  - PR head：`dea412c4c937e976fa73af815abeb1b408c2c820`
  - merge commit / main：`79a2b7e80d7b5c83062e24afba69ed66fcac3339`
  - Preview deployment：`7a85773e-6a2d-44e6-92e2-a8aed5520b7d`，source `dea412c`
  - Production deployment：`1c5b2430-6b20-4334-8e04-e9fb2243dbca`，source `79a2b7e`，URL `https://baina-tango.pages.dev`
- 用户真实验收：
  - 登录后 `analyze` 成功。
  - 登录后 `follow-up` 成功。
  - `rubricSource` / `matchedReferences` 显示。
  - `ERRORS_JSON` 不再外露。
  - `DEEPSEEK_API_KEY 未配置` 和 `Invalid header value` 不再出现。
- 2026-06-17 Production smoke：
  - `学习 → 真题试炼 → 日本語 → 記述` 可达，`記述` 显示 `EJU 記述作文 AI 批改 / 试验开放`。
  - 未登录提交显示 `批改失败：请先登录账号`。
  - 浏览器 console 无额外 error。

### Agent 同步看板制度（2026-06-17）

- `AGENT_SYNC_BOARD.md` 是 GitHub / Cloudflare / Supabase / DeepSeek / 用户验收的实时状态板。
- 涉及 PR、部署、环境变量、用户验收的任务必须更新它。
- Cloudflare 变化必须写 deployment id、source commit、Preview/Production URL。
- GitHub 变化必须写 branch、PR、head hash、main hash。
- 不允许记录任何 secret 值。
- 收工前必须让 `AGENT_SYNC_BOARD.md`、`AGENT_WORKLOG.md`、`PROJECT_STATUS.md` 三者状态一致。

### 外部平台 Baseline + Delta 制度（2026-06-17）

- 不再要求每个代理每次全量复查 Supabase / Stripe。
- Supabase 基线文档：`docs/ops/SUPABASE_STATUS.md`。
- Stripe 产品目录基线：`docs/ops/STRIPE_CATALOG.md`。
- 如果任务未触碰 Supabase / Stripe，只在 `AGENT_SYNC_BOARD.md` 标记未触碰、沿用上次记录，不要为了例行检查浪费上下文。
- 如果任务触碰 Supabase / Stripe / Cloudflare，或出现对应线上故障，必须更新对应状态文档。
- 如果状态记录超过 30 天，且当前任务依赖该平台，必须复查。
- Cloudflare 部署、环境变量、KV/R2/Functions/Pages 设置、部署失败、source commit 不一致仍必须及时回写 GitHub。
- 当前 Supabase baseline 记录：用户截图显示 Status `Unhealthy`，后续依赖 Auth/user data/payment/essay history 的任务需先排查。
- 当前 Stripe baseline 记录：price IDs 和站内权益来自仓库代码；product IDs 与 dashboard active 状态尚未复查。

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
- 2026-06-29 本地分支新增可判分综合科目：`humanities/2025-1`、`humanities/2023-2`、`humanities/2022-1`。三套均复用 2024-1 的页面结构、题号导航、作答状态、标准答案和 `ejuRika` 判分显示。标准答案来自官方正解表；页码映射来自本地扫描页/contact sheet 人工核对，后续正式上线前仍建议人工抽查更多题号。
- 渲染脚本独立：`scripts/sogo_render_set.py`（**勿套用理科页码**，综合科目页码自己一套）。图片在 `assets/eju-media/humanities/<set>/`。
- **材料页规则（重要）**：综合科目若子题出现「下線部N」，其所依据的大問引导会話/文章页必须作为材料页渲染（`answers:[]`），否则用户无法作答。本卷 p3=問1材料、p7=問2材料。复刻新套时务必先识别材料页。
- **页眉印刷页号**：卷内「総合科目-N」≠ PDF 页号。proto 用 `pageLabel:'総合科目-'` + `pageNumberOffset`（本卷 -2）；UI 同时标注「PDF pN」。
- localStorage key 与理科/数学同前缀但带 `humanities/` 不冲突：`baina-eju-math-paper-humanities/2024-1`。
- 缓存号当前 `20260614-sogo-2024-1-materials-fix`（两处：index.html 的 `eju.js?v=` 与 eju.js 内 `eju-scanned-data.json?v=`）。
- 复刻新套流程见 `SOGO_PLAN.md` 末「后续年份」；**必须用户明确指示才开做**。

### 理科扫描卷现状（2026-06-29）

- 既有可判分理科：`science/2021-1`、`science/2021-2`、`science/2022-1`、`science/2022-2`、`science/2023-1`、`science/2023-2`。
- 本地分支新增可判分理科：`science/2025-1`，三科结构为物理 19 题、化学 20 题、生物 18 题；化学参考页仍以折叠资料页显示。
- 仍为 scan-browser / needs_review：`science/2018-1`、`science/2018-2`、`science/2020-2`、`science/2024-1`，原因是本地已抽取资料中没有可靠正解表或尚未完成可靠题号页码映射。
- `science/2019-1` 保持建设中，原因是扫描索引 `status=fail` 且包含 OCR error page。

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
4. `AGENT_SYNC_BOARD.md`
5. `AGENT_WORKLOG.md`
6. `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`
7. 相关计划文件（例如 `RIKA_PLAN.md`、`SOGO_PLAN.md`、`EJU_ESSAY_INTEGRATION_PLAN.md`、`docs/architecture/DICTIONARY_LOOKUP_PLAN.md`、`docs/architecture/DICTIONARY_LOOKUP_IMPLEMENTATION_PLAN.md`、`NOTICES_ADMIN.md`；不存在就先确认，不要猜）

做完后必须：

- 更新 `PROJECT_STATUS.md`。
- 如影响接手信息，更新 `HANDOVER.md`。
- 如涉及 GitHub / Cloudflare / Supabase / DeepSeek / 用户验收，更新 `AGENT_SYNC_BOARD.md`。
- 追加 `AGENT_WORKLOG.md`。
- 更新相关计划文件。
- 按 `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md` 执行 closeout。
- commit + push，远端校验，并汇报 commit hash、验证结果、剩余风险。

任务没有写进 GitHub 文档、没有 push、没有远端校验，不算完成。所有记录时间用 JST。

---

## 3. 真题试炼架构

用户路径：`学习 tab → 真题试炼 → 选科目（日语/综合/理科/数学）→ 选年份回数 → 答题`。

- 套卷列表由 `assets/eju-scanned-data.json` 的 `sets[]` 驱动。
- `subject` 取值：`math1` / `math2` / `humanities` / `science`。
- 点击某套 → `renderEjuScannedSet(subject,setId)`（`assets/eju.js`）→ 按 key=`subject/setId` 路由：
  - 命中 `EJU_MATH_PAPER_PROTOTYPES` → 数学卷视图（填空答案框）。
  - 命中 `EJU_RIKA_PROTOTYPES` 或 `EJU_SOGO_PROTOTYPES` → 理科/综合卷视图（单选 + 判分）。
