---
name: security
description: Apply secure-by-design review and threat analysis to requirements, design and implementation.
---

## Purpose
Apply secure-by-design review and threat analysis to requirements, design and implementation.

## When to use
- New endpoint, auth flow, data model, dependency or trust-boundary change.
- Build design review, implementation review, or release readiness.
- Any trigger in **AppsIndie Security Trigger Policy** matches.

## Outputs
- Threat list with mitigations and owners.
- Security findings by severity and decision (`pass`, `rework`, `defer`).

## Operating rules
- Run the machine checks first and attach their output: `verify` carries the deterministic ones (secrets, SAST, insecure IaC defaults), `audit` carries dependency CVEs. Both are free and open source — see **AppsIndie Static Analysis Convention**. Reviewing by hand what a scanner already reports wastes the review.
- Scanner output is **evidence for** the threat list, never a replacement. A green scan says known patterns are absent; it says nothing about what the design got wrong.
- Validate authn/authz, input validation/output encoding, secret handling, key rotation, dependencies and data classification/privacy impact.
- Block `critical` unresolved findings; defer `high` findings only with human approval before release sign-off. At release, both conditions are checked by the `production-readiness` skill and surface as exceptions at Gate 3.

## Validation loop
1. Enumerate threats by component and data flow.
2. Validate controls against the checklist.
3. Re-run after remediation until thresholds pass.
