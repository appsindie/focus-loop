# Release documentation

Per-release artifacts live under `docs/release/<version>/`; the long-lived ones sit at
this level and are carried across releases.

| Artifact                               | Path                                         | Owner skill            |
| -------------------------------------- | -------------------------------------------- | ---------------------- |
| Readiness checks with evidence         | `docs/release/<version>/READINESS.md`        | `production-readiness` |
| Exception report — the Gate 3 artifact | `docs/release/<version>/EXCEPTION_REPORT.md` | `production-readiness` |
| Release notes per surface              | `docs/release/<version>/RELEASE_NOTES.md`    | `release`              |
| SLOs and rollout halt thresholds       | `docs/release/SLO_AND_ALERTING.md`           | `production-readiness` |
| Operating runbook per surface          | `docs/release/RUNBOOK_<surface>.md`          | `production-readiness` |
| Day-7 / day-14 north-star review       | `docs/release/<version>/GROWTH_REVIEW.md`    | `growth`               |

The last two long-lived files ship blank. **The first release of a product fails
readiness until they are seeded** — undefined thresholds mean the rollout has nothing to
halt on. That is the gate working, not a bug.

There is no separate go-live checklist. Readiness is machine-checked by the
`production-readiness` skill, and what reaches the human is the exception report: a
verdict plus only the decisions they must make.

Templates: `.agents/skills/release/assets/release-notes.md`,
`.agents/skills/production-readiness/assets/*`,
`.agents/skills/go-to-market/assets/app-store-pack.md`.
