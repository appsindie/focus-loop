---
name: product-design
description: Produce a consistent, accessible UI: one design system per product, screens generated against it, and a review before sign-off.
---

## Purpose
Produce a consistent, accessible UI: one design system per product, screens generated against it, and a review before sign-off.

## When to use
Any new product, app surface, journey, or screen that a human will review.

## Outputs
- `docs/product/DESIGN.md` — the product's design system instance.
- Screens and journey boards in the design-tool project.
- `docs/product/DESIGN_REVIEW.md` — findings, fixes and metric-impact decisions.

## Operating rules
- One design-tool project and one design system per product. Record projectId and system asset id in `DESIGN.md`.
- Sequence: brand input → low-fidelity journey overview → screens → state sheets → brand assets → high-res renders → journey board.
- Every screen needs loading, empty, error and success states, plus a sheet for the product's worst failure state.
- Metric-critical screens only get alternative variants and an element-minimisation audit; compare on measurable proxies, not preference.
- Theme tokens are semantic (surface, text-primary, action, success, danger, etc.) with values per theme (light/dark). Screens and code reference semantic tokens only.
- Loading states prefer animated skeleton placeholders that mirror the incoming content shape; avoid indefinite spinners. Respect `prefers-reduced-motion` by falling back to a static placeholder.
- Responsive surfaces only where justified: phone for guests, tablet/wide for operator queues, wide-first for admin.
- Review every screen against its spec and every journey end to end; record findings in `DESIGN_REVIEW.md`.

## Templates

| Use | Path |
| --- | --- |
| Design system | `.agents/skills/product-design/assets/design-system.md` |
| UI decision record (metric-impact, variants, minimisation) | `.agents/skills/product-design/assets/ui-decision-record.md` |
| Gate review checklist | `.agents/skills/product-design/assets/gate-review.md` |
