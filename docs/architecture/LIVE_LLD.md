# Focus Loop — Low-Level Design (LLD), v1 draft

This is the detailed design for the modules defined in `ARC42_SYSTEM_LIVE.md`. It focuses on interfaces, data shapes and module boundaries for the Pilot/MVP.

## 1. Module overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Focus Loop (RN/Expo)                    │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  UI      │  │  Timer       │  │  Notification        │  │
│  │ Screens  │  │ Engine       │  │ Scheduler            │  │
│  └────┬─────┘  └──────┬───────┘  └──────────┬─────────────┘  │
│       │               │                     │                │
│       └───────────────┼─────────────────────┘                │
│                       │                                       │
│       ┌───────────────┴───────────────────────┐              │
│       │           Session Store               │              │
│       │   (local log, streak, stats)          │              │
│       └───────────────────────────────────────┘              │
│       ┌───────────────┐  ┌─────────────┐  ┌───────────────┐│
│       │ Settings Store│  │ Ad Broker   │  │ Widget Bridge ││
│       │    (MMKV)     │  │ (AdMob SDK) │  │ (native module)││
│       └───────────────┘  └─────────────┘  └───────────────┘│
│       ┌───────────────┐  ┌─────────────┐                   ││
│       │ App Blocker    │  │ Analytics   │                   ││
│       │ (Android only) │  │ (Firebase)  │                   ││
│       └───────────────┘  └─────────────┘                   ││
└─────────────────────────────────────────────────────────────┘
```

## 2. Data models

### Session

```ts
interface Session {
  id: string;             // stable local UUID
  startedAt: ISOString;   // UTC
  durationSec: number;    // planned duration in seconds
  completedAt?: ISOString;
  cancelledAt?: ISOString;
  pausedMs: number;       // total paused time
  sound: 'silent' | 'white' | 'chime';
  theme: string;          // theme slug
  appBlockingEnabled: boolean;
  adImpressions: AdImpression[];
}

interface AdImpression {
  type: 'interstitial' | 'rewarded' | 'banner';
  shownAt: ISOString;
  revenueUsd?: number;    // reported by SDK
}
```

### Settings

```ts
interface Settings {
  defaultDurationSec: number;  // default 25 * 60
  breakDurationSec: number;    // default 5 * 60
  sound: 'silent' | 'white' | 'chime';
  theme: string;                 // e.g. 'light-blue'
  accent: string;
  reminders: Reminder[];
  appBlockingEnabled: boolean;
}

interface Reminder {
  id: string;
  days: number[];              // 0-6
  time: string;                // "HH:mm"
  enabled: boolean;
}
```

### Unlocks

```ts
interface Unlocks {
  themes: string[];
  sounds: string[];
}
```

## 3. Module interfaces

### Timer Engine

```ts
interface TimerEngine {
  start(durationSec: number, sound: Sound): Session;
  pause(): void;
  resume(): void;
  complete(): Session;
  cancel(): Session;
  getState(): TimerState;
  on(event: 'tick' | 'complete' | 'pause' | 'resume', handler: Function): Unsubscribe;
}
```

**Responsibilities**
- Own the countdown and state machine.
- Correct for backgrounding via elapsed time from system clock.
- Persist active session for crash recovery.

**Day-one invariant for sync**
- Session `id` is a UUID generated at start; `startedAt` is UTC; `durationSec` and `pausedMs` are in seconds.

### Notification Scheduler

```ts
interface NotificationScheduler {
  scheduleReminder(reminder: Reminder): Promise<string>;
  cancelReminder(id: string): Promise<void>;
  showForegroundNotification(session: Session): Promise<void>;
  cancelForegroundNotification(): Promise<void>;
}
```

### Session Store

```ts
interface SessionStore {
  save(session: Session): Promise<void>;
  list(since: ISOString): Promise<Session[]>;
  getStreak(today: Date): { current: number; best: number };
  getStats(range: 'today' | 'week' | 'month'): Stats;
}
```

### Ad Broker

```ts
interface AdBroker {
  init(): Promise<void>;
  showInterstitial(): Promise<boolean>; // true if ad shown
  showRewarded(): Promise<RewardResult>; // { completed: boolean; reward?: string }
  showBanner(): React.ComponentType;
}
```

### Widget Bridge

```ts
interface WidgetBridge {
  updateWidget(sessionCount: number, streak: number): Promise<void>;
  handleWidgetTap(): Promise<void>; // resolves to start session
}
```

### App Blocker (Android only)

```ts
interface AppBlocker {
  isAvailable(): boolean;
  requestPermission(): Promise<boolean>;
  enable(blockList: string[]): Promise<void>;
  disable(): Promise<void>;
}
```

## 4. Key flows

### Start session from home screen

1. `HomeScreen` reads `Settings` from `SettingsStore`.
2. User taps "Start Focus".
3. `TimerEngine.start()` creates `Session`.
4. `NotificationScheduler.showForegroundNotification()` (Android).
5. If `appBlockingEnabled`, `AppBlocker.enable()`.
6. Navigate to `TimerRunningScreen`.
7. `TimerRunningScreen` subscribes to `tick` and `complete` events.

### Session completion

1. `TimerEngine` fires `complete` event.
2. `NotificationScheduler.cancelForegroundNotification()`.
3. `AppBlocker.disable()` if enabled.
4. `SessionStore.save(session)`.
5. `AdBroker.showInterstitial()`.
6. Navigate to `BreakScreen` / `SummaryScreen`.
7. `WidgetBridge.updateWidget()`.

## 5. Storage layer

- **MMKV** for `Settings`, `Unlocks` (fast key-value, supports native modules).
- **SQLite via `expo-sqlite`** for `Session` log (queryable for stats).

## 6. Ad integration

- **AdMob** via `react-native-google-mobile-ads` (EAS Config Plugin available).
- **Banner** displayed on Home screen footer.
- **Interstitial** requested after `SessionStore.save()`; shown on `BreakScreen` if loaded.
- **Rewarded** triggered by user action in `ThemeSoundPickerScreen`.

## 7. Analytics events

```
session_start { durationSec, sound, theme, source }
session_complete { durationSec, pausedMs, source }
session_cancel { elapsedSec }
ad_impression { type }
ad_reward { item_type, item_id }
settings_change { key }
notification_tap { type }
widget_tap { }
```

## 8. Open design questions

1. Use Zustand or React Context for shared timer state? Working default: Context for active session, Zustand if state grows.
2. Navigation library: Expo Router or React Navigation? Working default: Expo Router for file-based routing.
3. SQLite or WatermelonDB? Working default: `expo-sqlite` for simple query needs.
