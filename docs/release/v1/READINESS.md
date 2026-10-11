# Release Readiness — v1.0.0

## Document control

- **Version (CalVer)**: v1.0.0
- **Surfaces in scope**: ios, android
- **SIT evidence**: `docs/qa/v1-e2e-test-report.md` (web preview) + iOS Simulator pass recorded in `EXCEPTION_REPORT.md` EX-native-sit-waiver
- **Run date / by**: 2026-10-04 / Devin — re-audit at `release/1.0.0` head (prior run 2026-08-08 superseded)

## Functional

| Item                  | Check                                      | Status    | Evidence                                                                                                                                        |
| --------------------- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| SIT regression        | QA plan run recorded in `docs/qa/`         | waived    | Sponsor waived device SIT 2026-10-04 (EX-native-sit-waiver waiver record). Web-preview E2E + iOS Simulator pass retained as partial evidence.                    |
| Failure-mode cases    | `docs/qa/` failure-mode suite results      | waived    | Sponsor waived 2026-10-04 (EX-failure-mode-waiver waiver record). Cancel regression, ATT-deny and paywall fallback verified on simulator; device paths deferred to internal testing. |
| Open defects          | Defect list for this version               | pass      | No open defects. Gate 2 exception E1 deferred/closed: https://github.com/appsindie/focus-loop/pull/1#issuecomment-5211987117.                   |
| Third-party sandboxes | SIT config points at real vendor sandboxes | waived    | Config points at real vendor surfaces (production AdMob IDs, Firebase `focus-loop-3db4a`, ASC app 6818991496 with IAP ids), but no sandbox run exists — folded into the EX-native-sit-waiver waiver; IAP/AdMob sandbox paths must be exercised in internal testing (EX-sit-retest-devices). |

## Rollback

| Item               | Check                                | Status    | Evidence                                                                                                    |
| ------------------ | ------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------- |
| Rollback command   | Exact command in `RUNBOOK_mobile.md` | exception | EX-rollback-command — halt + hotfix written; not yet executed end-to-end.                                                 |
| Rollback owner     | Named person in runbook              | pass      | `RUNBOOK_mobile.md` names justin.nguyen@appsindie.com.                                                      |
| Rollback rehearsed | Rollback executed against SIT        | exception | EX-rollback-rehearsal — no EAS build yet; internal-testing build is the rehearsal vehicle.                                  |
| Trigger conditions | Thresholds in `SLO_AND_ALERTING.md`  | exception | EX-rollback-triggers — thresholds seeded, not wired to a live alert.                                                       |

## Observability

| Item                    | Check                            | Status    | Evidence                                                                              |
| ----------------------- | -------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| North-star events       | Query analytics backend          | exception | EX-north-star-events — `events.ts` hook exists; no analytics backend connected.                      |
| Alerts wired            | Each SLO maps to a live alert    | exception | EX-alerts-not-wired — SLOs seeded; no alerts created or test-fired.                                 |
| Rollout halt thresholds | `SLO_AND_ALERTING.md`            | exception | EX-halt-thresholds — numeric thresholds seeded; not wired to alerts.                               |
| Dashboards              | Dashboard links in release notes | exception | EX-dashboards — no dashboards; vendor consoles cover each SLI today.                          |

## Security and privacy

| Item                     | Check                             | Status    | Evidence                                                                                                                          |
| ------------------------ | --------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Findings by severity     | `security` skill output           | pass      | `docs/security/ads-integration-security-review.md`: no critical/high findings, three low (F01–F03).                               |
| Deferred `high` findings | Deferral record                   | pass      | None.                                                                                                                             |
| Secrets                  | Scan diff and variable files      | pass      | gitleaks 8.30.1 on `main..release/1.0.0`: no leaks (`docs/security/v1-secrets-scan.txt`). Store credentials materialise only from EAS env vars via `write-store-credentials.sh`; one suppressed finding is a public Apple identifier. |
| Privacy delta            | Data-safety / privacy declaration | exception | EX-data-safety — data collection mapped to legal pages, store declaration not yet completed.                                               |

## Data

Not applicable — Focus Loop v1 is a local-first mobile app with no server-side database or migration.

## Infrastructure

Not applicable — v1 uses Expo managed workflow and Firebase/AdMob SaaS; no Terraform or cloud infrastructure.

## Store compliance (mobile)

| Item             | Check                                         | Status    | Evidence                                                                                                                                |
| ---------------- | --------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Store agreements | `manual` — portal status                      | exception | EX-store-agreements — not verified by a human yet.                                                                                                    |
| Credentials      | EAS / portal credential validity              | exception | EX-console-products — `EXPO_TOKEN` valid; ASC API key verified working (app 6818991496 readable); EAS env vars + iOS dist credentials still to provision. |
| Declarations     | Privacy, permissions, data safety, age rating | exception | EX-store-declarations — legal pages live at `appsindie.com/docs/legal/focus-loop/*`; console declarations not yet filled.                                 |
| Internal testing | Build present in internal testing             | exception | EX-internal-test-build — pipeline wired (`workflow_dispatch`-only release workflow); first build pending confirmed trigger.                                |

## Release record

| Item            | Check                              | Status | Evidence                                                                                       |
| --------------- | ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Release notes   | `release` skill template           | pass   | `docs/release/v1/RELEASE_NOTES.md` written (rollout/monitoring/rollback, compliance, links).     |
| Changelog       | Diff of changelog                  | pass   | `CHANGELOG.md` carries the v1.0.0 product entry.                                                |
| Traceability    | Shaping/build issue IDs            | pass   | Cycle PR https://github.com/appsindie/focus-loop/pull/4 merged; journeys J1–J10 recorded in RELEASE_NOTES. |
| `docs/release/` | Directory updated for this version | pass   | `docs/release/v1/` + runbook + SLO doc updated 2026-10-04.                                      |

## Support

| Item            | Check                       | Status    | Evidence                                                                             |
| --------------- | --------------------------- | --------- | ------------------------------------------------------------------------------------ |
| Runbook         | `RUNBOOK_mobile.md` current | exception | EX-runbook-placeholders — owner + operate/diagnose rows written; routes still placeholders pending real signals. |
| Escalation path | Contact and route recorded  | exception | EX-escalation-path — escalation routes TBD in `SLO_AND_ALERTING.md`.                              |

## Tally

- **Checks run / passed / waived / failed-and-remediated / manual / exception**: 26 / 9 / 3 / 0 / 0 / 14
- **Exceptions open**: 15 — EX-north-star-events..EX-data-safety, EX-console-products..EX-sit-retest-devices (14 exception rows above plus EX-sit-retest-devices, the waiver re-test condition, which maps to no readiness row)
- **Resolved**: EX-admob-prod-ids (production AdMob IDs), EX-release-record (release record)
- **Waived**: EX-native-sit-waiver, EX-failure-mode-waiver (sponsor waiver 2026-10-04 — signature pending on the release PR)
