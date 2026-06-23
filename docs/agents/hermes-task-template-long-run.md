# Hermes Long-Run Task Template

Copy and customize for each long-run task.

---

## Task Objective

<!-- What must be achieved -->

## Scope

<!-- Entry range, review depth, artifact types -->

## Branch

<!-- e.g., feat/dictionary-zh-deepseek-pilot-100 -->

## Start Commit

<!-- git rev-parse HEAD -->

---

## Prohibited Actions

- [ ] No DeepSeek provider calls
- [ ] No Google Translate
- [ ] No Runtime AI
- [ ] No R2 writes
- [ ] No D1 writes
- [ ] No Preview deploy
- [ ] No Production deploy
- [ ] No overlay activation
- [ ] No merge
- [ ] No mark ready
- [ ] No force push / rebase / reset
- [ ] No .env.local commit
- [ ] No API key exposure

## Allowed Actions

- [ ] Read local artifacts
- [ ] Modify docs/review files
- [ ] Generate correction patches
- [ ] Generate reviewed-rN candidates (local only)
- [ ] Generate local packages (local only)
- [ ] Run estimate-only (no provider)
- [ ] Run self-tests
- [ ] Commit + push to PR branch

---

## Long-Run Phases

### Phase 0: Preflight
- [ ] git fetch + checkout + pull
- [ ] Verify branch, HEAD, clean worktree
- [ ] Verify .env.local not tracked

### Phase 1: Long-Run Plan
- [ ] Create/update `docs/tasks/hermes-long-run-plan.md`

### Phase 2: Evidence Collection
- [ ] Read all relevant artifacts
- [ ] Read editorial rules
- [ ] Read previous lessons learned
- [ ] Read previous audit logs

### Phase 3: Per-Item Review
- [ ] Review every item in scope
- [ ] Record decision, rationale, counterargument for each
- [ ] Follow `docs/agents/hermes-deep-review-protocol.md`

### Phase 4: Corrections JSON
- [ ] Generate machine-readable corrections file
- [ ] Separate content corrections from flag-only corrections

### Phase 5: Apply Corrections
- [ ] Generate reviewed-rN candidate
- [ ] Verify schema validity
- [ ] Verify stats integrity

### Phase 6: Generate Package
- [ ] Generate reviewed-rN local package
- [ ] manifest + shards + checksum + validation

### Phase 7: QA / Summary
- [ ] Generate QA summary with correct gate result
- [ ] Apply review-depth validation gate

### Phase 8: Validation
- [ ] node --check
- [ ] JSON parse candidate
- [ ] Stats verification
- [ ] Secret scan
- [ ] Large file check
- [ ] Artifact protection check

### Phase 9: Validation Log
- [ ] Write complete validation log
- [ ] No pending/TBD/to be filled

### Phase 10: Status Writeback
- [ ] AGENT_SYNC_BOARD.md
- [ ] AGENT_WORKLOG.md
- [ ] PROJECT_STATUS.md
- [ ] HANDOVER.md

### Phase 11: Commit + Push
- [ ] Commit with clear message
- [ ] Push to PR branch
- [ ] PR stays draft/open/unmerged

---

## Green / Yellow / Red Light Rules

| Light | Action |
|-------|--------|
| 🟢 Green | Auto-fix, record, continue |
| 🟡 Yellow | Conservative fix, log rationale, continue |
| 🔴 Red | STOP immediately, report blocker |

See `docs/agents/hermes-deep-review-protocol.md` for full definitions.

---

## Evidence Requirements

- Every review item must have per-item rationale
- no_action items must cite editorial rule or evidence
- 10+ consecutive no_action → review-depth warning
- All P0 no_action → spot-check 20%

## Validation Requirements

- JSON parse candidate
- Stats integrity (entries, senses, sdTrue/sdFalse, nhr, lowConf)
- Correction count matches before/after diff
- Content corrections ≠ flag-only corrections in counts

## Status Writeback Requirements

- JST time
- Branch + start/end commit
- Files changed
- External services touched (all 0 for review tasks)
- Validation log path
- Remaining risks
- Next step

---

## Final Report Format

1. Status
2. PR state
3. Branch + start/end commit
4. Correction count + changed sense count
5. shouldDisplay before/after
6. nhr before/after
7. unresolved count
8. QA result (with gate)
9. Artifact paths
10. Validation log path
11. Modified files
12. Secret scan result
13. Remaining risks
14. Next step

---

## Model Recommendation

- Review tasks with 50+ items: Claude Opus or high-reasoning model
- Review tasks with <50 items: Claude Sonnet acceptable
- Never lightweight model for review tasks
