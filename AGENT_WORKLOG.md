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

### Commits
- `0cdcfe0` — docs: add agent start checklist
- `6f1e331` — docs: add agent worklog
- `6c3fd01` — docs: sync project status with latest EJU progress
- `f325a3f` — docs: refresh handover for agent workflow and latest EJU status
- `this update` — finalize worklog commit list
