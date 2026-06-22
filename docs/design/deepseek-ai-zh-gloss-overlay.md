# DeepSeek AI Chinese Gloss Overlay Pilot

Status: scaffold plus strict JSON hardening. One approved DeepSeek Top 100 provider attempt was made on 2026-06-22 JST and stopped because the provider message content was not strict JSON.

## Goal

This pilot creates a separate AI-assisted offline workflow for Simplified Chinese learner gloss candidates over the existing JMdict Top 100 pilot input.

It replaces the rejected Google MT baseline as a review path, but it does not activate runtime Chinese overlay lookup.

## Scope

- Provider: DeepSeek official API.
- Model: `deepseek-v4-flash`.
- Input: `docs/dictionary/zh-overlay-pilot-100/translation-input.json`.
- Output after a separately approved run: `docs/review/jmdict-zh-deepseek-pilot-100-review.md`.
- Runtime lookup: unchanged, English R2 shard lookup first, `aiCalled=false`.
- R2/D1: no write during this scaffolding task.
- Production: unchanged.

## Execution Guardrails

Provider execution is only allowed through the offline batch script:

```sh
node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider
```

The script must abort before any provider network call unless all of these are true:

- `BAINA_ZH_AI_PROVIDER=deepseek`
- `DEEPSEEK_API_KEY` exists
- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-v4-flash`
- `BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_100_ONLY`
- `BAINA_ZH_AI_MAX_ENTRIES=100`
- `BAINA_ZH_AI_MAX_INPUT_TOKENS=30000`
- `BAINA_ZH_AI_MAX_OUTPUT_TOKENS=30000`
- `BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS=60000`
- `BAINA_ZH_AI_MAX_REQUESTS=100`

The script prints only `DEEPSEEK_API_KEY_length=<number>` during approved provider execution. It never prints the key value and never writes the key or key-derived content to committed files.

Without `--run-provider`, the script only estimates tokens and makes no provider call.

## Prompt Policy

The prompt asks the model to act as a Japanese-Chinese learner dictionary editor, not as a mechanical English translator.

The prompt requires:

- concise natural Simplified Chinese dictionary glosses
- Japanese form, reading, sense index, and JMdict English glosses as evidence
- no invented Japanese forms
- preserved `entryId` and `senseIndex`
- ambiguity resolution from Japanese dictionary context
- `counter` as 助数词 / 量词 when appropriate
- `matter` in こと/事 contexts as 事情 / 事项 / 情况, not 物质
- `follow` meaning understand as 理解 / 听懂 / 跟得上, not 跟随
- `shouldDisplay=false` for rare, archaic, dialectal, or learner-unfriendly entries
- `confidence=low` with `issueFlags` when uncertain
- strict JSON only
- no Markdown
- no fenced ```json code block
- no explanation text, preface, or afterword
- exactly one top-level JSON object with an `items` array

Prompt file: `scripts/dictionary/prompts/jmdict-zh-deepseek-system.md`.

## Output Schema

The top-level response must validate against:

```json
{
  "items": [
    {
      "entryId": "string",
      "writtenForm": "string",
      "reading": "string",
      "senseIndex": 1,
      "shortGloss": "string",
      "zhGlosses": ["string"],
      "usageNote": "string",
      "shouldDisplay": true,
      "confidence": "high|medium|low",
      "issueFlags": ["none|wrong_sense_risk|too_rare|archaic|dialect|ambiguous|needs_human_review"],
      "reviewStatus": "ai_generated_unreviewed",
      "provider": "deepseek",
      "model": "deepseek-v4-flash"
    }
  ]
}
```

The validator also checks that the output contains exactly one object per input sense and no extra entry/sense keys. It fails if the provider returns Markdown fences, trailing explanatory text, an array without the top-level `items` object, missing fields, invalid enum values, mismatched `entryId`, mismatched `senseIndex`, duplicate senses, omitted senses, or extra senses.

## Provider JSON Mode

The offline script sends the OpenAI-compatible request field:

```json
{
  "response_format": { "type": "json_object" }
}
```

This is a request-side JSON output hint. The script still treats the provider response as untrusted evidence and validates the returned message content with strict `JSON.parse` plus schema checks before writing any review artifact or usage ledger.

## First Provider Attempt Result

The first approved DeepSeek Top 100 provider attempt stopped before artifact generation because the provider message content was not strict JSON. The script did not accept malformed JSON, did not guess fields, did not recover partial natural-language output, did not write the review artifact, and did not write a usage ledger.

Any next provider run requires separate user approval after reviewing this guardrail behavior. One failed DeepSeek request may already have incurred usage cost; exact usage and billing remain the DeepSeek console's source of truth because the failed attempt did not produce a local usage ledger.

## Usage Ledger

The offline script writes a local usage ledger after an approved provider run:

- timestamp
- provider
- model
- entries requested
- senses requested
- estimated input tokens
- estimated output tokens
- actual input tokens if available
- actual output tokens if available
- estimated cost
- request count

The ledger must not contain API keys or secret-derived content.

## Non-Goals

- No runtime DeepSeek calls.
- No runtime Google calls.
- No active Chinese overlay upload.
- No R2 shard rewrite.
- No D1 full import.
- No Production change.
- No merge or ready transition without explicit user approval.

## Phase Plan

1. Scaffolding: add offline script, prompt, validation, estimator, ledger writer, review writer, and this design doc.
2. Separately approved DeepSeek Top 100 run: generate review artifact only.
3. Human review: user edits or approves the review artifact.
4. Separate Phase B approval: build a small zh overlay artifact for reviewed entries.
5. Preview-only runtime integration: merge reviewed zh overlay with English R2 lookup while preserving English fallback and `aiCalled=false`.
6. Production remains untouched until explicit Production approval.
