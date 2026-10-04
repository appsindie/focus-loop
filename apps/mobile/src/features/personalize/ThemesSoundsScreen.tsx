import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "../../i18n";
import { Palette, radii, spacing, typography } from "../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../shared/layout";
import { PrimaryButton, SecondaryButton, TextButton } from "../../shared/ui/Buttons";
import { Sheet } from "../../shared/ui/Sheet";
import { trackEvent } from "../analytics/events";
import type { RewardedResult } from "../ads/rewardedAd";
import { trackRewardedResult } from "../ads/rewardedAd";
import { CatalogueItem, DISC_COLORS, FOCUS_SOUNDS } from "./catalogue";

// P15 / J8: disc colours + focus sounds. Locked tiers resolve like this —
// "trial" opens the 24h trial card (watch one rewarded video, or Get Plus),
// "plus" goes straight to the paywall (spec J8-R4: Plus-only items get no
// trial). A live trial makes the item selectable until its expiry.
type ThemesSoundsScreenProps = {
  colors: Palette;
  discColorId: string;
  focusSoundId: string;
  isPlus: boolean;
  isItemUnlocked: (itemId: string) => boolean;
  trialEndsAt: (itemId: string) => Date | null;
  onPick: (patch: { discColorId?: string; focusSoundId?: string }) => void;
  // Locked-item paywall entry — parent routes back here after close/purchase.
  onUpgrade: () => void;
  // Injectable rewarded-ad port (real: watchForReward + ADS_CONFIG.rewardedId).
  watchVideo: () => Promise<RewardedResult>;
  // Persists the 24h trial on the entitlement (startTrial); awaited before
  // the item unlocks so a failed write never pretends it granted.
  onTrialEarned: (itemId: string) => Promise<void>;
  onBack: () => void;
};

type AdState = "idle" | "loading" | "failed";

function lockHint(item: CatalogueItem, trialEnds: Date | null): string | null {
  if (trialEnds != null) {
    return t("trial until {time}", {
      time: trialEnds.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }
  if (item.tier === "plus") {
    return t("Plus");
  }
  if (item.tier === "trial") {
    return t("24h trial");
  }
  return null;
}

export function ThemesSoundsScreen({
  colors,
  discColorId,
  focusSoundId,
  isPlus,
  isItemUnlocked,
  trialEndsAt,
  onPick,
  onUpgrade,
  watchVideo,
  onTrialEarned,
  onBack,
}: ThemesSoundsScreenProps) {
  const [trialItem, setTrialItem] = useState<CatalogueItem | null>(null);
  const [adState, setAdState] = useState<AdState>("idle");

  const pickItem = (item: CatalogueItem) => {
    const selected =
      item.kind === "disc-color" ? discColorId === item.id : focusSoundId === item.id;
    if (isItemUnlocked(item.id)) {
      if (!selected) {
        onPick(item.kind === "disc-color" ? { discColorId: item.id } : { focusSoundId: item.id });
      }
      return;
    }
    if (item.tier === "plus") {
      // J8-R4: no trial on Plus-only items — straight to the locked-item paywall.
      onUpgrade();
      return;
    }
    setAdState("idle");
    setTrialItem(item);
  };

  const watch = async (item: CatalogueItem) => {
    trackEvent("rewarded_ad_requested", { itemId: item.id });
    setAdState("loading");
    const result = await watchVideo();
    trackRewardedResult(result, item.id);
    if (result !== "earned") {
      // J8-R4 copy: load failure → spec toast + retry affordance.
      setAdState("failed");
      return;
    }
    await onTrialEarned(item.id);
    trackEvent("trial_started", { itemId: item.id });
    setTrialItem(null);
  };

  const itemRow = (item: CatalogueItem) => {
    const selected =
      item.kind === "disc-color" ? discColorId === item.id : focusSoundId === item.id;
    const unlocked = isItemUnlocked(item.id);
    const hint = unlocked ? null : lockHint(item, null);
    const trialEnds = trialEndsAt(item.id);
    return (
      <Pressable
        key={item.id}
        onPress={() => pickItem(item)}
        accessibilityRole="button"
        accessibilityLabel={
          t(item.name) + (unlocked ? "" : t(" — locked, {hint}", { hint: hint ?? t("Plus") }))
        }
        accessibilityState={{ selected }}
        style={({ pressed }) => [
          styles.soundRow,
          { backgroundColor: colors.surface, borderColor: selected ? colors.ink : colors.rule },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text style={[styles.rowName, { color: colors.ink }]} allowFontScaling>
          {t(item.name)}
        </Text>
        {selected ? (
          <Text style={[styles.rowStatus, { color: colors.ink }]}>✓</Text>
        ) : trialEnds != null ? (
          <Text style={[styles.rowStatus, { color: colors.muted }]}>
            {lockHint(item, trialEnds)}
          </Text>
        ) : hint != null ? (
          <Text style={[styles.rowStatus, { color: colors.muted }]}>{hint}</Text>
        ) : null}
      </Pressable>
    );
  };

  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.bg },
        isTablet && { paddingHorizontal: TABLET_PADDING },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={t("Back to settings")}
          accessibilityRole="button"
          onPress={onBack}
          hitSlop={8}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.ink }]} allowFontScaling>
            {t("Back")}
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]} allowFontScaling>
          {t("Themes & sounds")}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]} allowFontScaling>
          {t("Disc colour")}
        </Text>
        <View style={styles.swatchRow}>
          {DISC_COLORS.map((item) => {
            const selected = discColorId === item.id;
            const unlocked = isItemUnlocked(item.id);
            const hint = unlocked ? null : lockHint(item, trialEndsAt(item.id));
            return (
              <Pressable
                key={item.id}
                onPress={() => pickItem(item)}
                accessibilityRole="button"
                accessibilityLabel={
                  t(item.name) +
                  (unlocked ? "" : t(" — locked, {hint}", { hint: hint ?? t("Plus") }))
                }
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.swatchWrap, pressed && { opacity: 0.75 }]}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: item.swatch ?? colors.track },
                    selected && { borderColor: colors.ink },
                  ]}
                />
                <Text
                  style={[styles.swatchName, { color: selected ? colors.ink : colors.muted }]}
                  allowFontScaling
                >
                  {t(item.name)}
                </Text>
                {hint != null ? (
                  <Text style={[styles.swatchHint, { color: colors.muted }]} allowFontScaling>
                    {hint}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.ink }]} allowFontScaling>
          {t("Focus sound")}
        </Text>
        <View style={styles.soundList}>{FOCUS_SOUNDS.map(itemRow)}</View>

        {isPlus ? null : (
          <Pressable
            onPress={onUpgrade}
            accessibilityRole="button"
            accessibilityLabel={t("Get Focus Loop Plus")}
            style={({ pressed }) => [
              styles.plusCard,
              { backgroundColor: colors.surface, borderColor: colors.rule },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.plusTitle, { color: colors.ink }]} allowFontScaling>
              {t("Get Plus")}
            </Text>
            <Text style={[styles.plusBody, { color: colors.muted }]} allowFontScaling>
              {t("Keep every colour and sound forever")}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* J8 trial card (P15 copy): watch one short video → 24h item trial. */}
      <Sheet
        visible={trialItem != null}
        onDismiss={() => setTrialItem(null)}
        colors={colors}
        accessibilityLabel={t("Try {name} for 24 hours", {
          name: trialItem != null ? t(trialItem.name) : t("item"),
        })}
      >
        {trialItem != null ? (
          <>
            <Text style={[styles.sheetTitle, { color: colors.ink }]} allowFontScaling>
              {t("Try {name} for 24 hours", { name: t(trialItem.name) })}
            </Text>
            <Text style={[styles.sheetBody, { color: colors.muted }]} allowFontScaling>
              {t("Watch one short video. Or keep it forever with Plus.")}
            </Text>
            {adState === "failed" ? (
              <Text style={[styles.adError, { color: colors.danger }]} allowFontScaling>
                {t("Couldn't load the video. Try again")}
              </Text>
            ) : null}
            <PrimaryButton
              label={
                adState === "loading"
                  ? t("Loading video…")
                  : adState === "failed"
                    ? t("Try again")
                    : t("Watch video")
              }
              onPress={() => {
                if (adState !== "loading") {
                  void watch(trialItem);
                }
              }}
              colors={colors}
            />
            <SecondaryButton
              label={t("Get Plus")}
              onPress={() => {
                setTrialItem(null);
                onUpgrade();
              }}
              colors={colors}
            />
            <TextButton label={t("Not now")} onPress={() => setTrialItem(null)} colors={colors} />
          </>
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: { minWidth: 48, minHeight: 48, justifyContent: "center" },
  backButtonText: { ...typography.body },
  title: { ...typography.title },
  scroll: { paddingBottom: spacing.xxl, gap: spacing.md },
  sectionTitle: { ...typography.headline, marginTop: spacing.sm },
  swatchRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  swatchWrap: { alignItems: "center", gap: spacing.xs, minWidth: 64 },
  swatch: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: "transparent" },
  swatchName: { ...typography.caption, fontSize: 14 },
  swatchHint: { ...typography.caption, fontSize: 11 },
  soundList: { gap: spacing.sm },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  rowName: { ...typography.body, fontWeight: "600" },
  rowStatus: { ...typography.caption, fontSize: 14 },
  plusCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
    marginTop: spacing.sm,
  },
  plusTitle: { ...typography.headline },
  plusBody: { ...typography.caption },
  sheetTitle: { ...typography.title },
  sheetBody: { ...typography.body },
  adError: { ...typography.body, fontSize: 15 },
});
