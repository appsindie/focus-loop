---
name: Transactional Outbox Relay Coordination for AppsIndie
id: note-d78f47788d124356af86a42c0ed8b88e
author: user
scope: When implementing a transactional outbox relay or scheduled poller in a Spring Boot / Java backend that runs more than one replica (e.g., Azure Container Apps, Kubernetes, or any horizontally scaled deployment).
---

<!-- id: note-d78f47788d124356af86a42c0ed8b88e | name: Transactional Outbox Relay Coordination for AppsIndie | author: user | scope: When implementing a transactional outbox relay or scheduled poller in a Spring Boot / Java backend that runs more than one replica (e.g., Azure Container Apps, Kubernetes, or any horizontally scaled deployment). -->

# Transactional outbox relay coordination in multi-replica Java backends

A Spring `@Scheduled` outbox relay will run on every replica if it is not coordinated. Always make the row-claiming step replica-safe before enabling horizontal scale-out.

Preferred approaches (in order):

1. **Row-level lock with `SELECT ... FOR UPDATE SKIP LOCKED` (PostgreSQL).**
   - The relay's repository method should use `@Lock(LockModeType.PESSIMISTIC_WRITE)` + the JPA query hint `jakarta.persistence.lock.timeout = -2` (`SKIP LOCKED`).
   - This lets multiple replicas poll concurrently while each claims a distinct set of unprocessed rows.
   - Keep the batch size small and process inside the same transaction so the lock is released on commit.

2. **Distributed leader election (e.g., ShedLock, Redis/Postgres advisory locks, or a native leader-election sidecar).**
   - Use this when the polling workload does not benefit from parallel batch processing or when the datastore does not support `SKIP LOCKED`.
   - Ensure the lock is released automatically on process crash / termination.

Anti-pattern:
- Do not rely on `@Scheduled` alone without coordination; it causes duplicate event processing, duplicate external calls, and data drift across replicas.

Verification:
- Run at least two local instances (or two threads with separate DB sessions) against a shared database.
- Insert several outbox rows and confirm each row is processed exactly once (or, for at-least-once designs, is deduplicated before external side effects).
- Inspect the generated SQL to confirm `for update ... skip locked` (or equivalent) is present.
