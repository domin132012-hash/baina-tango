## Agent Start Checklist

For every non-trivial task in this repository, start by reading the project handoff files before editing code:

1. `PROJECT_STATUS.md` — current real progress and active direction
2. `HANDOVER.md` — architecture, pitfalls, and handoff context
3. `AGENT_WORKLOG.md` — latest agent actions, commits, validation, and remaining risks
4. `AGENT_SYNC_BOARD.md` — live GitHub / Cloudflare / Supabase / DeepSeek / user acceptance state
5. Relevant plan files, such as `RIKA_PLAN.md`, `SOGO_PLAN.md`, or task-specific notes if present

Before finishing a task, every agent must leave a GitHub trace:

- Update `PROJECT_STATUS.md` when the visible project state changes.
- Update `HANDOVER.md` when the change affects how the next agent should work.
- Append a dated entry to `AGENT_WORKLOG.md` with task, files, validation, risks, and commit hash.
- Update `AGENT_SYNC_BOARD.md` for any task that touches GitHub PRs, Cloudflare, Supabase, Stripe, DeepSeek, deployment status, or user acceptance.
- Update the relevant plan file if the task advances or pauses a workstream.
- Commit and push. A task is not complete until GitHub documents reflect the final state.

## Agent Sync Board Rules

- Non-trivial tasks must read `AGENT_SYNC_BOARD.md` before changing GitHub PRs, Cloudflare, Supabase, DeepSeek, or deployment-related docs.
- Any Cloudflare change must be written back to `AGENT_SYNC_BOARD.md` with deployment id, source commit, environment, and URL.
- GitHub operations must record branch, PR number, head hash, and main hash in `AGENT_SYNC_BOARD.md`.
- Environment status may record whether variables are configured, but must never record secret values.
- User acceptance must record whether `analyze` and `follow-up` passed, and whether that result was user-provided or agent-verified.
- Before finishing, `AGENT_SYNC_BOARD.md`, `AGENT_WORKLOG.md`, and `PROJECT_STATUS.md` must describe the same current state.

## External Platform Baseline + Delta Rules

- External platforms use baseline + delta updates. Do not fully recheck Supabase or Stripe on every task.
- `docs/ops/SUPABASE_STATUS.md` is the Supabase baseline. Update it only when Supabase config/data/Auth/health is touched, when a Supabase-related fault appears, or when the record is older than 30 days and the current task depends on Supabase.
- `docs/ops/STRIPE_CATALOG.md` is the Stripe baseline. Update it only when products/prices/price IDs/product IDs/webhooks/payment entitlement logic are touched, when payment and entitlement disagree, or when the record is older than 30 days and the current task depends on Stripe.
- If the task does not touch Supabase or Stripe, mark "not touched; using previous record" in `AGENT_SYNC_BOARD.md` instead of spending context on routine backend checks.
- Cloudflare remains live-state sensitive: deployments, environment variables, KV, R2, Functions, Pages settings, deployment failures, and source commit mismatches must be written back promptly.
- If Supabase, Stripe, Cloudflare, or DeepSeek changes outside GitHub, write the delta back to GitHub docs before finishing.
- Do not record secrets or user privacy data: no API keys, service role keys, JWT secrets, webhook signing secrets, session tokens, user emails, customer records, payment records, or card data.

Recommended prompt header for future agent instructions:

```text
开工前必读：先读 AGENTS.md、PROJECT_STATUS.md、HANDOVER.md、AGENT_WORKLOG.md，再读本任务相关计划文件。做完后必须更新 PROJECT_STATUS/HANDOVER/AGENT_WORKLOG，commit + push，并汇报 commit hash、验证结果、剩余风险。
```

## Local Token Saving Rule

For non-trivial engineering tasks in this project, start with:

```sh
codex-preflight --task "<task>"
```

Then read `.codex-context-pack.json` before reading many source files.
Do not read large files directly. Use `repo-map`, `smart-read`, `rg`, `jq`, or bridge tools first.
Use `deepseek-bridge` for long logs, documents, or diffs. Use `visual-bridge` for screenshots, OCR, and UI image checks.
Before editing based on bridge output, verify original evidence.
Project root check: run codex-preflight from the project root; if it prints a project-root WARNING, cd to the real root first.
Bridge threshold: use deepseek-bridge only for logs >500 lines, docs >3000 tokens, or diffs >200 changed lines. Small inputs: direct read is cheaper (the tool refuses <1500-token inputs unless --force).
