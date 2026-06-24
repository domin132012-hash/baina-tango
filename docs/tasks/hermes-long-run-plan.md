# Hermes Long-Run Plan

- Task: Deploy JMdict Chinese overlay Top 1000 reviewed-r2 for online user smoke test
- Branch: `feat/dictionary-zh-deepseek-pilot-100`
- Start commit: `963dfb860350c3a84471a056b81cdf227ae9b973`
- Current head: `963dfb860350c3a84471a056b81cdf227ae9b973`
- Last updated: 2026-06-24 15:06 JST (Hermes closeout)
- PR: #12 draft / open / unmerged
- Source candidate: `docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json`
- Source package: `docs/review/jmdict-zh-deepseek-pilot-1000-local-package-reviewed-r2/`
- Strict scope: Top 1000 reviewed-r2 only; no DeepSeek / Google Translate / Runtime AI calls; no PR #13 work.

## Phase Checklist

- [x] Phase 0: Move `.env.local.backup.20260623-221154` outside repo without reading or printing contents.
  - Result: moved to `/Users/domin/Desktop/baina-tango-secret-backups/.env.local.backup.20260623-221154`; permissions set to `600`; repo no longer shows the file in `git status --short`.
- [x] Phase 1: Preflight branch, PR, worktree, secret tracking, and reviewed-r2 artifacts.
  - Result: branch `feat/dictionary-zh-deepseek-pilot-100`; PR #12 `OPEN`, draft, unmerged; `.env.local` untracked; worktree clean before task-doc update; reviewed-r2 candidate and local package present.
- [x] Phase 2: Confirm existing online overlay mechanism and rollback path from repo configuration and code.
  - Result: runtime `/api/dictionary/lookup` reads `DICTIONARY_R2` shards and resolves active manifest through D1 `dictionary_active_versions`; normal lookup returns `aiCalled: false`. Current active version is `jmdict-english-r2-shards-2026-06-18`, bucket `baina-dictionary-artifacts`, manifest `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json`.
  - Deployment path: create a new immutable R2 shard version with Top 1000 reviewed-r2 `chineseGloss` merged into copied active shards, then switch D1 active metadata to the new version. Rollback is switching D1 active metadata back to `jmdict-english-r2-shards-2026-06-18`.
- [x] Phase 3: Validate reviewed-r2 candidate and local package.
  - Result: PASS. Candidate/package parsed; entries `500`, senses `799`, shouldDisplay true/false `726`/`73`, `needs_human_review` flags `7`, checksum failures `0`, safety scan hits `0`. `PASS_WITH_LIMITED_REVIEW` is recorded in `chatgpt-review-round2-deep-review.md`; package QA summary records `PASS_WITH_REVIEW`.
- [x] Phase 4: Write online test deployment plan with version id, targets, activation method, rollback, and go/no-go.
  - Result: added `docs/review/jmdict-zh-deepseek-pilot-1000-online-test-deploy-plan.md`; version id `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`; upload target `baina-dictionary-artifacts/dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/`; metadata target D1 `baina-dictionary`; rollback SQL documented.
- [x] Phase 5: Execute existing safe online overlay deployment path.
  - Result: backed up old active metadata to `/tmp/baina-pr12-old-active-version-20260624.json`; generated rollback SQL at `/tmp/baina-pr12-rollback-jmdict-zh-deepseek-top1000-reviewed-r2-20260624.sql`; uploaded 513 R2 objects under new prefix; remote manifest SHA matched local generated manifest; D1 activation succeeded with 4 queries / 5 rows written. Old active version `jmdict-english-r2-shards-2026-06-18`; new active version `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`.
- [x] Phase 6: Validate production user-facing lookup behavior with at least 10 words.
  - Result: PASS. API smoke passed `12/12` samples with `aiCalled=false`, `dictionarySource=r2-shard`, sourceVersion `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`, no raw HTML, no failed samples. Browser UI smoke opened production 查词页, queried `一冊`, displayed `中文: 一册；一本`, showed bottom nav `学习 / 词库 / 首页 / 社区 / 我的`, and recorded console fatal errors `0`, network bad responses `0`.
- [x] Phase 7: Write online test deployment validation log.
  - Result: added `docs/review/jmdict-zh-deepseek-pilot-1000-online-test-deploy-validation-log.md`; includes secret backup handling, old/new active versions, R2/D1 write counts, rollback command, local package validation, API/browser smoke results, safety checks, risks, and next step.
- [x] Phase 8: Update project status documents.
  - Result: Hermes updated AGENT_SYNC_BOARD.md, AGENT_WORKLOG.md, PROJECT_STATUS.md, HANDOVER.md, and this file. Codex was interrupted by usage limit exhaustion after Phase 7; Hermes took over for read-only confirmation and document closeout only.
- [x] Phase 9: Commit and push PR #12 branch while keeping PR #12 draft / open / unmerged.
  - Result: Hermes committed and pushed all closeout files to `feat/dictionary-zh-deepseek-pilot-100`. PR #12 remains draft/open/unmerged. No merge, no mark ready, no force push, no rebase.

## Guardrails

- Do not read, print, commit, or copy `.env.local` or `.env.local.backup.20260623-221154`.
- Do not call DeepSeek, Google Translate, Runtime AI, or any AI provider.
- Do not generate new translations or expand beyond Top 1000 reviewed-r2.
- Do not merge, mark ready, rebase, reset, or force push PR #12.
- Do not overwrite production overlay data unless rollback is explicitly confirmed and old active metadata is backed up.

## Current Notes

- All 9 phases complete. Codex executed Phases 0–7 (deployment, upload, activation, smoke). Codex interrupted by usage limit exhaustion before Phase 8–9. Hermes completed Phases 8–9 (read-only confirmation, doc updates, commit + push).
- Production active version: `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`. R2: 513 objects. D1: 5 rows. API smoke: 12/12 PASS. Browser smoke: PASS.
- Rollback: switch D1 active version back to `jmdict-english-r2-shards-2026-06-18` via wrangler.
- External temporary worktree `/private/tmp/baina-tango-pr13-deploy.HkywH4` exists from prior PR #13 deployment session. This task did not touch PR #13.
- PR #12 remains draft/open/unmerged.
