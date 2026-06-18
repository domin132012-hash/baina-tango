# baina-tango 项目进度

> 📋 接手人必须先读：[`AGENTS.md`](AGENTS.md) → [`HANDOVER.md`](HANDOVER.md) → [`AGENT_WORKLOG.md`](AGENT_WORKLOG.md)。
> 当前真实版本：`20260617-eju-essay-production`（main `79a2b7e`；EJU 缓存号仍含 `20260615-eju-essay-v4-entry-open` 注入脚本）。
> ✅ 消息通知已改为 Cloudflare KV 远程配置，新增 `/admin/notices.html` 可视化后台。
> ✅ EJU 記述作文批改 PR #2 已在用户完成真实 Preview 验收后合并并部署 Production。
> ✅ 词典优先查词 PR #4 已合并并部署 Production；当前仍是 JMdict 小样本 MVP。
> 🧪 PR #6 正在 draft 中实现 JMdict 1,000-entry English-only beta；等待 Preview 验证，不要 merge。

## 最近完成（EJU 記述作文批改）— 2026-06-17

PR #2 `feat(eju-essay): add EJU writing critique integration` 已从 draft 改 ready，并以 merge commit `79a2b7e80d7b5c83062e24afba69ed66fcac3339` 合并到 `main`。

- 用户已在 Cloudflare Branch Preview 完成真实验收：登录后 `analyze` 成功、`follow-up` 成功、`rubricSource` 显示、`matchedReferences` 显示、`ERRORS_JSON` 不外露、`DEEPSEEK_API_KEY 未配置` 和 `Invalid header value` 不再出现。
- Cloudflare Preview：deployment `7a85773e-6a2d-44e6-92e2-a8aed5520b7d`，source `dea412c`，successful。
- Cloudflare Production：deployment `1c5b2430-6b20-4334-8e04-e9fb2243dbca`，source `79a2b7e`，Active，URL `https://baina-tango.pages.dev`。
- Production smoke：`学习 → 真题试炼 → 日本語 → 記述` 可打开；未登录提交显示 `批改失败：请先登录账号`；浏览器 console 无额外 error。
- 新增 `AGENT_SYNC_BOARD.md`，用于同步 GitHub / Cloudflare / Supabase / DeepSeek / 用户验收状态。

## 最近完成（远程可配置消息通知）— 本轮

把首页右上角「消息通知」从固定 HTML 通知，改成 Cloudflare KV 远程配置。详见 `NOTICES_ADMIN.md`。

- 新增用户端前端模块：`assets/notices.js`，负责拉取 `/api/notices`、过滤 enabled/time/showOnce、渲染通知、红点和关闭状态。
- 新增公开接口：`GET /api/notices`，从 KV `NOTICES_KV` 的 `notices:all` 读取通知；未绑定时返回空数组，不影响主应用。
- 新增管理接口：`GET/POST/PUT/DELETE /api/admin/notices`，用 `ADMIN_NOTICE_TOKEN` 鉴权，支持增删改查。
- 新增可视化后台：`/admin/notices.html`，可输入 Token 后新增、编辑、启用/禁用、删除通知。
- 新增 Pages Middleware：`functions/_middleware.js` 在 HTML 响应末尾注入 `assets/notices.js?v=20260614-notices-kv`。
- 注意：本轮没有直接改 `index.html`；旧硬编码通知块仍在源码里，但线上运行时会被 `assets/notices.js` 接管并替换显示。后续如有本地仓库，可再按规则用 Python 字节替换彻底清理。

---

## 当前总览

### 已完成并上线

| 模块 | 状态 | 备注 |
|---|---|---|
| 消息通知远程配置 | ✅ 已推送 main | Cloudflare KV + `/api/notices` + `/api/admin/notices` + `/admin/notices.html` |
| EJU 記述作文批改 | ✅ 已合并并部署 Production | PR #2 merge commit `79a2b7e`；Production deployment `1c5b2430`；用户已完成真实 Preview analyze/follow-up 验收 |
| 数学2 | ✅ 已上线 | 早期完成，已作为数学卷基础样板 |
| 数学1 | ✅ 已上线 | 12 套全部完成，commit `b3f37b3`，缓存号 `20260613-math1-all` |
| 理科 2023-1 | ✅ 已上线 | 样板 + 后续 bug 修复，缓存号曾到 `20260614-rika-2023-1-v2` |
| 理科 2023-2 | ✅ 已上线 | commit `feccfcc`，缓存号 `20260614-rika-2023-2` |
| 理科 2022-1 | ✅ 已上线 | commit `e90b3f2`，缓存号 `20260614-rika-2022-1` |
| 理科 2022-2 | ✅ 已上线 | commit `3b9bb65`，缓存号 `20260614-rika-2022-2` |
| 理科 2021-1 | ✅ 已上线 | commit `d57a747`，缓存号 `20260614-rika-2021-1` |
| 理科 2021-2 | ✅ 已上线 | commit `ef7c68b`，缓存号 `20260614-rika-2021-2` |
| 综合科目 2024 MVP | ✅ 已上线 | 缓存号 `20260614-sogo-2024-1-materials-fix`；27 屏含 p3/p7 材料页 |

### 暂缓

| 模块 | 状态 | 备注 |
|---|---|---|
| 理科剩余 6 套 | ⏸️ 暂缓 | 2018-1、2018-2、2019-1、2020-2、2024-1、2025-1 |

### 进行中 / 下一方向

| 模块 | 状态 | 备注 |
|---|---|---|
| 词典优先查词 | ✅ 小样本 MVP 已上线 | PR #4 merge commit `c340f75a5f8cf51dac691732a9c66e50cd22af09` 已部署 Production；`新增 -> 查词收藏` 先查 JMdict 小样本 fixture，命中不默认调用 AI；完整 JMdict/D1/R2/SQLite 导入仍是后续任务 |
| JMdict 1,000-entry beta | 🧪 PR #6 draft 中 | Issue #5 分支 `feat/full-jmdict-import-spike` 已生成 `functions/api/dictionary/_beta-data.js`，约 1,000 条 English-only JMdict-derived entries，约 500 KiB；PR #6 必须继续保持 draft。不得提交完整 JMdict/KANJIDIC2 原始文件或大型生成物，不做批量中文翻译 |
| 完整 JMdict 导入 | 🧭 Issue #7 cost-safe 路线已建立 | R2 bucket `baina-dictionary-artifacts` 和 D1 database `baina-dictionary` 已创建；官方 JMdict `2026-06-17` raw/checksum/manifest/import estimate 已上传 R2。D1 full import 未执行：完整结构化导入估算 `2,425,795` rows written，超过 Workers Free `100,000` rows/day；推荐下一步改为 R2 sharded dictionary lookup + D1 metadata |
| 代理 closeout 回写机制 | ✅ 已制度化 | 新增 `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`，并要求所有时间使用 JST、收尾必须 commit + push + 远端校验 |
| Cloudflare 通知配置 | ✅ 线上配置已解决（用户确认） | 本轮未处理通知系统 |
| 未部署年份灰色建设中 UI | 📝 待做 | 可后续让 Codex 做，但避免与 Claude 同时改 `assets/eju.js` 撞车 |

---

## 代理交接制度

本仓库现在使用固定交接制度：

1. 开工前读 `AGENTS.md`、`PROJECT_STATUS.md`、`HANDOVER.md`、`AGENT_WORKLOG.md`、`AGENT_SYNC_BOARD.md`。
2. 同时读取 `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`，收尾时按 checklist 执行。
3. 做完后必须更新 `PROJECT_STATUS.md`、必要时更新 `HANDOVER.md`、并追加 `AGENT_WORKLOG.md`。
4. 涉及 GitHub / Cloudflare / Supabase / DeepSeek / 用户验收的任务必须更新 `AGENT_SYNC_BOARD.md`。
5. 任务没有写入 GitHub 文档、没有 commit + push、没有远端校验，不算完成。
6. 所有任务记录时间使用 JST。
7. 多代理并行时，先确认谁正在改 `assets/eju.js`，避免覆盖。

推荐任务头部：

```text
开工前必读：先读 AGENTS.md、PROJECT_STATUS.md、HANDOVER.md、AGENT_WORKLOG.md，再读本任务相关计划文件。做完后必须更新 PROJECT_STATUS/HANDOVER/AGENT_WORKLOG，commit + push，并汇报 commit hash、验证结果、剩余风险。
```
