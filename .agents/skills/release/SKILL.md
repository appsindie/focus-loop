---
name: release
description: Prepare, deploy and roll out a release with safe rollback.
---

## Purpose
Prepare, deploy and roll out a release with safe rollback.

## When to use
- Infrastructure, pipeline or runtime config changes.
- SIT/RC deployments and mobile builds/submissions.

## Operating rules
- Terraform only: nothing created by hand in a portal is left unimported.
- One remote state backend per environment with locking; no state in the repo.
- `dev`/`sit`/`prod` share modules and differ only by variable files.
- Secrets from vault or CI secret store; never in `.tfvars` or the repo.
- `terraform plan` evidence attached to the PR; `terraform apply` for SIT/RC run by Devin, not auto-triggered by GitHub Actions.
- Mobile builds:
  - Trigger `preview` only after Regression passes on SIT.
  - Trigger `production`/`release` only after Full system tests pass.
  - Use local compile checks (`npx tsc --noEmit`, `npx expo prebuild --clean`, `eas build --local`) instead of cloud builds for compilation verification.
- Tag resources, state cost estimate on the PR, and define logs/metrics/alerts with the workload.
- Progressive rollout 5% → 25% → 100%; hold on error/crash threshold breach. Thresholds come from `.agents/skills/production-readiness/assets/slo-and-alerting.md`; a surface with none defined is not ready to roll out.
- Readiness before production is owned by the `production-readiness` skill; its exception report is the input to Gate 3.
- Internal testing pass before store promotion; **promotion to production store is a human action**.

## Templates

| Use | Path |
| --- | --- |
| Release notes | `.agents/skills/release/assets/release-notes.md` |
| Infra quickstart | `.agents/skills/release/assets/infra-quickstart.md` |
| CI light baseline | `.agents/skills/release/assets/github/ci-light.yml` |
