import { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "../../i18n";
import { Palette, radii } from "../theme";

// §3 Sheet: bottom sheet, radius 24 top, `surface`, over `scrim`.
// Content order follows the design: primary action first, then secondary, then text.
export function Sheet({
  visible,
  onDismiss,
  colors,
  children,
  accessibilityLabel,
}: {
  visible: boolean;
  onDismiss: () => void;
  colors: Palette;
  children: ReactNode;
  accessibilityLabel: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      accessibilityLabel={accessibilityLabel}
    >
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={({ pressed }) => [
            StyleSheet.absoluteFill,
            { backgroundColor: colors.scrim },
            pressed && { opacity: 0.55 },
          ]}
          onPress={onDismiss}
          accessibilityLabel={t("Dismiss")}
        />
        <SafeAreaView edges={["bottom"]}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>{children}</View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "flex-end" },
  card: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    gap: 12,
  },
});
