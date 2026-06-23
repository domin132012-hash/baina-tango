# Production Deploy Validation Log

## Task

- task name: PR #13 post-login navigation production deploy
- branch: `feat/post-login-nav-restructure` merged into `main`
- start commit: `d5f7264a1e30f81da5f5b01b4e0f1dbb057e918e`
- end commit: `d6312b85a158d08421a9b06b59b711df258fdd5a`
- JST time: `2026-06-23 23:17 JST`
- PR number: `#13`
- PR status before deploy: `OPEN`, draft `true`, head `d5f7264a1e30f81da5f5b01b4e0f1dbb057e918e`, merge state `CLEAN`
- PR status after deploy: `MERGED`, draft `false`
- marked ready: `yes`
- merged: `yes`
- merge commit: `d6312b85a158d08421a9b06b59b711df258fdd5a`

## Deployment

- production deploy command or deployment trigger: GitHub merge to `main`; Cloudflare Pages automatic Production deployment from `main`
- production deployment URL: `https://baina-tango.pages.dev`
- production deployment id: `d0d93ecd-bf01-44ce-8c6a-e0345b3a5b92`
- production deployment source: `d6312b8`
- production deployment status: `Active`
- deployment-specific URL: `https://d0d93ecd.baina-tango.pages.dev`
- Cloudflare command used for read-only status check: `npx wrangler pages deployment list --project-name baina-tango --environment production`

## Commands Run

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git fetch origin
git checkout feat/post-login-nav-restructure
git pull --ff-only origin feat/post-login-nav-restructure
git rev-parse HEAD
git diff --name-only origin/main...HEAD
gh pr view 13 --repo domin132012-hash/baina-tango --json number,title,state,isDraft,headRefName,headRefOid,baseRefName,mergeStateStatus,url
node --check assets/eju.js
python3 -m http.server 4173
python3 -m http.server 4174
Chrome headless DevTools local browser validation at http://localhost:4174/
GitHub mark ready for PR #13
GitHub merge PR #13 with expected_head_sha d5f7264a1e30f81da5f5b01b4e0f1dbb057e918e
git fetch origin main
gh pr view 13 --repo domin132012-hash/baina-tango --json number,state,isDraft,mergedAt,mergeCommit,headRefOid,baseRefName,url
npx wrangler --version
npx wrangler pages deployment list --project-name baina-tango --environment production
Chrome headless DevTools production browser validation at https://baina-tango.pages.dev/
git ls-files -- .env.local
git diff --check
git diff --stat
git diff --name-only
```

## Command Output Summary

- Initial required PR #13 branch head matched: `d5f7264a1e30f81da5f5b01b4e0f1dbb057e918e`.
- Main project worktree later showed unrelated PR #12 dirty files; PR #13 deployment was continued in isolated worktree `/tmp/baina-tango-pr13-deploy.HkywH4` to avoid touching PR #12.
- PR #13 diff from GitHub and isolated worktree stayed within UI/status-doc scope: `assets/eju.js`, `index.html`, post-login navigation docs/review logs, and status docs.
- Disallowed PR #12 / dictionary overlay files did not appear in PR #13 diff.
- `node --check assets/eju.js`: PASS.
- `python3 -m http.server 4173`: failed because port 4173 was already occupied by an existing Python server serving the main worktree.
- `python3 -m http.server 4174`: PASS; used for isolated PR #13 local validation.
- PR #13 was marked ready and merged successfully.
- Cloudflare Pages deployment list showed Production deployment `d0d93ecd-bf01-44ce-8c6a-e0345b3a5b92`, source `d6312b8`, status `Active`.

## Local Validation Result

- local URL: `http://localhost:4174/`
- bottom nav: PASS, labels `学习 / 词库 / 首页 / 社区 / 我的`
- 学习 -> EJU: PASS
- EJU -> 日本語: PASS
- 日本語 -> 読解: PASS, friendly local fallback text includes `需要后端`; no raw 404 HTML
- 日本語 -> 記述: PASS, essay home visible; submit was not clicked
- EJU -> 综合科目 / 扫描卷: PASS, `humanities/2024-1` scanned image visible
- 词库页: PASS
- 首页: PASS
- 社区页: PASS, construction content visible
- 我的页: PASS
- console fatal errors: `0`
- runtime exceptions: `0`
- network bad responses: `0`
- raw 404 visible: `false`

## Production Validation Result

- production URL: `https://baina-tango.pages.dev`
- deployed asset observed: `https://baina-tango.pages.dev/assets/eju.js?v=20260623-pr13-eju-deep-link-fix2`
- bottom nav: PASS, labels `学习 / 词库 / 首页 / 社区 / 我的`
- 学习 -> EJU: PASS
- EJU -> 日本語: PASS
- 日本語 -> 読解: PASS, online reading set list opened; no raw 404 HTML
- 日本語 -> 記述: PASS, essay home visible; submit was not clicked
- EJU -> 综合科目 / 扫描卷: PASS, `humanities/2024-1` scanned image visible
- 词库页: PASS
- 首页: PASS
- 社区页: PASS, construction content visible
- 我的页: PASS
- console fatal errors: `0`
- runtime exceptions: `0`
- network bad responses: `0`
- raw 404 visible: `false`

## Browser Paths Checked

- `https://baina-tango.pages.dev/`
- bottom nav: `学习`
- bottom nav: `词库`
- bottom nav: `首页`
- bottom nav: `社区`
- bottom nav: `我的`
- `学习 -> EJU`
- `EJU -> 日本語`
- `日本語 -> 読解`
- `日本語 -> 記述`
- `EJU -> 综合科目 -> 2024 年第 1 回`

## Console / Network Summary

- Local validation console fatal errors: `0`
- Local validation runtime exceptions: `0`
- Local validation network bad responses: `0`
- Production validation console fatal errors: `0`
- Production validation runtime exceptions: `0`
- Production validation network bad responses: `0`
- Raw `404 File not found` HTML visible: `No`

## Git State

- git status --short before status-doc commit:
  - `A docs/review/post-login-nav-restructure-production-deploy-validation-log.md`
  - `M AGENT_SYNC_BOARD.md`
  - `M AGENT_WORKLOG.md`
  - `M PROJECT_STATUS.md`
  - `M HANDOVER.md`
- git diff --stat before status-doc commit:
  - status docs and production validation log only
- changed files list:
  - `docs/review/post-login-nav-restructure-production-deploy-validation-log.md`
  - `AGENT_SYNC_BOARD.md`
  - `AGENT_WORKLOG.md`
  - `PROJECT_STATUS.md`
  - `HANDOVER.md`

## External Services Touched

- DeepSeek calls: `0`
- Google Translate calls: `0`
- Runtime AI calls: `0`
- R2 writes: `0`
- D1 writes: `0`
- Preview deploy: `no`
- Production deploy: `yes`
- Overlay activation: `0`
- GitHub push: `yes`
- GitHub merge: `yes`
- Cloudflare Pages read-only deployment status check: `yes`
- Cloudflare config changes: `0`

## Secret / Safety Checks

- `.env.local` tracked: `No`
- API key printed: `No`
- Authorization header printed: `No`
- secret scan: PASS, no obvious secret pattern in changed status docs
- large file check: PASS, no large artifact added
- JMdict XML/gz committed: `No`
- DB/SQLite committed: `No`
- production R2 shard committed: `No`
- provider raw response committed: `No`
- `.env.local` content printed: `No`

## Validation Result

PASS. PR #13 was deployed to Production via GitHub merge to `main`, and the canonical Production URL passed browser validation.

## Remaining Risks

- Production browser validation did not perform a real authenticated login because no user credentials were used in this deployment task.
- Essay submit was intentionally not clicked to avoid external AI provider calls.
- Main project worktree outside the isolated PR #13 worktree still had unrelated PR #12 dirty files; they were not read in detail, modified, staged, merged, or deployed.

## Next Step

Monitor user-side Production behavior on normal logged-in accounts; keep PR #12 dictionary overlay work paused until separately approved.
