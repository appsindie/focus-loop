# DevOps and IaC Quickstart Checklist

Use this when a build issue introduces a new delivery pipeline or infrastructure stack.

## Inputs
- Target environment(s)
- Hosting/runtime model
- Compliance and security requirements
- Rollout and rollback expectations

## Bootstrap steps
1. Define environment topology and naming conventions.
2. Create IaC baseline modules and state strategy.
3. Initialize CI workflow from `.agents/skills/release/assets/github/ci-light.yml` and adapt to stack needs.
4. Add plan/apply or equivalent deployment stages with explicit approvals as required.
5. Add rollback path and trigger criteria.
6. Add post-deploy verification checks (health, smoke, monitoring signal checks).
7. Configure secrets and identity permissions with least privilege.
8. Record operating runbook links and escalation paths using `.agents/skills/production-readiness/assets/runbook.md`.

## Required evidence
- IaC plan/dry-run output.
- CI pipeline run output.
- Rollback simulation or documented execution proof.
- Post-deploy verification checklist results.
