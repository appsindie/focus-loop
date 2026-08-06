---
name: AppsIndie Security Trigger Policy
id: note-6eabb5733f21437f9d6a5d7e48a0b562
author: user
scope: When a change touches authentication, authorization, secrets, external identity providers, file or document storage, production infrastructure, or any security trust boundary in any AppsIndie project
---

# AppsIndie Security Trigger Policy (Global)

A security review is required before a build phase exits when the slice touches any of the following trust boundaries:

- Authentication or authorization flows (IdP tokens, session cookies, API keys, service accounts, PATs, ACR).
- Secret or credential storage (passwords, API secrets, tokens, encryption keys, connection strings).
- External identity or access providers (Firebase, TTLock Cloud API, payment providers, OTA integrations).
- File or document storage and retention (uploads, PII, ID documents).
- Production infrastructure, secrets injection, or backup configuration.

## What triggers it

Adding or changing code, configuration, or documentation that fits the categories above.

## Required artifact

`docs/security/<feature>-security-review.md` (or repo equivalent) covering:

1. What changed and why.
2. Threat model with at least disclosure, replay, escalation, and cross-tenant risks.
3. Findings ranked LOW / MEDIUM / HIGH.
4. Outcome: PASS, PASS with findings, or BLOCK.

## Automated scanning runs regardless of trigger

The triggers above decide when a **human-grade review artifact** is required. They do not
gate the machine checks, which run on every repository whether or not a trigger fired:

- **In `verify`, every loop** — `gitleaks` (secrets), Semgrep OSS on a pinned ruleset
  (injection, path traversal, weak crypto), `eslint-plugin-security` / FindSecBugs,
  `checkov` (insecure IaC defaults). These are deterministic, so they are ordinary build
  failures and are fixed, not reviewed.
- **In `audit`, at slice completion, before every gate, and weekly in CI** — dependency
  CVEs via `npm audit`, `osv-scanner` or Trivy.

All free and open source. See **AppsIndie Static Analysis Convention** for why the two
sets have separate entry points and separate cadences.

A scanner finding is **evidence for** the review artifact, never a substitute for it. A
threat model is not replaced by a green scan: the scan finds known patterns, the review
finds what your design got wrong. Conversely, a trigger-driven review that ignores a
`critical` scanner finding is incomplete.

An unfixable dependency CVE is a **risk-acceptance exception**, not a rework loop —
accepted only with a stated reason why the vulnerable path is unreachable, and a recheck
date. `critical` never defaults to `proceed`.

## Exit criteria

A PASS (with or without non-HIGH findings) is required before the PR can be merged. Any HIGH finding blocks the phase unless explicitly waived in writing on the PR by the product owner.