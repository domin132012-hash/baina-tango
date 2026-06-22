# DeepSeek AI Chinese Gloss Overlay Pilot

Status: scaffold plus strict JSON hardening plus minimum provider probe mode. Two approved DeepSeek Top 100 provider attempts were made on 2026-06-22 JST; both stopped because the provider message content was not strict JSON. Top 100 must not be directly retried again without a separate user decision after a 1-entry or 5-entry provider probe.

## Goal

This pilot creates a separate AI-assisted offline workflow for Simplified Chinese learner gloss candidates over the existing JMdict Top 100 pilot input.

It replaces the rejected Google MT baseline as a review path, but it does not activate runtime Chinese overlay lookup.

## Scope

- Provider: DeepSeek official API.
- Model: `deepseek-v4-flash`.
- Input: `docs/dictionary/zh-overlay-pilot-100/translation-input.json`.
- Output after a separately approved Top 100 run: `docs/review/jmdict-zh-deepseek-pilot-100-review.md`.
- Output after a separately approved probe run: `docs/review/jmdict-zh-deepseek-probe-review.md`.
- Runtime lookup: unchanged, English R2 shard lookup first, `aiCalled=false`.
- R2/D1: no write during this scaffolding task.
- Production: unchanged.

## Execution Guardrails

Provider execution is only allowed through the offline batch script. Top 100 execution remains available only for a separately approved run, but it should not be the next step after the two strict JSON failures:

```sh
node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider
```

The next provider step must be a separately approved minimum probe, not another direct Top 100 run:

```sh
node scripts/dictionary/jmdict-zh-deepseek-pilot.js --probe-provider --probe-limit 1
node scripts/dictionary/jmdict-zh-deepseek-pilot.js --probe-provider --probe-limit 5
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

Without `--run-provider` or `--probe-provider`, the script only estimates tokens and makes no provider call. Probe mode uses the same provider guardrails and schema validation as Top 100 mode, but restricts the selected input to exactly 1 or 5 entries.

## Prompt Policy

The prompt asks the model to act as a Japanese-Chinese learner dictionary editor for ordinary Japanese learners and EJU learners, not as a mechanical English translator.

The prompt requires:

- concise natural Simplified Chinese dictionary glosses
- Japanese form, reading, sense index, and JMdict English glosses as evidence
- no invented Japanese forms
- preserved `entryId` and `senseIndex`
- ambiguity resolution from Japanese dictionary context
- `counter` as 助数词 / 量词 when appropriate
- `matter` in こと/事 contexts as 事情 / 事项 / 情况, not 物质
- `follow` meaning understand as 理解 / 听懂 / 跟得上, not 跟随
- `shouldDisplay=true` only for common learner-useful senses
- `shouldDisplay=false` by default for mahjong, medical, legal, Buddhist, archaic, dialectal, rare-reading, or other specialized senses unless they are common learner-useful senses
- `issueFlags` such as `specialized`, `too_rare`, `archaic`, `dialect`, and `needs_human_review` for specialized or rare senses
- no `shouldDisplay=true` merely because a translation is correct
- `shouldDisplay` as default visibility for ordinary learners, not as a claim that the sense exists
- `confidence=low` with `issueFlags` when uncertain
- strict JSON only
- the word `json` in the prompt for DeepSeek JSON Output mode
- no Markdown
- no fenced ```json code block
- no explanation text, preface, or afterword
- exactly one top-level JSON object with an `items` array
- an inline JSON example with the required top-level `items` shape

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
      "issueFlags": ["none|wrong_sense_risk|specialized|too_rare|archaic|dialect|ambiguous|needs_human_review"],
      "reviewStatus": "ai_generated_unreviewed",
      "provider": "deepseek",
      "model": "deepseek-v4-flash"
    }
  ]
}
```

The validator also checks that the output contains exactly one object per input sense and no extra entry/sense keys. It fails if the provider returns Markdown fences, trailing explanatory text, an array without the top-level `items` object, missing fields, invalid enum values, mismatched `entryId`, mismatched `senseIndex`, duplicate senses, omitted senses, or extra senses. `specialized` is an allowed issue flag for domain-specific senses that should not be shown by default to ordinary learners.

## Provider JSON Mode

The offline script follows the DeepSeek JSON Output requirements used for this pilot:

- send `response_format: { "type": "json_object" }`
- include the word `json` in the system and/or user prompt
- include a complete JSON example in the prompt
- allocate enough `max_tokens` to avoid likely truncation
- parse only `response.choices[0].message.content`
- ignore `reasoning_content` for result parsing
- do not use streaming, tools, or wrapper formats that can add non-JSON text

The OpenAI-compatible request body includes:

```json
{
  "response_format": { "type": "json_object" },
  "stream": false,
  "thinking": { "type": "disabled" }
}
```

DeepSeek v4 thinking mode is treated as enabled by default for this project. The dictionary JSON generation and probe stages explicitly use non-thinking mode with `thinking: { "type": "disabled" }` to reduce strict JSON failures.

These are request-side controls, not trust guarantees. The script still treats the provider response as untrusted evidence and validates the returned message content with strict `JSON.parse` plus schema checks before writing any review artifact or usage ledger.

## Provider Attempt Results

The first approved DeepSeek Top 100 provider attempt stopped before artifact generation because the provider message content was not strict JSON. The script did not accept malformed JSON, did not guess fields, did not recover partial natural-language output, did not write the review artifact, and did not write a usage ledger.

After the first failure, the script added `response_format: { "type": "json_object" }`, a top-level `items` schema, stronger prompt wording against Markdown/code blocks/explanations, and local fixture tests.

The second approved DeepSeek Top 100 retry still stopped because the provider message content was not strict JSON. No malformed JSON was accepted, no generated review artifact was written, and no automatic retry was run. A safe failure ledger was written with no secrets, but actual token/cost values remained unknown.

Top 100 should no longer be retried directly. The next provider action had to be a separately approved 1-entry or 5-entry probe.

The separately approved 1-entry probe succeeded on 2026-06-22 JST and generated `docs/review/jmdict-zh-deepseek-probe-review.md` for 1 entry / 2 senses. After user review accepted that probe quality, the separately approved 5-entry probe succeeded on 2026-06-22 JST and updated the same probe review artifact for 5 entries / 10 senses. Neither probe activated runtime overlay lookup, wrote R2/D1, deployed Production, marked the PR ready, merged, or triggered a Top 100 run.

The next provider action, if any, must be separately approved by the user. The two failed DeepSeek requests plus the successful probes may already have incurred usage cost; exact usage and billing remain the DeepSeek console's source of truth.

## Failure Debug File

When a provider response fails strict JSON parsing, the script may write:

```text
docs/review/jmdict-zh-deepseek-last-failure-debug.json
```

The file is intentionally limited to safe diagnostics: timestamp, provider, model, request count, batch size, finish reason, response content length, first and last 500 content characters, whether trimmed content starts with `{` and ends with `}`, parse error message, provider usage tokens if present, and whether `reasoning_content` existed plus its length.

The debug file must never contain API keys, `.env.local` contents, request headers, an Authorization header, the complete raw response, the complete prompt, or complete input data.

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
2. Strict JSON hardening: keep malformed JSON rejected and add fixture tests.
3. Minimum provider probe: only after separate approval, run `--probe-provider --probe-limit 1` or `--probe-provider --probe-limit 5`.
4. Probe review: inspect strict JSON compliance, schema validation, diagnostics, token usage, and cost risk.
5. Separately approved DeepSeek Top 100 run only if probe behavior is acceptable.
6. Human review: user edits or approves the review artifact.
7. Separate Phase B approval: build a small zh overlay artifact for reviewed entries.
8. Preview-only runtime integration: merge reviewed zh overlay with English R2 lookup while preserving English fallback and `aiCalled=false`.
9. Production remains untouched until explicit Production approval.
