# Focus Loop — Market Research / Validation Gate (MARKET_RESEARCH_LIVE.md)

- **Product Idea issue ID**: I01
- **Date/time (UTC)**: 2026-08-06
- **Research owner**: justin.nguyen@appsindie.com
- **Target persona/segment**: Adults with ADHD, remote workers, students and knowledge workers who need friction-free focus sessions.
- **Validation target date**: 2026-08-09 (before Pilot build starts on 2026-08-11).

## Change history

| Version | Date (UTC) | Owner | Reviewer(s) | Change summary |
| --- | --- | --- | --- | --- |
| 0.9 | 2026-08-06 | justin.nguyen@appsindie.com | Claude shaping review | Initial validation gate brief synthesised from Gate 0 Stage 3 research. |

## 1. Problem signal summary

- **Key pain points**: Users sit down to work/study but get pulled into their phones; existing Pomodoro apps are too gamified (Forest), too bloated (Focus To-Do), or paid-only (Focus Keeper).
- **Evidence summary**: US search volume for "pomodoro timer" is ~165k–200k/month; "adhd focus app" is +40% YoY. Reddit r/productivity and r/adhd repeatedly ask for a timer that "does not feel childish".
- **Confidence level**: Medium — keyword/autocomplete and competitor positioning are real; organic ASO velocity and ad-tolerance are not yet measured for Focus Loop.
- **Who this problem belongs to**: Adults with ADHD, remote workers, students.
- **Problem size signal**: The niche is large enough to support the Gate 0 model (14,686 MAU by Month 9, $3,245 net monthly contribution) if organic ASO reaches base-case rank targets.

## 2. Market and trend scan

- **Major trends**: Remote/hybrid work keeps demand for focus tools high; ADHD self-management apps growing; users increasingly expect no-account, ad-supported utility apps.
- **Regulatory or platform shifts**: iOS ATT reduces ad attribution precision but does not block ad serving; Google Play AccessibilityService policy tightening may affect app-blocking features.
- **News highlights**: None in the last 90 days that materially change the thesis.

## 3. Community and forum signals

- **Recurring complaints**: Forest's tree metaphor is polarising for adults; Focus To-Do is overloaded with todo/Gantt; OS timers lack streaks and stats.
- **Workarounds users mention**: Phone clock, browser tabs, Notion templates, separate habit trackers.
- **Unmet needs**: Simple, adult/ADHD-focused, no-account timer with streaks and stats; free tier with light ads.

## 4. Competitor snapshot

| Competitor | Target segment | Key features | Positioning | Gaps/opportunities |
| --- | --- | --- | --- | --- |
| Forest | Students, gamification fans | Trees, ad+IAP, wearables | Gamified focus | Adult/ADHD users find it childish |
| Focus To-Do | Task-driven users | Pomodoro + tasks + Gantt | Productivity hybrid | Bloated for users who just want a timer |
| Focus Keeper | iOS paid users | Clean paid timer | Paid subscription | No free ad-supported path, iOS-only |
| Pomofocus | Web-first | Web timer + app companion | Freemium web | Native mobile + widget opportunity |
| iOS Screen Time / Android Digital Wellbeing | OS built-in | Usage limits | Free, rigid | No ritual, stats, or ad-light free tier |

## 5. Opportunities and risks

- **Ranked opportunities**: No-account, ad-light, adult/ADHD Pomodoro timer with widget and streaks.
- **Key risks**: Ad tolerance (interstitial at session end), ATT impact, Android AccessibilityService policy, organic ASO velocity.
- **Unknowns to validate**: See validation plan below.

## 5.1 Quantitative evidence

- **Demand-size estimate**: "pomodoro timer" US search ~165k–200k/month; "adhd focus app" +40% YoY.
- **Baseline KPI assumptions**: 20 active days/month, 2 sessions/active day, D1 50%, D7 45%, D30 42%, ad ARPU $0.2312.
- **Numeric signal source references**: Playwire Tier-1 eCPM benchmarks (2025-09-17); Google Play / App Store competitor review counts (2026-08-05); Sensor Tower / public download estimates where available. All tagged in Stage 3 deep dive `appsindie/portfolio-research/research/i01/README.md`.

## 5.2 Qualitative evidence

- **Interview/community synthesis summary**: Reddit r/productivity and r/adhd signal a desire for a simpler, non-gamified timer. No proprietary interviews conducted; community signals are supporting evidence only.
- **Repeated pain-pattern counts**: "too childish" / "bloated" / "need stats" appear repeatedly in competitor reviews and Reddit threads.
- **Counter-signals or dissenting evidence**: Some users prefer Forest's gamification and are willing to pay for Focus Keeper; not the target segment.

## 6. Source log

| Source | URL / reference | Date accessed | Reliability note |
| --- | --- | --- | --- |
| Playwire Ad eCPM benchmarks | https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect | 2026-08-05 | A — published 2025-09-17, industry-accepted |
| Google Play — Forest | Google Play listing | 2026-08-05 | A — primary source |
| Google Play — Focus To-Do | Google Play listing | 2026-08-05 | A — primary source |
| App Store — Focus Keeper | App Store listing | 2026-08-05 | A — primary source |
| Reddit r/productivity, r/adhd | search + manual spot check | 2026-08-05 | C — supporting qualitative signal |
| Stage 3 deep dive | `appsindie/portfolio-research/research/i01/README.md` | 2026-08-06 | A — portfolio-research repository |

## 7. Source quality and freshness controls

- Two or more A/B sources support major product claims (competitor positioning, eCPM).
- C sources (Reddit) are used only for qualitative pain, not for market sizing or revenue.
- Core market evidence is within 90 days except Playwire eCPM (published 2025-09-17, accepted as stable benchmark).

## 8. Validation plan for the Gate 0 critical assumption

**Critical assumption from `docs/research/OPPORTUNITY_DECISION.json`:**
> "Users accept an interstitial at the end of a 25-minute focus session and the widget drives enough daily returns to sustain 20 active days/month."

This assumption is split into two validation tests:

### V1 — Ad tolerance at session end

- **Method**: Competitor teardown + review sentiment analysis.
  - Install the top 5 Pomodoro/focus apps on iOS and Android.
  - Complete 10 focus sessions per app and log ad placement, frequency, and disruptiveness.
  - Scrape/scan the most recent 500 reviews of each competitor for complaints about ads.
- **Pass criterion**: <= 5% of recent reviews complain about ads AND at least 2 competitors show interstitials at session completion without a material drop in rating.
- **Fail criterion**: > 10% of reviews complain about ads OR top competitors avoid interstitials because of user backlash.
- **Owner**: Devin AI with human spot-check.
- **Target date**: 2026-08-09.
- **Fallback if fail**: Remove interstitial; keep rewarded unlock and banner only; model ad ARPU drop and re-check Gate 0 economics.

### V2 — Widget-driven retention

- **Method**: Synthetic usage test + community signal.
  - Add a Focus Loop widget to a test device and measure session starts via widget over 7 days.
  - Post a short poll in r/productivity and r/adhd asking whether users would use a home-screen widget to start a 25-minute focus timer.
- **Pass criterion**: >= 30% of respondents say they would use the widget daily OR widget-initiated sessions account for >= 20% of test sessions in a 7-day synthetic run.
- **Fail criterion**: < 10% of respondents would use the widget daily AND synthetic usage shows < 10% widget-initiated sessions.
- **Owner**: Devin AI with human review.
- **Target date**: 2026-08-09.
- **Fallback if fail**: De-prioritise widget; rely on notifications and app-icon launch; update retention model and re-check economics.

## 9. Gate decision criteria

- **Proceed to Pilot build** if both V1 and V2 pass OR one passes with an acceptable fallback that still clears the $2,000 Month-9 net contribution target.
- **Return to Gate 0** if both fail or a single failure invalidates the base-case economics.
