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

## 2026-06-14 / Claude (Opus 4.8) / 综合科目 2024 MVP

### Task
- 完成「综合科目（総合科目）2024 一套 MVP」：能作答 / 保存 / 採点 / 上线。仅此一套，不碰理科剩余套、不做旧年份综合。

### Files changed
- `assets/eju.js` — 新增 `EJU_SOGO_PROTOTYPES['humanities/2024-1']`（单科目 sogo，38 题全 `opts:4`，title「総合科目 · 2024年」，pageLabel「総合-」）；新增 `ejuRikaProtoFor(key)=EJU_RIKA_PROTOTYPES[key]||EJU_SOGO_PROTOTYPES[key]` 并替换 4 处直接查表（renderEjuRikaPractice / ejuRikaGo / ejuRikaJump / ejuRenderRikaView）+ renderEjuScannedSet 路由；ejuRenderRikaView 用 `proto.pageLabel` 去 '理科-' 硬编码 + 单科目隐藏切换条；runEjuTests 增综合断言；JSON 缓存号 → `20260614-sogo-2024-1`。
- `index.html` — `eju.js?v=` → `20260614-sogo-2024-1`（Python 字节替换，未手改）。
- `scripts/sogo_render_set.py`（新增）— 仿 rika_render_set.py，用综合科目自己的页码（**未套理科**）；跨页竖接 page-008=[8,9]、page-022=[22,23]。
- `assets/eju-media/humanities/2024-1/page-NNN.png`（新增 25 张，DPI150 裁白边/去页脚）。
- `SOGO_PLAN.md` 标注已实现；`PROJECT_STATUS.md` / `HANDOVER.md` / `TASK_PLAN.md` 更新。

### 答案核验（非猜测）
- PDF 32 页纯图。8x 渲染 p32 正解表，分左右两列分段读图；p31 末页确认「39～60 はマークしないでください」→ 实际作答番号 1-38，全部 4 択（正解值全 ≤4）。
- 答案序列：`4,4,3,2,3,2,4,4,1,3,1,1,2,4,1,3,1,2,2,2,3,3,1,4,3,2,4,1,1,2,3,4,1,2,3,1,3,4`

### Validation
- `node --check assets/eju.js` ✅；vm 跑 `runEjuTests` 自检 0 失败 ✅。
- preview（python http.server 8731）：进入「総合科目 · 2024年」练习页（非 OCR 浏览）✅；25 屏导航（1·2 … 38）✅；25/25 题图 HTTP 200 ✅；单选保存到 localStorage `baina-eju-math-paper-humanities/2024-1` ✅；官方答案採点 38/38 满分 ✅；故意错第 10 题 → 37/38 扣分 ✅；控制台无 error ✅。

### Risks / next steps
- 仅 `humanities/2024-1` 一套。其余综合年份（2008~2023、2025）未做，需用户明确指示。
- 大問引导文章页 p3(問1)/p7(問2) 未渲染（MVP 决策，子题面自含）；后续如需上下文可补引导页。
- 理科剩余 6 套仍暂停。与 Codex 不要同时改 `assets/eju.js`。

### Commit
- `feat(eju): add humanities 2024 practice MVP`（rebase 到 origin/main 后 push，哈希以实际为准）

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

---

## 2026-06-14 / ChatGPT / Selected mattpocock skills install

### Task

- Installed selected `mattpocock/skills` project-level skills for Claude Code and Codex.
- Did not modify business code, EJU assets, PDF rendering scripts, or scanned-practice implementation files.

### Installed skills

- `setup-matt-pocock-skills`
- `handoff`
- `diagnose`
- `tdd`
- `grill-with-docs`
- `to-prd`
- `to-issues`

### Files changed

- Codex universal skills: `.agents/skills/<skill>/`
- Claude Code project skill symlinks: `.claude/skills/<skill>`
- Lockfile: `skills-lock.json`
- Agent policy and setup docs: `AGENTS.md`, `docs/agents/`, `docs/adr/.gitkeep`
- Worklog: `AGENT_WORKLOG.md`

### Validation

- Listed available `mattpocock/skills` before install and confirmed all 7 requested skills existed.
- Installed with `npx skills@latest add mattpocock/skills -a claude-code -a codex` and explicit `--skill` entries only. No global install, no `-g`, and no `--all`.
- Applied `setup-matt-pocock-skills` configuration by reading and following `.agents/skills/setup-matt-pocock-skills/SKILL.md` because the newly installed slash command was not available inside the already-running Codex session.
- Setup choices:
  - issue tracker: GitHub Issues for `domin132012-hash/baina-tango`
  - agent docs directory: `docs/agents/`
  - ADR directory: `docs/adr/`
  - labels: `bug`, `feature`, `docs`, `refactor`, `priority-high`, `blocked`

### Risks / next steps

- Installed skills run with full agent permissions when invoked.
- Installer reported medium security risk for `setup-matt-pocock-skills` and `to-issues`; review skill contents before first use.
- GitHub labels are documented in repo config but were not created or changed on GitHub.

### Commit

- `c03108f` before rebase; final rebased hash reported in task completion.
