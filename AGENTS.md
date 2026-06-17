## Agent Start Checklist

For every non-trivial task in this repository, start by reading:

1. `PROJECT_STATUS.md` — current real progress and active direction
2. `HANDOVER.md` — architecture, pitfalls, and handoff context
3. `AGENT_WORKLOG.md` — latest agent actions, commits, validation, and remaining risks
4. `AGENT_SYNC_BOARD.md` — live GitHub / Cloudflare / Supabase / Stripe / DeepSeek / user acceptance state
5. `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md` — required closeout and GitHub writeback checklist
6. `docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md` — required protocol when the user assigns a GitHub Issue task
7. `docs/ops/CHATGPT_TASK_WRITING_PREFERENCE.md` — manager-side default for writing task instructions directly into GitHub when the user asks
8. Relevant plan files, such as `RIKA_PLAN.md`, `SOGO_PLAN.md`, or task-specific notes if present

## Closeout Rules

Before finishing any non-trivial task:

- Execute `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`.
- Update `PROJECT_STATUS.md` when the visible project state changes.
- Update `HANDOVER.md` when the change affects how the next agent should work.
- Append a dated entry to `AGENT_WORKLOG.md`.
- Update `AGENT_SYNC_BOARD.md` for GitHub PRs, deployments, external services, or user acceptance changes.
- Commit and push. Local-only work is not complete.
- Verify the remote branch after push.
- Use JST for all task records, deployment notes, and final reports.
- Do not write private credentials or private user/payment data into repository files, comments, logs, or reports.

## GitHub Issue Task Protocol

When the user assigns a GitHub Issue number, the Issue is the task ticket and the chat prompt is the launcher/latest override.

- Read `docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md` before executing any Issue-based task.
- Only execute the Issue number explicitly provided by the user or manager.
- Do not search for, choose, or switch to other `agent-task` Issues on your own.
- If the specified Issue cannot be read, does not exist, is unexpectedly closed, or its title/content does not match the user instruction, stop and report.
- Start with an ACK before editing: Issue number, Issue title, branch, start commit, JST time, scope, and expected external services.
- If the Issue body conflicts with the latest user/chat instruction, follow the latest user/chat instruction and record the change in an Issue comment or final closeout.
- At closeout, comment on the Issue with JST time, branch, start/end commit, files changed, external services touched, validation, user acceptance, remaining risks, commit/merge hash, and remote verification.
- If the task changes code or deployable behavior, prefer a branch/PR linked to the Issue. Docs-only tasks may commit to `main` only when the user explicitly allows it.

## ChatGPT / Manager Task Writing Preference

When the user tells ChatGPT/manager to "write the instruction in the repository", "go into the repo and write the instruction", or equivalent wording, the default action is to create or update the GitHub Issue / repository task document directly through the GitHub connection.

- Do not only return a copy-paste instruction block unless the user explicitly asks for text only.
- After writing to GitHub, report the exact Issue number, file path, or commit hash.
- The execution agent should still only execute the Issue number or task path explicitly provided by the user/manager.
- If the user says "先不要写进 GitHub，只给我文本", "只生成指令", "我自己复制", or "不要创建 Issue", provide chat text only and do not write to GitHub.

## Agent Sync Board Rules

- Non-trivial tasks must read `AGENT_SYNC_BOARD.md` before changing GitHub PRs, Cloudflare, Supabase, Stripe, DeepSeek, or deployment-related docs.
- Any Cloudflare change must be written back to `AGENT_SYNC_BOARD.md` with deployment id, source commit, environment, and URL.
- GitHub operations must record branch, PR number, head hash, and main hash in `AGENT_SYNC_BOARD.md`.
- Environment status may record whether variables are configured, but must never record their values.
- User acceptance must record whether critical checks passed and whether that result was user-provided or agent-verified.
- Before finishing, `AGENT_SYNC_BOARD.md`, `AGENT_WORKLOG.md`, and `PROJECT_STATUS.md` must describe the same current state.

## External Platform Baseline + Delta Rules

- External platforms use baseline + delta updates. Do not fully recheck Supabase or Stripe on every task.
- `docs/ops/SUPABASE_STATUS.md` is the Supabase baseline.
- `docs/ops/STRIPE_CATALOG.md` is the Stripe baseline.
- If the task does not touch Supabase or Stripe, mark `not touched; using previous record` in `AGENT_SYNC_BOARD.md` instead of routine backend checks.
- Cloudflare remains live-state sensitive: deployments, environment variables, KV, R2, Functions, Pages settings, deployment failures, and source commit mismatches must be written back promptly.
- If Supabase, Stripe, Cloudflare, or DeepSeek changes outside GitHub, write the delta back to GitHub docs before finishing.

Recommended prompt header for future agent instructions:

```text
开工前必读：先读 AGENTS.md、PROJECT_STATUS.md、HANDOVER.md、AGENT_WORKLOG.md、AGENT_SYNC_BOARD.md、docs/ops/AGENT_CLOSEOUT_CHECKLIST.md。若任务指定 GitHub Issue 编号，还必须读 docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md，只执行指定 Issue，开工先 ACK。做完后必须更新 PROJECT_STATUS/HANDOVER/AGENT_WORKLOG/AGENT_SYNC_BOARD，commit + push，并汇报 commit hash、验证结果、剩余风险。
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
Bridge threshold: use deepseek-bridge only for logs >500 lines, docs >3000 tokens, or diffs >200 changed lines. Small inputs: direct read is cheaper.
