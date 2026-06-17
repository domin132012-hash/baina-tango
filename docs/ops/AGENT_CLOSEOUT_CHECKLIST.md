# Agent Closeout Checklist

本文件定义每个非平凡任务结束前必须执行的固定收尾机制。目标是避免“本地做完但 GitHub 没有回写”的状态漂移。

## 1. 必须更新的文件

每个非平凡任务结束前必须更新：

- `AGENT_SYNC_BOARD.md`
- `AGENT_WORKLOG.md`
- 必要时 `PROJECT_STATUS.md`
- 必要时 `HANDOVER.md`
- 相关计划文件或验收文档

如果任务改变了用户可见状态、线上部署状态、外部服务状态、后续接手方式或当前路线图，通常就需要更新 `PROJECT_STATUS.md` 或 `HANDOVER.md`。

## 2. 每次记录必须包含

每次 closeout 记录必须写：

- JST 时间，格式：`YYYY-MM-DD HH:mm JST`
- 分支
- start commit
- end commit
- files changed
- external services touched
- validation
- remaining risks

如果 end commit 在写入时还没有生成，记录必须明确写“final commit reported in final response”，最终汇报必须给出实际 commit hash。后续更推荐把 closeout 信息写在最后一个提交的提交信息和最终汇报中同步确认。

## 3. External services touched 格式

`external services touched` 必须逐项写清楚：

- GitHub
- Cloudflare
- Supabase
- Stripe
- DeepSeek
- 其他服务

如果没碰，就写 `not touched`，不能省略。

示例：

```text
external services touched:
- GitHub: commit + push only
- Cloudflare: not touched
- Supabase: not touched
- Stripe: not touched
- DeepSeek: not touched
- Other: not touched
```

## 4. 禁止记录内容

任何 closeout 文档、日志、提交信息、截图、报告都禁止记录：

- API key
- secret
- service role key
- JWT secret
- session token
- 客户信息
- 付款记录
- 用户隐私

只允许记录“configured / not configured / not touched / needs recheck”等状态，不允许记录真实值。

## 5. 任务结束前必须执行

每个非平凡任务结束前至少执行：

```sh
git status
git diff --check
rg -n "sk-|gho_|service role|JWT secret|session token|STRIPE_SECRET|WEBHOOK_SECRET|DEEPSEEK_API_KEY|SUPABASE_SERVICE_ROLE_KEY" .
```

必要时执行：

```sh
node --check path/to/file.js
```

如果新增或修改 closeout 检查脚本，执行：

```sh
node --check scripts/agent-closeout-check.js
node scripts/agent-closeout-check.js
```

最终必须：

- commit。
- push。
- 远端校验，例如 `git ls-remote origin refs/heads/<branch>`。
- 最终汇报 commit hash 和是否已 push。

secret scan 中如果只是规则文字、变量名或 masked 示例出现，可以保留；如果出现真实值，必须删除。

## 6. Cloudflare 任务记录要求

如果任务涉及 Cloudflare 部署、环境变量、KV、R2、Functions、Pages 设置或线上故障，必须记录：

- deployment id
- Preview / Production URL
- source commit
- deployment status
- 是否等于 GitHub head/main
- 是否触碰环境变量或 secret

不得记录 secret 值。

## 7. Supabase / Stripe 任务记录要求

如果任务涉及 Supabase / Stripe：

- 不做无关全量巡检。
- 只在任务触碰、发生故障、或 30 天过期且当前任务依赖时复查。
- 只记录配置状态，不记录敏感值。

Supabase 可记录：

- Auth 是否触碰。
- 表 / RLS / Function 是否触碰。
- health 状态是否影响当前任务。

Stripe 可记录：

- 产品 / 价格 / webhook / entitlement 是否触碰。
- dashboard 状态是否复查。
- 站内 price id / product id 是否与任务相关。

禁止记录客户、付款、卡号、邮箱或隐私数据。

## 8. 最终汇报格式

最终汇报默认使用：

```text
1. 新增/修改了哪些文件：
2. 词典实施计划文件路径：
3. 防忘 closeout checklist 文件路径：
4. AGENTS.md 是否更新：
5. 是否新增 closeout 检查脚本：
6. 分支：
7. start commit：
8. end commit：
9. external services touched：
10. validation：
11. commit hash：
12. 是否已 push：
13. 剩余风险：
```

## 9. 不允许的收尾状态

以下状态不算完成：

- 只本地修改，没有 commit。
- 只本地 commit，没有 push。
- 声称已提交，但没有远端校验。
- 外部服务变更没有写回 `AGENT_SYNC_BOARD.md`。
- 没有追加 `AGENT_WORKLOG.md`。
- 没有记录 validation。
- 没有记录 remaining risks。
- 时间不是 JST。
