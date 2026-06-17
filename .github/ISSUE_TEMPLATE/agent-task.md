---
name: Agent task
description: Task ticket for AI agents
title: "[AGENT-TASK] "
labels: ["agent-task", "ready"]
---

## Background

## Goal

## Scope

## Required reads

- `AGENTS.md`
- `AGENT_SYNC_BOARD.md`
- `AGENT_WORKLOG.md`
- `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`
- `docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md`

## Execution rules

- Execute only the Issue number explicitly provided by the user.
- Do not choose other Issues.
- Start with ACK: Issue number, title, branch, start commit, and JST time.
- Stop if this Issue cannot be read or conflicts with the latest user instruction.

## External services allowed

| Service | Allowed? | Notes |
|---|---|---|
| GitHub | Yes | Commit, push, PR, Issue comments as required |
| Cloudflare | No | |
| Supabase | No | |
| Stripe | No | |
| DeepSeek | No | |

## Implementation steps

1.
2.
3.

## Validation requirements

- `git diff --check`
- `node --check` for changed JS files, if any
- remote verification after push

## Documentation writeback

- Update `AGENT_SYNC_BOARD.md`
- Append `AGENT_WORKLOG.md`
- Update `PROJECT_STATUS.md` / `HANDOVER.md` when needed
- Comment final closeout report on this Issue

## Acceptance criteria

- 

## Model recommendation

Recommended model:

Reason:

## Final report template

```text
Closeout report
- Time: YYYY-MM-DD HH:mm JST
- Issue:
- Branch:
- Start commit:
- End commit:
- PR:
- Files changed:
- External services touched:
- Validation:
- Remaining risks:
- Commit / merge hash:
- Remote verification:
```
