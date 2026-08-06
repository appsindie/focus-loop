# Changelog

All notable changes to this template are documented in this file.

## Journey-Slice Governance, Full Pipeline, Reusable Shaping Skills (2026-07-27)

### Removed

- `governance/roles/**` (19 personas including `business-analyst` and the peer-reviewer chain): routing is by skill, and the journey/screen spec is the artifact the BA role used to produce.
- Rules encoding the old issue-centric workflow: `phase-first-operating-model`, `github-issue-pr-traceability`, `github-pr-evidence-policy`, `traceability-and-product-system-record`, `pr-feedback-routing-policy`, `findings-decision-authority`, `protected-governance-capabilities`.
- `governance/playbooks/analyze-pr-learnings.md`: post-merge learning is what Devin session insights already do; a playbook nobody runs is stale documentation.
- `phase-execution-checklists` skill and `docs/traceability/matrix.md`: the checklists now live as a definition of done inside each playbook, and traceability lives in the living documents.

### Added

- `.agents/skills/product-shaping-artifacts/` — product concept and journey/screen spec templates, with the no-duplication, failure-modes-first, design-artifact-on-the-screen, NFR-from-north-star and push-back rules.
- `.agents/skills/design-system-and-ui-generation/` — one design-tool project and one design system per product, low-fi to hi-fi to state sheets to brand assets to journey board to review, with the UI/UX checklist.
- `governance/playbooks/go-to-market-and-aso.md`; Terraform work lives in `product-build.md` stage E and is applied in `product-release.md`.

### Changed

- `AGENTS.md` Core Policy: unit of work is a shippable journey slice; slices are commits and the human decides the size of a PR; living documents instead of evidence packs; two human gates (shaping sign-off, production release); specs fix outcomes and the implementer must push back; a phase exits only when its definition-of-done checklist is ticked.
- `product-shaping.md`: stage 0 produces a concept sketch **with no repository**, gate 0 requires an explicit human go-ahead (repo name, visibility, sponsor) before a repository is created from this template, and an unused repository is flagged for archiving after 14 days.
- `product-build.md`: high-level architecture (integrations, bounded contexts, contracts, ADRs) -> detailed design per capability plus a per-journey sequence view -> QA plan with a case per acceptance criterion and per failure mode -> UI-first slices.
- `product-release.md`: SIT with real sandboxes -> readiness and store compliance -> human gate -> progressive rollout -> day 7/14 north-star review. Go-to-market moved out to its own playbook.
- `docs/product/`, `docs/qa/`, `docs/architecture/`, `docs/changes/` indexes describe living documents rather than per-issue evidence packs; `README.md` operating model and workflow map redrawn accordingly.
- CI: dropped the `governance/roles` check, added checks for the shaping/design templates and the shaping/build playbooks.

## GitHub Issue And PR Templates Removed (2026-07-26)

### Removed

- Deleted `.github/ISSUE_TEMPLATE/**` (product idea, product feature, product release, journey chunk, config) and `.github/PULL_REQUEST_TEMPLATE/**` (core, engineering, integrated-delivery, exception-hotfix). Issues and PRs are written from the phase playbooks and checklists instead of form scaffolding.
- Deleted the matching scaffold assets from `product-system-governance-and-traceability` (`journey-chunk-issue-template.yml`, `pull_request_template_core.md`, `pull_request_template_engineering.md`) and their routing rows.
- Dropped the `Verify PR templates exist` CI step from `.github/workflows/ci.yml` and the `ci-light.yml` skill asset.

### Changed

- `FIRST_PILOT_RUNBOOK.md`, `DEVIN_SOFTWARE_FACTORY.md`, `GITHUB_REPO_MIGRATION_RUNBOOK.md`, and `scripts/migrate-ado-repo.sh` no longer reference or copy the template directories; issue creation is described by phase label and linkage instead of by form path.

## Devin-Native Governance Layout (2026-07-26)

### Removed

- Deleted the Cursor-specific layout: `.cursor/` no longer exists (`mcp.json`, `commands/`, `rules/*.mdc`, `agents/`, `skills/` all re-homed or dropped).
- Removed the orchestrator entirely: `orchestrator` and `project-reporter` roles, the `start-product-ai-workflow` dispatcher, the `orchestration-and-delivery-operations` skill, and the `orchestrator-reliability`, `issue-workflow-state-machine`, and `human-operation-modes` rules.
- Deleted `.github/workflows/hbe-rework-placeholder.yml` (dry-run scheduler payload for external agent runtimes).
- Deleted `draft-ai-workflow.md`; it duplicated `README.md`, the phase playbooks, and `governance/rules/phase-first-operating-model.md`.

### Changed

- New layout: `.agents/skills/<skill>/` (Devin's native skill path), `governance/rules/*.md`, `governance/roles/*.md`, `governance/playbooks/*.md`, with `governance/README.md` describing it.
- Rules are plain markdown: Cursor `.mdc` frontmatter (`globs`, `alwaysApply`) is replaced by a `Scope:` line.
- Playbooks are named `product-shaping.md` / `product-build.md` / `product-release.md` (from `start-product-*`), selected by the issue's phase label instead of dispatched by an orchestrator command.
- Added `governance/rules/delivery-guardrails.md`, which now carries the guardrails that were spread across the orchestrator rule and skill: phase order, single-writer/de-dup, rework cap and escalation, PR feedback SLAs, progressive rollout, rollback trigger/owner, environment readiness before smoke/regression.
- Escalation targets are the human reviewer rather than an orchestrator role; status updates are GitHub issue/PR comments rather than a reporter role.
- GitHub access is the Devin GitHub integration; MCP config and MCP-specific policy lines are gone from `AGENTS.md` and `README.md`.
- CI adds a governance-assets check (`governance/rules|roles|playbooks`, `delivery-guardrails.md`, `.agents/skills`) and the existing template checks point at the new skill paths; `scripts/migrate-ado-repo.sh` and the migration runbook copy `governance/` + `.agents/` instead of `.cursor/`.

## Orchestrator State Removal (2026-07-26)

### Removed

- Deleted the orchestrator state store: `.cursor/state/` (including `.cursor/state/orchestrator/README.md`), the committed `state.json`/`events.jsonl` replay contract, and the `locks/<runId>.lock` single-writer lock protocol. No runtime state is committed anywhere in the repo.
- Removed resume/checkpoint machinery: heartbeat interval, stall timeout, "persist checkpoints / resume from latest checkpoint", fail-closed lock acquire/refresh/release, stale-lock recovery and force-unlock, and "new run blocked if prior state changes are unmerged".
- Removed the `Tracking fields` section from `issue-workflow-state-machine` (it was the persisted `state.json` contract) and the `.cursor/state/**` glob from both orchestrator rule frontmatters.
- Deleted `.github/workflows/hbe-resume-on-merge-placeholder.yml`; the `changes_requested` rework placeholder is unchanged.
- Dropped the `Orchestrator run ID` and `Idempotency key` fields from the integrated-delivery PR template.

### Changed

- Rationale: the replay store and lock existed to resume short-lived, stateless slash-command runs. Devin runs a persistent agentic loop with native session resume, so in-session continuity needs no checkpointing.
- Phase, status, and ownership are now always read live from GitHub (issue labels, issue assignee, PR status) instead of a persisted store; transitions are recorded by updating GitHub itself.
- Single-writer coordination is GitHub-native: one assignee, one branch, and one open integrated PR per shaping issue. Independent build issues run as child sessions on separate branches, merged in dependency order.
- Idempotency is GitHub-derivable: before creating a branch, PR, or status comment, check whether one already exists for the issue and reuse it or no-op.
- Updated `AGENTS.md` (Core Policy line replaced with session continuity + GitHub-native phase tracking), `README.md`, `draft-ai-workflow.md`, `docs/operations/DEVIN_SOFTWARE_FACTORY.md`, `docs/operations/FIRST_PILOT_RUNBOOK.md`, `docs/release/GO_LIVE_READINESS_CHECKLIST.md`, the orchestrator role and phase commands, `human-operation-modes`, `orchestration-and-delivery-operations`, and `idempotency-checklist.md`.

### Retained

- Delivery guardrails: rework-loop cap and escalation triggers, PR feedback SLAs, progressive rollout (5% -> 25% -> 100%), rollback trigger/owner, and blocking smoke/regression until environment readiness signals are true.
- The lesson-learn loop: `analyze-pr-learnings` (Devin Playbook) and `docs/release/POST_RELEASE_LEARNING.md`.
- Phase-first operating model, traceability, checklist-first evidence, one-integrated-PR default, and human-in-loop signoff.

## GitHub Software Factory Migration (2026-07-25)

### Included

- Added `docs/operations/DEVIN_SOFTWARE_FACTORY.md`: maps `.cursor/skills|agents|rules` to Devin Knowledge, `.cursor/commands/start-product-*` to Devin Playbooks, GitHub MCP auth to the Devin GitHub integration, and `.cursor/state/orchestrator/` to git-committed state persistence/replay.
- Added `docs/operations/GITHUB_REPO_MIGRATION_RUNBOOK.md`: history-preserving Azure DevOps -> GitHub repo migration plus template/scaffold/CI installation per repo.
- Added `docs/operations/REGISTRY_MIGRATION_RUNBOOK.md`: executable Azure Artifacts -> GitHub Packages rollout with the migration-PR evidence pack template.
- Added `docs/operations/DEVELOPER_SETUP.md`: private `@appsindie/*` package access for local dev, CI, and Devin sessions.
- Installed the governance scaffold in this template: `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE/core.md`, `.github/PULL_REQUEST_TEMPLATE/engineering.md`, `.github/ISSUE_TEMPLATE/journey-chunk.yml`, `.github/CODEOWNERS`.
- Added library registry assets: `publish-github-packages.yml` (tag-triggered publish with `packages: write` only), `npmrc-consumer.example`, `npmrc-library.example`.
- Added `docs/operations/MIGRATION_INVENTORY.md` (real Azure DevOps repo/package inventory, version plan, open gaps) and `scripts/migrate-ado-repo.sh` (mirror + scaffold one repo).

### Changed

- `AGENTS.md` opening is now runtime-agnostic (Devin, Cursor, or other) with Core Policy untouched.
- `ci-light.yml` skips Node steps when there is no `package.json`, passes `NODE_AUTH_TOKEN` for GitHub Packages installs, and adds governance checks for the AGENTS Core Policy heading and for Azure Artifacts references in package config.
- `registry-and-migration.md`: GitHub Packages is now the current default; Azure DevOps Artifacts is recorded as the previous source with a rollback procedure and window; added a maintainer-mode section.
- `internal-frontend-react-and-react-native-libraries` SKILL now covers consumer **and** maintainer mode; `frontend-engineer` and `devops-engineer` route to it for library-repo authoring, releasing, and registry/publish pipeline changes.

## Workflow Enhancement (2026-05-01)

### Included

- Added hybrid UX requirement flow across shaping/build roles:
  - PO defines product-level UX intent.
  - BA defines executable UX/accessibility requirements.
  - FE provides UX behavior evidence mapped to SRS/LLD acceptance.
- Added UX requirement fields to canonical shaping/build templates:
  - `.cursor/skills/product-discovery-dvf/assets/dvf-brief.md`
  - `.cursor/skills/requirements-engineering/assets/spec.md`
  - `.cursor/skills/solution-architecture-and-adr/assets/lld.md`
- Added skill-driven quickstart assets for project bootstrap:
  - React Native quickstart checklist
  - Spring Boot quickstart checklist
  - DevOps/IaC quickstart checklist
- Added operational internal-library playbook assets for AppsIndie React Native packages, including per-library integration notes and registry migration guidance.

### Changed

- Updated role contracts for `product-owner`, `business-analyst`, `frontend-engineer`, and `design-peer-reviewer` to explicitly cover UX intent, executable UX requirements, UX evidence, and UX design fidelity checks.
- Updated phase checklist gates to require UX completeness at shaping/build acceptance.
- Updated `requirements-engineering` schema guidance to keep `FR/NFR` IDs while adding explicit requirement category tagging (including UX/accessibility).
- Updated `README.md` with quickstart discovery paths under skill assets.

## Workflow Update (2026-05-01)

### Included

- Added canonical unified command: `/start-product-ai-workflow` with minimal URL input contract (`prUrl` or same-phase `issueUrls[]`).
- Added confidence blocking behavior for ambiguous phase/state detection.
- Upgraded phase commands to be resume-aware and to collect PR review + general PR comments via GitHub MCP.
- Added peer-review impact/complexity pre-check so low-impact work can skip reviewer loops with rationale.
- Added `/analyze-pr-learnings` command for cross-repo PR URL analysis and workflow improvement proposals.
- Added two dry-run HBE placeholder workflows:
  - `.github/workflows/hbe-rework-placeholder.yml`
  - `.github/workflows/hbe-resume-on-merge-placeholder.yml`

### Changed

- Label-driven phase detection is now required (`shaping`, `build`, `release`).
- Rework routing is embedded in unified/phase commands instead of standalone feedback command flow.
- Runbook and README now document shaping-scoped develop-branch strategy and human promotion to `main`/tags.

### Removed

- Removed `.cursor/commands/route-pr-feedback.md`.
- Removed `.cursor/commands/switch-operation-mode.md`.
- Removed `.github/workflows/pr-feedback-autoroute.yml` classifier workflow.

## Initial Release (2026-04-30)

### Included

- Phase-first commands for shaping, build, release, PR-feedback routing, and operation-mode switching.
- Peer-reviewer sub-agent set across product, architecture, requirements, design, QA, and release artifacts.
- `project-reporter` and `market-researcher` personas with explicit model and routing contracts.
- Phase checklist assets including peer-review report template and idempotency/feedback routing checklists.
- Human operation mode policy with auditable `human_in_loop` to `human_by_exception` transition flow.
- Security trigger policy with explicit orchestrator invocation ownership and escalation rules.
- GitHub issue/PR templates aligned to Product Idea, Product Feature, Product Release, and integrated delivery.
- PR feedback auto-routing workflow (`.github/workflows/pr-feedback-autoroute.yml`) with artifact-first and intent-fallback routing.
- First pilot operational runbook at `docs/operations/FIRST_PILOT_RUNBOOK.md`.

### Changed

- Canonical work-item identity uses GitHub issue ID.
- Governance/rules/skills embed quality controls in phase checklists.
- Routing and reporting guidance aligns to GitHub MCP as shared state plane for local and cloud agents.
- Baseline CI workflow file `.github/workflows/ci.yml` is intentionally not part of this initial baseline.
