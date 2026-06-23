# Hermes Deep Review Protocol

Version 1.0 — 2026-06-23

## A. Long-Run Execution Principles

1. **Do not stop after every minor step.** Execute phases continuously until all done, a red-light blocker is hit, or user authorization boundary is reached.
2. **Green light → auto-fix and continue.** Format issues, missing metadata, validation log gaps — fix without asking.
3. **Yellow light → conservative fix, record, continue.** Ambiguous glosses, borderline shouldDisplay, uncertain usageNote — make best conservative choice, log rationale, proceed.
4. **Red light → STOP immediately.** Provider calls without approval, secret leaks, deployment without authorization, merge/ready without approval, scope errors, production data risk.
5. **Update `docs/tasks/hermes-long-run-plan.md` after each phase.** Mark completed phases, update risks, note blockers.

## B. Deep Review Principles

### Evidence Quality Over Artifact Existence

A review task is NOT complete just because artifacts exist. It is complete only when every review item has evidence-based decisions.

### Per-Item Review Structure

Every review item MUST include:

| Field | Description |
|-------|-------------|
| item id | entryId:senseIndex or equivalent |
| written / reading | Japanese form |
| pos | part of speech |
| original English glosses | JMdict source |
| current zhGlosses | what the provider generated |
| current shortGloss | compact label |
| current usageNote | usage context note |
| shouldDisplay | true/false |
| issueFlags / risk labels | from provider and machine classifier |
| reviewer decision | one of the defined decision types |
| rationale | WHY this decision was made, with evidence |
| possible counterargument | what a reasonable dissenter might say |
| final action | what changed (or why nothing changed) |

### Decision Types

| Decision | Meaning |
|----------|---------|
| `no_action` | Correct as-is. REQUIRES rationale with evidence. |
| `rewrite_gloss` | Fix zhGlosses or shortGloss |
| `rewrite_usage_note` | Fix usageNote |
| `show_common_word` | Change shouldDisplay false→true |
| `hide_specialized_or_rare` | Change shouldDisplay true→false |
| `keep_hidden` | Confirm shouldDisplay=false is correct |
| `remove_needs_human_review` | Clear nhr flag after review confirms |
| `keep_needs_human_review` | Retain nhr — reviewer cannot decide |
| `mark_unresolved` | Neither fix nor clear — requires external review |

## C. No-Action Rules

`no_action` is NOT the default. Every `no_action` MUST explain WHY no change is needed.

- **10+ consecutive `no_action` items** → trigger review-depth warning in validation log
- **All P0 items `no_action` or `remove_needs_human_review`** → MUST perform counter-argument spot-check on at least 20% of P0 items
- **All P2 items `no_action`** → MUST mark QA result as `PASS_WITH_LIMITED_REVIEW`, NOT `PASS`
- **"Correctly hidden" alone is insufficient rationale** — must cite editorial rule, example, or learner impact

## D. shouldDisplay Judgment Rules

| Context | Default | Exception |
|---------|:---:|------|
| Common modern word | `true` | Even if domain-adjacent (medical, legal, education) |
| Specialized domain (sumo, mahjong, printing, gagaku) | `false` | — |
| Religious (Buddhist, Shinto, Christian specialist terms) | `false` | Common cultural words (お参り) may be `true` |
| Legal subdivision | `false` | Common words (違法) may be `true` |
| Archaic/obsolete | `false` | — |
| Rare/dialect | `false` | — |
| Fixed greetings | `true` | — |

## E. Correction Patch Rules

### Content vs Metadata Corrections

Corrections MUST be split into:
- **Content corrections**: zhGlosses, shortGloss, usageNote, shouldDisplay changes
- **Flag-only corrections**: issueFlags, confidence, needs_human_review changes
- **No mixing**: 15 flag changes ≠ 1 correction; count separately

### Statistical Integrity

- `changed sense count`, `correction count`, `flag-only count` MUST be reported separately
- Do NOT modify un-involved senses
- Do NOT modify provider raw output
- Do NOT modify source identity fields (entryId, reading, written, senseIndex, pos)

## F. Review-Depth Validation Gate

### Valid Results

| Result | Meaning |
|--------|---------|
| `PASS` | Every item has item-level rationale; no unresolved items; no review-depth warnings |
| `PASS_WITH_REVIEW` | Corrections applied; some items need follow-up; minor review-depth concerns |
| `PASS_WITH_UNRESOLVED` | Unresolved items remain; requires external reviewer |
| `PASS_WITH_LIMITED_REVIEW` | Review completed but depth insufficient for full PASS (e.g., P2 all no_action) |
| `PASS_WITH_GUARDRAIL_NOTE` | Provider run had guardrail deviation; audit notes apply |
| `FAIL_REVIEW_DEPTH_INSUFFICIENT` | Items lack per-item rationale; too many unexplained no_action |
| `FAIL_SCHEMA` | Candidate JSON fails schema validation |
| `FAIL_SECRET_RISK` | Secret or credential leak detected |

### Gate Conditions

- **Cannot PASS** if items lack per-item rationale
- **Cannot PASS** if P0/P1/P2 have large no_action blocks without evidence
- **Cannot PASS** if unresolved items remain without explicit marking
- **Must FAIL_REVIEW_DEPTH_INSUFFICIENT** if >50% of reviewed items have no rationale beyond a generic phrase
