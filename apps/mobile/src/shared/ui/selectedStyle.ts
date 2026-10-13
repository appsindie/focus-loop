import type { ViewStyle } from "react-native";
import type { Palette } from "../theme";

export function selectedStyle(colors: Palette, selected: boolean): ViewStyle {
  return {
    backgroundColor: selected ? colors.focus : "transparent",
    borderColor: selected ? colors.focus : colors.rule,
    borderWidth: 1,
  };
}

export function selectedCardStyle(colors: Palette, selected: boolean): ViewStyle {
  return {
    backgroundColor: colors.surface,
    borderColor: selected ? colors.focus : colors.rule,
    borderWidth: 2,
  };
}

export function selectedTextColor(colors: Palette, selected: boolean): string {
  return selected ? colors.onFocus : colors.ink2;
}
