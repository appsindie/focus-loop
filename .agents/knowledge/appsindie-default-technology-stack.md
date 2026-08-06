---
name: AppsIndie Default Technology Stack
id: note-a0c6c3e1873b44fa9c7aa4af3c66936c
author: user
scope: When choosing or reviewing the technology stack for any AppsIndie project
---

# AppsIndie Default Technology Stack (Global)

Default technology choices for new AppsIndie products. These are **defaults, not mandates** — a project MAY override any choice when its context requires it, but the override MUST be recorded as an ADR (context, chosen option, rejected options, flip conditions). Absent an ADR, the defaults below apply.

## Mobile (Expo)

- Expo (managed workflow)
- TypeScript
- Corelib (shared AppsIndie core library)
- Expo Router
- TanStack Query
- React Context (add Zustand when shared client state grows beyond Context)
- React Hook Form + Zod
- MMKV + SecureStore
- Reanimated
- FlashList
- Firebase Auth, Analytics, Crashlytics
- `expo-notifications` over FCM/APNs

## Web

- Vite + React Router
- React
- TypeScript
- shadcn/ui + Radix UI + Tailwind
- TanStack Query
- React Hook Form + Zod
- TanStack Table
- Lucide
- Cloudflare Pages for static hosting (SPA with `_redirects` fallback)

> Next.js is still a valid override for products that need SSR/ISR or have already shipped on Next.js (e.g. StayHub admin); new products default to Vite + React Router unless an ADR says otherwise.

## Backend

- Java LTS
- Spring Boot
- Spring Modulith
- PostgreSQL
- JPA / Hibernate
- REST + OpenAPI
- Azure Container Apps
- Event Grid + Outbox (transactional outbox for reliable event publishing)
- Blob Storage
- Terraform + GitHub Actions
- OpenTelemetry
- Firebase Admin SDK (verify ID tokens, send FCM pushes)

## Firebase (apps + backend)

Firebase covers the four things that are cheaper to buy than to build — identity, crash reporting, product analytics and push transport. It is **not** the authorization system and **not** the observability backend for the API; those stay in the backend.

| Concern | App side | Backend side | Boundary that matters |
|---|---|---|---|
| Auth | Firebase Auth (phone / email / social) issues the ID token | verifies the token via Firebase Admin SDK, then issues **its own** session and resolves roles from its own tables | Firebase answers *who*; the backend answers *what they may do*. Keep an internal `userId` as the primary key so the provider stays replaceable |
| Crash | Crashlytics (native crashes + non-fatals) | — | Crashlytics is for the app process only; API errors belong in the API's traces, not in Crashlytics |
| Analytics | Firebase Analytics for UI funnels (screen views, taps, drop-off) | product/north-star events are emitted by the **owning backend context**, not the client | An event that must be complete and auditable (money, provisioning, SLA) is a backend event; a client-only funnel event is Analytics |
| Push | `expo-notifications` for permission, token, foreground handling, deep-link routing | Firebase Admin SDK (FCM) to send; APNs is reached through FCM | `expo-notifications` is the **app API**; FCM is the **transport**. The Firebase Messaging JS/web SDK is not used in an Expo app. Web apps may use the Firebase JS Auth SDK for sign-in only. |

Rules:

- Never put a secret, passcode, document number or full name in an Analytics parameter, Crashlytics key or notification payload — a push carries an id and the app fetches the rest.
- Notifications are content-agnostic and idempotent: the same send key delivered twice must not produce two user-visible states.
- Analytics is opt-out-able and disabled in development builds; a debug session must not pollute product funnels.
- Firebase config files (`google-services.json`, `GoogleService-Info.plist`, web `firebaseConfig` objects) contain no secret and are committed or embedded at build time, so builds are reproducible; service account keys are secrets and are **never** committed.
- One Firebase project per product, one app per bundle id / package name; a new bundle id means a new Firebase app, not a reused one.
- Web Firebase config may be stored as a JSON string or an unquoted object literal in `VITE_FIREBASE_CONFIG`/`EXPO_PUBLIC_FIREBASE_CONFIG`; the web Vite app normalizes it at runtime.

## Observability

The application is instrumented **once**, with OpenTelemetry, and knows nothing about where the data goes. Where it goes is environment configuration, so the same build runs on a laptop and in Azure:

- **Code:** OpenTelemetry traces, metrics and logs. Logs carry `trace_id` / `span_id`. No vendor SDK in application code, so the backend is runnable without any monitoring stack at all.
- **Local:** `OTEL_EXPORTER_OTLP_ENDPOINT` points at a collector in `docker-compose` (sample 100%). With the variable unset the app must still start and serve — missing monitoring is not an outage.
- **Azure:** Application Insights, wired with `APPLICATIONINSIGHTS_CONNECTION_STRING` (JVM agent or the Azure Monitor OpenTelemetry exporter) and a sampling rate per environment. Adding it is a deployment variable, never a code change.
- **Alerts:** on the outcomes the product exists to prevent (a failed provisioning job, an ageing exception queue, an unpaid settlement), not on CPU. A silent automation failure MUST alert.

## Override rule

- One override decision = one ADR.
- An override is scoped to the project that records it; it does not change this default for other products.
- When a project overrides a datastore or runtime, the ADR MUST state the data migration and rollback implications.