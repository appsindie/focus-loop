---
name: AppsIndie Backend Architecture, API & Observability Convention
id: note-1aa18119af054d6ea1c8a6f121072301
author: user
scope: When designing, implementing, or reviewing backend architecture, API contracts, event handling, observability, or distributed tracing for any AppsIndie product
---

<!-- id: note-1aa18119af054d6ea1c8a6f121072301 | name: AppsIndie Backend Architecture, API & Observability Convention | author: user | scope: When designing, implementing, or reviewing backend architecture, API contracts, event handling, observability, or distributed tracing for any AppsIndie product -->

# AppsIndie Backend Architecture, API & Observability Convention

Backend code for AppsIndie products is organized as **Domain-Driven Design bounded contexts** (feature modules), each internally structured with **hexagonal architecture**, exposing functionality through **API-first** contracts, communicating across contexts through synchronous service calls or asynchronous domain events, and fully observable through **OpenTelemetry** distributed tracing.

## 1. Bounded context (feature module)

A bounded context is a vertical slice that owns a subset of the business domain, e.g. `access`, `booking`, `billing`, `identity`, `documents`, `ingest`, `operations`.

- Each context has its own `domain`, `application`, `infrastructure`, and `api` packages.
- Contexts do not reach into another context's database tables or repositories directly.
- Shared concepts (e.g. `User`, `Account`, `Tenant`) live in a small `platform` or `shared` kernel with the minimal surface needed by multiple contexts.

## 2. Hexagonal structure inside each context

```
<context>/
  api/              # Driving adapters: REST controllers, gRPC, GraphQL, CLI handlers
  application/      # Use cases / application services; defines inbound and outbound ports
  domain/           # Entities, value objects, domain events, domain services, invariants
  infrastructure/   # Driven adapters: JPA repositories, external API clients, message producers, outbox/inbox tables
```

- `domain` must not depend on Spring, JPA, Jackson, HTTP, or any infrastructure concern.
- `application` declares **ports** (interfaces) for everything it needs from the outside world.
- `infrastructure` provides concrete adapters and maps between persistence/external models and domain models.
- `api` maps HTTP/gRPC requests to application use cases and maps responses back.

## 3. Cross-context communication

- **Synchronous in-process call** — call another context's application service/port directly when immediate consistency is required and both contexts live in the same repo/monolith.
- **service-api sync call** — when contexts are separate services, use `/api/service/v1/**` with `X-Service-Key`. Include `traceparent`, `correlation-id`, and `idempotency-key` headers.
- **Asynchronous domain event** — when eventual consistency is acceptable, when cross-repo/cross-service, or when the producer should not block. Events use the outbox/inbox pattern.

There is no rule that every cross-context call must be an event. Prefer sync for strong consistency and event for loose coupling and asynchrony.

## 4. API idempotency for side effects

Every mutating endpoint (POST/PUT/PATCH/DELETE that changes state) must accept an `Idempotency-Key` header.

- The server stores `(idempotency-key, request-signature, response, created-at)` for at least 24 hours.
- Repeating the same request with the same key returns the stored response without re-executing side effects.
- Different request bodies with the same key return `409 conflict` or `422 unprocessable_entity`.
- The key must be provided by the client and propagated through sync service calls and event metadata.

## 5. Event-Driven Architecture with outbox and inbox

- Domain events carry: `eventId` (UUID v4), `correlationId` (from request or generated), `causationId` (previous event id, if any), `aggregateId`, `tenantId`, `occurredAt`, and a semantic `type`.
- Events are persisted in an **outbox** table inside the same transaction as the business write, then relayed asynchronously.
- Downstream contexts consume through an **inbox** table; consumers deduplicate by `eventId` and are safe to replay.
- Integration with external systems (payments, locks, email, push) is modeled as commands that can fail; failures are events too.

## 6. Distributed tracing and observability

- Every incoming HTTP request and every event consumer starts an OpenTelemetry span.
- Context propagation:
  - REST: `traceparent` header.
  - service-api: `traceparent` + `correlation-id`.
  - outbox/inbox: carry `traceparent` in event metadata and restore it in the consumer.
- All logs carry `trace_id`, `span_id`, `tenant_id`, `actor_id`.
- External calls (HTTP, DB, blob, lock, payment) create child spans with standard attributes (`http.method`, `db.system`, `peer.service`, etc.).
- Application code is instrumented once with OpenTelemetry; where traces go is environment configuration, never vendor SDK in business logic.
- Alerts are on business outcomes (failed provisioning, ageing exception queue, unpaid settlement), not CPU.

## 7. API First

- APIs are designed from OpenAPI / AsyncAPI contracts before implementation.
- Server and client types are generated from the contract where practical.
- REST endpoints follow the AppsIndie trust-boundary convention: `/api/client/v1/**`, `/api/service/v1/**`, `/api/integration/v1/**`.
- Public contracts are versioned and do not expose internal identifiers or infrastructure details.

## 8. Idempotency and resiliency

- Mutating endpoints require `Idempotency-Key` (see §4).
- External calls use retries with exponential backoff, circuit breakers, timeouts, and bulkheads to prevent cascade failure.
- Event consumers use a retry ladder with a dead-letter queue (DLQ) for poison messages.
- Read models / projections can be eventually consistent; commands must return clear status or a tracking token.
- Never assume exactly-once delivery: design for at-least-once, idempotent, ordered where required.

## 9. Ports for external dependencies

Every external system is accessed through a port:

- Persistence: repository port implemented by JPA/Postgres.
- File storage: `FileStoragePort` implemented by local disk or Azure Blob.
- Smart locks: `TTLockPort` with fake and live adapters.
- Payment: `PaymentGatewayPort` with mock and VietQR/live adapters.
- Identity/Auth: `IdentityPort`, `EntitlementPort` decoupled from Firebase Admin SDK.
- Messaging: `EventPublisherPort` implemented by an outbox relay.

## 10. Migration path

- Existing package-by-feature code should be migrated one bounded context at a time.
- Do not big-bang the entire backend. When touching a context, move it closer to the structure above and update its ADR.
- New features must start in this structure from day one.

## 11. Verification

- Domain and application unit tests run without Spring, DB, or network.
- Adapter integration tests are gated by environment variables and can run with fake/local adapters by default.
- Contract tests verify OpenAPI/AsyncAPI compliance before a PR is merged.
- Tracing smoke tests verify `trace_id` propagation across client → API → service call → outbox → inbox.
