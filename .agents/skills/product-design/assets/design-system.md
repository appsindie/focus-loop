# <Product> Design System — <theme name>

One-paragraph intent: <mood, mode (light/dark), what it must be good at — e.g. legible in daylight on a phone, operational and calm>.
Source: <client UI kit / existing app / brand guideline>.

## Theme topology

Two layers. **Primitives** are the palette; **semantic tokens** are the only thing screens and components reference. A raw hex outside this file is a defect.

### Primitives
`<name-scale>`: `<hex>` … (brand ramp, neutral ramp, success/warning/danger ramps). Named by colour, never by usage.

### Semantic tokens (per theme)

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `surface` | app background | `<hex>` | `<hex>` |
| `surface-variant` | cards, grouped rows | `<hex>` | `<hex>` |
| `surface-raised` | sheets, dialogs (elevation by surface step, not shadow, on dark) | `<hex>` | `<hex>` |
| `border` | dividers, input outlines | `<hex>` | `<hex>` |
| `text-primary` | titles, values | `<hex>` | `<hex>` |
| `text-secondary` | supporting text (SHALL meet AA on `surface`) | `<hex>` | `<hex>` |
| `text-muted` | decorative only, never load-bearing | `<hex>` | `<hex>` |
| `action` / `on-action` | primary button and its label | `<hex>` / `<hex>` | `<hex>` / `<hex>` |
| `action-disabled` / `on-action-disabled` | disabled primary | `<hex>` / `<hex>` | `<hex>` / `<hex>` |
| `success` / `on-success` | positive state | `<hex>` / `<hex>` | `<hex>` / `<hex>` |
| `warning` / `on-warning` | needs attention | `<hex>` / `<hex>` | `<hex>` / `<hex>` |
| `danger` / `on-danger` | error and destructive | `<hex>` / `<hex>` | `<hex>` / `<hex>` |
| `<product-critical role>` | `<e.g. the code/amount display that must stay legible in sunlight>` | `<hex>` | `<hex>` |

### Theme rules
- Dark is a **remapping**, not a redesign: same components, same layout, same token names.
- Brand and danger hues usually need a lighter, less saturated value on dark surfaces; verify AA per theme (4.5:1 body, 3:1 large text and meaningful non-text) rather than assuming the light values carry over.
- Status is icon + text in every theme; colour alone never carries meaning.
- Shipped themes in the first release: `<light only / light + dark / system-following>`. Tokens for the unshipped theme still exist and are contrast-checked, so enabling it later is a mapping change.

### Theme object binding (`<shared UI core / MUI / Tailwind config / token package>`)

The tokens above bind onto the theme object the code already has, so implementation is configuration rather than new styling code. Delete this section only if the product genuinely has no shared theme object.

| Semantic token | Key in `<theme object>` | Light | Dark |
| --- | --- | --- | --- |
| `<token>` | `<key>` *(mark `(augmented)` when the library lacks it)* | `<hex>` | `<hex>` |

- Name collisions resolved here, not by the implementer: `<library key>` means `<library meaning>` in the library, so `<our role>` maps to `<key>` instead.
- Augmented keys are declared once, in `<file>`, and are named by role — a colour-named key cannot be remapped for the next theme.
- Non-colour parts of the theme object: spacing scale `<values>`; per-component defaults `<button radius/height, input radius/height, chip shape, icon size>`.
- Library presets/features the product does **not** offer: `<e.g. alternate colour schemes, an in-app theme picker>` — say so, or someone ships them by accident.
- Other surfaces (web console, e-mail): `<how the same tokens map to that platform's palette>`.

## Typography
<Family>. Screen title <size/weight>; section label <size, case, tracking, color>; body <size>; caption <size>. Numeric-critical content (codes, money) uses tabular figures.

## Shape & spacing
<n>px rhythm. Radius: <n>px buttons/cards, <n>px inputs, pill chips. Primary buttons full-width, <n>px tall. Card padding <n>px. Screen margins <n>px.

## Responsive surfaces

| Surface | Actor / context | Breakpoint | Layout |
| --- | --- | --- | --- |
| Phone | `<who, where>` | `< <n>px` | single column, bottom tabs |
| Tablet / wide | `<only the actors who really work at a desk>` | `>= <n>px` | `<master-detail / two-pane / dense table>` |

Screens with a wide variant: `<list>`. Everything else is phone-only by decision, not by omission.

## Components
- **Buttons**: primary / disabled / text-tertiary — fill, label, icon and shape rules.
- **Icons**: <outline or filled>, <stroke>px, <cap style>; active vs inactive color. One icon family only.
- **Navigation**: <bottom tab bar / side nav> rules; active state uses icon + label, not colour alone.
- **Lists & cards**: surface, border, shadow, row height, title/subtitle sizes, trailing affordance.
- **Status chips**: shape and how the semantic colour is applied — always with text, never colour alone.
- **Loading**: animated skeleton placeholders that mirror the content shape (`surface-variant` base + shimmer over `surface`/`surface-raised`), not indefinite spinners; reduce-motion fallback is a static wireframe.

## Brand assets
Mark concept: <description of the symbol and why it means something>. Wordmark: <treatment>.
- <App A> icon: <description>, master `docs/product/brand/icon-<a>-1024.png` (1024x1024, no rounded-corner mask, no padding).
- <App B> icon: <description>, master `docs/product/brand/icon-<b>-1024.png`.
- Splash per app: <background, mark treatment>; splash <= 3s, then a skeleton.
- Platform sizes are generated from the masters by tooling — never hand-produced.

## Tooling
Design tool: **one project per product** — <product> -> projectId `<id>`. Reuse it; never create a second project for the same product.
Design system asset: `<asset id>` (<name>). Pass it on every generation call; update it to evolve the system, never create a new one.
Known tool limitations and workarounds: <record them here so the next session does not rediscover them>.

## UI/UX standards (design-phase gate)
See `.agents/skills/product-design/SKILL.md` — the checklist there is mandatory for every screen and is not duplicated per product. Product-specific additions: <e.g. locale pair and the longer locale, currency formatting, offline-visible content>.

## Do not
<Explicit anti-patterns for this brand — e.g. no dark backgrounds, no gradients or glow, no filled icon sets, no sharp corners.>
