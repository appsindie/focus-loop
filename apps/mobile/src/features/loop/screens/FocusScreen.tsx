import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisplayMode } from "../../settings/SettingsStore";
import { ParkedThought } from "../parkedThoughts";
import { LoopStep } from "../loopPlan";
import { Palette, fonts, typography } from "../../../shared/theme";
import {
  DisplayToggle,
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from "../../../shared/ui/Buttons";
import { Sheet } from "../../../shared/ui/Sheet";
import { FocusDisc } from "../ui/FocusDisc";
import { LoopStrip } from "../ui/LoopStrip";

function fmtMMSS(totalSeconds: number): { minutes: string; seconds: string } {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return { minutes: String(m), seconds: String(s).padStart(2, "0") };
}

function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatMinutesLeft(remainingSeconds: number): number {
  return Math.ceil(remainingSeconds / 60);
}

// P06 (disc) / P07 (numbers): no ads; keep-awake handled by the controller.
export function FocusScreen({
  colors,
  displayMode,
  onDisplayModeChange,
  showSeconds,
  focusNumber,
  totalFocus,
  intention,
  steps,
  currentIndex,
  remainingSeconds,
  durationSeconds,
  nextStep,
  paused,
  parkedThoughts,
  elapsedSeconds,
  onPause,
  onResume,
  onParkThought,
  onEndEarlySave,
  onEndEarlyDiscard,
}: {
  colors: Palette;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  showSeconds: boolean;
  focusNumber: number;
  totalFocus: number;
  intention: string | null;
  steps: readonly LoopStep[];
  currentIndex: number;
  remainingSeconds: number;
  durationSeconds: number;
  nextStep: LoopStep | null;
  paused: boolean;
  parkedThoughts: ParkedThought[];
  elapsedSeconds: number;
  onPause: () => void;
  onResume: () => void;
  onParkThought: (text: string) => void;
  onEndEarlySave: () => void;
  onEndEarlyDiscard: () => void;
}) {
  const [laterOpen, setLaterOpen] = useState(false);
  const [endEarlyOpen, setEndEarlyOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const endsAtMs = Date.now() + remainingSeconds * 1000;
  const progress = durationSeconds > 0 ? 1 - remainingSeconds / durationSeconds : 0;
  const mmss = fmtMMSS(remainingSeconds);
  const nextLabel =
    nextStep?.kind === "break"
      ? `Next: ${Math.round(nextStep.durationSeconds / 60)} min break`
      : nextStep?.kind === "longBreak"
        ? `Next: ${Math.round(nextStep.durationSeconds / 60)} min long break`
        : "Next: loop done";

  const openEndEarly = () => {
    onPause(); // P09: the sheet pauses the timer while open.
    setEndEarlyOpen(true);
  };
  const closeEndEarly = (action: "keep" | "save" | "discard") => {
    setEndEarlyOpen(false);
    if (action === "keep") {
      onResume();
    } else if (action === "save") {
      onEndEarlySave();
    } else {
      onEndEarlyDiscard();
    }
  };

  const parkDraft = () => {
    const text = draft.trim();
    if (text.length > 0) {
      onParkThought(text);
    }
    setDraft("");
    setLaterOpen(false);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.focusText }]}>
          FOCUS {focusNumber} OF {totalFocus}
        </Text>
        <DisplayToggle mode={displayMode} onChange={onDisplayModeChange} colors={colors} />
      </View>
      {intention != null && intention !== "" ? (
        <Text style={[styles.intention, { color: colors.ink2 }]} numberOfLines={2}>
          {intention}
        </Text>
      ) : null}

      <View style={styles.timeArea}>
        {displayMode === "disc" ? (
          <>
            <FocusDisc
              progress={progress}
              remainingMinutes={formatMinutesLeft(remainingSeconds)}
              colors={colors}
            />
            <Text style={[styles.about, { color: colors.muted }]}>
              about {formatMinutesLeft(remainingSeconds)} min left
            </Text>
          </>
        ) : (
          <View style={styles.numbersWrap}>
            <View style={styles.numbersRow}>
              <Text style={[styles.minutes, { color: colors.ink }]} maxFontSizeMultiplier={1.3}>
                {mmss.minutes}
              </Text>
              {showSeconds ? (
                <Text style={[styles.seconds, { color: colors.faint }]}>{mmss.seconds}</Text>
              ) : null}
            </View>
            <Text style={[styles.about, { color: colors.muted }]}>
              {formatMinutesLeft(remainingSeconds)} minutes left · ends {formatClock(endsAtMs)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stripArea}>
        <LoopStrip
          steps={steps}
          currentIndex={currentIndex}
          currentProgress={progress}
          colors={colors}
        />
        <Text style={[styles.next, { color: colors.muted }]}>{nextLabel}</Text>
      </View>

      <View style={styles.controls}>
        {paused ? (
          <SecondaryButton label="Resume" onPress={onResume} colors={colors} />
        ) : (
          <SecondaryButton label="Pause" onPress={onPause} colors={colors} />
        )}
        <TextButton label="End early…" onPress={openEndEarly} colors={colors} />
        <Pressable
          onPress={() => setLaterOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Park a thought for later — the timer keeps running"
          hitSlop={8}
          style={styles.laterLink}
        >
          <Text style={[styles.laterText, { color: colors.muted }]}>Later, not now…</Text>
        </Pressable>
      </View>

      {/* P08 SHT-later: one field, parked list, Cancel / Park it. Timer keeps running. */}
      <Sheet
        visible={laterOpen}
        onDismiss={() => setLaterOpen(false)}
        colors={colors}
        accessibilityLabel="Park a thought"
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]}>Park it for later</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="What popped into your head?"
          placeholderTextColor={colors.faint}
          accessibilityLabel="What popped into your head?"
          autoFocus
          style={[
            styles.sheetInput,
            { color: colors.ink, borderColor: colors.rule, fontFamily: fonts.userWords },
          ]}
          onSubmitEditing={parkDraft}
          returnKeyType="done"
        />
        {parkedThoughts.length > 0 ? (
          <View style={styles.parkedList}>
            {parkedThoughts.slice(0, 5).map((t) => (
              <Text
                key={t.id}
                style={[styles.parkedItem, { color: colors.ink2 }]}
                numberOfLines={1}
              >
                {t.text}
              </Text>
            ))}
          </View>
        ) : null}
        <PrimaryButton label="Park it" onPress={parkDraft} colors={colors} />
        <TextButton label="Cancel" onPress={() => setLaterOpen(false)} colors={colors} />
      </Sheet>

      {/* P09 SHT-end-early: pauses while open; Keep going / End and save N / Discard. */}
      <Sheet
        visible={endEarlyOpen}
        onDismiss={() => closeEndEarly("keep")}
        colors={colors}
        accessibilityLabel="End this focus early"
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]}>End early?</Text>
        <Text style={[styles.sheetBody, { color: colors.muted }]}>
          You've focused {Math.floor(elapsedSeconds / 60)} min — ending early still counts toward
          your week.
        </Text>
        <PrimaryButton label="Keep going" onPress={() => closeEndEarly("keep")} colors={colors} />
        <SecondaryButton
          label={`End and save ${Math.floor(elapsedSeconds / 60)} min`}
          onPress={() => closeEndEarly("save")}
          colors={colors}
        />
        <TextButton
          label="Discard this session"
          onPress={() => closeEndEarly("discard")}
          colors={colors}
        />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: { ...typography.label, letterSpacing: 1.5 },
  intention: { ...typography.userWords, marginTop: 8 },
  timeArea: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  about: { ...typography.body },
  numbersWrap: { alignItems: "center", gap: 8 },
  numbersRow: { flexDirection: "row", alignItems: "baseline" },
  minutes: {
    ...typography.timer,
    fontVariant: ["tabular-nums"],
  },
  seconds: {
    ...typography.timerSeconds,
    marginLeft: 8,
    fontVariant: ["tabular-nums"],
  },
  stripArea: { gap: 10 },
  next: { ...typography.caption, fontSize: 14 },
  controls: { gap: 4, marginTop: 16 },
  laterLink: { alignSelf: "center", minHeight: 44, justifyContent: "center" },
  laterText: { ...typography.body },
  sheetTitle: { ...typography.title },
  sheetBody: { ...typography.body },
  sheetInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
  },
  parkedList: { gap: 6, paddingVertical: 4 },
  parkedItem: { ...typography.userWords, fontSize: 17, lineHeight: 22 },
});
