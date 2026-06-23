# Agent Sync Board

> Current external-state summary for active agents. Use baseline + delta updates:
> do not recheck Supabase / Stripe unless the task touches them, a related fault appears, or the recorded status is older than 30 days and the task depends on that platform.
> Never record API keys, service role keys, JWT secrets, session tokens, customer data, payment records, card data, or raw secret values.

Last updated: 2026-06-23 14:00:31 JST by Codex

## 1. 当前锁定状态

| Area | Status | Note |
|---|---|---|
| Repository docs | Active for Issue #11 DeepSeek Chinese overlay pilot branch | Recording DeepSeek Top 500 local artifacts/package and no Production/R2/D1/Preview deploy changes |
| Application code | PR #6 R2 shard lookup path + beta fallback | `/api/dictionary/lookup` is binding-ready for `DICTIONARY_R2` + optional `DICTIONARY_DB`; when bindings are absent or fail it keeps the bounded 1,000-entry beta fallback and `aiCalled=false` |
| Cloudflare | Production R2 shard lookup active | Production Pages config now has `DICTIONARY_R2` -> `baina-dictionary-artifacts` and `DICTIONARY_DB` -> `baina-dictionary`; canonical Production returns `dictionarySource=r2-shard` |
| Supabase | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| Stripe | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| DeepSeek | Called once for approved Top 500 retry | Offline batch only; first Top 500 attempt failed on yellow-light `zhGlosses` length, validator/prompt were fixed, one retry succeeded; normal lookup does not call AI by default |

## 2. GitHub 状态

| Item | Value |
|---|---|
| Repository | `domin132012-hash/baina-tango` |
| Current branch | `feat/dictionary-zh-deepseek-pilot-100` |
| Main latest hash at task start | `ebc320317e6ef212a38a53a603191c419aca527c` |
| Current task | Issue #11 DeepSeek Chinese gloss overlay pilot: Top 500 local artifacts only |
| Issue | `#11` AI-assisted Chinese gloss overlay pilot: DeepSeek Top 100 |
| PR #4 | `MERGED` `https://github.com/domin132012-hash/baina-tango/pull/4` |
| PR #4 merge commit | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Main latest hash after PR #4 | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Phase 2 branch | `feat/full-jmdict-import-spike` |
| Phase 2 PR | `https://github.com/domin132012-hash/baina-tango/pull/6` merged |
| Latest relevant commit | Phase A start commit `42f936cc07ad4897b4dfe0b739a39fd580761df7`; final Phase A branch head recorded in PR #10 / Issue #9 comments after closeout push |
| PR #2 | `MERGED`; merge commit `79a2b7e80d7b5c83062e24afba69ed66fcac3339` |
| This task | Issue #11 / PR #12 reviewed-r1 ChatGPT corrections generated locally; no R2/D1 write, no deploy, no overlay activation |
| Dictionary plan commit | `9622358aebaa9b3f7bafb2e1050750b69a8adc38` pushed to `origin/main` |
| External services touched - GitHub | PR #12 branch push after local validation; PR kept draft/open/unmerged. |
| External services touched - Cloudflare | No settings change; no Preview deploy; no Production change; no R2/D1 data write. Earlier Preview/Production binding ambiguity remains a blocker for any Cloudflare write. |
| External services touched - Google Cloud Translation | Official Translation API called offline for Top 100 Phase A only; `7,382` input chars; no runtime Google calls |
| External services touched - Supabase | Not touched |
| External services touched - Stripe | Not touched |
| External services touched - DeepSeek | No new DeepSeek call in this reviewed-r1 correction task; existing Top 500 retry usage remains the prior recorded provider event. |
| Current status | ChatGPT Round 1 reviewed-r1 artifacts generated locally: correction patch `docs/review/jmdict-zh-deepseek-pilot-500-chatgpt-review/chatgpt-review-round1-corrections.json`, candidate `docs/review/jmdict-zh-deepseek-pilot-500-overlay-candidate-reviewed-r1.json`, package `docs/review/jmdict-zh-deepseek-pilot-500-local-package-reviewed-r1/`. Counts: entries `500`, senses `841`, corrections `21`, false->true `9`, true->false `4`, gloss-only `8`, no action `19`, shouldDisplay true/false `762/79`, needs_human_review `30`, checksum `220e8a1276befa5524c51cb5dee9c2ff9b3713678d5fc19b683036a553b9d1d7`. Review-only, not production overlay, not uploaded to R2/D1, not deployed, not activated. |
| Current blocker | reviewed-r1 still needs further ChatGPT/reviewer review for P1 usageNote and high-frequency sampling before any activation decision. Any R2/D1 write, upload, deploy, overlay activation, PR ready transition, or merge still requires separate explicit approval. PR #12 must remain draft/open/unmerged until explicitly advanced. |

## 3. Cloudflare 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-22 01:04 JST after Production binding/runtime fix and docs-only deployment smoke |
| Touched by this task | Cloudflare Pages Project production binding config updated; Git-backed Production rebuild triggered. No R2/D1 data write, no D1 full import, no Stripe/Supabase/DeepSeek change |
| Needs recheck | No for current Production lookup result |
| Current blocker | None for dictionary R2 shard lookup; continue monitoring cost/traffic after Production traffic uses R2 |
| Production deployment | Latest validated during closeout: docs-only deployment `7ac71e04-bf01-4b71-9138-86f259b9703c`, source `942f1a2`; project-level bindings are active and canonical URL `https://baina-tango.pages.dev` returns `r2-shard` |
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
| Last checked | 2026-06-22 23:24 JST during PR #12 five-entry probe |
| Touched by this task | Yes; one offline DeepSeek request for `--probe-provider --probe-limit 5` |
| Needs recheck | Yes before any future Top 100 run; requires separate user approval |
| Current blocker | Five-entry probe succeeded, but no automatic Top 100 escalation is allowed |
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
| Issue #9 Chinese overlay pilot setup | Phase A review generated | 2026-06-22 12:58 JST: On branch `feat/dictionary-zh-overlay-pilot-100`, generated review artifact `docs/review/jmdict-zh-pilot-100-review.md` using Google Cloud Translation official API for Top 100 only. Translated entries `100`, translated senses `209`, estimated/actual chars `7,382`; usage ledger `docs/review/jmdict-zh-pilot-100-usage-ledger.json`; artifact size `46,686` bytes. Existing Preview `https://44dbffce.baina-tango.pages.dev` still returns `dictionarySource=r2-shard` for `食べられる`, count `1`, and required terms `aiCalled=false`. No runtime Google calls, no active zh overlay upload, no R2/D1 data write, no Production deploy/change, PR #10 kept draft/open/unmerged, `.env.local` ignored/untracked, billing prompt seen: no |
| Issue #11 DeepSeek probe-mode hardening | Pending probe approval | 2026-06-22 22:59 JST: On branch `feat/dictionary-zh-deepseek-pilot-100`, start commit `046b5d51f699d34ac34c10ea1dd50ee461ca4d88`; end commit is this closeout commit, exact SHA reported after push. Added non-thinking DeepSeek request body, safe last-failure debug file logic, strict parser diagnostics for empty/truncated content, and `--probe-provider --probe-limit 1` / `--probe-provider --probe-limit 5` with separate probe review/ledger paths. No DeepSeek API call this round, no Google Translate, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, `.env.local` ignored/untracked and not committed, `RIKA_PLAN.md` untracked and not staged, PR #12 kept draft/open/unmerged, billing prompt seen no. Validation passed: syntax, estimator, probe estimators, fixture tests, guardrails before sentinel `fetch`, runtime lookup static check, secret scan, and artifact scan. Remaining risk: next probe provider run requires separate approval and may incur cost; two earlier failed DeepSeek requests may already have cost. |
| Issue #11 DeepSeek one-entry probe | Passed | 2026-06-22 23:15 JST: On branch `feat/dictionary-zh-deepseek-pilot-100`, start commit `040fc9af3c47ec4da60517f3a447b1c21ff04de2`; end commit is this closeout commit, exact SHA reported after push. User approved only a 1-entry probe. Pre-run checks passed: repo/branch/PR, `.env.local` ignored/untracked, `DEEPSEEK_API_KEY_length=35`, required env values, syntax, estimator, fixture tests `16/16`, and guardrails before sentinel `fetch`. DeepSeek API called once only via `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --probe-provider --probe-limit 1`. Generated entries `1`, senses `2`, actual input tokens `1328`, actual output tokens `284`, review `docs/review/jmdict-zh-deepseek-probe-review.md`, ledger `docs/review/jmdict-zh-deepseek-probe-usage-ledger.json`; TextEdit open command executed. No 5-entry probe, no Top 100 retry, no automatic next phase. Google Translate no, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, PR #12 kept draft/open/unmerged, billing prompt seen no. |
| Issue #11 DeepSeek five-entry probe | Passed | 2026-06-22 23:24 JST: On branch `feat/dictionary-zh-deepseek-pilot-100`, start commit `c831285523c989800760bc2462ab8370e4c3bb93`; end commit is this closeout commit, exact SHA reported after push. User approved only a 5-entry probe after reviewing the 1-entry probe. Pre-run checks passed: repo/branch/PR, `.env.local` ignored/untracked, `DEEPSEEK_API_KEY_length=35`, syntax, estimator, 5-entry probe estimator, fixture tests `16/16`, and guardrails before sentinel `fetch`. DeepSeek API called once only via `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --probe-provider --probe-limit 5`. Generated entries `5`, senses `10`, actual input tokens `2228`, actual output tokens `1300`, review `docs/review/jmdict-zh-deepseek-probe-review.md`, ledger `docs/review/jmdict-zh-deepseek-probe-usage-ledger.json`; TextEdit open command executed. No Top 100 retry, no automatic next phase. Google Translate no, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, PR #12 kept draft/open/unmerged, billing prompt seen no. |
| Issue #11 DeepSeek specialized/rare sense rule fix | Passed locally | 2026-06-22 23:35 JST: On branch `feat/dictionary-zh-deepseek-pilot-100`, start commit `78b1085f74369e6b5809ce1f114522301693b6b4`; end commit is this closeout commit, exact SHA reported after push. User accepted 5 probe quality but found `平和 / ピンフ` mahjong sense incorrectly `shouldDisplay=true`. Fixed DeepSeek system/user prompt and docs so ordinary Japanese/EJU learners are prioritized; common learner-useful senses use `shouldDisplay=true`; mahjong, medical, legal, Buddhist, archaic, dialectal, rare-reading, and specialized senses default to `shouldDisplay=false` unless common learner-useful; correct translation alone is not enough; `shouldDisplay` means default visibility, not sense existence. Added `specialized` to allowed `issueFlags` and fixture coverage. No DeepSeek API call, no Google Translate, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, no PR ready/merge, `.env.local` not tracked/committed, `RIKA_PLAN.md` left untracked. Validation passed: `node --check`, `--self-test-json-fixtures` `17/17`, `--estimate-only`, guardrail sentinel matrix before external network, runtime lookup static check. Billing prompt seen no. |
| Issue #11 DeepSeek Top 100 provider run | Passed | 2026-06-22 23:52 JST: On branch `feat/dictionary-zh-deepseek-pilot-100`, start commit `aa85ed2becd9396d955e483f8f6a96f6352c05d1`; end commit is this closeout commit, exact SHA reported after push. User explicitly approved one Top 100 provider run after probe/rule review. Pre-run checks passed: repo path, branch, expected head, PR #12 draft/open/unmerged, `.env.local` ignored/untracked, `DEEPSEEK_API_KEY_length=35`, required env values, syntax, estimator, fixture tests `17/17`, guardrail sentinel matrix, runtime lookup static check. DeepSeek API called once only via `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider`; no automatic retry. Generated entries `100`, senses `209`, request count `5`, actual input tokens `30544`, actual output tokens `27411`, review `docs/review/jmdict-zh-deepseek-pilot-100-review.md`, ledger `docs/review/jmdict-zh-deepseek-pilot-100-usage-ledger.json`; TextEdit open command executed. Google Translate no, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, no PR ready/merge, billing prompt seen no. |
| Issue #11 DeepSeek Top 100 manual QA findings | Passed locally | 2026-06-23 00:04 JST: On branch `feat/dictionary-zh-deepseek-pilot-100`, start commit `711c1576fe2393789df31db5f3fd3e338d389011`; end commit is this closeout commit, exact SHA reported after push. User manually reviewed Top 100 and approved overall quality but blocked direct overlay activation. Added `docs/review/jmdict-zh-deepseek-pilot-100-qa-findings.md` with five QA items: two Bad, two Minor, and one shouldDisplay review group. No DeepSeek API call, no Google Translate, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, no PR ready/merge, `.env.local` not tracked/committed, `RIKA_PLAN.md` left untracked. Next step should be human-corrected review or overlay candidate; all deployment/data-write/ready/merge actions require separate approval. Billing prompt seen no. |

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
| 2026-06-22 10:00 JST | Issue #9 Chinese gloss overlay pilot opened draft PR #10 from branch `feat/dictionary-zh-overlay-pilot-100`; Preview deployment `16357ba6` passed existing English lookup smoke with `dictionarySource=r2-shard`, `食べられる` count `1`, required terms `aiCalled=false`, and no obvious console/API errors. Chinese overlay generation remains blocked because no dedicated MT provider is configured; translated entries `0`; no provider call, no R2/D1 data write, no Production change, no `RIKA_PLAN.md` touch, billing prompt seen: no. |
| 2026-06-22 12:58 JST | Issue #9 / PR #10 Phase A generated a local review artifact only: `docs/review/jmdict-zh-pilot-100-review.md` plus usage ledger. Google Cloud Translation official API was called offline for Top 100 only, translated entries `100`, estimated/actual chars `7,382`; no runtime lookup Google calls, no active zh overlay, no R2/D1 write, no Production deploy/change, PR #10 remains draft/open/unmerged, billing prompt seen: no. |
| 2026-06-22 17:42 JST | Issue #11 DeepSeek Chinese gloss overlay pilot scaffold checkpoint on `feat/dictionary-zh-deepseek-pilot-100`: start commit `950da0a02cb4d88d161f495a3ee031012b8dcd43`; end commit is this closeout commit, exact SHA reported after push. Added offline DeepSeek Top 100 estimator/guardrail scaffold and reserved review docs only. Validation passed: `node --check`, `--estimate-only`, and guardrail failures for missing key, missing approval, wrong provider, wrong model, max entries too low, and max input-token limit too low all exited before sentinel `fetch`; runtime dictionary lookup still returns `aiCalled=false` and does not import the DeepSeek pilot. External services touched: GitHub only for branch/PR after commit; DeepSeek API no, Google Translate no, R2/D1 writes no, Production deploy no, provider mode no, overlay activation no, billing prompt seen no. `.env.local` ignored/untracked and not committed; `RIKA_PLAN.md` untracked and not staged; no full JMdict XML/gz, KANJIDIC, SQLite/DB, R2 shard, or large generated artifact committed. Remaining risks: provider run still requires separate user approval and review; cost risk remains only a future approved DeepSeek run, with estimated cost not implemented in scaffold. |
| 2026-06-22 19:14 JST | Issue #11 / PR #12 approved DeepSeek Top 100 Phase A attempt on `feat/dictionary-zh-deepseek-pilot-100`: start commit `c6b3022829de1abff1e045509a2d685101556ff2`; end commit is this status commit, exact SHA reported after push. `.env.local` remained ignored/untracked and was not committed; only `DEEPSEEK_API_KEY_length=35` was printed. Pre-run validation passed: syntax check and estimator (`100` entries, `209` senses, `5` estimated requests, estimated input tokens `24870`, output tokens `28035`, total `52905`) stayed within guardrails. DeepSeek API was called only via `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider`, but the script stopped because the provider message content was not strict JSON. No malformed JSON was accepted, no AI review artifact was generated, and no usage ledger was written. External services touched: DeepSeek offline batch only and GitHub branch push after status update; Google Translate no, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, PR #12 kept draft/open/unmerged, billing prompt seen no. Remaining risks: actual provider token usage/cost unknown because no ledger was produced; a future retry needs a separate fix/approval path for strict JSON handling. |
| 2026-06-22 19:22 JST | Issue #11 / PR #12 strict JSON hardening on `feat/dictionary-zh-deepseek-pilot-100`: start commit `0b507ccb470855e8e5bcba0499e4a4f4de99560a`; end commit is this hardening commit, exact SHA reported after push. No DeepSeek API call this round, no Google Translate, no runtime AI call, no R2/D1 write, no Production deploy, no overlay activation, `.env.local` not read/printed/committed, PR #12 kept draft/open/unmerged. Changed script/prompt/docs/status only: unified provider schema to top-level `items`, kept request `response_format: { type: "json_object" }`, strengthened system/user prompt against Markdown/explanations, added strict parser fixture self-tests. Validation passed: `node --check`, estimator (`100` entries, `209` senses, `5` requests, estimated input `26272`, output `28035`, total `54307`), fixture tests `11/11`, guardrails all failed before sentinel `fetch`, and runtime lookup contains no DeepSeek/provider reference. Remaining risks: next provider run still needs separate approval; one prior failed DeepSeek request may have cost, final billing must be checked in DeepSeek console. |
| 2026-06-22 20:51 JST | Issue #11 / PR #12 approved DeepSeek Top 100 retry on `feat/dictionary-zh-deepseek-pilot-100`: start commit `b32d858f522acd0288b358eece6794c08c1d97aa`; end commit is this failure-ledger/status commit, exact SHA reported after push. Pre-run checks passed: repo/branch, `.env.local` ignored/untracked, `DEEPSEEK_API_KEY_length=35`, required env values silently verified, `node --check`, estimator (`100` entries, `209` senses, `5` requests, estimated input `26272`, output `28035`, total `54307`), fixture tests `11/11`, and guardrails failed before sentinel `fetch`. DeepSeek API was called once only via `node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider`; it failed again with `DeepSeek message content was not strict JSON.` No malformed JSON was accepted, no generated review artifact was written, no automatic retry was run. Safe failure ledger written to `docs/review/jmdict-zh-deepseek-pilot-100-usage-ledger.json` with no secrets and unknown actual tokens/cost. Google Translate no, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, PR #12 kept draft/open/unmerged, billing prompt seen no. Remaining risk: DeepSeek output still not strict JSON; future retry needs separate approval and may incur additional cost. |
| 2026-06-22 22:59 JST | Issue #11 / PR #12 probe-mode hardening on `feat/dictionary-zh-deepseek-pilot-100`: start commit `046b5d51f699d34ac34c10ea1dd50ee461ca4d88`; end commit is this closeout commit, exact SHA reported after push. No DeepSeek API call this round and no provider/probe execution. Added `thinking: { type: "disabled" }`, safe non-strict JSON debug metadata, prompt JSON example reinforcement, strict fixture coverage for empty/truncated/reasoning-content cases, and `--probe-provider --probe-limit 1` / `--probe-provider --probe-limit 5`. Top 100 direct retry is paused; next provider action requires separate approval for a minimum probe. Google Translate no, runtime AI calls `0`, R2/D1 writes `0`, Production deploy no, overlay activation no, `.env.local` not committed, PR #12 kept draft/open/unmerged, billing prompt seen no. |
| 2026-06-22 23:15 JST | Issue #11 / PR #12 one-entry DeepSeek provider probe on `feat/dictionary-zh-deepseek-pilot-100`: start commit `040fc9af3c47ec4da60517f3a447b1c21ff04de2`; end commit is this closeout commit, exact SHA reported after push. DeepSeek API called once only for `--probe-provider --probe-limit 1`, generated 1 entry / 2 senses, actual input tokens `1328`, actual output tokens `284`; review and usage ledger written under `docs/review/`. TextEdit open command executed. No 5-entry probe, no Top 100 retry, no Google Translate, no runtime AI calls, no R2/D1 write, no Production deploy, no overlay activation, `.env.local` not committed, PR #12 kept draft/open/unmerged, billing prompt seen no. |
| 2026-06-22 23:24 JST | Issue #11 / PR #12 five-entry DeepSeek provider probe on `feat/dictionary-zh-deepseek-pilot-100`: start commit `c831285523c989800760bc2462ab8370e4c3bb93`; end commit is this closeout commit, exact SHA reported after push. DeepSeek API called once only for `--probe-provider --probe-limit 5`, generated 5 entries / 10 senses, actual input tokens `2228`, actual output tokens `1300`; probe review and usage ledger updated under `docs/review/`. TextEdit open command executed. No Top 100 retry, no Google Translate, no runtime AI calls, no R2/D1 write, no Production deploy, no overlay activation, `.env.local` not committed, PR #12 kept draft/open/unmerged, billing prompt seen no. |
