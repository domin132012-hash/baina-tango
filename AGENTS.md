## Agent Start Checklist

For every non-trivial task in this repository, start by reading the project handoff files before editing code:

1. `PROJECT_STATUS.md` — current real progress and active direction
2. `HANDOVER.md` — architecture, pitfalls, and handoff context
3. `AGENT_WORKLOG.md` — latest agent actions, commits, validation, and remaining risks
4. Relevant plan files, such as `RIKA_PLAN.md`, `SOGO_PLAN.md`, or task-specific notes if present

Before finishing a task, every agent must leave a GitHub trace:

- Update `PROJECT_STATUS.md` when the visible project state changes.
- Update `HANDOVER.md` when the change affects how the next agent should work.
- Append a dated entry to `AGENT_WORKLOG.md` with task, files, validation, risks, and commit hash.
- Update the relevant plan file if the task advances or pauses a workstream.
- Commit and push. A task is not complete until GitHub documents reflect the final state.

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

## Agent skills

Project docs take priority over general skill instructions. Before applying a skill, read the relevant project docs first, especially `PROJECT_STATUS.md`, `HANDOVER.md`, `AGENT_WORKLOG.md`, and the active plan file.

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `domin132012-hash/baina-tango`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the project label set `bug`, `feature`, `docs`, `refactor`, `priority-high`, and `blocked`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo. Agent configuration lives in `docs/agents/`; ADRs live in `docs/adr/`. See `docs/agents/domain.md`.

### Skill usage strategy

- Use `/grill-with-docs` when requirements, terminology, or implementation direction are unclear.
- Use `/diagnose` for bug investigation and root-cause analysis.
- Use `/tdd` when a change can be developed test-first.
- Use `/handoff` when preparing a compact handover for another agent.
- Use `/to-prd` for turning a larger request into a product requirements document.
- Use `/to-issues` for splitting an approved plan or PRD into implementation issues.
