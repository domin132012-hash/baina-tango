# Validation Log

## Task

- task name: PR #13 EJU deep-link bugfix
- branch: `feat/post-login-nav-restructure`
- start commit: `7d995556dcfa27ebdb61953235de0133a464f418`
- end commit: final pushed branch head for commit subject `Fix EJU deep links in post-login navigation`; exact SHA is reported after commit/push
- JST time: `2026-06-23 21:56 JST`

## User-reported bug

- screenshot 1 summary: `综合科目 — 扫描卷` could expose a red `404 File not found` / local Python server error.
- screenshot 2 summary: `日本語` showed `読解` as open and `記述` as trial-open, but deep entry clicks did not complete.
- affected routes/buttons: `学习 -> EJU -> 日本語 -> 読解`; `学习 -> EJU -> 日本語 -> 記述`; `学习 -> EJU -> 综合科目 / 扫描卷`.

## Commands Run

- `pwd`
- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git fetch origin feat/post-login-nav-restructure:refs/remotes/origin/feat/post-login-nav-restructure`
- `git rev-parse origin/feat/post-login-nav-restructure`
- `gh pr view 13 --json number,state,isDraft,mergedAt,headRefName,headRefOid,baseRefName,url`
- `git ls-files .env.local RIKA_PLAN.md`
- `codex-preflight --task "Fix PR13 EJU deep links without provider calls, deploys, R2/D1 writes, mark-ready, merge, or dictionary overlay changes"`
- `python3 -m http.server 4173`
- browser validation at `http://localhost:4173/?pr13_final=20260623b`
- `node --check assets/eju.js`
- `node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts||{}, null, 2))"`
- `git diff --check`
- secret scan with `rg` over `git diff`
- `.env.local` / `RIKA_PLAN.md` git tracking check
- changed-file size check with `wc -c`
- `git status --short`
- `git diff --stat`
- `git diff --name-only`

## Manual Browser Checks

- 学习 -> EJU: PASS. `学习` tab opens, EJU card opens `view-exam-trial`.
- 日本語: PASS. Japanese page opens `view-eju-japanese`; `読解` is labelled `需要后端` in local static preview.
- 読解: PASS. Click opens `view-eju-reading-select` with `読解训练暂不可用` and `需要后端`; no `/api/eju-reading-sets` request is made in local static preview.
- 記述: PASS. Click opens the existing essay home inside `view-eju-japanese`; `题目 / テーマ`, `作文本文`, and `提交批改` are visible. No submit was clicked.
- 综合科目 / 扫描卷: PASS. Scan menu opens, 2024 第 1 回 opens, and `assets/eju-media/humanities/2024-1/page-003.png` renders as the visible question image.
- bottom nav: PASS. `学习 / 词库 / 首页 / 社区 / 我的` all open their expected views with 5 tabs visible.
- console errors: `0`.
- network 404: `0` in the clean final server log.
- raw HTML 404 visible in UI: `No`.

Screenshots saved outside the repository under Codex task outputs:

- `/Users/domin/Documents/Codex/2026-06-23/files-mentioned-by-the-user-pr-2/outputs/pr13-eju-japanese.png`
- `/Users/domin/Documents/Codex/2026-06-23/files-mentioned-by-the-user-pr-2/outputs/pr13-eju-reading-needs-backend.png`
- `/Users/domin/Documents/Codex/2026-06-23/files-mentioned-by-the-user-pr-2/outputs/pr13-eju-writing-home.png`
- `/Users/domin/Documents/Codex/2026-06-23/files-mentioned-by-the-user-pr-2/outputs/pr13-eju-sogo.png`

## Git Status

- git status --short:
  - `M AGENT_SYNC_BOARD.md`
  - `M AGENT_WORKLOG.md`
  - `M HANDOVER.md`
  - `M PROJECT_STATUS.md`
  - `M assets/eju.js`
  - `M docs/design/post-login-nav-restructure.md`
  - `M index.html`
  - `?? docs/review/post-login-nav-restructure-eju-deep-link-validation-log.md`
- git diff --stat:
  - `AGENT_SYNC_BOARD.md | 18 ++++---`
  - `AGENT_WORKLOG.md | 58 ++++++++++++++++++++++`
  - `HANDOVER.md | 2 +-`
  - `PROJECT_STATUS.md | 4 +-`
  - `assets/eju.js`
  - `docs/design/post-login-nav-restructure.md`
  - `index.html`
  - note: untracked new validation log is listed in `git status --short` and will be included in the commit
- changed files list:
  - `assets/eju.js`
  - `index.html`
  - `docs/design/post-login-nav-restructure.md`
  - `docs/review/post-login-nav-restructure-eju-deep-link-validation-log.md`
  - `AGENT_SYNC_BOARD.md`
  - `AGENT_WORKLOG.md`
  - `PROJECT_STATUS.md`
  - `HANDOVER.md`

## External Services

- DeepSeek calls: `0`
- Google Translate calls: `0`
- Runtime AI calls: `0`
- R2 writes: `0`
- D1 writes: `0`
- Preview deploy: `No`
- Production deploy: `No`
- Overlay activation: `No`
- GitHub push: branch push only after commit; PR #13 must remain draft/open/unmerged

## Secret / Safety Checks

- .env.local tracked: `No`
- RIKA_PLAN.md committed: `No`
- API key printed: `No`
- Authorization header printed: `No`
- secret scan: PASS, no obvious secret patterns in staged diff
- large file check: PASS, no new large repository artifact; largest changed tracked files before docs commit were `index.html` and `assets/eju.js`; screenshots saved outside repo
- package scripts: `{}`; no build/test/lint scripts available

## UI Validation

- bottom nav still 5 tabs: PASS
- learning tab: PASS
- EJU entry: PASS
- Japanese page: PASS
- reading behavior: PASS, local static preview is explicitly `需要后端`
- writing behavior: PASS, existing essay home opens by on-demand loading `assets/eju-essay.js`
- scanned paper behavior: PASS, 综合科目 2024-1 menu and question image render locally
- construction badges: PASS, unavailable EJU reading/static data and future sets are not presented as fully open
- raw 404 HTML hidden: PASS
- existing vocab/home/profile functions preserved: PASS by bottom nav smoke

## Validation Result

PASS

## Remaining Risks

- Local static preview does not exercise the Cloudflare `/api/eju-reading-sets` backend path.
- The essay home is verified only for entry/opening; the submit path was intentionally not clicked to avoid external AI/provider calls.
- PR #13 remains draft and unmerged; Preview/Production behavior is not deployed or verified under this task.

## Next Step

PR #13 can continue review as a draft after the pushed bugfix commit. Do not mark ready, merge, deploy, or touch PR #12 dictionary overlay artifacts in this step.
