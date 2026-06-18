# Dictionary Full Import Spike And 1,000-Entry Beta

Last updated: 2026-06-18 10:24 JST

This document covers the next phase after PR #4: moving from a JMdict small-sample MVP to a usable 1,000-entry English-only beta, while preserving the full, versioned D1/R2 import path. It does not import full JMdict into Production, does not apply Cloudflare D1/R2 settings, and does not commit full JMdict/KANJIDIC2 raw files or generated database artifacts.

## Issue #7 Cost-Safe Full JMdict Outcome

Issue #7 continued on draft PR #6 but did not execute a full normalized D1 import because of the Cloudflare billing/free-tier guardrail.

Cloudflare resources:

- R2 bucket / binding: `baina-dictionary-artifacts` / `DICTIONARY_R2`
- D1 database / binding: `baina-dictionary` / `DICTIONARY_DB`
- D1 database id: `5e8eeeda-0029-4c2e-958e-845ea0020c6e`
- Billing / paid prompt observed by Wrangler: no

R2 uploaded artifacts:

- `dictionary/raw/jmdict/2026-06-17/JMdict_e.gz`
- `dictionary/raw/jmdict/2026-06-17/JMdict_e.gz.sha256`
- `dictionary/raw/jmdict/2026-06-17/manifest.json`
- `dictionary/raw/jmdict/2026-06-17/import-estimate.json`

Official source:

- URL: `https://www.edrdg.org/pub/Nihongo/JMdict_e.gz`
- Last-Modified: `Wed, 17 Jun 2026 03:30:21 GMT`
- Source created date: `2026-06-17`
- SHA-256: `8feac9cc6eda31a737e5e89a4aa876189d16a49443bdde3a86ec6a85392ccf6d`
- Compressed size: `10,471,251` bytes
- Decompressed XML size: `62,606,784` bytes

Dry-run parser results:

- Entries: `217,554`
- Forms: `495,722`
- Senses: `251,759`
- English glosses: `438,777`
- Required terms found in source: `平和`, `学校`, `先生`, `問題`, `社会`, `生活`, `必要`, `考える`, `分かる`, `努力`, `食べる`, `読む`, `高い`
- AI-generated entries: no
- Chinese gloss generation: not done

Full normalized D1 estimate:

- Base rows: `965,038`
- Conservative rows written with current indexes: `2,425,795`
- Workers Free write allowance: `100,000` rows/day
- Estimated minimum free-tier import duration: `25` days
- D1 full import executed: no

Cost-safe recommendation:

1. Keep D1 for source/version/active metadata only, using `scripts/dictionary/d1-metadata-schema.sql`.
2. Generate R2 dictionary shards from official JMdict in a later task.
3. Lookup by exact surface/reading/deinflected candidates should read one to a few small R2 shards.
4. Keep the 1,000-entry beta as local/missing-binding fallback until R2 shards are deployed and Preview-validated.
5. Only revisit full normalized D1 import if the user explicitly approves billing or a multi-day free-tier import plan.

## Issue #5 Beta Outcome

PR #6 now includes a bounded JMdict-derived beta for Preview testing:

- Data module: `functions/api/dictionary/_beta-data.js`
- Entry count: `1,000`
- File size at generation time: about `500 KiB`
- Source URL: `https://www.edrdg.org/pub/Nihongo/JMdict_e.gz`
- Source created date: `2026-06-17`
- Source SHA-256: `8feac9cc6eda31a737e5e89a4aa876189d16a49443bdde3a86ec6a85392ccf6d`
- Source license / attribution: `Dictionary data: JMdict / EDRDG, CC BY-SA 4.0`
- Chinese gloss status: intentionally `null`

Generation command:

```sh
node scripts/dictionary/jmdict-import-spike.js \
  --input /tmp/baina-JMdict_e.gz \
  --out /tmp/baina-jmdict-beta-1000 \
  --beta-module functions/api/dictionary/_beta-data.js \
  --beta-count 1000
```

The beta entries are parsed from official JMdict XML. AI is not used to create, translate, paraphrase, or invent dictionary entries. The selection starts with required Issue #5 test terms, then fills with scored JMdict priority/common learner entries, preferring kanji/basic forms and excluding obvious adult-content glosses from this bounded learner beta.

Required local API tests passed for:

- `平和`
- `学校`
- `先生`
- `問題`
- `努力`
- `食べる`
- `読まなかった`
- `存在しない語`

All local API responses kept `aiCalled=false`.

## Summary Decision

Recommended path:

1. Use the committed 1,000-entry English-only beta for PR #6 Preview validation.
2. Store official raw source files and generated full artifacts in Cloudflare R2.
3. Parse JMdict locally or in a controlled build job into normalized tables.
4. Load lookup-critical structured rows into Cloudflare D1.
5. Generate a SQLite artifact from the same normalized data and store it in R2 for rollback, future app/offline use, and reproducible releases.
6. Keep the bounded beta or smaller fixture as runtime fallback until a D1 binding and active dictionary version are deployed.

This gives fast structured lookup for the website, durable artifact storage for traceability, and a future offline/app path without downloading the entire dictionary to browsers.

## Official Sources Checked

- EDRDG license statement: `https://www.edrdg.org/edrdg/licence.html`
- JMdict project/download documentation: `https://www.edrdg.org/jmdict/edict_doc_depr.html`
- EDRDG current download host: `https://www.edrdg.org/pub/Nihongo/JMdict_e.gz`
- KANJIDIC2 current download host: `https://www.edrdg.org/pub/Nihongo/kanjidic2.xml.gz`
- JMdict DTD reference: `https://www.edrdg.org/jmdict/jmdict_dtd_h.html`

Live check on 2026-06-17 JST:

- `JMdict_e.gz` over `https://www.edrdg.org/pub/Nihongo/JMdict_e.gz`
  - `Last-Modified: Wed, 17 Jun 2026 03:30:21 GMT`
  - compressed size: `10,471,251` bytes
  - local SHA-256: `8feac9cc6eda31a737e5e89a4aa876189d16a49443bdde3a86ec6a85392ccf6d`
  - XML header: `JMdict created: 2026-06-17`
  - decompressed size: `62,606,784` bytes
  - rough count: `217,554` entries, `251,760` senses, `231,559` kanji elements, `264,163` reading elements
- `kanjidic2.xml.gz` over `https://www.edrdg.org/pub/Nihongo/kanjidic2.xml.gz`
  - `Last-Modified: Wed, 17 Jun 2026 03:30:33 GMT`
  - compressed size: `1,488,570` bytes

Download note: `https://ftp.edrdg.org/...` returned a certificate host mismatch during this spike. `https://www.edrdg.org/pub/Nihongo/...` worked with a valid TLS check.

## What Is Not Recommended

- Do not commit full JMdict/KANJIDIC2 XML, gzip files, sharded JSON, or generated SQLite/D1 database artifacts to GitHub.
- Do not batch translate the whole dictionary into Chinese.
- Do not use AI to generate, translate, paraphrase, or invent dictionary entries for the beta.
- Do not use static sharded JSON as the primary website storage path for full data. It is harder to version-switch, query, and roll back cleanly at this scale.
- Do not use Supabase Postgres for the first full dictionary rollout unless D1 proves unsuitable. The current app already has Cloudflare Pages Functions, and dictionary lookup is read-heavy and edge-adjacent.
- Do not make AI the default lookup path. Full import should preserve the PR #4 behavior: dictionary first, `aiCalled=false` for hits and misses, optional user-triggered AI explain later.

## Data Flow

```text
official EDRDG download
  -> SHA-256 checksum + source created date
  -> raw gzip/XML stored in R2 under immutable version key
  -> local/build parse into normalized rows
  -> validation report and row-count diff
  -> D1 staging tables
  -> generated SQLite artifact stored in R2
  -> activate dictionary_versions row
  -> lookup API reads active D1 version
  -> rollback switches active_version_id to previous version
```

Suggested R2 keys:

```text
dictionary/raw/jmdict/2026-06-17/JMdict_e.gz
dictionary/raw/kanjidic2/2026-06-17/kanjidic2.xml.gz
dictionary/artifacts/jmdict/2026-06-17/jmdict.sqlite
dictionary/manifests/jmdict/2026-06-17/manifest.json
```

Suggested manifest fields:

- `source`
- `source_url`
- `source_created_date`
- `source_last_modified`
- `source_sha256`
- `artifact_sha256`
- `entry_count`
- `sense_count`
- `created_at`
- `license`
- `attribution_text`
- `previous_version_id`

## D1 Schema Direction

Draft schema is in `scripts/dictionary/d1-schema.sql`.

Minimum tables:

- `dictionary_sources`
- `dictionary_versions`
- `dictionary_entries`
- `dictionary_forms`
- `dictionary_senses`
- `dictionary_active_versions`
- `dictionary_lookup_cache`

Lookup path:

1. Normalize query.
2. Generate exact, reading, and deinflected candidates.
3. Query `dictionary_forms.form` and `dictionary_forms.reading`.
4. Join entries and senses for the active version.
5. Rank exact before reading before deinflected.
6. Return the same response shape as PR #4.

## Script Scaffold

Added:

- `scripts/dictionary/jmdict-import-spike.js`
- `scripts/dictionary/fixtures/sample-fixture.xml`
- `scripts/dictionary/d1-schema.sql`
- `functions/api/dictionary/_beta-data.js`

The script is dependency-free and validates the shape against a small XML fixture. It can also analyze a full `/tmp/JMdict_e.gz` file, write reports to `/tmp`, and emit a bounded 1,000-entry beta data module. Generated reports and full raw data are intentionally ignored by Git.

Production importer requirements before deployment:

- Replace regex extraction with a streaming XML parser.
- Resolve JMdict entities through the DTD or a checked entity map.
- Write staged D1 rows in chunks.
- Produce an R2 manifest and SQLite artifact.
- Compare counts against the previous active version.
- Fail closed on large count drops, missing license/source metadata, or checksum mismatch.

## Update Cadence

EDRDG project documentation states generated files are updated frequently/daily, and project guidance expects regular update procedures for dictionary servers and apps. For this site:

- Check source at least monthly before Production dictionary refresh.
- Keep every imported version addressable by immutable version id.
- Store source checksum and generated artifact checksum.
- Keep at least one previous active version for rollback.

## License / Attribution Requirements

Use the conservative policy already recorded in `DICTIONARY_LOOKUP_PLAN.md`:

- Display `Dictionary data: JMdict / EDRDG, CC BY-SA 4.0` on lookup UI and API responses.
- Store `license_url`, `source_url`, `source_version`, and `attribution_text` with every active version.
- Treat AI-generated Chinese glosses derived from JMdict glosses as CC BY-SA governed unless legal review decides otherwise.
- Keep English JMdict glosses in storage; never replace them with only AI Chinese text.

## Rollout Plan

1. Keep PR #6 draft for user Preview validation of the 1,000-entry beta.
2. In a later implementation PR, add D1/R2 bindings and a staging import command.
3. Import full JMdict into staging D1 and R2 outside Git.
4. Run lookup tests for:
   - `努力`
   - `平和`
   - `学校`
   - `先生`
   - `問題`
   - `食べる`
   - `読まなかった`
   - common kana-only terms
   - no-match input
5. Switch `/api/dictionary/lookup` from beta/static fallback to D1 active version.
6. Keep beta/static fallback when D1 binding or active version is unavailable.
7. Deploy Preview, then Production after user validation.

## Risks And Open Questions

- D1 row count and index size need a real import benchmark before committing to exact schema/index choices.
- Full XML import should use streaming parsing; reading full XML into memory is acceptable only for this local spike.
- The 1,000-entry beta selection is useful for display/search validation, but it is not a frequency-ranked or complete learner dictionary.
- Deinflection remains rule-based MVP; full Japanese morphology is a separate decision.
- KANJIDIC2 should be imported after JMdict lookup is stable, unless kanji detail becomes a blocking user feature.
- Chinese gloss generation needs a separate model evaluation and review workflow; do not start full translation in the import PR.
