# Proposed Correction Notes

These are suggested review directions only. This file does not modify the overlay candidate.

## QA Summary Findings Already Known

- Bad findings: 0.
- Minor findings: 7, mainly possible unreviewed Japanese example or usageNote naturalness checks.
- shouldDisplay review findings: 14, mainly specialized/default-visible terms that may be too broad for ordinary learners.

## Machine Check Findings

- P0 senses: 84
- P1 senses: 335
- confidence=low senses: 4
- needs_human_review senses: 46
- shouldDisplay risk senses: 28
- usageNote risk senses: 158
- specialized visible senses: 28

## Suggested Reviewer Directions

- For specialized or professional terms, check whether the sense should default to shouldDisplay=false for ordinary EJU/N2-N3 learners.
- For usageNote text containing Japanese examples, prefer removing or rewriting to a short Chinese usage note unless the example is clearly natural.
- For low confidence or needs_human_review senses, review zhGlosses and shortGloss before any activation.
- For high-risk literal translation terms such as counter/matter/follow, verify against original English glosses and Japanese headword.
- For multi-sense entries, check that shortGloss remains aligned with the specific sense, not the whole entry.

## Possible Correction Types

- rewrite zhGlosses
- rewrite shortGloss
- rewrite usageNote
- set shouldDisplay=false
- add issueFlags
- remove unnatural Japanese example
- mark needs_human_review
- no action