# Release Readiness — v1.0.0

## Document control

- **Version (CalVer)**: v1.0.0
- **Surfaces in scope**: ios, android
- **SIT evidence**: `docs/qa/v1-e2e-test-report.md` (web preview) + iOS Simulator pass recorded in `EXCEPTION_REPORT.md` EX-native-sit-waiver
- **Run date / by**: 2026-10-13 / Devin — re-run against the binaries under review: Android versionCode 8 (Play internal) and iOS build 21 (TestFlight). Prior run 2026-10-04 superseded.
- **Raw evidence**: `docs/release/v1/evidence/2026-10-13/` (timestamp + command in each file); store passes in `STORE_COMPLIANCE.md`

## Functional

| Item                    | Check                                                            | Status    | Evidence                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SIT regression          | QA plan run recorded in `docs/qa/`                               | waived    | Sponsor waived device SIT 2026-10-04 (EX-native-sit-waiver), signed by sponsor 2026-10-13 ("ko cần sít"). Web-preview E2E + iOS Simulator pass retained as partial evidence.                   |
| Failure-mode cases      | `docs/qa/` failure-mode suite results                            | waived    | Sponsor waived 2026-10-04 (EX-failure-mode-waiver), signed by sponsor 2026-10-13 ("ko cần sít"). Cancel regression, ATT-deny and paywall fallback verified on simulator.                       |
| Spec completeness       | `PRODUCT_SPEC_LIVE.md` screens + rules mapped to code and a test | exception | Phone journeys J1–J10 mapped at Gate 2 (passed 2026-10-05). Tablet layouts T01–T06 shipped (`supportsTablet: true`, orientation `default`) but not verified on a tablet device → EX-tablet-e2e |
| E2E automation coverage | `docs/qa/LIVE_E2E_INDEX.md`                                      | exception | ATT prompt not asserted (no hard `assertVisible` flow) → EX-att-e2e; no tablet flows → EX-tablet-e2e                                                                                           |
| Open defects            | Defect list for this version                                     | pass      | No open defects. Gate 2 exception E1 deferred/closed: https://github.com/appsindie/focus-loop/pull/1#issuecomment-5211987117.                                                                  |
| Third-party sandboxes   | SIT config points at real vendor sandboxes                       | exception | Real vendor surfaces configured (prod AdMob IDs, Firebase `focus-loop-3db4a`, ASC IAP ids), no sandbox run → EX-sit-retest-devices; waiver unsigned → EX-waiver-signature.                     |

## Rollback

| Item               | Check                                | Status    | Evidence                                                                                   |
| ------------------ | ------------------------------------ | --------- | ------------------------------------------------------------------------------------------ |
| Rollback command   | Exact command in `RUNBOOK_mobile.md` | exception | EX-rollback-command — halt + hotfix written; not yet executed end-to-end.                  |
| Rollback owner     | Named person in runbook              | pass      | `RUNBOOK_mobile.md` names justin.nguyen@appsindie.com.                                     |
| Rollback rehearsed | Rollback executed against SIT        | exception | EX-rollback-rehearsal — no EAS build yet; internal-testing build is the rehearsal vehicle. |
| Trigger conditions | Thresholds in `SLO_AND_ALERTING.md`  | exception | EX-rollback-triggers — thresholds seeded, not wired to a live alert.                       |

## Observability

| Item                    | Check                            | Status    | Evidence                                                                        |
| ----------------------- | -------------------------------- | --------- | ------------------------------------------------------------------------------- |
| North-star events       | Query analytics backend          | exception | EX-north-star-events — `events.ts` hook exists; no analytics backend connected. |
| Alerts wired            | Each SLO maps to a live alert    | exception | EX-alerts-not-wired — SLOs seeded; no alerts created or test-fired.             |
| Rollout halt thresholds | `SLO_AND_ALERTING.md`            | exception | EX-halt-thresholds — numeric thresholds seeded; not wired to alerts.            |
| Dashboards              | Dashboard links in release notes | exception | EX-dashboards — no dashboards; vendor consoles cover each SLI today.            |

## Security and privacy

| Item                     | Check                                                                         | Status    | Evidence                                                                                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Findings by severity     | `security` skill output                                                       | exception | `docs/security/ads-integration-security-review.md` (no critical/high, three low) predates the production AdMob IDs and UMP → refresh under EX-owasp-checklist.                                                                             |
| Deferred `high` findings | Deferral record                                                               | pass      | None.                                                                                                                                                                                                                                      |
| Secrets                  | Scan diff and variable files                                                  | pass      | gitleaks 8.30.1 at head, full history + `origin/main..HEAD`: no leaks after fingerprinting 3 public identifiers in `.gitleaksignore` (`evidence/2026-10-13/secrets-scan.txt`).                                                             |
| OWASP coverage           | Threat checklist in `docs/security/`                                          | exception | Only `ads-integration-security-review.md`; no MASVS / OWASP Mobile Top 10 disposition per category → EX-owasp-checklist                                                                                                                    |
| Dependency freshness     | `npm outdated` / `npm audit` (`deps-outdated.json`, `deps-audit-summary.txt`) | exception | 28 outdated entries not yet triaged by major; audit 1 critical = `shell-quote@1.10.0` (GHSA-pqg4-j6r4-53mv) via `react-native → react-devtools-core` (dev tooling, not in the release JS bundle), 67 high untriaged → EX-dependency-triage |
| Privacy delta            | Data-safety / privacy declaration                                             | exception | EX-data-safety — answers in `STORE_QUESTIONNAIRE.md` (incl. approximate location, diagnostics default ON + opt-out); Play form not yet submitted (human).                                                                                  |

## Data

Not applicable — Focus Loop v1 is a local-first mobile app with no server-side database or migration.

## Infrastructure

Not applicable — v1 uses Expo managed workflow and Firebase/AdMob SaaS; no Terraform or cloud infrastructure.

## Store listing (mobile)

| Item                         | Check                 | Status    | Evidence                                                                                                                                                                                              |
| ---------------------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Store assets from this build | `STORE_ASSETS.md`     | exception | Phone sets captured from b21 / vc7 (same UI as vc8), 19 locales ASC + 20 Play. **No iPad 13" or Android tablet sets** although the app supports tablets; ASC es-MX has no set → EX-tablet-screenshots |
| Store compliance, two passes | `STORE_COMPLIANCE.md` | pass      | Pass A and Pass B recorded 2026-10-13                                                                                                                                                                 |

## Store compliance (mobile)

| Item                             | Check                                                                   | Status            | Evidence                                                                                                                                                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pass A — metadata                | `STORE_COMPLIANCE.md` Pass A                                            | fail → exceptions | 5 failing rows: EX-asc-iap-metadata (2.1), EX-ios-background-audio-mode (2.5.4), EX-permission-gate-drift, EX-att-e2e, EX-ump-consent                                                                                    |
| Pass B — store verification      | `STORE_COMPLIANCE.md` Pass B, `asc-readback.json`, `play-readback.json` | fail → exceptions | Console forms not submitted (EX-store-declarations, EX-data-safety); ASC category + build not set (EX-asc-version-setup); Play yearly has no free-trial offer (EX-console-products)                                      |
| Both passes recorded             | `STORE_COMPLIANCE.md` committed                                         | pass              | this PR                                                                                                                                                                                                                  |
| Drift corrected                  | Drift table D1–D4                                                       | exception         | D2 (Play es-419) and D4 (declarations) corrected; D1 (ASC es-MX screenshots) → EX-tablet-screenshots, D3 (Play trial offer) → EX-console-products                                                                        |
| Store agreements                 | `manual` — portal status                                                | pass              | Manual pass on sponsor attestation (justin.nguyen@appsindie.com, 2026-10-11: account-level agreements, tax, banking active, shared with live AppsIndie apps); no portal artifact attached (EX-store-agreements resolved) |
| Credentials                      | EAS / portal credential validity                                        | pass              | ASC API key + Play service account read back live 2026-10-13 (`asc-readback.json`, `play-readback.json`)                                                                                                                 |
| Merged-manifest permission audit | `android-permissions.json` vs vc8 AAB merged manifest                   | fail → exception  | 16 merged vs 8 allowlisted; CI `verify:permissions` audits the prebuild manifest and misses library-injected entries (`permissions-audit.txt`) → EX-permission-gate-drift                                                |
| App size and minification        | `binary-audit.txt`                                                      | pass              | vc8 AAB 72,802,628 B; universal APK set 43,931,900 B; R8 minify + resource shrink on (`expo-build-properties`). First release — no previous size to compare                                                              |
| Account deletion                 | In-app path                                                             | n/a               | No accounts; Settings → "Your data" deletes all local data                                                                                                                                                               |
| Ads                              | ATT e2e, UMP, SKAdNetwork, `AD_ID`, placement                           | fail → exceptions | SKAdNetwork 49 IDs, `AD_ID` present, placement reviewed (`ads-integration-security-review.md`); **no UMP consent** → EX-ump-consent; ATT not asserted by e2e → EX-att-e2e                                                |
| Child-directed                   | Target audience answers                                                 | pass              | 18+ target audience, not child-directed (`STORE_QUESTIONNAIRE.md`)                                                                                                                                                       |
| Internal testing                 | Build present in internal testing                                       | pass              | vc8 Play internal `completed`; b21 TestFlight `VALID`                                                                                                                                                                    |
| Prior rejections                 | ASC review submissions                                                  | pass              | None — `reviewSubmissions: []` (`asc-readback.json`); no Play rejection                                                                                                                                                  |
| Declarations                     | Console forms                                                           | exception         | EX-store-declarations — answers in `STORE_QUESTIONNAIRE.md`; forms not yet submitted (human)                                                                                                                             |

## Release record

| Item            | Check                              | Status | Evidence                                                                                                   |
| --------------- | ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Release notes   | `release` skill template           | pass   | `docs/release/v1/RELEASE_NOTES.md` written (rollout/monitoring/rollback, compliance, links).               |
| Changelog       | Diff of changelog                  | pass   | `CHANGELOG.md` carries the v1.0.0 product entry.                                                           |
| Traceability    | Shaping/build issue IDs            | pass   | Cycle PR https://github.com/appsindie/focus-loop/pull/4 merged; journeys J1–J10 recorded in RELEASE_NOTES. |
| `docs/release/` | Directory updated for this version | pass   | `docs/release/v1/` + runbook + SLO doc updated 2026-10-04.                                                 |

## Legal and policy pages

| Item                  | Check                                | Status    | Evidence                                                                                                   |
| --------------------- | ------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------- |
| Terms of Service      | Public URL                           | pass      | `/docs/legal/focus-loop/tnc/` HTTP 200 (`legal-pages.txt`)                                                 |
| Privacy Policy        | Public URL, covers declared types    | exception | HTTP 200, covers AdMob, Firebase, IP-derived location, ad IDs; no contact email → EX-privacy-contact-email |
| Disclaimer            | Regulated claims only                | n/a       | No health/finance claims; page exists (HTTP 200)                                                           |
| Refund / cancellation | Store-mediated refunds + cancel path | pass      | IAP via App Store / Play; Restore purchases in Settings; ToS references store refunds                      |

## Support

| Item            | Check                       | Status    | Evidence                                                                                                         |
| --------------- | --------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| Runbook         | `RUNBOOK_mobile.md` current | exception | EX-runbook-placeholders — owner + operate/diagnose rows written; routes still placeholders pending real signals. |
| Escalation path | Contact and route recorded  | exception | EX-escalation-path — escalation routes TBD in `SLO_AND_ALERTING.md`.                                             |

## Tally

Counts are of rows above; the verdict lives in `EXCEPTION_REPORT.md`.

- **Checks run**: 46 · **pass**: 19 · **waived**: 2 · **n/a**: 2 · **exception / fail→exception**: 23
- **Exception IDs referenced**: see `EXCEPTION_REPORT.md` summary — every ID there matches `FACTORY_STATE.json` `open_exceptions[].id`
