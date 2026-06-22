# Chinese Gloss Overlay Pilot 100

Status: Phase A review artifact generated.

This folder contains the Top 100 Chinese gloss overlay pilot input batch for the existing full JMdict R2 shard dictionary. It is not a full JMdict translation and it does not rewrite English shards.

## Current Output

- Overlay version: `jmdict-zh-machine-pilot-100-2026-06-22`
- Target R2 prefix after translation/review: `dictionary/zh-overlays/jmdict-zh-machine-pilot-100-2026-06-22/`
- Translation input: `translation-input.json`
- Review artifact: `docs/review/jmdict-zh-pilot-100-review.md`
- Usage ledger: `docs/review/jmdict-zh-pilot-100-usage-ledger.json`
- Selected entries: `100`
- Required seed terms missing: `0`
- Estimated English characters to translate: `7,382`
- Actual provider input characters: `7,382`
- Provider used: `google_cloud_translate`
- Translated entries: `100`
- Translated senses: `209`
- Translation status: `machine_translated`
- Review status: `unreviewed`
- Billing prompt seen: no

## Phase A Scope

Phase A generated a local review artifact only. It did not activate Chinese overlay lookup behavior and did not upload an active zh overlay to R2.

The provider adapter is available at:

```sh
node scripts/dictionary/jmdict-zh-overlay-provider-adapter.js \
  --input docs/dictionary/zh-overlay-pilot-100/translation-input.json \
  --review-out docs/review/jmdict-zh-pilot-100-review.md \
  --ledger-out docs/review/jmdict-zh-pilot-100-usage-ledger.json
```

Required guardrails:

- `GOOGLE_TRANSLATE_API_KEY` must be supplied from local secret state.
- `BAINA_ZH_MT_APPROVE_RUN=YES_TOP_100_ONLY`
- `BAINA_ZH_MT_MAX_ENTRIES=100`
- `BAINA_ZH_MT_MAX_CHARS=10000`

Do not commit provider keys or generated secrets. Runtime lookup must not call Google Translate.

## Required Output Shape After Provider Translation

Each translated sense must preserve:

- `entryId`
- `senseIndex` / `senseId`
- `originalEnglishGlosses`
- `chineseGlosses`
- `translationStatus: "machine_translated"`
- `reviewStatus: "unreviewed"`
- `providerName`
- `sourceDictionaryVersion`
- `zhOverlayVersion`
- `generatedAt`

Do not overwrite English glosses, merge unrelated senses, invent senses, add examples, or use runtime AI translation during lookup.

## Runtime Plan After Review Is Approved

1. User reviews `docs/review/jmdict-zh-pilot-100-review.md`.
2. After separate explicit Phase B approval, build a small overlay artifact under `dictionary/zh-overlays/jmdict-zh-machine-pilot-100-2026-06-22/`.
3. Store only zh overlay metadata/active version in D1 if needed.
4. Keep English R2 shards unchanged.
5. Update lookup runtime to merge overlay Chinese glosses when present.
6. If overlay is missing or fails, return English-only R2 result with `aiCalled=false`.
7. Validate in Cloudflare Preview first; do not deploy Production without explicit approval.
