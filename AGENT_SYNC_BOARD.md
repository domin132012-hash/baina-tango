# Agent Sync Board

> Current external-state summary for active agents. Use baseline + delta updates:
> do not recheck Supabase / Stripe unless the task touches them, a related fault appears, or the recorded status is older than 30 days and the task depends on that platform.
> Never record API keys, service role keys, JWT secrets, session tokens, customer data, payment records, card data, or raw secret values.

Last updated: 2026-06-22 00:06 JST by Codex

## 1. 当前锁定状态

| Area | Status | Note |
|---|---|---|
| Repository docs | Locked for PR #6 final pre-merge cleanup | Recording active Preview bindings, r2-shard validation PASS, ready-for-review state, cost guardrail, and merge-approval warning |
| Application code | PR #6 R2 shard lookup path + beta fallback | `/api/dictionary/lookup` is binding-ready for `DICTIONARY_R2` + optional `DICTIONARY_DB`; when bindings are absent or fail it keeps the bounded 1,000-entry beta fallback and `aiCalled=false` |
| Cloudflare | R2 shards uploaded; D1 metadata active; Preview R2 shard lookup passed | Preview `DICTIONARY_R2` / `DICTIONARY_DB` bindings are active; Branch Preview returns `dictionarySource=r2-shard`, `食べられる` count `1`, and all required terms `aiCalled=false` |
| Supabase | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| Stripe | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| DeepSeek | Not touched in this task | No backend, secret, or API changes; normal lookup does not call AI by default |

## 2. GitHub 状态

| Item | Value |
|---|---|
| Repository | `domin132012-hash/baina-tango` |
| Current branch | `feat/full-jmdict-import-spike` |
| Main latest hash at task start | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Current task | PR #6 docs/title cleanup and final pre-merge verification after user Preview validation |
| Issue | `#8` `[AGENT-TASK] Dictionary full lookup via R2 shards + D1 metadata` |
| PR #4 | `MERGED` `https://github.com/domin132012-hash/baina-tango/pull/4` |
| PR #4 merge commit | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Main latest hash after PR #4 | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Phase 2 branch | `feat/full-jmdict-import-spike` |
| Phase 2 PR | `https://github.com/domin132012-hash/baina-tango/pull/6` open, ready for review, not merged; merge requires explicit user approval |
| Latest relevant commit | PR #6 docs/title cleanup commit; exact end commit recorded in PR #6 final verification comment after push |
| PR #2 | `MERGED`; merge commit `79a2b7e80d7b5c83062e24afba69ed66fcac3339` |
| This task | Cost-safe continuation from PR #6: full JMdict English-only R2 shards generated/uploaded from official JMdict, D1 metadata-only active version written, D1 full import not executed |
| Dictionary plan commit | `9622358aebaa9b3f7bafb2e1050750b69a8adc38` pushed to `origin/main` |
| External services touched - GitHub | PR #6 title/body updated, final verification comment posted, docs-only branch commit pushed; PR #6 remains unmerged |
| External services touched - Cloudflare | Not touched in this status closeout fix. Prior PASS validation used Preview deployment `bde77489-e786-4764-9b55-8e9154cb9605`, source `fb7d58a`; Production was unchanged. |
| External services touched - Supabase | Not touched |
| External services touched - Stripe | Not touched |
| External services touched - DeepSeek | Not touched |
| Current status | Official JMdict source `2026-06-18` is uploaded as R2 shards and D1 metadata-only active version remains present. Preview bindings are active: Branch Preview at source `fb7d58a` returned `dictionarySource=r2-shard`; `食べられる` returned count `1`; all required terms returned `aiCalled=false`; Production remained unchanged. |
| Current blocker | Preview R2 shard lookup passed and PR is ready for review; merge still requires explicit user approval. Do not execute D1 full import or change Production without a separate approved plan. |

## 3. Cloudflare 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-22 00:06 JST during final pre-merge check; Branch Preview API still returned `dictionarySource=r2-shard`, `食べられる` count `1`, and all required terms `aiCalled=false` |
| Touched by this task | Repository status docs and GitHub PR metadata/comment only; no Cloudflare, R2, D1, or Production operation |
| Needs recheck | Yes before changing Production or after any new app-code commit |
| Current blocker | Merge requires explicit user approval; D1 full import remains prohibited without a separate cost-safe plan |
| Production deployment | `8f0ef91f-4dbb-4f21-a5f8-1dfcc66c5367`, source `c340f75`, URL `https://baina-tango.pages.dev`, Active |
| Previous app merge deployment | `1c5b2430-6b20-4334-8e04-e9fb2243dbca`, source `79a2b7e` |
| PR #2 Preview deployment | `7a85773e-6a2d-44e6-92e2-a8aed5520b7d`, source `dea412c` |
| PR #4 Preview deployment | `8c882ad2-3432-4d21-a422-be0357eedb19`, source `c294976`, URL `https://8c882ad2.baina-tango.pages.dev`, branch URL `https://feat-dictionary-lookup-mvp.baina-tango.pages.dev`, status successful |
| PR #6 Preview deployment | Latest validated PASS deployment `bde77489-e786-4764-9b55-8e9154cb9605`, source `fb7d58a`, URL `https://bde77489.baina-tango.pages.dev`, branch URL `https://feat-full-jmdict-import-spik.baina-tango.pages.dev`; Branch Preview returns `dictionarySource=r2-shard` |
| R2 dictionary bucket | `baina-dictionary-artifacts`; raw/checksum/manifest/estimate keys under `dictionary/raw/jmdict/2026-06-17/`; active shard keys under `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/` |
| D1 dictionary database | `baina-dictionary`, id `5e8eeeda-0029-4c2e-958e-845ea0020c6e`; metadata-only tables `dictionary_sources`, `dictionary_versions`, `dictionary_active_versions`; active version `jmdict-english-r2-shards-2026-06-18`; full import not executed |
| Planned dictionary bindings | Preview/branch binding target is active: `DICTIONARY_R2` -> R2 bucket `baina-dictionary-artifacts`, `DICTIONARY_DB` -> D1 database `baina-dictionary`; optional manifest key remains `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json` |
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
