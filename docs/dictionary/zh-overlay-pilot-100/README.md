# Chinese Gloss Overlay Pilot 100

Status: blocked before translation provider call.

This folder contains the Top 100 Chinese gloss overlay pilot input batch for the existing full JMdict R2 shard dictionary. It is not a full JMdict translation and it does not rewrite English shards.

## Current Output

- Overlay version: `jmdict-zh-machine-pilot-100-2026-06-22`
- Target R2 prefix after translation/review: `dictionary/zh-overlays/jmdict-zh-machine-pilot-100-2026-06-22/`
- Translation input: `translation-input.json`
- Selected entries: `100`
- Required seed terms missing: `0`
- Estimated English characters to translate: `7,382`
- Provider used: none
- Billing prompt seen: no

## Blocked Reason

The repository and local machine have AI/LLM-related keys configured, but no dedicated machine translation provider configuration was found for a dictionary gloss overlay. Per task rules, no unofficial API, guessed provider, runtime AI translation, or LLM teacher explanation was used.

The adapter skeleton is available at:

```sh
node scripts/dictionary/jmdict-zh-overlay-provider-adapter.js --input docs/dictionary/zh-overlay-pilot-100/translation-input.json
```

It currently stops with a blocked report unless a dedicated machine translation provider is explicitly selected and configured.

## Provider Configuration Needed

Choose and approve one dedicated machine translation provider before generating Chinese glosses:

- `BAINA_ZH_MT_PROVIDER=deepl` with `DEEPL_API_KEY`
- or `BAINA_ZH_MT_PROVIDER=google_cloud_translate` with `GOOGLE_CLOUD_TRANSLATE_API_KEY`

Before any provider call, confirm billing/quota/cost guardrails. Do not commit provider keys or generated secrets.

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

## Runtime Plan After Provider Is Approved

1. Translate only the 100 selected entries from `translation-input.json`.
2. Build a small overlay artifact under `dictionary/zh-overlays/jmdict-zh-machine-pilot-100-2026-06-22/`.
3. Store only zh overlay metadata/active version in D1 if needed.
4. Keep English R2 shards unchanged.
5. Update lookup runtime to merge overlay Chinese glosses when present.
6. If overlay is missing or fails, return English-only R2 result with `aiCalled=false`.
7. Validate in Cloudflare Preview first; do not deploy Production without explicit approval.
