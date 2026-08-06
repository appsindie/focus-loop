# Focus Loop — Design System (Pilot)

This is the living design reference for the Focus Loop mobile app. It is intentionally minimal for the Pilot build; high-fidelity mockups and brand assets will be added before Gate 3.

## 1. Design principles

- **Adult / ADHD-first**: large tap targets (>= 48 x 48 dp), high contrast, clear type, reduced motion by default.
- **Friction-free**: one-tap start, one-tap stop, no account, no onboarding.
- **Ad-light trust**: ads only at natural breakpoints (end of session, rewarded unlock, setup banner).
- **Calm focus**: neutral background, single accent color for the timer, no gamified characters.

## 2. Color palette

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `background` | `#F7F8FA` | `#0F1115` | Screen background |
| `surface` | `#FFFFFF` | `#1A1D23` | Cards, bottom sheets |
| `primary` | `#2D5A27` | `#4CAF50` | Start, success, progress |
| `accent` | `#D97706` | `#F59E0B` | Break, pause, highlights |
| `danger` | `#DC2626` | `#EF4444` | Cancel, error |
| `text` | `#111827` | `#F3F4F6` | Primary text |
| `textMuted` | `#6B7280` | `#9CA3AF` | Secondary text |
| `border` | `#E5E7EB` | `#374151` | Dividers, input borders |

## 3. Typography

- **Font**: system default (iOS San Francisco, Android Roboto) for fastest load and accessibility.
- **Scale**:
  - `display`: 64 / bold — timer countdown
  - `title`: 28 / semibold — screen titles
  - `headline`: 20 / semibold — section headers
  - `body`: 16 / regular — labels, settings
  - `caption`: 14 / regular — metadata, hints
- Minimum font size: 14. All text uses `allowFontScaling: true`.

## 4. Spacing & sizing

- Base grid: 8 dp.
- Screen padding: 24 dp horizontal, 32 dp vertical.
- Card radius: 16 dp.
- Button height: 56 dp.
- Tap target minimum: 48 x 48 dp.

## 5. Components

### PrimaryButton
- Height 56 dp, full width on mobile, radius 12 dp.
- Background `primary`, white text, 18 semibold.
- Disabled state: opacity 0.5.
- Icon optional, left of label.

### IconButton
- 48 x 48 dp hit area.
- Used for settings, close, mute.

### TimerRing
- Circular progress ring around the countdown.
- Stroke width 12 dp, color `primary` for focus, `accent` for break.
- Animated only if user has not enabled reduced motion.

### StatPill
- Small rounded card with label + value.
- Background `surface`, border `border`, radius 12 dp.

## 6. Screen-by-screen UX

### S1.1 Home
- Large timer preset selector (25 / 50 / Custom).
- Big green **Start Focus** button.
- Top bar: settings gear, streak pill.
- Banner ad zone at bottom of setup (small, 50 dp height).

### S1.2 Timer running
- Full-screen `TimerRing` with countdown `display`.
- Pause / Cancel controls, 48 dp each.
- Keep screen awake while timer is active.

### S1.3 Break / complete
- Confetti-free: static success state.
- Interstitial ad shown on natural transition.
- "Start break" or "Done" primary action.

### S1.4 Session summary
- Stat pills: duration, sessions today, streak.
- Primary action: **Start another**.

### S5.1 Settings
- Timer duration presets.
- Sound / vibration toggles.
- Theme selection (locked themes show rewarded-video unlock).

## 7. Motion & accessibility

- Respect `prefers-reduced-motion`.
- All color combinations meet WCAG AA for normal text.
- Touch targets >= 48 dp.
- Focus states visible for keyboard navigation.

## 8. Assets

- App icon: simple loop/clock mark (to be designed before Gate 3).
- Splash: solid `primary` background with white wordmark.
- In-app illustrations: none for Pilot.

## 9. Open design work

- High-fidelity mockups for S1.1–S1.5 and S5.1–S5.2.
- Brand icon, splash screen.
- Rewarded unlock and widget preview screens.
