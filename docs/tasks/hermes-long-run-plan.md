# Hermes Long-Run Plan

- Branch: `feat/dictionary-zh-deepseek-pilot-100`
- Current head: `b5f55f83c1a8c02cefd1e14bd9e49e17f3d0bfe3`
- Last updated: 2026-06-23 23:28 JST
- Protocol: `docs/agents/hermes-deep-review-protocol.md`
- Template: `docs/agents/hermes-task-template-long-run.md`

## Completed Phases

- [x] Top 1000 provider run
- [x] Post-run audit
- [x] Post-run cleanup (pos field + guardrail check)
- [x] Top 1000 reviewed-r1 (round 1 corrections)

## Current State

| Artifact | Status |
|----------|--------|
| Top 1000 original candidate | ✅ |
| QA summary | ✅ |
| Local package | ✅ |
| ChatGPT review packet | ✅ (16 chunks, pos field complete) |
| reviewed-r1 candidate | ✅ (1 correction, 15 nhr clears) |
| reviewed-r1 local package | ✅ |

## Known Risks (from R1)

- **R1 review depth may be shallow**: P2 51 items all `no_action`; P0 15 items all `remove_needs_human_review`
- **Stats source mismatch**: candidate nhr count (7) differs from QA summary (22) because QA runs against original overlay, not reviewed-r1
- **Counter-argument not performed**: P0 spot-check not done per protocol

## Next Intended Phase

**Top 1000 reviewed-r2 deep review** — must:
- Perform per-item review with rationale for every item
- Spot-check at least 20% of P0 items
- Re-review P2 items individually
- Apply `docs/agents/hermes-deep-review-protocol.md` gate
- Cannot PASS without per-item evidence
