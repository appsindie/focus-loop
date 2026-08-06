# QA documentation

The QA plan and its test cases are produced in Stage C of `!build_product`, derived from journey acceptance criteria **and** from the failure modes in the product spec.

- `QA_PLAN.md` — scope, environments, entry/exit criteria, defect handling. Template: `.agents/skills/qa-test-automation-maestro-detox/assets/qa-plan.md`.
- `LIVE_E2E_INDEX.md` — canonical index of automated end-to-end coverage.

Cases state journey, precondition, steps, expected result and classification (smoke / regression / edge), and are runnable by hand before automation exists.
