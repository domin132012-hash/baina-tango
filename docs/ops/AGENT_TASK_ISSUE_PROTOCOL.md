# Agent Task Issue Protocol

> GitHub Issue is the task ticket. Chat/user instruction is the launcher and latest override. Agents must not discover or choose work on their own.

Last updated: 2026-06-17 19:40 JST

## Purpose

Use this protocol for medium and large agent tasks so the task source, implementation branch, PR, closeout, and final status remain visible in GitHub.

This protocol is designed to prevent:

- agents picking the wrong task from the issue list;
- agents working from stale chat context;
- tasks completing locally without GitHub writeback;
- Cloudflare / Supabase / Stripe / DeepSeek state drifting away from repository docs.

## When to use GitHub Issue tasking

Use a GitHub Issue for:

- application code changes;
- Cloudflare Functions / Pages / R2 / KV / D1 changes;
- Supabase Auth / database / RLS / entitlement changes;
- Stripe product / price / webhook / entitlement changes;
- multi-file docs or architecture tasks;
- tasks expected to require a PR or user acceptance.

Chat-only instructions are acceptable for small questions, single-line docs edits, or status checks, but the closeout rules still apply whenever repository state changes.

## Roles

| Place | Role |
|---|---|
| GitHub Issue | Task ticket and durable task specification |
| Chat/user prompt | Launcher, confirmation, and latest override |
| Branch/PR | Code and document changes for review |
| `AGENT_SYNC_BOARD.md` | Current live state summary |
| `AGENT_WORKLOG.md` | Historical work ledger |
| `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md` | Required finish checklist |

## Non-negotiable rule

Agents may only execute the Issue number explicitly provided by the user or manager.

Agents must not:

- search for `agent-task` Issues and choose one;
- switch to a different Issue because it looks more urgent;
- execute multiple Issues unless explicitly instructed;
- continue if the specified Issue cannot be read;
- assume an Issue body is current when the user supplied newer conflicting instructions.

If the specified Issue is missing, unreadable, closed unexpectedly, or title/content does not match the user instruction, stop and report.

## Required agent startup flow

When the user says `execute GitHub Issue #N`, the agent must:

1. Read:
   - `AGENTS.md`
   - `AGENT_SYNC_BOARD.md`
   - `AGENT_WORKLOG.md`
   - `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`
   - this file, `docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md`
2. Fetch the exact Issue, for example:
   - `gh issue view N --comments`
3. Confirm the Issue number and title match the user instruction.
4. Check current branch and start commit.
5. Reply with an ACK before making changes.

ACK format:

```text
ACK
Issue: #N
Title: <issue title>
Branch: <planned branch or main if docs-only>
Start commit: <sha>
Time: YYYY-MM-DD HH:mm JST
Scope: <one-line summary>
External services expected: GitHub / Cloudflare / Supabase / Stripe / DeepSeek / Other
```

If no ACK is possible, stop and ask for clarification.

## Conflict handling

If the Issue body conflicts with the latest user/chat instruction:

1. Treat the latest user/chat instruction as the controlling instruction.
2. Record the change in the final Issue comment.
3. If the change materially alters scope, update the Issue body or add an Issue comment before continuing.
4. If the change touches external services that the Issue forbids, stop and ask for confirmation.

## Branch and PR guidance

Default branch naming:

```text
feat/issue-N-short-name
fix/issue-N-short-name
docs/issue-N-short-name
```

Use a PR when the task changes application code, Cloudflare Functions, data schemas, payment logic, auth logic, or anything requiring review. Docs-only tasks may commit to `main` only when the user explicitly allows it.

PR body should link the Issue with `Closes #N` or `Refs #N`.

## Required final Issue comment

At closeout, comment on the Issue with:

```text
Closeout report
- Time: YYYY-MM-DD HH:mm JST
- Branch:
- Start commit:
- End commit:
- PR:
- Files changed:
- External services touched:
- Validation:
- User acceptance:
- Remaining risks:
- Commit / merge hash:
- Remote verification:
```

If the task remains incomplete, state the blocker and next owner.

## Required document writeback

Before final response, update:

- `AGENT_SYNC_BOARD.md`
- `AGENT_WORKLOG.md`
- necessary `PROJECT_STATUS.md` / `HANDOVER.md`
- relevant task plan docs
- the Issue comment

Every non-trivial task record must include:

- JST time;
- branch;
- start commit;
- end commit;
- files changed;
- external services touched;
- validation;
- remaining risks.

## External service policy

Write back any external state delta to GitHub.

| Service | Rule |
|---|---|
| GitHub | Record Issue/PR/branch/head/main and remote verification |
| Cloudflare | Record deployment id, URL, source commit, environment, and status for any deployment/settings/env/KV/R2/D1/Pages/Functions change |
| Supabase | Baseline + delta only; update when touched, faulty, or stale and needed |
| Stripe | Baseline + delta only; update when products/prices/webhooks/entitlements are touched or faulty |
| DeepSeek | Record configured/not configured and validation status only; never record secret values |

Do not record secrets, API keys, service role keys, JWT secrets, session tokens, customer data, payment records, or card data.

## Labels recommended for agent Issues

- `agent-task`
- `ready`
- `blocked`
- `docs`
- `frontend`
- `backend`
- `cloudflare`
- `supabase`
- `stripe`
- `dictionary`
- `eju`
- `priority-high`
- `priority-medium`
- `priority-low`

## User launcher template

```text
Execute GitHub Issue #N.

Before starting, read AGENTS.md, AGENT_SYNC_BOARD.md, AGENT_WORKLOG.md, docs/ops/AGENT_CLOSEOUT_CHECKLIST.md, and docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md.

Only execute Issue #N. Do not search for or choose other tasks.
If Issue #N cannot be read or does not match this instruction, stop.
Start by replying with ACK: Issue number, title, branch, start commit, JST time.
```
