---
name: AppsIndie Portfolio Opportunity Policy
id: note-15d3e5e7f456496bb6e2b2d5388a03bb
author: user
scope: When deciding whether an app idea deserves a portfolio slot, measuring post-launch contribution, or applying evidence discipline to market claims in any AppsIndie project
---

# AppsIndie Portfolio Opportunity Policy

Portfolio-level rules that survive past research. `release` and `growth` (when added) must measure a shipped product with the same contribution definitions Gate 0 used to approve the slot.

Research-process thresholds (gate §3.1, scoring weights §4.1, multipliers §5.x) live only in `.agents/skills/opportunity-research/assets/opportunity-research-v5.md`. Do not copy them here.

## Strategy

- Primary monetization is **ads-first**. Premium, subscription, B2B and B2B2C are expansion paths, not entry requirements.
- Target market is global with Tier 1 preference (US, UK, Canada, Australia and other high-yield geographies).
- AppsIndie currently has **no** existing portfolio advantage (audience, cross-promotion, category authority). Do not award points for cross-promotion that does not exist yet.
- Twelve-month objective: a repeatable process to research, validate, release and optimise many apps — not a single hit.

## Two contribution definitions — never mix them

**Variable Contribution per MAU** — unit economics and cash break-even:

```text
Variable Contribution per MAU
=
Ad ARPU
+ Subscription Contribution per MAU
+ IAP Contribution per MAU
- AI Cost per MAU
- Variable Infrastructure Cost per MAU
- Variable Support or Moderation Cost per MAU
```

**Net Monthly Contribution** — the number compared to the $2,000 target:

```text
Net Monthly Contribution
=
(Variable Contribution per MAU × MAU)
- Monthly Fixed Cash Operating Cost
```

Developer opportunity cost is **not** subtracted from Net Monthly Contribution. Report it separately when comparing shortlist items.

## Portfolio slot thresholds

An idea may consume a portfolio slot only when **all** of the following hold in the **Base case** (not Optimistic):

| Threshold | Rule |
|---|---|
| Net Monthly Contribution | ≥ **$2,000** at or before **Month 9** after public launch |
| Build weeks | ≤ **8** |
| Validation weeks | Reported separately; not part of the 8-week build cap, but used in portfolio-slot economics |

These are internal AppsIndie decision thresholds, not market benchmarks.

```text
[ASSUMPTION | Reason: Internal portfolio-slot threshold set by AppsIndie.]
```

## Evidence discipline

Every market number, score or empirical claim must carry one tag:

- `[VERIFIED | Source: URL | Accessed: YYYY-MM-DD]`
- `[ESTIMATE | Method: ... | Inputs: ...]`
- `[ASSUMPTION | Reason: ...]`
- `[JUDGMENT | Basis: ...]`
- `[UNKNOWN]`
- `[STALE | Source: URL | Published: YYYY-MM-DD]`
- `[LOW-CONFIDENCE | Reason: ...]`

Do not invent keyword search volume. Prefer store autocomplete, long-tail variant count, competitor review volume and Google Trends as proxies, tagged `[UNKNOWN]` when unverified.

### Acceptable sources (priority order)

1. Apple App Store and Google Play listings
2. Official product websites, pricing, docs and help centres
3. Apple Developer / Google Play Console Help and policy pages
4. Sensor Tower, Appfigures, data.ai or equivalent with a stated method
5. Company / investor reports and public filings
6. Academic or reputable institutional research
7. Reddit / forums for qualitative pain only
8. Store and search-engine autocomplete as keyword-demand proxy

### Low-trust sources (not primary evidence)

"Top apps" listicles, SEO affiliate pages, scrape sites without methods, unattributed AI content, copied blogs, search snippets never opened, Reddit for market size / revenue / eCPM, and a handful of reviews as market representation.

## Meaning of portfolio success

Shipping many apps is not success if they:

- Never reach positive contribution margin
- Create no audience, data or reusable assets
- Yield no evidence reusable for the next app
- Consume disproportionate build weeks
- Survive only by continuous paid acquisition spend

Compare opportunities on: unit economics, realistic acquisition scale, Month-9 $2,000 Net Monthly Contribution, contribution per build-week, validation cost and time-to-signal, assets left if the app fails, and advantage for the next portfolio app.

Use the same yardstick when deciding to **sunset** a shipped app against its kill criteria at Month 3 / 6 / 9.
