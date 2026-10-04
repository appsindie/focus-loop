import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AdsContext, Banner, useFullScreenAds } from "@appsindie/react-native-ads";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Linking, StyleSheet, Text, View } from "react-native";
import { AdsProvider } from "./src/features/ads/AdsProvider";
import { useLoopController } from "./src/features/loop/useLoopController";
import { BreakScreen } from "./src/features/loop/screens/BreakScreen";
import { CloseoutScreen } from "./src/features/loop/screens/CloseoutScreen";
import { FirstLaunchScreen } from "./src/features/loop/screens/FirstLaunchScreen";
import { FocusScreen } from "./src/features/loop/screens/FocusScreen";
import { HomeScreen } from "./src/features/loop/screens/HomeScreen";
import { LoopDoneScreen } from "./src/features/loop/screens/LoopDoneScreen";
import { NotifAskSheet } from "./src/features/loop/screens/NotifAskSheet";
import {
  activeTrialEndsAt,
  isItemUnlocked,
  isPlusActive,
  startTrial,
} from "./src/features/loop/entitlement";
import { useEntitlement } from "./src/features/loop/useEntitlement";
import { restorePlus, verifyPlusWithStore } from "./src/features/plus/purchase";
import { PaywallScreen } from "./src/features/plus/screens/PaywallScreen";
import { PlusWelcomeScreen } from "./src/features/plus/screens/PlusWelcomeScreen";
import { mostRecentUnused } from "./src/features/loop/parkedThoughts";
import { ThemesSoundsScreen } from "./src/features/personalize/ThemesSoundsScreen";
import {
  DEFAULT_FOCUS_SOUND_ID,
  catalogueItem,
  shadeHex,
} from "./src/features/personalize/catalogue";
import {
  pauseFocusSound,
  startFocusSound,
  stopFocusSound,
} from "./src/features/personalize/focusSounds";
import { watchForReward } from "./src/features/ads/rewardedAd";
import { ADS_CONFIG } from "./src/features/ads/adsConfig";
import { SettingsScreen } from "./src/features/settings/SettingsScreen";
import { RhythmScreen } from "./src/features/settings/RhythmScreen";
import { sessionsToCsv } from "./src/features/settings/dataExport";
import { shareCsvFile } from "./src/features/settings/shareCsv";
import { RemindersScreen } from "./src/features/reminders/RemindersScreen";
import {
  DEFAULT_REMINDER_PREFS,
  ReminderPrefs,
  loadReminderPrefs,
  reminderSummaryLine,
  saveReminderPrefs,
} from "./src/features/reminders/reminderStore";
import {
  clearReminderSchedules,
  syncReminderSchedules,
} from "./src/features/reminders/reminderScheduler";
import { sessionsOnDay } from "./src/features/loop/SessionLog";
import { cancelStepAlert } from "./src/features/notifications/NotificationScheduler";
import { DEFAULT_SETTINGS, Settings, useSettings } from "./src/features/settings/useSettings";
import { saveSettings } from "./src/features/settings/SettingsStore";
import { defaultEntitlement, saveEntitlement } from "./src/features/loop/entitlement";
import { HistoryScreen } from "./src/features/loop/screens/HistoryScreen";
import { ShareScreen } from "./src/features/loop/screens/ShareScreen";
import { WeekScreen } from "./src/features/loop/screens/WeekScreen";
import { WelcomeBackScreen } from "./src/features/loop/screens/WelcomeBackScreen";
import { parseFocusLoopUrl, type FocusLoopIntent } from "./src/linking";
import { palette, typography, usePalette } from "./src/shared/theme";

function KeepAwakeActivator() {
  useKeepAwake();
  return null;
}

function Splash() {
  // Pre-settings: follow the OS appearance so dark-mode users don't get a
  // light flash on cold start.
  const colors = usePalette("system");
  return (
    <View style={[styles.splash, { backgroundColor: colors.bg }]}>
      <Text style={[styles.splashMark, { color: colors.ink }]}>Focus Loop</Text>
    </View>
  );
}

export default function App() {
  const { settings, loading: settingsLoading, update: updateSettings } = useSettings();

  // Save-immediately semantics (P20: no Save button) — patch state + disk together.
  const persistSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      updateSettings(patch);
      await saveSettings(next);
    },
    [settings, updateSettings],
  );

  return (
    <AdsProvider>
      <AppBody
        settings={settingsLoading ? DEFAULT_SETTINGS : settings}
        settingsLoading={settingsLoading}
        persistSettings={persistSettings}
      />
    </AdsProvider>
  );
}

// Renders inside AdsProvider so the ads lib hooks see the module context.
type AppBodyProps = {
  settings: Settings;
  settingsLoading: boolean;
  persistSettings: (patch: Partial<Settings>) => Promise<void>;
};

function AppBody({ settings, settingsLoading, persistSettings }: AppBodyProps) {
  // J7-R3: Plus removes every ad. The flag follows the stored entitlement
  // (expiry + renewal grace handled inside isPlusActive) and flips live on a
  // purchase / lapse re-check — no restart needed (useEntitlement listener).
  // CR-25: until the first AsyncStorage read lands, ads stay OFF — a Plus user
  // must never see a banner or an ad request in the load window.
  const { entitlement, loaded: entitlementLoaded } = useEntitlement();
  const hasAdsRemoval = isPlusActive(entitlement, new Date());
  const adsBlocked = !entitlementLoaded || hasAdsRemoval;
  const ads = useContext(AdsContext);
  const { showFullscreenAds } = useFullScreenAds(adsBlocked);
  const interstitial = useMemo(
    () => ({ show: showFullscreenAds, hasAdsRemoval: adsBlocked }),
    [showFullscreenAds, adsBlocked],
  );

  // ADR-003 entitlement re-check: run once at app start, then again the moment
  // a stored expiry stamp passes while the app is alive (renewal grace already
  // inside isPlusActive). A store failure resolves "unknown" and keeps the
  // local flag (tri-state, CR-02).
  // Once per app start.
  useEffect(() => {
    void verifyPlusWithStore();
  }, []);
  const wasPlusActiveRef = useRef(hasAdsRemoval);
  useEffect(() => {
    const was = wasPlusActiveRef.current;
    wasPlusActiveRef.current = hasAdsRemoval;
    if (was && !hasAdsRemoval && entitlement.isPlus) {
      void verifyPlusWithStore();
    }
  }, [hasAdsRemoval, entitlement.isPlus]);

  // J4: a widget/Live-Activity deep link may have launched the app — resolve
  // it before boot so a widget start can route straight into a focus (R1).
  const [bootIntent, setBootIntent] = useState<FocusLoopIntent | "pending" | null>("pending");
  useEffect(() => {
    let mounted = true;
    Linking.getInitialURL()
      .then((url) => {
        if (mounted) {
          setBootIntent(parseFocusLoopUrl(url));
        }
      })
      .catch(() => {
        if (mounted) {
          setBootIntent(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const controller = useLoopController(settings, settingsLoading, interstitial, bootIntent);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // J8: the focus sound loops under a RUNNING focus step only — paused keeps
  // the player but mutes it; leaving focus or ending the step releases it.
  // A lapsed trial/Plus drops the pick back to silence (isItemUnlocked gate).
  const unlockedFocusSoundId = isItemUnlocked(entitlement, settings.focusSoundId, new Date())
    ? settings.focusSoundId
    : DEFAULT_FOCUS_SOUND_ID;
  const soundStepKind = controller.step?.kind ?? null;
  const soundRoute = controller.route;
  const soundPhase = controller.phase;
  useEffect(() => {
    if (soundRoute === "focus" && soundPhase === "running" && soundStepKind === "focus") {
      startFocusSound(unlockedFocusSoundId);
    } else if (soundPhase === "paused" && soundStepKind === "focus") {
      pauseFocusSound();
    } else {
      stopFocusSound();
    }
  }, [soundRoute, soundPhase, soundStepKind, unlockedFocusSoundId]);

  // J8-R1: the rewarded video buys a 24h trial — the port lazy-loads RNGMA so
  // jest/Expo Go stay native-free; null unit → "unavailable" → retry copy.
  const watchVideo = useCallback(
    () =>
      watchForReward(ADS_CONFIG.rewardedId, {
        keywords: ADS_CONFIG.keywords,
        requestNonPersonalizedAdsOnly: ads.allowTracking === false,
      }),
    [ads.allowTracking],
  );
  const onTrialEarned = useCallback(async (itemId: string) => {
    await startTrial(itemId, new Date());
  }, []);

  // P15: the picked disc colour re-tints the focus palette — only while the
  // pick is unlocked (Plus or live trial); the accent derives its darker
  // focusText variant via shadeHex (design ships one hex per colour).
  // J10-R2: Appearance (Light/Dark/System) re-tints every screen via the
  // `colors` prop; the P15 disc colour still overrides the focus accent below.
  const colors = usePalette(settings.appearance);
  const focusColors = useMemo(() => {
    const item = catalogueItem(settings.discColorId);
    if (
      item?.kind === "disc-color" &&
      item.swatch != null &&
      isItemUnlocked(entitlement, item.id, new Date())
    ) {
      return { ...colors, focus: item.swatch, focusText: shadeHex(item.swatch, 0.85) };
    }
    return colors;
  }, [colors, settings.discColorId, entitlement]);

  // Links that arrive while the app is alive (widget tap, Live Activity pause).
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const intent = parseFocusLoopUrl(url);
      if (intent != null) {
        controller.handleDeepLinkIntent(intent);
      }
    });
    return () => subscription.remove();
  }, [controller]);

  const {
    route,
    go,
    phase,
    step,
    engine,
    sessions,
    sessionsInLoop,
    parkedThoughts,
    week,
    todayMinutes,
    isNewWeek,
    loopEndsAtMs,
    longBreakSeconds,
    intentionDraft,
    setIntentionDraft,
    outcomeDraft,
    setOutcome,
    notifAskOpen,
    answerNotifAsk,
    chooseDisplayMode,
    startFocus,
    startBreak,
    keepGoing,
    startNextFocus,
    extendBreak,
    endEarlySave,
    endEarlyDiscard,
    startLongBreak,
    skipLongBreak,
    parkThought,
    adoptParked,
    pauseFocus,
    resumeFocus,
    welcomeHowDidItGo,
    welcomeSkipToBreak,
    resetAllData,
  } = controller;

  // J5: reminder prefs are a separate small store; the schedule reconciles on
  // prefs change, a logged session (today's evening note may be due off), and
  // every return to foreground. Permission-denied is a silent no-op inside.
  const [reminderPrefs, setReminderPrefs] = useState<ReminderPrefs>(DEFAULT_REMINDER_PREFS);
  useEffect(() => {
    void loadReminderPrefs().then(setReminderPrefs);
  }, []);
  const persistReminders = useCallback(async (prefs: ReminderPrefs) => {
    setReminderPrefs(prefs);
    await saveReminderPrefs(prefs);
  }, []);
  const focusedToday = sessionsOnDay(sessions, new Date()).length > 0;
  const goalUnmet = week.daysMet < settings.weeklyGoalDays;
  useEffect(() => {
    void syncReminderSchedules(reminderPrefs, {
      focusedToday,
      goalUnmet,
      now: new Date(),
    });
  }, [reminderPrefs, focusedToday, goalUnmet]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void syncReminderSchedules(reminderPrefs, {
          focusedToday,
          goalUnmet,
          now: new Date(),
        });
      }
    });
    return () => sub.remove();
  }, [reminderPrefs, focusedToday, goalUnmet]);

  // J5 exit: tapping a reminder/evening notification starts the rhythm — the
  // payload carries the same focusloop:// intent the widgets use (J4).
  const controllerRef = useRef(controller);
  controllerRef.current = controller;
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const raw = response.notification.request.content.data?.["url"];
      const intent = parseFocusLoopUrl(typeof raw === "string" ? raw : null);
      if (intent != null) {
        controllerRef.current.handleDeepLinkIntent(intent);
      }
    });
    return () => sub.remove();
  }, []);

  // P20: a row's one-line summary for the first enabled reminder.
  const remindersSummary = useMemo(() => {
    const first = reminderPrefs.reminders.find((r) => r.enabled);
    return first == null ? "Off" : reminderSummaryLine(first);
  }, [reminderPrefs]);

  // P20 "Export sessions (CSV)" — generic failure copy only (no native error).
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const onExportData = useCallback(() => {
    void (async () => {
      const result = await shareCsvFile(sessionsToCsv(sessions));
      setExportMessage(result === "shared" ? null : "Couldn't export right now. Try again.");
    })();
  }, [sessions]);

  // P20 "Delete all data…" (J10-R4, confirmed in the sheet): cancel pending
  // notifications first so nothing fires from beyond the wipe, then remove
  // every focus-loop/ key and reset the in-memory mirrors. Plus survives via
  // Restore purchases (store-side receipt).
  const onDeleteAll = useCallback(() => {
    void (async () => {
      await cancelStepAlert();
      await clearReminderSchedules();
      const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith("focus-loop/"));
      await AsyncStorage.removeMany(keys);
      await saveSettings(DEFAULT_SETTINGS);
      await saveEntitlement(defaultEntitlement());
      await persistSettings(DEFAULT_SETTINGS);
      resetAllData();
    })();
  }, [persistSettings, resetAllData]);

  const keepAwake =
    (route === "focus" || route === "break") && (phase === "running" || phase === "paused");
  const darkStatus = route === "break" || colors === palette.dark;

  return (
    <>
      {keepAwake ? <KeepAwakeActivator /> : null}
      {route === "loading" ? <Splash /> : null}
      {route === "first-launch" ? (
        <FirstLaunchScreen
          colors={colors}
          onChoose={(mode) => chooseDisplayMode(mode, persistSettings)}
        />
      ) : null}
      {route === "home" ? (
        <HomeScreen
          colors={colors}
          now={new Date()}
          plan={engine.planSteps}
          focusNumber={Math.max(1, engine.currentFocusNumber)}
          totalFocus={engine.totalFocusCount}
          loopEndsAtMs={loopEndsAtMs}
          intention={intentionDraft}
          onIntentionChange={setIntentionDraft}
          parked={mostRecentUnused(parkedThoughts)}
          onUseParkedThought={(t) => void adoptParked(t)}
          week={week}
          todayMinutes={todayMinutes}
          isNewWeek={isNewWeek}
          onStart={startFocus}
          onOpenSettings={() => go("settings")}
          onOpenWeek={() => go("week")}
        />
      ) : null}
      {route === "home" ? (
        // P04 free-tier banner, 320x50 pinned to the bottom of Home. Hidden
        // until the entitlement read lands so Plus never flashes an ad (CR-25).
        entitlementLoaded ? (
          <View style={[styles.bannerSlot, { backgroundColor: colors.bg }]}>
            <Banner hasAdsRemoval={hasAdsRemoval} />
          </View>
        ) : null
      ) : null}
      {route === "focus" ? (
        <FocusScreen
          colors={focusColors}
          displayMode={settings.displayMode ?? "disc"}
          onDisplayModeChange={(mode) => void persistSettings({ displayMode: mode })}
          showSeconds={settings.showSeconds}
          focusNumber={engine.currentFocusNumber}
          totalFocus={engine.totalFocusCount}
          intention={engine.currentIntention}
          steps={engine.planSteps}
          currentIndex={engine.currentStepIndex}
          remainingSeconds={engine.remainingSeconds()}
          durationSeconds={step?.durationSeconds ?? 0}
          nextStep={controller.nextStep}
          paused={phase === "paused"}
          parkedThoughts={parkedThoughts}
          elapsedSeconds={engine.elapsedSeconds()}
          onPause={pauseFocus}
          onResume={resumeFocus}
          onParkThought={(text) => void parkThought(text)}
          onEndEarlySave={endEarlySave}
          onEndEarlyDiscard={endEarlyDiscard}
        />
      ) : null}
      {route === "closeout" ? (
        <CloseoutScreen
          colors={colors}
          focusNumber={engine.currentFocusNumber}
          focusedSeconds={controller.lastSession?.focusedSeconds ?? step?.durationSeconds ?? 0}
          intention={controller.lastSession?.intention ?? null}
          outcome={outcomeDraft}
          onOutcome={setOutcome}
          autoStartBreaks={settings.autoStartBreaks}
          onAutoStartBreaks={(v) => void persistSettings({ autoStartBreaks: v })}
          nextStep={controller.nextStep}
          onStartBreak={startBreak}
          onKeepGoing={keepGoing}
        />
      ) : null}
      {route === "break" ? (
        <BreakScreen
          colors={colors}
          displayMode={settings.displayMode ?? "disc"}
          remainingSeconds={engine.remainingSeconds()}
          durationSeconds={step?.durationSeconds ?? 0}
          nextFocusNumber={Math.min(engine.currentFocusNumber + 1, engine.totalFocusCount)}
          autoStart={settings.autoStartBreaks}
          onExtend={extendBreak}
          onStartFocus={startNextFocus}
        />
      ) : null}
      {route === "welcome-back" ? (
        <WelcomeBackScreen
          colors={colors}
          focusedSeconds={controller.lastSession?.focusedSeconds ?? step?.durationSeconds ?? 0}
          onHowDidItGo={welcomeHowDidItGo}
          onSkipToBreak={welcomeSkipToBreak}
        />
      ) : null}
      {route === "loop-done" ? (
        <LoopDoneScreen
          colors={colors}
          sessionsInLoop={sessionsInLoop}
          steps={engine.planSteps}
          week={week}
          longBreakSeconds={longBreakSeconds}
          onStartLongBreak={startLongBreak}
          onShareWeek={() => go("share")}
          onSkipLongBreak={skipLongBreak}
        />
      ) : null}
      {route === "settings" ? (
        <SettingsScreen
          colors={colors}
          settings={settings}
          onChange={(patch) => void persistSettings(patch)}
          onBack={() => go("home")}
          isPlus={hasAdsRemoval}
          plusExpiresAt={entitlement.plusExpiresAt}
          plusProductId={entitlement.productId}
          restoreMessage={restoreMessage}
          onOpenThemes={() => go("themes")}
          onOpenRhythm={() => go("rhythm")}
          onOpenReminders={() => go("reminders")}
          remindersSummary={remindersSummary}
          onExportData={onExportData}
          exportMessage={exportMessage}
          onDeleteAll={onDeleteAll}
          allowTracking={ads.allowTracking}
          onSetAllowTracking={(allow) => ads.setAllowTracking?.(allow)}
          version={Constants.expoConfig?.version ?? "1.0.0"}
          onUpgrade={() => {
            setRestoreMessage(null);
            controller.setPostPaywall("settings");
            controller.openPaywall("settings");
          }}
          onRestore={() => {
            // J7-R4: restore must work directly from Settings, not just via P14.
            setRestoreMessage(null);
            void restorePlus().then((outcome) => {
              if (outcome === "restored") {
                controller.setPostPaywall("settings");
                controller.plusPurchased();
              } else {
                setRestoreMessage(
                  outcome === "none"
                    ? "No purchases found for this store account."
                    : "We couldn't reach the store. Check your connection and try again.",
                );
              }
            });
          }}
        />
      ) : null}
      {route === "paywall" ? (
        <PaywallScreen
          colors={colors}
          onClose={controller.closePaywall}
          onPurchased={controller.plusPurchased}
          onRestored={controller.plusPurchased}
        />
      ) : null}
      {route === "plus-welcome" ? (
        <PlusWelcomeScreen colors={colors} onContinue={controller.plusWelcomeContinue} />
      ) : null}
      {route === "week" ? (
        <WeekScreen
          sessions={sessions}
          week={week}
          now={new Date()}
          onBack={() => go("home")}
          onHistory={() => go("history")}
          onShare={() => go("share")}
          colors={colors}
        />
      ) : null}
      {route === "history" ? (
        <HistoryScreen
          sessions={sessions}
          isPlus={hasAdsRemoval /* same validity window as ad removal (J7-R3) */}
          onBack={() => go("home")}
          onWeek={() => go("week")}
          onShare={() => go("share")}
          colors={colors}
        />
      ) : null}
      {route === "share" ? (
        <ShareScreen sessions={sessions} week={week} onBack={() => go("week")} colors={colors} />
      ) : null}
      {route === "themes" ? (
        <ThemesSoundsScreen
          colors={colors}
          discColorId={settings.discColorId}
          focusSoundId={settings.focusSoundId}
          isPlus={hasAdsRemoval}
          isItemUnlocked={(id) => isItemUnlocked(entitlement, id, new Date())}
          trialEndsAt={(id) => activeTrialEndsAt(entitlement, id, new Date())}
          onPick={(patch) => void persistSettings(patch)}
          onUpgrade={() => {
            // Locked-item entry: return to this picker after close/purchase.
            controller.setPostPaywall("themes");
            controller.openPaywall("locked-item");
          }}
          watchVideo={watchVideo}
          onTrialEarned={onTrialEarned}
          onBack={() => go("settings")}
        />
      ) : null}
      {route === "rhythm" ? (
        <RhythmScreen
          colors={colors}
          settings={settings}
          onChange={(patch) => void persistSettings(patch)}
          onBack={() => go("settings")}
        />
      ) : null}
      {route === "reminders" ? (
        <RemindersScreen
          colors={colors}
          prefs={reminderPrefs}
          onChange={(prefs) => void persistReminders(prefs)}
          onBack={() => go("settings")}
        />
      ) : null}
      <NotifAskSheet
        visible={notifAskOpen}
        colors={colors}
        onAllow={() => answerNotifAsk(true)}
        onNotNow={() => answerNotifAsk(false)}
      />
      <StatusBar style={darkStatus ? "light" : "dark"} />
    </>
  );
}

const styles = StyleSheet.create({
  bannerSlot: { alignItems: "center" },
  splash: { flex: 1, alignItems: "center", justifyContent: "center" },
  splashMark: { ...typography.h1Screen, letterSpacing: -0.5 },
});
