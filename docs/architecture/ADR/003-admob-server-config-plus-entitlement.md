# ADR-003: Ad limits via AdMob console; Plus entitlement local

**Status**: Accepted — 2026-10-03
**Deciders**: sponsor (justin.nguyen@appsindie.com)
**Related**: ADR-001 (local-first, no backend), spec J2-R5 / J7, DESIGN.md §5, canvas `1791071241-7cd3`

## Context

The v2.1 design fixes _where_ ads may trigger (leaving Loop complete; leaving Close-out after the 2nd focus when the loop is not completed) but says "the server decides whether they show" (frequency caps, new-user grace). The product is local-first with no backend. Separately, v2 adds Focus Loop Plus (yearly + lifetime IAP), which needs an entitlement decision: where does "is Plus" live without an account system?

## Decision

1. **Ad show/skip logic is AdMob server-side configuration.** The app always fires a designed trigger point; whether an interstitial renders is controlled by AdMob ad-unit frequency caps and related console settings. No AppsIndie service is built for this (sponsor, 2026-10-03: _"admod limit là do admob server config"_). If finer control is ever needed (per-cohort, remote kill-switch), the upgrade path is Firebase Remote Config — still no owned backend — and that is a new ADR when it happens.
   - **New-user grace is owned client-side.** AdMob caps limit impressions per window but cannot express "no ads for the first N days"; the Ad Broker therefore suppresses trigger points until install age exceeds the design's grace window, with the caps as the outer limiter. If the console ever gains cohort-level controls, grace can move server-side without a client schema change.
2. **Plus entitlement is a local flag backed by the store receipt.** Purchase/restore goes through StoreKit / Play Billing; the app caches the entitlement locally. The flag is re-verified on every app start and at the subscription expiry timestamp via the stores' entitlement queries (`currentEntitlements` / `queryPurchases`) — restore is the recovery path, not the only re-check. A lapsed or refunded yearly therefore revokes Plus on the next re-check, without user action. No account, no server-side entitlement service.

## Consequences

- ADR-001 (no backend) still holds: the console is AdMob's, not ours.
- The app cannot honour an ad trigger _decision_ offline — an unfilled/uncapped trigger simply shows nothing; ad failures never block flow (spec J2 variant).
- 24-hour rewarded trials are per-item local records (Entitlement Store), not store transactions.
- Removing ads for Plus is a client-side gate on every ad surface; QA must verify entitlement gating on all surfaces, including the lapse/refund re-check above.
- The client-side grace suppression is a small owned surface (install date in Session Store); it must be covered by the J2 failure-mode tests so a day-1 user never sees an interstitial.

## Alternatives considered

- **Own backend for ad decisions + entitlement** — rejected: contradicts ADR-001 and the no-account wedge; doubles build scope.
- **Firebase Remote Config now** — rejected for this cycle: adds a dependency to satisfy a control AdMob already provides; noted as the upgrade path.
