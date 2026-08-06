---
name: engineering
description: Implement backend, web, mobile and shared-library changes aligned to approved spec, design and contracts.
---

## Purpose
Implement backend, web, mobile and shared-library changes aligned to approved spec, design and contracts.

## When to use
- Building or updating backend/domain/API, React/React Native apps, or shared frontend libraries.
- Bootstrapping a new service or app for a feature stream.

## Operating rules
- Re-check and update living docs (`PRODUCT_SPEC_LIVE.md`, `DESIGN.md`, architecture/LLD, `QA_PLAN.md`) before starting a slice.
- For screens in essential journeys, review the screen spec and mockups and record design alignment before coding.
- Keep changes minimal and scoped; follow existing conventions.
- Separate presentation, business logic, data access and infrastructure.
- Explicit contracts, explicit error handling, validation and idempotency.
- Run the repository's `verify` entry point **as you generate** — after each file or class, before each commit, and green before firing a reviewer. A repo with no such entry point gets one before the slice proceeds — free, local tooling only, minimum bar being a formatter, a linter and a type/compile check with warnings as errors. Cadence, tool baseline per stack and the suppression rules are in **AppsIndie Static Analysis Convention**.
- If a check will not go green after two attempts, raise an exception via the `escalation` skill. Never weaken a rule, extend an ignore file or report a red tree as green to get past it.
- Every PR: `verify` and tests green.
- Instrument north-star events as part of the slice, not afterwards.
- Mobile observability is Firebase (Crashlytics, Performance, Analytics): map events to the journeys the slice touches, and collect nothing the north-star and guard-rail metrics do not need. Verification that the events actually emit from a deployed environment belongs to `production-readiness`.

## Templates

| Use | Path |
| --- | --- |
| **`verify` reference configs** | `.agents/skills/engineering/assets/verify/` — start here rather than hand-rolling |
| Spring Boot quickstart | `.agents/skills/engineering/assets/spring-boot-quickstart.md` |
| React Native quickstart | `.agents/skills/engineering/assets/react-native-quickstart.md` |
| Shared library catalog | `.agents/skills/engineering/assets/library-catalog.md` |
| Shared library publish workflow | `.agents/skills/engineering/assets/github/publish-github-packages.yml` |
| npmrc examples | `.agents/skills/engineering/assets/github/npmrc-consumer.example`, `npmrc-library.example` |
| Registry migration notes | `.agents/skills/engineering/assets/registry-and-migration.md` |
| Library docs | `.agents/skills/engineering/assets/libraries/*.md` |
