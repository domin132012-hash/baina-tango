# JMdict Chinese Overlay Top 1000 Reviewed-R2 Online Test Deploy Validation Log

- Task name: Deploy JMdict Chinese overlay Top 1000 reviewed-r2 for online user smoke test
- Branch: `feat/dictionary-zh-deepseek-pilot-100`
- Start commit: `963dfb860350c3a84471a056b81cdf227ae9b973`
- Deployment operation end commit: `963dfb860350c3a84471a056b81cdf227ae9b973`
- JST time: 2026-06-24 13:43
- PR number: #12
- PR status: draft / open / unmerged
- User approval summary: user explicitly approved moving the secret backup file outside the repo and deploying the current Top 1000 reviewed-r2 Chinese overlay for real production user-side smoke testing.

## Secret Backup Handling

- Source file handled: `.env.local.backup.20260623-221154`
- Handling result: moved outside repo without reading or printing contents
- Destination: `/Users/domin/Desktop/baina-tango-secret-backups/.env.local.backup.20260623-221154`
- Destination permission: `600`
- Repo status after move: backup file no longer appeared in `git status --short`

## Source Artifacts

- Source candidate used: `docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json`
- Source package used: `docs/review/jmdict-zh-deepseek-pilot-1000-local-package-reviewed-r2/`
- Version id: `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`
- Source package counts: `500` entries, `799` senses
- shouldDisplay true / false: `726` / `73`
- `needs_human_review` flags: `7`
- QA evidence:
  - `docs/review/jmdict-zh-deepseek-pilot-1000-chatgpt-review/chatgpt-review-round2-deep-review.md`: `PASS_WITH_LIMITED_REVIEW`
  - `docs/review/jmdict-zh-deepseek-pilot-1000-qa-summary-reviewed-r2.md`: `PASS_WITH_REVIEW`

## Overlay Mechanism

1. Runtime 查词是否只读 overlay，不调用 AI？
   - Yes. `/api/dictionary/lookup` reads R2/D1 or fallback data and returns `aiCalled: false`; no provider call is part of ordinary lookup.
2. Overlay shards 存在哪里？
   - Cloudflare R2 bucket `baina-dictionary-artifacts`.
3. Active version metadata 存在哪里？
   - Cloudflare D1 database `baina-dictionary`, tables `dictionary_versions` and `dictionary_active_versions`.
4. 线上是否已有 active overlay？
   - Before this task, active version was English-only `jmdict-english-r2-shards-2026-06-18`; no active Chinese overlay.
5. 本次 Top 1000 reviewed-r2 version id
   - `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`
6. 是否需要 production deploy？
   - No Pages code deploy was required. The existing production code already reads active R2 shards and displays `chineseGloss`.
7. 是否可以用 preview/canary/test flag 测试？
   - No separate Chinese overlay canary/test flag was found. Project status records Preview and Production dictionary bindings as the same R2/D1 resources, so production active activation was used with rollback.
8. 回滚方式
   - Switch D1 `dictionary_active_versions.active_version_id` back to `jmdict-english-r2-shards-2026-06-18`; no old R2 objects were overwritten.
9. 是否影响所有用户？
   - Yes. D1 active metadata is the production global lookup switch.
10. 是否只影响 Top 1000 中已有词，其余词 fallback 原逻辑？
   - Yes. New shards were copied from the old active English shards and only reviewed-r2 matched senses received Chinese overlay fields. Non-covered entries remain English-only R2 results.

## Upload And Activation

- Upload target: `baina-dictionary-artifacts/dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/`
- Metadata target: D1 `baina-dictionary`
- Old active version: `jmdict-english-r2-shards-2026-06-18`
- Old active manifest: `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json`
- New active version: `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`
- New active manifest: `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/manifest.json`
- R2 paths written:
  - `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/manifest.json`
  - `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/shards/surface/<00..ff>.json`
  - `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/shards/reading/<00..ff>.json`
- R2 object write count: `513`
- D1 tables written: `dictionary_versions`, `dictionary_active_versions`
- D1 rows written: `5` rows reported by Wrangler
- D1 bookmark after activation: `00000016-00000006-00005094-f5640eb258310761d49b23313452fc0c`
- Production deploy happened: no Pages code deployment
- Production deployment URL / id: no new Cloudflare Pages deployment id; production URL is `https://baina-tango.pages.dev`
- Overlay activation: yes

## Rollback

- Rollback SQL file prepared: `/tmp/baina-pr12-rollback-jmdict-zh-deepseek-top1000-reviewed-r2-20260624.sql`
- Rollback command:

```sh
npx wrangler d1 execute baina-dictionary --remote --file /tmp/baina-pr12-rollback-jmdict-zh-deepseek-top1000-reviewed-r2-20260624.sql
```

- Rollback procedure:
  - Set `dictionary_versions.status='active'` for `jmdict-english-r2-shards-2026-06-18`.
  - Set `dictionary_versions.status='rolled_back'` for `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`.
  - Set `dictionary_active_versions.active_version_id='jmdict-english-r2-shards-2026-06-18'`.
  - Verify `/api/dictionary/lookup?q=食べられる&lang=zh&mode=basic` still returns `dictionarySource='r2-shard'` and `aiCalled=false`.

## Commands Run

- Secret backup handling:
  - `mkdir -p /Users/domin/Desktop/baina-tango-secret-backups`
  - `test -f .env.local.backup.20260623-221154`
  - `mv .env.local.backup.20260623-221154 /Users/domin/Desktop/baina-tango-secret-backups/`
  - `chmod 600 /Users/domin/Desktop/baina-tango-secret-backups/.env.local.backup.20260623-221154`
- Preflight:
  - `git fetch origin`
  - `git checkout feat/dictionary-zh-deepseek-pilot-100`
  - `git pull --ff-only origin feat/dictionary-zh-deepseek-pilot-100`
  - `git branch --show-current`
  - `git rev-parse HEAD`
  - `git status --short`
  - `gh pr view 12 --json number,state,isDraft,mergedAt,headRefName,baseRefName,headRefOid,url`
- Mechanism checks:
  - `sed` / `grep` reads of `package.json`, `wrangler.toml`, `functions/api/dictionary/lookup.js`, D1 schema, architecture docs, status docs
  - `npx wrangler d1 execute baina-dictionary --remote --command "SELECT ..."`
  - `npx wrangler r2 object get baina-dictionary-artifacts/dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json --remote --file /tmp/baina-active-jmdict-manifest.json`
- Local package validation:
  - `node /tmp/baina-pr12-validate-reviewed-r2-package.mjs /Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango`
- Build/upload/activation:
  - `node /tmp/baina-pr12-build-zh-r2-version.mjs /Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango build`
  - `node /tmp/baina-pr12-build-zh-r2-version.mjs /Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango upload`
  - `npx wrangler d1 execute baina-dictionary --remote --file /tmp/baina-pr12-activate-jmdict-zh-deepseek-top1000-reviewed-r2-20260624.sql`
- Online validation:
  - `curl -sS -I https://baina-tango.pages.dev/`
  - `node /tmp/baina-pr12-online-api-smoke.mjs`
  - temporary headless Chrome + `node /tmp/baina-pr12-ui-smoke.mjs`

## Command Output Summary

- Preflight: branch `feat/dictionary-zh-deepseek-pilot-100`; HEAD `963dfb860350c3a84471a056b81cdf227ae9b973`; PR #12 `OPEN`, draft, unmerged; worktree clean after moving secret backup.
- D1 old active metadata: active version `jmdict-english-r2-shards-2026-06-18`, rows written `0`.
- R2 old manifest: downloaded successfully; 512 shard objects; old total shard bytes `632,040,903`.
- Local package validation: PASS; checksum failures `0`; safety scan hits `0`.
- Build: downloaded `511` shards and reused `1` already downloaded shard after checksum verification; generated 512 shards; merged `500` unique entries / `799` unique senses; visible sense writes occurred only for `shouldDisplay=true`; hidden senses kept default `chineseGloss` empty and preserved metadata in `zhOverlay`.
- Upload: uploaded `513` R2 objects under the new immutable prefix.
- Remote manifest verification: remote manifest SHA matched local generated manifest; version, prefix, 512 shard index, and zhOverlay counts matched.
- First D1 activation attempt: failed safely because explicit SQL transaction statements are not accepted by D1 remote execution; follow-up queries confirmed active metadata remained unchanged and no new version row existed.
- Second D1 activation attempt: succeeded; `4` queries processed, `5` rows written.
- Production URL: HTTP `200`.

## Local Package Validation Result

- JSON parse: PASS
- Candidate entries: `500`
- Candidate senses: `799`
- Package manifest: present
- `shards/`: present, `16` local package shard files
- `checksum.txt`: present
- `validation.md`: present
- reviewed-r2 metadata: present
- shouldDisplay true/false: `726` / `73`
- `needs_human_review`: `7` issue flags
- QA result: `PASS_WITH_LIMITED_REVIEW` in Round 2 deep review; package QA summary `PASS_WITH_REVIEW`
- Provider raw response: not found by safety scan
- API key: not found by safety scan
- Authorization header: not found by safety scan
- `.env.local` content: not found by safety scan

## Online Smoke Test Result

- Production URL: `https://baina-tango.pages.dev`
- API smoke result: PASS, `12/12`
- Browser UI smoke result: PASS
- Runtime AI calls observed: `0`
- Raw HTML in API responses: no
- 500 responses: no
- Console fatal errors in browser smoke: `0`
- Network bad responses in browser smoke: `0`
- Blank page: no

## Tested Words

| Word | Category | Result |
|---|---|---|
| `一冊` | shouldDisplay=true ordinary | PASS: Chinese visible, `aiCalled=false` |
| `一字` | shouldDisplay=true ordinary | PASS: Chinese visible, `aiCalled=false` |
| `一時間` | shouldDisplay=true ordinary | PASS: Chinese visible, `aiCalled=false` |
| `一時的` | shouldDisplay=true ordinary | PASS: Chinese visible, `aiCalled=false` |
| `一室` | shouldDisplay=true ordinary | PASS: Chinese visible, `aiCalled=false` |
| `一石` | shouldDisplay=false hidden/specialized | PASS: hidden overlay metadata present, default Chinese not exposed |
| `一手` | shouldDisplay=false hidden/specialized | PASS: visible senses shown, hidden sense not exposed by default |
| `営む` | reviewed-r2 risk queue | PASS: needs_human_review metadata present, hidden senses not exposed by default |
| `鋭い` | reviewed-r2 risk queue | PASS: needs_human_review metadata present, hidden sense not exposed by default |
| `越境` | reviewed-r2 risk queue | PASS: hidden risk sense not exposed by default |
| `食べられる` | non-overlay R2 fallback | PASS: old R2 lookup still works, no Chinese overlay, `aiCalled=false` |
| `存在しない語` | miss fallback | PASS: empty entries, `canUseAiExplain=true`, `aiCalled=false` |

## Expected vs Actual Summary

- Expected: production lookup reads new active version.
  - Actual: D1 active version is `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`.
- Expected: reviewed-r2 visible senses display Chinese.
  - Actual: visible samples displayed Chinese; browser UI showed `中文: 一册；一本` for `一冊`.
- Expected: shouldDisplay=false senses are not default-exposed.
  - Actual: hidden samples had `hiddenDefaultExposed=0`; hidden metadata preserved under `zhOverlay`.
- Expected: ordinary lookup does not call AI.
  - Actual: all API smoke responses returned `aiCalled=false`; browser smoke did not click AI explain.
- Expected: non-covered words keep R2 fallback.
  - Actual: `食べられる` returned `dictionarySource=r2-shard`, entries `1`, no Chinese overlay.

## Git State At Log Creation

- `git status --short`:

```text
 M docs/tasks/hermes-long-run-plan.md
?? docs/review/jmdict-zh-deepseek-pilot-1000-online-test-deploy-plan.md
?? docs/review/jmdict-zh-deepseek-pilot-1000-online-test-deploy-validation-log.md
```

- `git diff --stat`:

```text
 docs/tasks/hermes-long-run-plan.md | 78 ++++++++++++++++++++------------------
 1 file changed, 41 insertions(+), 37 deletions(-)
```

- Changed files list at log creation:
  - `docs/tasks/hermes-long-run-plan.md`
  - `docs/review/jmdict-zh-deepseek-pilot-1000-online-test-deploy-plan.md`
  - `docs/review/jmdict-zh-deepseek-pilot-1000-online-test-deploy-validation-log.md`

## External Services

- DeepSeek calls: `0`
- Google Translate calls: `0`
- Runtime AI calls: `0`
- R2 writes: yes, `513` objects under `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/`
- D1 writes: yes, tables `dictionary_versions`, `dictionary_active_versions`, `5` rows written
- Preview deploy: no
- Production deploy: no Pages code deployment
- Overlay activation: yes
- GitHub push: yes, this validation/status update is pushed to PR #12 branch
- GitHub merge: no

## Secret / Safety Checks

- `.env.local` tracked? no
- `.env.local.backup` moved outside repo? yes
- API key printed? no
- Authorization header printed? no
- Secret scan: package scan clean; final git diff scan clean before commit
- Large file check: no large generated R2 shard, DB, SQLite, JMdict XML, or gzip committed
- JMdict XML/gz committed? no
- DB/SQLite committed? no
- Production R2 shard committed? no
- Provider raw response committed? no
- Full prompt raw input committed? no

## Validation Result

PASS.

## Remaining Risks

- Production active metadata affects all users because no separate Chinese overlay canary flag exists.
- Source artifact is named Top 1000 but contains the reviewed-r2 batch of `500` entries / `799` senses; this task did not expand beyond that package.
- Current UI still contains old text saying "1,000 词 English-only beta" / "中文释义尚未补全"; data now shows Chinese where available, but copy should be updated in a later UI-only task.
- Hidden-sense behavior is enforced by not writing hidden `chineseGloss`; a future UI can expose `zhOverlay.shouldDisplay=false` senses behind an explicit expand/control if desired.

## Remaining Cost Risks

- Normal lookup reads R2 shards and D1 metadata; no AI provider cost.
- R2 storage increased by one copied/merged shard version, about `634,049,333` bytes plus manifest.
- R2 Class A writes used: `513` object uploads.
- D1 rows written: `5`.

## Codex Interruption & Hermes Closeout

- Codex completed all deployment phases (Phase 0–7) but was interrupted by usage limit exhaustion before Phase 8 (update status docs) and Phase 9 (commit + push).
- Hermes took over on 2026-06-24 15:06 JST for read-only confirmation, document closeout, and commit + push only.
- Hermes did NOT: re-upload R2, re-write D1, re-activate overlay, re-deploy, call any AI provider, or modify reviewed-r2 content.
- Hermes read-only production smoke confirmed:
  - `一冊`: `dictionarySource=r2-shard`, `aiCalled=false`, `chineseGloss=['一册', '一本']`
  - `食べられる`: `dictionarySource=r2-shard`, `aiCalled=false`, entries=1
  - `存在しない語`: `dictionarySource=r2-shard`, `aiCalled=false`, entries=0, `canUseAiExplain=true`
- Hermes updated AGENT_SYNC_BOARD.md, AGENT_WORKLOG.md, PROJECT_STATUS.md, HANDOVER.md, docs/tasks/hermes-long-run-plan.md.
- Hermes committed and pushed all closeout files to `feat/dictionary-zh-deepseek-pilot-100`; PR #12 remains draft/open/unmerged.

## Next Step

- Let the user test real production 查词 display for the reviewed-r2 sample set.
- If quality is accepted, plan a UI-copy update so the lookup page no longer describes the data as English-only.
- Keep PR #12 draft / open / unmerged until a separate merge approval.
