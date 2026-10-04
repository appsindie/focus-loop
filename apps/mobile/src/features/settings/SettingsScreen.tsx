import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "../../i18n";
import { Palette, radii, spacing, typography } from "../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../shared/layout";
import { Sheet } from "../../shared/ui/Sheet";
import { Appearance, DisplayMode, Settings } from "./SettingsStore";
import { catalogueItem } from "../personalize/catalogue";
import { PLUS_PRODUCT_IDS } from "../plus/plusProducts";
import { resolveRhythm } from "../loop/rhythm";
import { CONTACT_URL, LICENSES_URL, PRIVACY_URL, TERMS_URL } from "./about";

export type AboutLink = "privacy" | "terms" | "licenses" | "contact";

const ABOUT_LINKS: { id: AboutLink; label: string; url: string }[] = [
  { id: "privacy", label: "Privacy Policy", url: PRIVACY_URL },
  { id: "terms", label: "Terms of Use", url: TERMS_URL },
  { id: "licenses", label: "Open-source licenses", url: LICENSES_URL },
  { id: "contact", label: "Contact & feedback", url: CONTACT_URL },
];

function openLink(url: string): void {
  void Linking.openURL(url);
}

type SettingsScreenProps = {
  colors: Palette;
  settings: Settings;
  // P20: changes save immediately — the parent persists every patch.
  onChange: (patch: Partial<Settings>) => void;
  onBack: () => void;
  // J7: Plus card + R4 restore row.
  isPlus: boolean;
  plusExpiresAt: string | null;
  // CR-29: an Android yearly sub reports no client-side expiry — the label
  // comes from the product id, not the absence of a date.
  plusProductId: string | null;
  onUpgrade: () => void;
  onRestore: () => void;
  restoreMessage?: string | null;
  // J8: P15 lives on its own screen — this row routes there.
  onOpenThemes: () => void;
  // J10: rhythm + reminders each get their own screen (P21/P22).
  onOpenRhythm: () => void;
  onOpenReminders: () => void;
  remindersSummary: string;
  // P20 Your data: CSV export + confirmed wipe.
  onExportData: () => void;
  exportMessage?: string | null;
  onDeleteAll: () => void;
  // P20 About: ad tracking choice + the store app version string.
  allowTracking: boolean | null;
  onSetAllowTracking: (allow: boolean) => void;
  version: string;
};

function Stepper({
  colors,
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
}: {
  colors: Palette;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel={t("Decrease {label}", { label: accessibilityLabel })}
        hitSlop={8}
        style={styles.stepButton}
      >
        <Text style={[styles.stepButtonText, { color: colors.ink }]}>−</Text>
      </Pressable>
      <Text style={[styles.stepValue, { color: colors.ink }]}>{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel={t("Increase {label}", { label: accessibilityLabel })}
        hitSlop={8}
        style={styles.stepButton}
      >
        <Text style={[styles.stepButtonText, { color: colors.ink }]}>+</Text>
      </Pressable>
    </View>
  );
}

function Segmented<T extends string>({
  colors,
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  colors: Palette;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="button"
            accessibilityLabel={t("{label}: {option}", {
              label: accessibilityLabel,
              option: t(o.label),
            })}
            accessibilityState={{ selected }}
            style={[
              styles.segmentOption,
              selected && { backgroundColor: colors.chip, borderRadius: radii.pill },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: colors.muted },
                selected && { color: colors.ink, fontWeight: "600" },
              ]}
            >
              {t(o.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Row({
  colors,
  label,
  value,
  onPress,
  children,
}: {
  colors: Palette;
  label: string;
  value?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const inner = (
    <>
      <Text style={[styles.rowLabel, { color: colors.ink }]} allowFontScaling>
        {label}
      </Text>
      {children ??
        (value != null ? (
          <Text style={[styles.rowValue, { color: colors.muted }]} allowFontScaling>
            {value}
          </Text>
        ) : null)}
    </>
  );
  if (onPress == null) {
    return (
      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
        {inner}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.rule }]}
    >
      {inner}
    </Pressable>
  );
}

// P20: single place for every preference and legal/data control. Row order is
// J10-R2; everything saves immediately (R3) — there is no Save button.
type SectionId = "timer" | "plus" | "data" | "about";

// T05 rail labels — Themes and Reminders route to their own screens on tap
// (they are journeys of their own, not detail panes).
const RAIL: { id: SectionId | "themes" | "reminders"; label: string }[] = [
  { id: "timer", label: "Timer & display" },
  { id: "themes", label: "Themes & sounds" },
  { id: "reminders", label: "Reminders" },
  { id: "plus", label: "Focus Loop Plus" },
  { id: "data", label: "Your data" },
  { id: "about", label: "About & legal" },
];

export function SettingsScreen({
  colors,
  settings,
  onChange,
  onBack,
  isPlus,
  plusExpiresAt,
  plusProductId,
  onUpgrade,
  onRestore,
  restoreMessage,
  onOpenThemes,
  onOpenRhythm,
  onOpenReminders,
  remindersSummary,
  onExportData,
  exportMessage,
  onDeleteAll,
  allowTracking,
  onSetAllowTracking,
  version,
}: SettingsScreenProps) {
  const isTablet = useIsTablet();
  const rhythm = resolveRhythm(settings.rhythmPresetId, settings.customRhythm);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adChoicesOpen, setAdChoicesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("timer");

  const rhythmSummary = `${rhythm.focusMinutes} · ${rhythm.breakMinutes} · ${t("long")} ${rhythm.longBreakMinutes}`;
  const discName = t(catalogueItem(settings.discColorId)?.name ?? "Ember");
  const soundName = t(catalogueItem(settings.focusSoundId)?.name ?? "Silence");

  const timerRows = (
    <>
      <Row colors={colors} label={t("Show time as")}>
        <Segmented<DisplayMode>
          colors={colors}
          accessibilityLabel={t("Show time as")}
          options={[
            { id: "disc", label: "Disc" },
            { id: "numbers", label: "Numbers" },
          ]}
          value={settings.displayMode ?? "disc"}
          onChange={(displayMode) => onChange({ displayMode })}
        />
      </Row>

      <Row colors={colors} label={t("Appearance")}>
        <Segmented<Appearance>
          colors={colors}
          accessibilityLabel={t("Appearance")}
          options={[
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" },
            { id: "system", label: "System" },
          ]}
          value={settings.appearance}
          onChange={(appearance) => onChange({ appearance })}
        />
      </Row>

      <Row colors={colors} label={t("Rhythm")} value={rhythmSummary} onPress={onOpenRhythm} />

      <Row colors={colors} label={t("Weekly goal")}>
        <Stepper
          colors={colors}
          accessibilityLabel={t("Weekly goal days")}
          value={settings.weeklyGoalDays}
          min={1}
          max={7}
          onChange={(weeklyGoalDays) => onChange({ weeklyGoalDays })}
        />
      </Row>

      <Row colors={colors} label={t("Start breaks automatically")}>
        <Switch
          accessibilityLabel={t("Toggle auto-start breaks")}
          onValueChange={(value) => onChange({ autoStartBreaks: value })}
          value={settings.autoStartBreaks}
        />
      </Row>

      <Row colors={colors} label={t("Show seconds")}>
        <Switch
          accessibilityLabel={t("Toggle show seconds")}
          onValueChange={(value) => onChange({ showSeconds: value })}
          value={settings.showSeconds}
        />
      </Row>

      <Row colors={colors} label={t("Sound on completion")}>
        <Switch
          accessibilityLabel={t("Toggle sound on completion")}
          onValueChange={(value) => onChange({ soundEnabled: value })}
          value={settings.soundEnabled}
        />
      </Row>

      <Row colors={colors} label={t("Vibrate at the end")}>
        <Switch
          accessibilityLabel={t("Toggle vibration on completion")}
          onValueChange={(value) => onChange({ vibrationEnabled: value })}
          value={settings.vibrationEnabled}
        />
      </Row>

      <Row colors={colors} label={t("Keep screen on during focus")}>
        <Switch
          accessibilityLabel={t("Toggle keep screen on during focus")}
          onValueChange={(value) => onChange({ keepScreenOn: value })}
          value={settings.keepScreenOn}
        />
      </Row>
    </>
  );

  const themeRows = (
    <>
      <Row
        colors={colors}
        label={t("Themes & sounds")}
        value={`${discName} · ${soundName}`}
        onPress={onOpenThemes}
      />

      <Row
        colors={colors}
        label={t("Reminders")}
        value={remindersSummary}
        onPress={onOpenReminders}
      />
    </>
  );

  const plusCard = (
    <View style={[styles.plusCard, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
      <View style={styles.plusHeader}>
        <View style={styles.plusText}>
          <Text style={[styles.plusTitle, { color: colors.ink }]} allowFontScaling>
            Focus Loop Plus
          </Text>
          <Text style={[styles.plusBody, { color: colors.muted }]} allowFontScaling>
            {isPlus
              ? plusProductId === PLUS_PRODUCT_IDS.lifetime
                ? t("Lifetime")
                : plusExpiresAt != null
                  ? t("Active until {date}", {
                      date: new Date(plusExpiresAt).toLocaleDateString(),
                    })
                  : t("Active")
              : t("No ads, focus sounds, every theme, full history.")}
          </Text>
        </View>
        {!isPlus ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Get Focus Loop Plus")}
            onPress={onUpgrade}
            hitSlop={8}
          >
            <Text style={[styles.linkText, { color: colors.focus }]} allowFontScaling>
              {t("See Plus")}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("Restore purchases")}
        onPress={onRestore}
        hitSlop={8}
        style={styles.restoreRow}
      >
        <Text style={[styles.linkText, { color: colors.focus }]} allowFontScaling>
          {t("Restore purchases")}
        </Text>
      </Pressable>
      {restoreMessage != null ? (
        <Text style={[styles.message, { color: colors.muted }]} allowFontScaling>
          {restoreMessage}
        </Text>
      ) : null}
    </View>
  );

  const dataRows = (
    <>
      <Text style={[styles.sectionTitle, { color: colors.faint }]} allowFontScaling>
        {t("Your data")}
      </Text>
      <Row colors={colors} label={t("Export sessions (CSV)")} onPress={onExportData} />
      {exportMessage != null ? (
        <Text style={[styles.message, { color: colors.muted }]} allowFontScaling>
          {exportMessage}
        </Text>
      ) : null}
      <Row colors={colors} label={t("Delete all data…")} onPress={() => setConfirmDelete(true)} />
    </>
  );

  const aboutRows = (
    <>
      <Text style={[styles.sectionTitle, { color: colors.faint }]} allowFontScaling>
        {t("About")}
      </Text>
      {ABOUT_LINKS.map((link) => (
        <Row
          key={link.id}
          colors={colors}
          label={t(link.label)}
          onPress={() => openLink(link.url)}
        />
      ))}
      <Row
        colors={colors}
        label={t("Ad choices & tracking")}
        onPress={() => setAdChoicesOpen(true)}
      />
    </>
  );

  const versionFooter = (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: colors.faint }]} allowFontScaling>
        {t("Focus Loop · Version {version}", { version })}
      </Text>
      <Text style={[styles.footerText, { color: colors.faint }]} allowFontScaling>
        {t("No account. Your sessions stay on this phone.")}
      </Text>
    </View>
  );

  const detail =
    activeSection === "timer"
      ? timerRows
      : activeSection === "plus"
        ? plusCard
        : activeSection === "data"
          ? dataRows
          : aboutRows;

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
          accessibilityLabel={t("Back to home")}
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
          {t("Settings")}
        </Text>
        <View style={styles.backButton} />
      </View>

      {isTablet ? (
        // T05 master–detail: section rail left, the chosen section right.
        <View style={styles.mdRow}>
          <View style={styles.rail}>
            {RAIL.map((item) => {
              const isRoute = item.id === "themes" || item.id === "reminders";
              const selected = !isRoute && item.id === activeSection;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={t(item.label)}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    if (item.id === "themes") {
                      onOpenThemes();
                    } else if (item.id === "reminders") {
                      onOpenReminders();
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  style={[
                    styles.railItem,
                    selected && { backgroundColor: colors.chip, borderRadius: radii.md },
                  ]}
                >
                  <Text
                    style={[styles.railItemText, { color: selected ? colors.ink : colors.ink2 }]}
                    allowFontScaling
                  >
                    {t(item.label)}
                  </Text>
                </Pressable>
              );
            })}
            <View style={styles.railFooter}>
              <Text style={[styles.footerText, { color: colors.faint }]} allowFontScaling>
                {t("Version {version}", { version })}
              </Text>
            </View>
          </View>
          <ScrollView style={styles.detail}>
            <Text style={[styles.saveHint, { color: colors.faint }]} allowFontScaling>
              {t("Changes save as you go.")}
            </Text>
            {detail}
          </ScrollView>
        </View>
      ) : (
        <ScrollView>
          <Text style={[styles.saveHint, { color: colors.faint }]} allowFontScaling>
            {t("Changes save as you go.")}
          </Text>

          {timerRows}
          {themeRows}
          {plusCard}
          {dataRows}
          {aboutRows}
          {versionFooter}
        </ScrollView>
      )}

      <Sheet
        visible={confirmDelete}
        onDismiss={() => setConfirmDelete(false)}
        colors={colors}
        accessibilityLabel={t("Delete all data")}
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]} allowFontScaling>
          {t("Delete all data?")}
        </Text>
        <Text style={[styles.sheetBody, { color: colors.muted }]} allowFontScaling>
          {t(
            "This removes every session, setting and trial on this phone. Plus purchases can be restored afterwards. This cannot be undone.",
          )}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Confirm delete all data")}
          onPress={() => {
            setConfirmDelete(false);
            onDeleteAll();
          }}
          style={[styles.dangerButton, { backgroundColor: colors.danger }]}
        >
          <Text style={[styles.dangerButtonText, { color: colors.onPrimary }]} allowFontScaling>
            {t("Delete everything")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Keep my data")}
          onPress={() => setConfirmDelete(false)}
          hitSlop={8}
          style={styles.sheetSecondary}
        >
          <Text style={[styles.sheetSecondaryText, { color: colors.ink }]} allowFontScaling>
            {t("Keep my data")}
          </Text>
        </Pressable>
      </Sheet>

      <Sheet
        visible={adChoicesOpen}
        onDismiss={() => setAdChoicesOpen(false)}
        colors={colors}
        accessibilityLabel={t("Ad choices and tracking")}
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]} allowFontScaling>
          {t("Ad choices & tracking")}
        </Text>
        <Text style={[styles.sheetBody, { color: colors.muted }]} allowFontScaling>
          {t(
            "Focus Loop shows ads from Google AdMob. Turning this off asks AdMob for non-personalised ads only — ads still appear, they just don't use cross-app tracking.",
          )}
        </Text>
        <View style={styles.adChoiceRow}>
          <Text style={[styles.adChoiceLabel, { color: colors.ink }]} allowFontScaling>
            {t("Allow ad tracking")}
          </Text>
          <Switch
            accessibilityLabel={t("Toggle ad tracking")}
            onValueChange={onSetAllowTracking}
            value={allowTracking === true}
          />
        </View>
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
    marginBottom: spacing.sm,
  },
  backButton: { minWidth: 48, minHeight: 48, justifyContent: "center" },
  backButtonText: { ...typography.body },
  title: { ...typography.title },
  saveHint: { ...typography.caption, marginBottom: spacing.md },
  mdRow: { flex: 1, flexDirection: "row", gap: spacing.xl },
  rail: { width: 240, gap: 2 },
  railItem: { minHeight: 52, justifyContent: "center", paddingHorizontal: spacing.md },
  railItemText: { ...typography.body },
  railFooter: { marginTop: "auto", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  detail: { flex: 1 },
  sectionTitle: { ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 56,
    gap: spacing.md,
  },
  rowLabel: { ...typography.body, flexShrink: 1 },
  rowValue: { ...typography.caption, flexShrink: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  stepButtonText: { fontSize: 24 },
  stepValue: { ...typography.headline, minWidth: 24, textAlign: "center" },
  segmented: { flexDirection: "row" },
  segmentOption: {
    paddingHorizontal: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: { ...typography.caption },
  plusCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  plusHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  plusText: { flex: 1, gap: 2 },
  plusTitle: { ...typography.headline },
  plusBody: { ...typography.caption },
  restoreRow: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  linkText: { ...typography.caption, fontWeight: "600" },
  message: { ...typography.caption, textAlign: "left" },
  footer: { marginTop: spacing.xl, marginBottom: spacing.xxl, alignItems: "center", gap: 2 },
  footerText: { ...typography.caption },
  sheetTitle: { ...typography.headline, marginBottom: spacing.sm },
  sheetBody: { ...typography.body, marginBottom: spacing.lg },
  dangerButton: {
    borderRadius: radii.md,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: { ...typography.body, fontWeight: "600" },
  sheetSecondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  sheetSecondaryText: { ...typography.body },
  adChoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  adChoiceLabel: { ...typography.body },
});
