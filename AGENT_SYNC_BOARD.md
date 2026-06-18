# Agent Sync Board

> Current external-state summary for active agents. Use baseline + delta updates:
> do not recheck Supabase / Stripe unless the task touches them, a related fault appears, or the recorded status is older than 30 days and the task depends on that platform.
> Never record API keys, service role keys, JWT secrets, session tokens, customer data, payment records, card data, or raw secret values.

Last updated: 2026-06-18 13:10 JST by Codex

## 1. 当前锁定状态

| Area | Status | Note |
|---|---|---|
| Repository docs | Locked for Issue #8 R2 sharded lookup closeout | Updating R2 shard format, D1 metadata-only status, cost guardrail, and PR #6 draft warnings |
| Application code | PR #6 R2 shard lookup path + beta fallback | `/api/dictionary/lookup` is binding-ready for `DICTIONARY_R2` + optional `DICTIONARY_DB`; when bindings are absent or fail it keeps the bounded 1,000-entry beta fallback and `aiCalled=false` |
| Cloudflare | R2 shards uploaded; D1 metadata active; D1 full import still forbidden | R2 bucket `baina-dictionary-artifacts` contains 2026-06-18 JMdict English shard version; D1 database `baina-dictionary` stores only source/version/active metadata, not full entries/forms/senses |
| Supabase | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| Stripe | Not touched in this task | Existing baseline carried forward; no dashboard/API recheck |
| DeepSeek | Not touched in this task | No backend, secret, or API changes; normal lookup does not call AI by default |

## 2. GitHub 状态

| Item | Value |
|---|---|
| Repository | `domin132012-hash/baina-tango` |
| Current branch | `feat/full-jmdict-import-spike` |
| Main latest hash at task start | `caca731cd961d68216395e8b57b4bce7cb02202a` |
| Current task | Issue #8 R2 sharded dictionary lookup + D1 metadata |
| Issue | `#8` `[AGENT-TASK] Dictionary full lookup via R2 shards + D1 metadata` |
| PR #4 | `MERGED` `https://github.com/domin132012-hash/baina-tango/pull/4` |
| PR #4 merge commit | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Main latest hash after PR #4 | `c340f75a5f8cf51dac691732a9c66e50cd22af09` |
| Phase 2 branch | `feat/full-jmdict-import-spike` |
| Phase 2 draft PR | `https://github.com/domin132012-hash/baina-tango/pull/6` open draft; do not merge |
| Latest relevant commit | `c340f75` Merge pull request #4 from `feat/dictionary-lookup-mvp` |
| PR #2 | `MERGED`; merge commit `79a2b7e80d7b5c83062e24afba69ed66fcac3339` |
| This task | Cost-safe continuation from PR #6: full JMdict English-only R2 shards generated/uploaded from official JMdict, D1 metadata-only active version written, D1 full import not executed |
| Dictionary plan commit | `9622358aebaa9b3f7bafb2e1050750b69a8adc38` pushed to `origin/main` |
| External services touched - GitHub | Issue #8 comments and PR #6 closeout pending after final commit; PR #6 remains draft |
| External services touched - Cloudflare | Uploaded R2 shard manifest + 512 shard objects under `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/`; wrote D1 metadata schema/active version only; no D1 full import |
| External services touched - Supabase | Not touched |
| External services touched - Stripe | Not touched |
| External services touched - DeepSeek | Not touched |
| Current status | Official JMdict source `2026-06-18` parsed into R2 shards: `217,564` entries / `495,748` forms / `251,778` senses, source SHA-256 `77cc98c43209d56e2ad44438a61ca02ce081ff083c58c5e87e4bc288cd860610`. R2 shard API path passed local binding mock validation for all Issue #8 required queries; Preview binding validation still depends on Cloudflare Pages binding availability. |
| Current blocker | Do not execute D1 full import. Do not mark PR #6 ready, merge PR #6, or close Issue #8 until user validation/approval. |

## 3. Cloudflare 状态

| Field | Value |
|---|---|
| Last checked | 2026-06-18 13:10 JST during Issue #8 R2 shard upload + D1 metadata write |
| Touched by this task | R2 remote shard upload, D1 metadata schema/active-version writes, read-only R2/D1 verification; no paid prompt observed |
| Needs recheck | Yes before adding active Pages bindings or promoting PR #6 out of draft |
| Current blocker | Full D1 import exceeds Workers Free `100,000` rows written/day in one pass |
| Production deployment | `8f0ef91f-4dbb-4f21-a5f8-1dfcc66c5367`, source `c340f75`, URL `https://baina-tango.pages.dev`, Active |
| Previous app merge deployment | `1c5b2430-6b20-4334-8e04-e9fb2243dbca`, source `79a2b7e` |
| PR #2 Preview deployment | `7a85773e-6a2d-44e6-92e2-a8aed5520b7d`, source `dea412c` |
| PR #4 Preview deployment | `8c882ad2-3432-4d21-a422-be0357eedb19`, source `c294976`, URL `https://8c882ad2.baina-tango.pages.dev`, branch URL `https://feat-dictionary-lookup-mvp.baina-tango.pages.dev`, status successful |
| PR #6 Preview deployment | Latest before Issue #8 closeout remained `dadf54bc-2573-48e0-9468-91f8ce368ea8`, source `adf5f67`; new deployment pending final push |
| R2 dictionary bucket | `baina-dictionary-artifacts`; raw/checksum/manifest/estimate keys under `dictionary/raw/jmdict/2026-06-17/`; active shard keys under `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/` |
| D1 dictionary database | `baina-dictionary`, id `5e8eeeda-0029-4c2e-958e-845ea0020c6e`; metadata-only tables `dictionary_sources`, `dictionary_versions`, `dictionary_active_versions`; active version `jmdict-english-r2-shards-2026-06-18`; full import not executed |
| Planned dictionary bindings | `DICTIONARY_R2` and `DICTIONARY_DB`; lookup API is binding-ready, but `wrangler.toml` active bindings remain avoided until Pages binding config is safely verified |
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
