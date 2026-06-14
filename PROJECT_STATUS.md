# baina-tango 项目进度

> 📋 接手人必须先读：[`AGENTS.md`](AGENTS.md) → [`HANDOVER.md`](HANDOVER.md) → [`AGENT_WORKLOG.md`](AGENT_WORKLOG.md)。
> 当前真实版本：`20260614-notices-kv`（EJU 缓存号仍为 `20260614-sogo-2024-1-materials-fix`）。
> ✅ 消息通知已改为 Cloudflare KV 远程配置，新增 `/admin/notices.html` 可视化后台。

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
| Cloudflare 通知配置 | ⚠️ 待线上配置 | 需要在 Pages 设置里绑定 `NOTICES_KV` 并配置 `ADMIN_NOTICE_TOKEN` |
| 未部署年份灰色建设中 UI | 📝 待做 | 可后续让 Codex 做，但避免与 Claude 同时改 `assets/eju.js` 撞车 |

---

## 代理交接制度

本仓库现在使用固定交接制度：

1. 开工前读 `AGENTS.md`、`PROJECT_STATUS.md`、`HANDOVER.md`、`AGENT_WORKLOG.md`。
2. 做完后必须更新 `PROJECT_STATUS.md`、必要时更新 `HANDOVER.md`、并追加 `AGENT_WORKLOG.md`。
3. 任务没有写入 GitHub 文档，不算完成。
4. 多代理并行时，先确认谁正在改 `assets/eju.js`，避免覆盖。

推荐任务头部：

```text
开工前必读：先读 AGENTS.md、PROJECT_STATUS.md、HANDOVER.md、AGENT_WORKLOG.md，再读本任务相关计划文件。做完后必须更新 PROJECT_STATUS/HANDOVER/AGENT_WORKLOG，commit + push，并汇报 commit hash、验证结果、剩余风险。
```
