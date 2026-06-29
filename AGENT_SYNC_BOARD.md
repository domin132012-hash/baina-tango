# Agent Sync Board

> Current external-state summary for active agents. Use baseline + delta updates:
> do not recheck Supabase / Stripe unless the task touches them, a related fault appears, or the recorded status is older than 30 days and the task depends on that platform.
> Never record API keys, service role keys, JWT secrets, session tokens, customer data, payment records, card data, or raw secret values.

Last updated: 2026-06-29 18:01 JST by Codex

## 1. 当前锁定状态

| Area | Status | Note |
|---|---|---|
| Repository docs | Active for EJU scanned exam import | Recording local-only scan-browser import on `feat/eju-official-exam-import`; no push/deploy |
| Application code | EJU scanned exam grading alignment ready locally | Added graded practice for 総合科目 2025-1 / 2023-2 / 2022-1 and 理科 2025-1, keeping 2024-1 総合科目 as the gold standard; remaining sets without reliable answer sources stay scan-browser / needs_review |
| Cloudflare | Not touched in this task | Prior Production deployment state carried forward; no Pages config change, no Preview/Production deploy, no R2/D1 write |
| Supabase | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| Stripe | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| DeepSeek | Not touched in this task | No backend, secret, or API changes; normal lookup does not call AI by default |

## 2. GitHub 状态

| Item | Value |
|---|---|
| Repository | `domin132012-hash/baina-tango` |
| Current branch | `feat/eju-official-exam-import` local worktree |
| Main latest hash at task start | `ebc320317e6ef212a38a53a603191c419aca527c` |
| Current task | PR #13 post-login navigation Production deploy |
| Issue | `#11` post-login main interface information architecture |
| PR #4 | `MERGED` `https://github.com/domin132012-hash/baina-tango/pull/4` |
| PR #4 merge commit | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Main latest hash after PR #4 | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Phase 2 branch | `feat/full-jmdict-import-spike` |
| Phase 2 PR | `https://github.com/domin132012-hash/baina-tango/pull/6` merged |
| Latest relevant commit | PR #13 merge commit `d6312b85a158d08421a9b06b59b711df258fdd5a` |
| UI PR | `#13` `https://github.com/domin132012-hash/baina-tango/pull/13` MERGED; head `d5f7264a1e30f81da5f5b01b4e0f1dbb057e918e`; merge commit `d6312b85a158d08421a9b06b59b711df258fdd5a` |
| PR #2 | `MERGED`; merge commit `79a2b7e80d7b5c83062e24afba69ed66fcac3339` |
| This task | EJU official scanned exam scan-browser import |
| Dictionary plan commit | `9622358aebaa9b3f7bafb2e1050750b69a8adc38` pushed to `origin/main` |
| External services touched - GitHub | None in this task; no push |
| External services touched - Cloudflare | None in this task; no Preview deploy, no Production deploy, no R2/D1 write, no config/metadata change |
| External services touched - Supabase | Not touched |
| External services touched - Stripe | Not touched |
| External services touched - DeepSeek | Not touched |
| Current status | Local branch upgrades selected scanned exams to graded practice: 総合科目 2025-1 / 2023-2 / 2022-1 and 理科 2025-1; existing 総合科目 2024-1 and 理科 2021-1 through 2023-2 graded practice remain available. Validation passed locally; commit pending in this worktree. |
| Current blocker | 理科 2024-1 / 2018-1 / 2018-2 / 2020-2 and several older 総合科目 sets lack reliable verified answer + page mapping in local extracted data; `science/2019-1` remains unavailable because scanned data is `fail` with an OCR error page. |

## 3. Cloudflare 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-23 23:17 JST after PR #13 Production deployment |
| Touched by this task | Git-backed Production deployment from PR #13 merge; prior Production R2 shard lookup state carried forward |
| Needs recheck | No for current Production lookup result |
| Current blocker | None for dictionary R2 shard lookup; continue monitoring cost/traffic after Production traffic uses R2 |
| Production deployment | Latest PR #13 functional deployment validated: `d0d93ecd-bf01-44ce-8c6a-e0345b3a5b92`, source `d6312b8`, URL `https://baina-tango.pages.dev`, status Active; project-level dictionary bindings remain unchanged |
| Previous app merge deployment | `1c5b2430-6b20-4334-8e04-e9fb2243dbca`, source `79a2b7e` |
| PR #2 Preview deployment | `7a85773e-6a2d-44e6-92e2-a8aed5520b7d`, source `dea412c` |
| PR #4 Preview deployment | `8c882ad2-3432-4d21-a422-be0357eedb19`, source `c294976`, URL `https://8c882ad2.baina-tango.pages.dev`, branch URL `https://feat-dictionary-lookup-mvp.baina-tango.pages.dev`, status successful |
| PR #6 Preview deployment | Latest validated PASS deployment `bde77489-e786-4764-9b55-8e9154cb9605`, source `fb7d58a`, URL `https://bde77489.baina-tango.pages.dev`, branch URL `https://feat-full-jmdict-import-spik.baina-tango.pages.dev`; Branch Preview returns `dictionarySource=r2-shard` |
| R2 dictionary bucket | `baina-dictionary-artifacts`; raw/checksum/manifest/estimate keys under `dictionary/raw/jmdict/2026-06-17/`; active shard keys under `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/` |
| D1 dictionary database | `baina-dictionary`, id `5e8eeeda-0029-4c2e-958e-845ea0020c6e`; metadata-only tables `dictionary_sources`, `dictionary_versions`, `dictionary_active_versions`; active version `jmdict-english-r2-shards-2026-06-18`; full import not executed |
| Dictionary bindings | Preview and Production active: `DICTIONARY_R2` -> R2 bucket `baina-dictionary-artifacts`, `DICTIONARY_DB` -> D1 database `baina-dictionary`; optional manifest key remains `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json` |
| Billing / paid prompt seen | No |

Update triggers:
- New Preview or Production deployment.
- Environment variable change.
- KV / R2 / Functions / Pages settings change.
- Deployment failure.
- Cloudflare source commit differs from GitHub expected commit.

## 4. Supabase 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-17 baseline from repository + user-provided screenshot status |
| Touched by this task | No dashboard/backend changes; docs baseline only |
| Needs recheck | Yes: status screenshot says `Unhealthy`; recheck before tasks relying on Auth, user data, purchases, or essay history |
| Current blocker | Supabase dashboard health is reported as `Unhealthy`; details unknown |
| Baseline doc | `docs/ops/SUPABASE_STATUS.md` |

Update triggers:
- Auth settings change.
- Database table change.
- RLS policy change.
- Environment variable change.
- Login/register/user data fault.
- New critique history, usage limit, or user-entitlement table.
- Health status changes.

## 5. Stripe 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-17 baseline from repository code only |
| Touched by this task | No dashboard/API changes; docs baseline only |
| Needs recheck | No for this docs-only task; yes before changing products/prices/webhook/entitlement logic |
| Current blocker | Product IDs and dashboard active status not confirmed from Stripe Dashboard |
| Baseline doc | `docs/ops/STRIPE_CATALOG.md` |

Update triggers:
- Product change.
- Price change.
- `price_id` / `product_id` change.
- Webhook endpoint or event type change.
- Payment success entitlement logic change.
- Payment and entitlement mismatch.

## 6. DeepSeek 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-17 during PR #2 closeout |
| Touched by this task | No |
| Needs recheck | No for this docs-only task |
| Current blocker | None recorded |
| Env status | `DEEPSEEK_API_KEY` configured in Cloudflare Preview / Production as secret; value not recorded |

## 7. 用户验收状态

| Check | Status | Evidence |
|---|---|---|
| PR #2 Preview logged-in `analyze` | Passed | User reported real Branch Preview validation |
| PR #2 Preview logged-in `follow-up` | Passed | User reported real Branch Preview validation |
| Production unauthenticated smoke | Passed | Agent verified 2026-06-17 in previous task |
| PR #4 Cloudflare Preview sample MVP notice | Passed | Agent verified 2026-06-17 23:05 JST on source `c294976` |
| PR #4 Cloudflare Preview `平和` sample miss | Passed | Shows `当前小样本词典未收录，可等待完整 JMdict 接入或尝试 AI 解释` |
| PR #4 Cloudflare Preview sample hits | Passed | `努力` / `食べる` exact hits; `読まなかった` deinflects to `読む` |
| PR #4 Cloudflare Preview EJU 記述 entry | Passed | `学习 -> 真题试炼 -> 日本語 -> 記述` opens; console errors none |
| PR #4 Production deployment source | Passed | Cloudflare Production deployment `8f0ef91f-4dbb-4f21-a5f8-1dfcc66c5367` reports source `c340f75`, matching latest `main` |
| PR #4 Production smoke | Passed | Browser smoke on `https://baina-tango.pages.dev`: sample notice, `努力`, `平和`, `食べる`, `読まなかった`, no AI lookup request, EJU 記述 opens, console/page errors none |
| PR #6 local beta API checks | Passed | `平和` / `学校` / `先生` / `問題` / `努力` / `食べる` / `読まなかった` / `存在しない語`, all `aiCalled=false`, beta sourceVersion `jmdict-english-beta-1000-2026-06-17` |
| PR #6 Cloudflare Preview beta API checks | Passed | Preview `https://467d1f82.baina-tango.pages.dev`, source `02cbddb`, deployment `467d1f82-b5e5-46e0-bd47-9a78a542e3be`; required API checks all passed with `aiCalled=false`; page contains JMdict 1,000-entry beta wording |
| PR #6 Issue #8 local R2 shard API checks | Passed | Full 2026-06-18 R2 shard artifact via API mock: all required Issue #8 queries passed, `source=r2-shard`, `aiCalled=false`; `存在しない語` missed |
| PR #6 Issue #8 remote R2/D1 checks | Passed | Remote R2 manifest checksum matched local; remote shards for `平和`, `読む`, `高い`, `食べられる` contained expected entries; D1 active metadata points to `jmdict-english-r2-shards-2026-06-18` |
| PR #6 Issue #8 Cloudflare Preview checks | Passed | Branch Preview at source `fb7d58a` returned `dictionarySource=r2-shard`; `食べられる` count `1`; all required queries kept `aiCalled=false`; Production unchanged |
| PR #6 user Preview validation / ready transition | Passed | 2026-06-21 23:26 JST: User reported Preview validation passed; PR #6 marked ready for review only; merge approval remains unchecked; PR remains unmerged at `5fb2c05322fbe98903eebd61b297e9237d6c14fc` |
| PR #6 final pre-merge check | Passed | 2026-06-22 00:06 JST: title/docs cleanup approved; start commit `5fb2c05322fbe98903eebd61b297e9237d6c14fc`; final head recorded in PR #6 comment after push; PR open/ready/not merged; Preview `r2-shard`; `食べられる` count `1`; all required terms `aiCalled=false`; artifact/secret scan passed; Production unchanged; billing prompt seen: no |
| PR #6 Production post-merge smoke | Failed | 2026-06-22 00:26 JST: PR #6 merged with commit `c94735925798c604321631e1caa36c2f2c3190be`; Production deployment `9ee954f2` Active at source `c947359`; dictionary page opens; EJU 記述 opens; no console/page errors; all required API terms `aiCalled=false`; blocker: Production returns `dictionarySource=fallback`, and `食べられる` count `0` instead of `1`; billing prompt seen: no |
| PR #6 Production R2/D1 binding/runtime fix | Passed | 2026-06-22 01:04 JST: Production Pages config updated with `DICTIONARY_R2` and `DICTIONARY_DB`; Git-backed Production rebuild `fe86990e` fixed runtime bindings, then docs-only deployment `7ac71e04` at source `942f1a2` also passed smoke. Production `/api/dictionary/lookup?q=食べられる` returns `dictionarySource=r2-shard`, count `1`; required API terms all `aiCalled=false`; dictionary page and EJU 記述 entry open; console errors `0`, API failures `0`; billing prompt seen: no |
| Issue #11 local post-login nav restructure | Passed | 2026-06-23 21:11 JST: local `http://localhost:4173/` browser validation passed for `学习 / 词库 / 首页 / 社区 / 我的`; EJU opens existing 真题试炼; 词库 opens 查词/背词/导入导出/词库管理; 社区 and planned profile entries show `建设中`; construction clicks show toast only; console errors `0`; DeepSeek/Google/Runtime AI/R2/D1/deploy calls `0`; screenshot check saved under Codex outputs. |
| PR #13 EJU deep-link bugfix | Passed | 2026-06-23 21:57 JST: local `http://localhost:4173/?pr13_final=20260623b` browser validation passed for `学习 -> EJU`, `日本語`, `読解`, `記述`, `综合科目 -> 2024 第 1 回`, and bottom nav. `読解` local static shows `需要后端`; `記述` opens the essay home; 综合科目 scan image `assets/eju-media/humanities/2024-1/page-003.png` renders. Console errors `0`; clean server network 404 `0`; raw HTML 404 visible `No`; DeepSeek/Google/Runtime AI/R2/D1/deploy calls `0`. |
| PR #13 Production deploy | Passed | 2026-06-23 23:17 JST: User approved deployment. PR #13 marked ready and merged with commit `d6312b85a158d08421a9b06b59b711df258fdd5a`; Cloudflare Production deployment `d0d93ecd-bf01-44ce-8c6a-e0345b3a5b92`, source `d6312b8`, Active. Production browser validation on `https://baina-tango.pages.dev` passed for bottom nav, `学习 -> EJU`, `EJU -> 日本語`, `読解`, `記述` home, `综合科目 -> 2024 年第 1 回`, 词库, 首页, 社区, 我的. Console fatal errors `0`; network bad responses `0`; raw 404 visible `No`; DeepSeek/Google/Runtime AI/R2/D1/overlay activation all `0`. |
| EJU scanned exam graded alignment | Passed locally | 2026-06-29 18:01 JST: Local browser validation on `http://localhost:4173/` passed for 総合科目 2025-1 / 2023-2 / 2022-1, 理科 2025-1 / 2023-2 / 2022-1, and gold regression 総合科目 2024-1. Each checked set opened, rendered a nonzero scan image, accepted an answer, showed `✓ 正解`, and displayed expected score `1 / 38` or `1 / 19`. Console errors `0`; `node --check assets/eju.js`, JSON format check, and `git diff --check` passed. No push, deploy, merge, provider call, R2/D1 write, `.env.local`, or Top50K worktree touch. |
| EJU scanned exam graded coverage completion | User-validated locally, push approved | 2026-06-29 21:01 JST: On `feat/eju-official-exam-import` from start `15095e60fe84f7bb662da3a0d2b3f4d149a645b3`, remaining requested 総合科目 `2018-1`, `2018-2`, `2019-1`, `2020-2`, `2021-1`, `2021-2`, `2022-2`, `2023-1` and 理科 `2018-1`, `2018-2`, `2019-1`, `2020-2`, `2024-1` were upgraded to graded scan practice using official PDF tail answer tables. `science/2019-1` PNG pages were rendered from the desktop PDF and kept `needs_review`. User reported local验收 passed and approved push. Deploy `0`; merge `0`; DeepSeek/Google Translate/Runtime AI `0`; R2/D1 writes `0`; `.env.local` and Top50K worktree untouched. |

## 8. 最近事件流水

| Time | Event |
|---|---|
| 2026-06-17 | PR #2 merged with merge commit `79a2b7e80d7b5c83062e24afba69ed66fcac3339`. |
| 2026-06-17 | Docs closeout commit `3ca722ec49cc588370f9bd2ec0400a2f7a4e0fde` pushed to `main`; last known Cloudflare Production source `3ca722e`. |
| 2026-06-17 | Added baseline + delta update model for external platforms. |
| 2026-06-17 | Docs-only dictionary lookup architecture plan task: Cloudflare / Supabase / Stripe / DeepSeek not touched; no secret added. |
| 2026-06-17 | Dictionary lookup architecture plan commit `9622358aebaa9b3f7bafb2e1050750b69a8adc38` pushed to `origin/main`. |
| 2026-06-17 18:40 JST | Docs-only implementation plan and closeout mechanism task started on `main` at `591dedf618ddb99373bd05b2ac75950101cbadf0`; Cloudflare / Supabase / Stripe / DeepSeek not touched. |
| 2026-06-17 20:20 JST | GitHub Issue task protocol closeout backfill started on `main` at `326a4bd49c278505eb15339a610ed60583544cd7`; Cloudflare / Supabase / Stripe / DeepSeek not touched. |
| 2026-06-17 20:50 JST | ChatGPT manager task-writing preference recorded: repo-writing requests now mean direct GitHub Issue/task-file write by default unless user asks for text only; Cloudflare / Supabase / Stripe / DeepSeek not touched. |
| 2026-06-17 20:57 JST | Issue #3 JMdict lookup MVP implemented on `feat/dictionary-lookup-mvp`; Cloudflare code changed only, dashboard not touched; Supabase / Stripe / DeepSeek not touched. |
| 2026-06-17 21:00 JST | Draft PR #4 opened for Issue #3: `https://github.com/domin132012-hash/baina-tango/pull/4`; no merge performed. |
| 2026-06-17 21:11 JST | PR #4 wording patched to state this is a JMdict small-sample MVP only; `平和`-style misses are expected until full JMdict import. |
| 2026-06-17 23:05 JST | Cloudflare Preview for PR #4 verified at source `c294976`: `https://8c882ad2.baina-tango.pages.dev`; PR #4 ready can be enabled after closeout push; no merge performed. |
| 2026-06-17 23:34 JST | Issue #5 Phase 1: PR #4 merged to `main` with merge commit `c340f75a5f8cf51dac691732a9c66e50cd22af09`. |
| 2026-06-17 23:35 JST | Cloudflare Production deployment `8f0ef91f-4dbb-4f21-a5f8-1dfcc66c5367` Active at source `c340f75`; Production smoke passed. |
| 2026-06-17 23:44 JST | Issue #5 Phase 2 branch `feat/full-jmdict-import-spike` created from merged `main`; full import spike doc/scripts/schema prepared without committing full JMdict/KANJIDIC2 data. |
| 2026-06-18 09:20 JST | Issue #5 scope updated from docs-only spike to PR #6 1,000-entry JMdict English-only beta; beta data generated from official JMdict source; local and Cloudflare Preview API checks passed; PR #6 remains draft. |
| 2026-06-18 13:10 JST | Issue #8 R2 sharded lookup implemented on PR #6 branch: 2026-06-18 JMdict shards uploaded to R2, D1 metadata-only active version written, lookup API binding-ready with beta fallback; PR #6 remains draft. |
| 2026-06-18 13:20 JST | Historical check: Cloudflare Preview source `c1e9133` returned JSON but used beta fallback because Pages `DICTIONARY_R2` / `DICTIONARY_DB` bindings were not available in that check; this blocker was later superseded by the 2026-06-19 Preview PASS. |
| 2026-06-18 15:25 JST | Issue #8 Pages Preview binding confirmation: downloaded current Pages config, attempted safe Wrangler/repo config path, Preview redeployed at source `52d12da`, but downloaded Pages config still lacked dictionary bindings and Branch Preview stayed on fallback. This historical blocker was later superseded by the 2026-06-19 Preview PASS. |
| 2026-06-19 00:10 JST | Status closeout fix: prior Preview PASS recorded in docs. Branch Preview source `fb7d58a` returns `r2-shard`; `食べられる` count `1`; all required terms `aiCalled=false`; PR #6 was kept draft at that time pending user review. |
| 2026-06-21 23:26 JST | User Preview validation passed; PR #6 body checklist updated and PR marked ready for review only. PR #6 remains open and unmerged at `5fb2c05322fbe98903eebd61b297e9237d6c14fc`; no code, deploy, Cloudflare, Production, R2/D1, or `RIKA_PLAN.md` change. |
| 2026-06-22 00:06 JST | PR #6 docs/title cleanup and final pre-merge verification started from `5fb2c05322fbe98903eebd61b297e9237d6c14fc`; docs/status only plus GitHub PR metadata/comment; no app code, manual redeploy, Cloudflare settings, Production, R2/D1 data, D1 full import, `RIKA_PLAN.md`, or generated dictionary artifacts touched. |
| 2026-06-22 00:26 JST | PR #6 merged to `main` with merge commit `c94735925798c604321631e1caa36c2f2c3190be`; automatic Production deployment `9ee954f2` Active at source `c947359`; Production smoke failed R2/count requirement because lookup still uses fallback and `食べられる` count is `0`; no manual Cloudflare settings change, no R2/D1 write, no D1 full import, no `RIKA_PLAN.md` touch, billing prompt seen: no. |
| 2026-06-22 01:04 JST | Production R2/D1 binding/runtime fix completed: Cloudflare Pages production config now has `DICTIONARY_R2` -> `baina-dictionary-artifacts` and `DICTIONARY_DB` -> `baina-dictionary`; runtime-fix deployment `fe86990e` and docs-only closeout deployment `7ac71e04` both passed Production smoke with `dictionarySource=r2-shard`, `食べられる` count `1`, required terms `aiCalled=false`; no R2/D1 data write, no D1 full import, no `RIKA_PLAN.md` touch, billing prompt seen: no. |
| 2026-06-23 21:11 JST | Issue #11 post-login nav IA implementation committed on `feat/post-login-nav-restructure` from `main` at `ebc3203`; `RIKA_PLAN.md` moved out of repo to Desktop backup before branch work; implementation commit `1f07590`; local UI/browser validation passed; no provider call, R2/D1 write, deploy, Cloudflare config change, or dictionary overlay artifact change. |
| 2026-06-23 21:15 JST | Branch `feat/post-login-nav-restructure` pushed and draft PR #13 created: `https://github.com/domin132012-hash/baina-tango/pull/13`; PR is OPEN and draft; no mark-ready, merge, deploy, provider call, R2/D1 write, or Cloudflare config change. |
| 2026-06-23 21:22 JST | PR #13 validation/status-doc finalization started from head `a9c1a9de20eb28a328e85c6e0dddb8a664a93a28`; GitHub confirms PR #13 remains OPEN, draft, unmerged; scope is markdown status/validation docs only, with no `index.html`, UI, business logic, deploy, mark-ready, merge, provider, R2/D1, or overlay change. |
| 2026-06-23 21:57 JST | PR #13 EJU deep-link bugfix completed locally from start head `7d995556dcfa27ebdb61953235de0133a464f418`: `assets/eju.js` now avoids local `/api/eju-reading-sets` 404 exposure, loads `assets/eju-essay.js` on demand for `記述`, and sanitizes EJU fetch errors; `index.html` EJU script cache key updated. No deploy, provider call, R2/D1 write, mark-ready, merge, PR #12 touch, `.env.local`, or `RIKA_PLAN.md` commit. |
| 2026-06-23 23:17 JST | PR #13 deployed to Production after user approval: marked ready, merged with commit `d6312b85a158d08421a9b06b59b711df258fdd5a`, Cloudflare Production deployment `d0d93ecd-bf01-44ce-8c6a-e0345b3a5b92` Active at source `d6312b8`; canonical browser validation passed; no DeepSeek, Google Translate, Runtime AI, R2/D1 write, overlay activation, PR #12 handling, `.env.local`, API key, or Authorization header exposure. |
| 2026-06-29 18:01 JST | EJU scanned exam graded alignment completed locally on `feat/eju-official-exam-import`: 総合科目 2025-1 / 2023-2 / 2022-1 and 理科 2025-1 upgraded to graded practice using verified official answer tables where available; browser validation covered 3 総合科目, 3 理科, and 2024-1 gold regression; no push/deploy/merge/provider/R2/D1/.env.local/Top50K touch. |
