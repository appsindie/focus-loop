# Product documents

Living documents, updated in the same PR as the change they describe.

- `PRODUCT_CONCEPT.md` — high-level sketch: north-star metrics and guard-rails, channel objectives, pain/gain, journey -> screen map, scope cuts, phases, business acceptance criteria. Template: `.agents/skills/product-shaping-artifacts/assets/product-concept.md`.
- `MARKET_RESEARCH_LIVE.md` — validation-gate brief: market evidence, source log, and pass/fail validation plan for the Gate 0 critical assumption before Pilot build.
- `PRODUCT_SPEC_LIVE.md` — journey and screen spec: per journey value, entry, exit, internal navigation, rules, variants and failure modes; per screen intent, data, primary action, rules, design reference. Template: `.agents/skills/product-shaping-artifacts/assets/journey-and-screen-spec.md`.
- `DESIGN.md` — the product's instance of `.agents/skills/design-system-and-ui-generation/assets/design-system.md`; `DESIGN_REVIEW.md` records the UI/UX pass.
- `design/` — approved copy of the design canvas (`source/*.dc.html` + 2× `png/`), listed in `design/SNAPSHOT.md`. Never edited by hand: change the canvas and sync.
- `../brand/design/` — shared brand: tokens, icons, app icon master, brand boards.
- `mockups/` — exploration only (Pilot mockups, concept boards); not a build reference.
- `LIVE_SRS.md` — optional formal requirements, only when a client or audit demands that form.
