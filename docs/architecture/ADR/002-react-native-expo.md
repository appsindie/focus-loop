# ADR-002 — React Native / Expo managed workflow

## Status
Draft — pending Gate 1 shaping review.

## Context
The product must ship on iOS and Android with a single codebase and stay within 6 build weeks. The AppsIndie default mobile stack is Expo (managed workflow) with TypeScript.

## Decision
Build Focus Loop with React Native inside Expo managed workflow. Use EAS Build for binaries and EAS Submit for store submission. Eject to bare workflow only if Android AccessibilityService or another native module cannot be achieved with Expo Config Plugins / development builds.

## Consequences

**Positive**
- One codebase for iOS + Android.
- Fast iteration via Expo Go for timer logic and UI.
- EAS handles certificates, builds, and submissions.
- Aligns with AppsIndie default stack; components may be reusable for I04 Routine Clock if that opportunity clears its own Gate 0, but no Focus Loop design decision is driven by it.

**Negative**
- Native modules (AccessibilityService, some ad SDKs) may require prebuild / config plugins.
- Larger binary size than pure native.
- New Expo SDK releases require migration.

## Alternatives considered

| Option | Forces | Why rejected |
| --- | --- | --- |
| Flutter | Cross-platform, high performance | Not AppsIndie default; team has no Flutter corpus. |
| Native Swift + Kotlin | Best performance and smallest binary | Doubles build time and maintenance; exceeds 6-week MVP. |
| Expo bare workflow from start | Native flexibility | Adds build/maintenance complexity without proven need. |

## What would flip the decision
- App-blocking cannot be implemented in managed workflow and the feature is deemed critical (risk is accepted and mitigated by making it optional).
- Store rejection specifically cites Expo / RN runtime.
