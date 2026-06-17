# ChatGPT Task Writing Preference

Last updated: 2026-06-17 20:45 JST

## Default interpretation

When the user tells ChatGPT/manager to "write the instruction in the repository" or "go into the repo and write the instruction", the default meaning is:

- ChatGPT/manager should create or update the GitHub Issue / repository task document directly through the GitHub connection.
- ChatGPT/manager should not only return a copy-paste block for the user, unless the user explicitly asks for text only.
- After writing the task in GitHub, ChatGPT/manager should report the Issue number, file path, or commit hash so the user can hand only the target reference to the execution agent.

## Text-only exception

If the user says any of the following, do not write to GitHub automatically:

- "先不要写进 GitHub，只给我文本"
- "只生成指令"
- "我自己复制"
- "不要创建 Issue"

In those cases, provide the instruction text in chat only.

## Preferred workflow for medium/large tasks

1. User describes the task to ChatGPT/manager.
2. ChatGPT/manager writes the task into GitHub as a specific Issue or repository task document.
3. ChatGPT/manager reports the exact Issue number or file path.
4. User tells the execution agent: `Execute GitHub Issue #N` or gives the exact task file path.
5. The execution agent must follow `docs/ops/AGENT_TASK_ISSUE_PROTOCOL.md` and `docs/ops/AGENT_CLOSEOUT_CHECKLIST.md`.

## Required content when ChatGPT/manager writes an Issue

The Issue/task should include:

- background;
- goal;
- scope;
- prohibited actions;
- execution steps;
- validation requirements;
- documentation writeback requirements;
- external services allowed/touched;
- acceptance criteria;
- model recommendation;
- closeout requirements with JST time, branch, start/end commit, files changed, external services touched, validation, and remaining risks.

## Rationale

This avoids making the user copy long instructions manually and keeps medium/large tasks durable in GitHub, while still preventing agents from searching for or choosing tasks on their own.
