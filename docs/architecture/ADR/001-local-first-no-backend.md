# ADR-001 — Local-first, no backend for MVP

## Status
Draft — pending Gate 1 shaping review.

## Context
Focus Loop is a single-user Pomodoro timer. The Gate 0 economics assume no AI cost and no variable infrastructure cost per MAU. A backend would add fixed cost, operational load, and build weeks without materially improving the core value proposition for the Pilot/MVP.

## Decision
All state (session log, settings, unlocks, streaks) is stored locally on the device for Pilot and MVP. There is no backend API.

## Consequences

**Positive**
- Fits the 6-week build budget.
- Keeps unit economics clean: variable contribution per MAU equals ad ARPU.
- No data privacy risk from a backend; no PII sync.
- Offline-first by default.

**Negative**
- No cross-device sync in MVP.
- No server-side analytics; attribution relies on Firebase/AdMob SDKs.
- Device loss = data loss unless user opts into platform cloud backup (iCloud/Google Backup).
- Future sync feature requires a migration plan and local-ID stability.

## Alternatives considered

| Option | Forces | Why rejected |
| --- | --- | --- |
| Firebase Firestore sync | Enables cross-device sync, low backend setup | Adds variable cost and complexity; not needed for MVP; can be added in MMP. |
| Self-hosted Spring Boot backend | Full control, reusable AppsIndie backend stack | Far exceeds 6-week build; no user value in MVP. |
| SQLite with future sync schema | Keeps options open | Accepted as mitigation — use stable local IDs and UTC timestamps. |

## What would flip the decision
- A Gate 0 review showing cross-device sync is a must-have (not the case).
- A Phase 2 requirement for coach/team dashboard or real-time leaderboards.
