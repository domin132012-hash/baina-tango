# DeepSeek AI Chinese Gloss Overlay Pilot

Status: scaffolding only. No DeepSeek API call has been made for this branch.

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

Prompt file: `scripts/dictionary/prompts/jmdict-zh-deepseek-system.md`.

## Output Schema

Each returned sense must validate against:

```json
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
```

The validator also checks that the output contains exactly one object per input sense and no extra entry/sense keys.

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
