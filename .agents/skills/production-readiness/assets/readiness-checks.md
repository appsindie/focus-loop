# Production Readiness Checks

One row per item. **Check** is how it is verified — a command, a query, or an artifact path; rows prefixed `manual` are verified by a human because no automated check exists today, and each one is an invitation to replace it with a command.

**This file is the single source of escalation conditions.** The `Escalate when` column is authoritative — `SKILL.md` lists the common ones illustratively, not exhaustively. Everything else is `pass`, or `fail`-and-remediate; a `fail` that cannot be remediated in scope becomes an exception.

Adapt paths and commands per product repo. Delete rows for surfaces not in the release (e.g. mobile rows for a backend-only release); do not delete rows because a check is inconvenient.

Instantiate as `docs/release/<version>/READINESS.md`.

## Document control

- **Version (CalVer)**:
- **Surfaces in scope**: api | web | ios | android
- **SIT evidence**: `docs/qa/`
- **Run date / by**:

## Functional

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| SIT regression | QA plan run recorded in `docs/qa/` | All journey regression cases green on SIT | — (fail = remediate) |
| Failure-mode cases | `docs/qa/` failure-mode suite results | Every promised failure mode exercised and handled | — |
| Open defects | Defect list for this version | Each is fixed, or accepted with a named owner and a date | A defect is accepted with no owner or no date |
| Third-party sandboxes | SIT config points at real vendor sandboxes | No mocks in the SIT run path | — |

## Rollback

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Rollback command | Exact command or pipeline step recorded in the runbook (`RUNBOOK_<surface>.md`) | Command is literal and copy-pasteable, not a description | Command is absent or generic |
| Rollback owner | Named person in the runbook | A person, not a team or a role | Unowned |
| Rollback rehearsed | Rollback executed against SIT for this release | Documented execution proof or simulation output | Never rehearsed for this release |
| Trigger conditions | Thresholds in `docs/release/SLO_AND_ALERTING.md` | Numeric, tied to an alert | Conditions are prose only |

## Observability

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| North-star events | Query the analytics backend for events from the deployed environment | Events observed, with expected properties | Not emitting, or emitting from SIT only |
| Alerts wired | Each SLO in `docs/release/SLO_AND_ALERTING.md` maps to a live alert | Every SLO has an alert that has been test-fired | An SLO exists with no alert behind it |
| Rollout halt thresholds | `docs/release/SLO_AND_ALERTING.md` error and latency numbers | Defined per surface, machine-readable by the rollout step | Undefined for a surface being rolled out |
| Dashboards | Dashboard links in release notes | Reachable, showing this version | — |

## Security and privacy

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Findings by severity | `security` skill output for this release | No unresolved `critical` | Any unresolved `critical` |
| Deferred `high` findings | Deferral record | Each has explicit human approval | A `high` is deferred without approval |
| Secrets | Scan the diff and `.tfvars` | No secrets in repo or variable files | Any secret found in the repo |
| Privacy delta | Data-safety / privacy declaration diff | Matches what the release actually collects | Declaration and behaviour disagree |

## Data

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Migration reversibility | Down-migration exists and runs on a SIT-shaped dataset | Reverts cleanly | Migration is irreversible |
| Data loss risk | `manual` — review migration for destructive statements | No unguarded `DROP` / `DELETE` on live tables | Destructive statement present |
| Backup / restore point | Restore point taken before prod migration | Timestamped and verified | Absent |

## Infrastructure

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Production plan | `terraform plan` against `prod`, then `manual` review | Plan reviewed; matches the SIT-proven module set | Plan contains a destroy/replace of a stateful resource |
| Plan/state parity | Post-apply state compared to reviewed plan | Identical | Divergence |
| Cost delta | `manual` — cost estimate on the release PR | Stated, within expectation | Unexpected order-of-magnitude increase |
| Least privilege | `manual` — identity and secret permissions review | Scoped to the workload | An identity has standing write or admin scope beyond the workload |

## Store compliance (mobile)

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Store agreements | `manual` — developer portal status | All required agreements signed | Any unsigned agreement |
| Credentials | EAS / portal credential validity | Valid and not near expiry | Missing or expired |
| Declarations | Privacy, permissions, data safety, age rating | Complete for this version | — |
| Internal testing | Build present in internal testing | Passed internal test pass | — |

## Release record

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Release notes | `release` skill template filled for this version | One entry per surface in scope; rollout/monitoring/rollback section complete | — |
| Changelog | Diff of changelog against the released commit range | Every user-facing change represented | — |
| Traceability | Shaping/build issue IDs in the release notes | Every shipped change traces to an issue | — |
| `docs/release/` | Directory updated for this version | Present and matching the tag | — |

## Support

| Item | Check | Pass criterion | Escalate when |
|---|---|---|---|
| Runbook | `RUNBOOK_<surface>.md` current for this version | Operate / diagnose / roll back / escalate all filled | Stale or templated-but-empty |
| Escalation path | Contact and route recorded | Reachable | Absent |

## Tally

The raw counts that feed the exception report. The verdict itself is recorded once, in `EXCEPTION_REPORT.md` — do not restate it here.

- **Checks run / passed / failed-and-remediated / manual**:
- **Exceptions raised**:
