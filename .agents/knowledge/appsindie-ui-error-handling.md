---
name: UI Error Handling for AppsIndie
id: note-f016699fd64342d4ad55422dc5921e53
author: user
scope: When building or reviewing AppsIndie frontend, mobile, or API code that surfaces errors to users
---

<!-- id: note-f016699fd64342d4ad55422dc5921e53 | name: UI Error Handling for AppsIndie | author: user | scope: When building or reviewing AppsIndie frontend, mobile, or API code that surfaces errors to users -->

# AppsIndie UI Error Handling

Never display raw exception messages, HTTP status text, or SDK error strings to end users.

## Rule

1. Backend returns stable, machine-readable error codes in RFC 9457 `application/problem+json` responses. Set a `code` property (e.g. `auth/invalid-credentials`, `event/not-found`).
2. Frontend maintains an error-code registry that maps backend codes and SDK error codes to i18n keys (`error.*`).
3. Before any error text is rendered, it must pass through the translation layer. If a code is unknown, show a generic, safe user message and log the original error for debugging.
4. Firebase/auth SDK errors, network failures, and validation errors all flow through the same registry.
5. Keep error keys in product dictionaries (`packages/i18n` or equivalent) and add new keys whenever a new code is introduced.

## Why

- Raw SDK strings (e.g. `auth/invalid-email`) leak implementation details and are often in English.
- Human-readable, localized messages are required for trust and usability.
- Stable codes let clients branch on behavior and keep copy changes out of business logic.

## Flip conditions

None. This is a hard rule for every AppsIndie product.
