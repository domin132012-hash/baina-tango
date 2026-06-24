# JMdict Chinese Overlay Top 1000 Reviewed-R2 Online Test Deploy Plan

- Task name: Deploy JMdict Chinese overlay Top 1000 reviewed-r2 for online user smoke test
- Branch: `feat/dictionary-zh-deepseek-pilot-100`
- Start commit: `963dfb860350c3a84471a056b81cdf227ae9b973`
- JST time: 2026-06-24 12:48
- PR: #12 draft / open / unmerged
- User approval: user explicitly approved publishing the current Top 1000 reviewed-r2 Chinese overlay for real production user-side testing.

## Source Artifacts

- Source candidate: `docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r2.json`
- Source local package: `docs/review/jmdict-zh-deepseek-pilot-1000-local-package-reviewed-r2/`
- Candidate status: `local_review_only_not_active`
- Reviewed version: `reviewed-r2`
- Candidate counts: `500` entries, `799` senses
- shouldDisplay true / false: `726` / `73`
- `needs_human_review` flags: `7`
- QA evidence:
  - `docs/review/jmdict-zh-deepseek-pilot-1000-chatgpt-review/chatgpt-review-round2-deep-review.md`: `PASS_WITH_LIMITED_REVIEW`
  - `docs/review/jmdict-zh-deepseek-pilot-1000-qa-summary-reviewed-r2.md`: `PASS_WITH_REVIEW`

## Existing Runtime Mechanism

1. Runtime查词是否只读overlay，不调用AI？
   - 普通查词接口 `/api/dictionary/lookup` 只读 `DICTIONARY_R2` / `DICTIONARY_DB` 或本地 beta fallback，响应固定 `aiCalled: false`。AI explain 是未来手动增强入口，普通查词不会调用 AI provider。
2. overlay shards 存在哪里？
   - 现有生产词典 shards 存在 Cloudflare R2 bucket `baina-dictionary-artifacts`。
3. active version metadata 存在哪里？
   - Cloudflare D1 database `baina-dictionary` 的 metadata-only tables：`dictionary_versions` 和 `dictionary_active_versions`。
4. 线上是否已有 active overlay？
   - 当前线上 active dictionary version 是 English-only R2 shard version `jmdict-english-r2-shards-2026-06-18`，manifest key `dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json`。中文 overlay 尚未 active。
5. 本次 version id
   - New version id: `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`
6. 是否需要 production deploy？
   - 不需要代码部署。当前前端已经显示 `chineseGloss` 字段；当前后端已经从 active R2 shards 返回 sense payload。只需发布新的 R2 shard version 并切 D1 active metadata。
7. 是否可以用 preview / canary / test flag 测试？
   - 未发现独立中文 overlay canary/test flag。项目状态记录显示 Preview / Production 字典绑定指向同一 R2/D1 资源；为避免误判隔离，本次使用 production active version 切换，并保留旧 active 版本作为回滚点。
8. production active overlay 如何回滚？
   - 回滚方式：把 `dictionary_active_versions.active_version_id` 切回 `jmdict-english-r2-shards-2026-06-18`，并将新版本 `dictionary_versions.status` 设为 `inactive` 或 `rolled_back`。旧 R2 version prefix 不会被覆盖或删除。
9. 本次是否影响所有用户？
   - 是。D1 active version 是 production 全局读取点；切换后所有生产用户普通查词会读取新 active R2 version。
10. 是否只影响 Top 1000 中已有词，其余词 fallback 原逻辑？
   - 是。新版本由当前 English-only active shards 拷贝生成，仅对 reviewed-r2 overlay 命中的 entry/sense 填入 `chineseGloss`；其他词条和未覆盖义项保持原 English-only payload。未命中词继续返回空结果且 `aiCalled: false`。

## Upload And Metadata Targets

- Upload target bucket: `baina-dictionary-artifacts`
- Upload target prefix: `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/`
- New manifest target: `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/manifest.json`
- New shard targets:
  - `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/shards/surface/<hash>.json`
  - `dictionary/shards/jmdict/jmdict-zh-deepseek-top1000-reviewed-r2-20260624/shards/reading/<hash>.json`
- Metadata target: D1 `baina-dictionary`
  - Insert/replace one `dictionary_versions` row for `jmdict-zh-deepseek-top1000-reviewed-r2-20260624`
  - Update one `dictionary_active_versions` row for `source_id='jmdict'`

## Activation Method

1. Back up current D1 active metadata to `/tmp/baina-pr12-old-active-version-20260624.json` and `/tmp/baina-pr12-old-active-version-20260624.sql`.
2. Download current active manifest and all 512 active R2 shard objects to `/tmp/baina-jmdict-zh-online-test-20260624/source/`.
3. Merge reviewed-r2 Chinese overlay into copied shard payloads by matching `entryId` to current R2 entry `id` / `jmdictEntryId`, preserving English glosses and source fields.
4. Write new manifest and 512 generated shards to `/tmp/baina-jmdict-zh-online-test-20260624/generated/`.
5. Upload the new immutable R2 version prefix. Do not overwrite the old prefix.
6. Insert D1 metadata for the new version and update active metadata to the new version.
7. Production smoke test canonical production URL and `/api/dictionary/lookup` samples.

## Expected User-Visible Behavior

- Top 1000 reviewed-r2 covered senses show Simplified Chinese glosses in the existing 查词 UI.
- `shouldDisplay=false` senses remain in API payload only as non-default visibility metadata if exposed by the current UI; default UI mode still limits displayed senses by existing `mode=basic` behavior.
- English JMdict glosses and EDRDG attribution remain visible.
- Non-covered words behave as before.
- Ordinary lookup responses keep `aiCalled: false`.

## Rollback Plan

Rollback SQL procedure:

```sql
UPDATE dictionary_versions
SET status = CASE
  WHEN id = 'jmdict-english-r2-shards-2026-06-18' THEN 'active'
  WHEN id = 'jmdict-zh-deepseek-top1000-reviewed-r2-20260624' THEN 'rolled_back'
  ELSE status
END,
rolled_back_at = CASE
  WHEN id = 'jmdict-zh-deepseek-top1000-reviewed-r2-20260624' THEN datetime('now')
  ELSE rolled_back_at
END
WHERE id IN ('jmdict-english-r2-shards-2026-06-18', 'jmdict-zh-deepseek-top1000-reviewed-r2-20260624');

UPDATE dictionary_active_versions
SET active_version_id = 'jmdict-english-r2-shards-2026-06-18',
    previous_version_id = 'jmdict-zh-deepseek-top1000-reviewed-r2-20260624',
    switched_at = datetime('now')
WHERE source_id = 'jmdict';
```

Wrangler rollback command:

```sh
npx wrangler d1 execute baina-dictionary --remote --file /tmp/baina-pr12-rollback-jmdict-zh-deepseek-top1000-reviewed-r2-20260624.sql
```

Rollback verification:

- Query `/api/dictionary/lookup?q=一冊&lang=zh&mode=all`; active `sourceVersion` should return `jmdict-english-r2-shards-2026-06-18`.
- Query `/api/dictionary/lookup?q=食べられる&lang=zh&mode=basic`; `dictionarySource` should remain `r2-shard`, count should remain `1`, and `aiCalled` should remain `false`.

## Smoke Test Checklist

- Production URL opens: `https://baina-tango.pages.dev`
- API smoke for 10 reviewed-r2 covered words:
  - shouldDisplay=true ordinary: `一冊`, `一字`, `一時間`, `一時的`, `一室`
  - shouldDisplay=false hidden/specialized: `一石`, `一手`
  - reviewed-r2 / risk queue: `営む`, `鋭い`, `越境`
- Fallback smoke for a non-covered term: `食べられる`
- Each API response:
  - status `200`
  - no raw HTML / raw JSON leakage in UI
  - `aiCalled: false`
  - `dictionarySource: r2-shard`
  - covered words expose Chinese `chineseGloss` where reviewed-r2 source has visible glosses
- Browser smoke:
  - 查词 UI opens
  - Chinese overlay is visible for a covered word
  - no console fatal errors if browser automation is available
  - no bad network responses if browser automation is available

## Risks

- This is a production active version switch and affects all users.
- No independent canary flag exists for Chinese overlay in current runtime.
- The source package is named Top 1000 but contains 500 entries / 799 senses for the reviewed-r2 batch; this plan does not expand beyond the reviewed-r2 package.
- `shouldDisplay=false` is preserved as metadata on senses; the current UI may not yet provide a specialized hidden-sense toggle beyond existing `mode=basic` truncation behavior.
- R2 upload touches 513 objects: 512 copied/merged shards plus manifest.

## Go / No-Go Decision

GO, with rollback guardrails:

- Existing runtime mechanism and rollback path are confirmed.
- Candidate/package validation passed.
- No AI provider calls are required.
- No old R2 objects are overwritten.
- D1 write scope is metadata-only.
- Production smoke test and rollback SQL are prepared before activation.
