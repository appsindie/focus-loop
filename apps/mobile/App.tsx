import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Banner, useFullScreenAds } from "@appsindie/react-native-ads";
import { Linking, StyleSheet, Text, View } from "react-native";
import { AdsProvider } from "./src/features/ads/AdsProvider";
import { useLoopController } from "./src/features/loop/useLoopController";
import { BreakScreen } from "./src/features/loop/screens/BreakScreen";
import { CloseoutScreen } from "./src/features/loop/screens/CloseoutScreen";
import { FirstLaunchScreen } from "./src/features/loop/screens/FirstLaunchScreen";
import { FocusScreen } from "./src/features/loop/screens/FocusScreen";
import { HomeScreen } from "./src/features/loop/screens/HomeScreen";
import { LoopDoneScreen } from "./src/features/loop/screens/LoopDoneScreen";
import { NotifAskSheet } from "./src/features/loop/screens/NotifAskSheet";
import { isPlusActive } from "./src/features/loop/entitlement";
import { useEntitlement } from "./src/features/loop/useEntitlement";
import { restorePlus, verifyPlusWithStore } from "./src/features/plus/purchase";
import { PaywallScreen } from "./src/features/plus/screens/PaywallScreen";
import { PlusWelcomeScreen } from "./src/features/plus/screens/PlusWelcomeScreen";
import { mostRecentUnused } from "./src/features/loop/parkedThoughts";
import { SettingsScreen } from "./src/features/settings/SettingsScreen";
import { DEFAULT_SETTINGS, Settings, useSettings } from "./src/features/settings/useSettings";
import { saveSettings } from "./src/features/settings/SettingsStore";
import { HistoryScreen } from "./src/features/loop/screens/HistoryScreen";
import { ShareScreen } from "./src/features/loop/screens/ShareScreen";
import { WeekScreen } from "./src/features/loop/screens/WeekScreen";
import { WelcomeBackScreen } from "./src/features/loop/screens/WelcomeBackScreen";
import { parseFocusLoopUrl, type FocusLoopIntent } from "./src/linking";
import { palette, typography } from "./src/shared/theme";

function KeepAwakeActivator() {
  useKeepAwake();
  return null;
}

function Splash() {
  return (
    <View style={[styles.splash, { backgroundColor: palette.light.bg }]}>
      <Text style={[styles.splashMark, { color: palette.light.ink }]}>Focus Loop</Text>
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

  const colors = palette.light; // Dark theme + Appearance wiring lands with P20 polish.

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
  } = controller;

  const keepAwake =
    (route === "focus" || route === "break") && (phase === "running" || phase === "paused");
  const darkStatus = route === "break";

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
          <View style={styles.bannerSlot}>
            <Banner hasAdsRemoval={hasAdsRemoval} />
          </View>
        ) : null
      ) : null}
      {route === "focus" ? (
        <FocusScreen
          colors={colors}
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
          settings={settings}
          onChange={(patch) => void persistSettings(patch)}
          onBack={() => go("home")}
          isPlus={hasAdsRemoval}
          plusExpiresAt={entitlement.plusExpiresAt}
          restoreMessage={restoreMessage}
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
  bannerSlot: { alignItems: "center", backgroundColor: palette.light.bg },
  splash: { flex: 1, alignItems: "center", justifyContent: "center" },
  splashMark: { ...typography.h1Screen, letterSpacing: -0.5 },
});
