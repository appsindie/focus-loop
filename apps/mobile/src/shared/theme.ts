import { useColorScheme } from "react-native";
import { Appearance } from "../features/settings/SettingsStore";

// Canvas 1791071241-7cd3 → docs/brand/design/tokens.json (do not edit design/ by hand).
export const palette = {
  light: {
    bg: "#F6F3EE",
    surface: "#FFFFFF",
    ink: "#141210",
    ink2: "#4A443C",
    muted: "#6B645B",
    faint: "#8A8175",
    rule: "#DDD6CB",
    chip: "#ECE5DA",
    track: "#E9DFD3",
    trackBreak: "#D3E3D8",
    trackFocus: "#F1D4C6",
    focus: "#D9480F",
    focusText: "#B93C0A",
    break: "#2F7D4F",
    onBreak: "#FFFFFF",
    breakBg: "#2F7D4F",
    breakMuted: "#A8CCB4",
    onPrimary: "#F6F3EE",
    primaryAccent: "#F0A27F",
    scrim: "rgba(20,18,16,0.45)",
    danger: "#DC2626",
  },
  dark: {
    bg: "#0B0A09",
    surface: "#191715",
    ink: "#F2EEE8",
    ink2: "#C9C2B8",
    muted: "#9A9289",
    faint: "#7A7269",
    rule: "#2C2926",
    chip: "#221F1C",
    track: "#2A2420",
    trackBreak: "#1C2A22",
    trackFocus: "#43291B",
    focus: "#FF6A2B",
    focusText: "#FF8A5B",
    break: "#3FA66A",
    onBreak: "#0B0A09",
    breakBg: "#173D28",
    breakMuted: "#6CC892",
    onPrimary: "#0B0A09",
    primaryAccent: "#B93C0A",
    scrim: "rgba(0,0,0,0.6)",
    danger: "#F87171",
  },
} as const;

// Widened to plain strings so callers can legitimately override single roles
// (e.g. the break field re-tints the disc to white-on-green).
export type Palette = { readonly [K in keyof (typeof palette)["light"]]: string };

export function resolvePalette(appearance: Appearance, scheme: "light" | "dark" | null): Palette {
  const effective = appearance === "system" ? (scheme ?? "light") : appearance;
  return palette[effective];
}

export function usePalette(appearance: Appearance): Palette {
  const scheme = useColorScheme();
  return resolvePalette(appearance, scheme === "dark" ? "dark" : "light");
}

export const fonts = {
  // tokens.json `user-words` is Newsreader; the bundled font lands with the asset work —
  // until then the platform serif carries the same role.
  userWords: "serif",
} as const;

export const typography = {
  timer: { fontSize: 200, fontWeight: "600" as const, letterSpacing: -12 },
  timerSeconds: { fontSize: 56, fontWeight: "500" as const },
  h1: { fontSize: 44, fontWeight: "600" as const, letterSpacing: -1.3 },
  h1Screen: { fontSize: 36, fontWeight: "600" as const, letterSpacing: -1 },
  title: { fontSize: 22, fontWeight: "600" as const },
  body: { fontSize: 17, fontWeight: "400" as const, lineHeight: 26 },
  label: { fontSize: 14, fontWeight: "600" as const, letterSpacing: 0.7 },
  caption: { fontSize: 13, fontWeight: "400" as const },
  userWords: {
    fontSize: 26,
    fontWeight: "400" as const,
    lineHeight: 30,
    fontFamily: fonts.userWords,
  },
  // Legacy scale kept for screens not yet migrated to the canvas typography.
  display: { fontSize: 64, fontWeight: "700" as const },
  headline: { fontSize: 20, fontWeight: "600" as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// Back-compat alias for screens still on the pilot theme (migrated in their slices).
export const colors = {
  background: palette.light.bg,
  surface: palette.light.surface,
  primary: palette.light.ink,
  primaryText: palette.light.onPrimary,
  accent: palette.light.focus,
  danger: palette.light.danger,
  text: palette.light.ink,
  textMuted: palette.light.muted,
  border: palette.light.rule,
  chip: palette.light.chip,
} as const;
