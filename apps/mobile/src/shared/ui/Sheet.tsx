import { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
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
      <View style={styles.wrap}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
          onPress={onDismiss}
          accessibilityLabel="Dismiss"
        />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "flex-end" },
  card: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
});
