# Release Readiness — v1.0.0

## Document control

- **Version (CalVer)**: v1.0.0
- **Surfaces in scope**: ios, android
- **SIT evidence**: `docs/qa/v1-e2e-test-report.md`
- **Run date / by**: 2026-08-08 / Devin

## Functional

| Item                  | Check                                      | Status    | Evidence                                                                                                                      |
| --------------------- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| SIT regression        | QA plan run recorded in `docs/qa/`         | exception | Web-preview E2E completed (`docs/qa/v1-e2e-test-report.md`). Native device SIT not yet run.                                   |
| Failure-mode cases    | `docs/qa/` failure-mode suite results      | exception | Cancel regression passed; ad load-failure graceful handling not yet verified on device.                                       |
| Open defects          | Defect list for this version               | pass      | No open defects. Gate 2 exception E1 deferred/closed: https://github.com/appsindie/focus-loop/pull/1#issuecomment-5211987117. |
| Third-party sandboxes | SIT config points at real vendor sandboxes | pass      | Google official `TestIds` are real AdMob sandbox IDs, not mocks; Firebase `focus-loop-3db4a` project configured.              |

## Rollback

| Item               | Check                                | Status    | Evidence                                                                         |
| ------------------ | ------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| Rollback command   | Exact command in `RUNBOOK_mobile.md` | exception | Mobile binary cannot be recalled; runbook states staged-rollout halt and hotfix. |
| Rollback owner     | Named person in runbook              | exception | Owner not yet named; `RUNBOOK_mobile.md` seeded with placeholder.                |
| Rollback rehearsed | Rollback executed against SIT        | exception | No native SIT build yet.                                                         |
| Trigger conditions | Thresholds in `SLO_AND_ALERTING.md`  | exception | Thresholds seeded but alerts not wired/test-fired.                               |

## Observability

| Item                    | Check                            | Status    | Evidence                                                       |
| ----------------------- | -------------------------------- | --------- | -------------------------------------------------------------- |
| North-star events       | Query analytics backend          | exception | No analytics events wired yet.                                 |
| Alerts wired            | Each SLO maps to a live alert    | exception | `SLO_AND_ALERTING.md` seeded; no alerts created or test-fired. |
| Rollout halt thresholds | `SLO_AND_ALERTING.md`            | exception | Thresholds seeded as placeholders.                             |
| Dashboards              | Dashboard links in release notes | exception | No dashboards created.                                         |

## Security and privacy

| Item                     | Check                             | Status    | Evidence                                                                                                                          |
| ------------------------ | --------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Findings by severity     | `security` skill output           | pass      | `docs/security/ads-integration-security-review.md`: no critical/high findings, three low (F01–F03, see doc for resolution notes). |
| Deferred `high` findings | Deferral record                   | pass      | None.                                                                                                                             |
| Secrets                  | Scan diff and variable files      | pass      | No secrets in repo per `docs/security/ads-integration-security-review.md` (Disclosure); `.npmrc` uses `NODE_AUTH_TOKEN` env var.  |
| Privacy delta            | Data-safety / privacy declaration | exception | Store privacy/permissions declarations not yet completed for v1.                                                                  |

## Data

Not applicable — Focus Loop v1 is a local-first mobile app with no server-side database or migration.

## Infrastructure

Not applicable — v1 uses Expo managed workflow and Firebase/AdMob SaaS; no Terraform or cloud infrastructure.

## Store compliance (mobile)

| Item             | Check                                         | Status    | Evidence                                                                                                                               |
| ---------------- | --------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Store agreements | `manual` — portal status                      | exception | Not verified by a human yet.                                                                                                           |
| Credentials      | EAS / portal credential validity              | exception | `npx eas-cli whoami` confirms EXPO_TOKEN is valid (account: tuan3.nguyen@gmail.com). Apple ID / store credentials expiry not verified. |
| Declarations     | Privacy, permissions, data safety, age rating | exception | Declarations not yet drafted for ATT, notifications, and ads.                                                                          |
| Internal testing | Build present in internal testing             | exception | No EAS build produced yet.                                                                                                             |

## Release record

| Item            | Check                              | Status    | Evidence                                        |
| --------------- | ---------------------------------- | --------- | ----------------------------------------------- |
| Release notes   | `release` skill template           | exception | `RELEASE_NOTES.md` not yet written.             |
| Changelog       | Diff of changelog                  | exception | `CHANGELOG.md` not yet created.                 |
| Traceability    | Shaping/build issue IDs            | exception | No external issue tracker IDs recorded.         |
| `docs/release/` | Directory updated for this version | pass      | `docs/release/v1/` and long-lived files seeded. |

## Support

| Item            | Check                       | Status    | Evidence                                                     |
| --------------- | --------------------------- | --------- | ------------------------------------------------------------ |
| Runbook         | `RUNBOOK_mobile.md` current | exception | Seeded; operate/diagnose/escalate sections are placeholders. |
| Escalation path | Contact and route recorded  | exception | Escalation path not finalized.                               |

## Tally

- **Checks run / passed / failed-and-remediated / manual / exception**: 26 / 6 / 0 / 0 / 20
- **Exceptions raised**: 20 (all documented above)
