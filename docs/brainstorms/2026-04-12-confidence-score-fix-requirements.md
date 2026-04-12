---
date: 2026-04-12
topic: confidence-score-fix
---

# Confidence Score Disambiguation

## Problem Frame

The LLM prompt asks for a "confidence score from 0 to 1" without specifying what direction it measures. The LLM interprets this as confidence in its determination (high = "I'm sure of my answer"), while the UI displays it as "Isekai Confidence" (high = "definitely isekai"). This causes non-isekai titles like Tokyo Ghoul to show a 95% green confidence bar alongside explanation text that says it is not isekai.

## Requirements

- R1. The confidence score returned by the LLM must represent the likelihood the anime is isekai, where 1 = definitely isekai and 0 = definitely not isekai
- R2. The UI must cross-check the `isIsekai` boolean against the confidence value. If `isIsekai` is false but confidence is above 0.5, the displayed score should be corrected (inverted) as a defense-in-depth guard against future LLM misinterpretation.

## Success Criteria

- Tokyo Ghoul (or any non-isekai) shows low confidence with a red/yellow bar and explanation text that agrees directionally
- Known isekai titles continue to show high confidence with a green bar

## Scope Boundaries

- No changes to the confidence threshold UX (>= 0.7 auto-accept, 0.3-0.7 borderline, < 0.3 reject)
- Existing seed data with potentially inverted scores should be re-evaluated during seed regeneration, not transformed in-place

## Key Decisions

- **Prompt fix as primary, UI guard as defense-in-depth**: Fixing the prompt is the correct solution. The UI guard catches edge cases where the LLM still misinterprets despite clear wording.

## Next Steps

→ `/ce-plan` for structured implementation planning
