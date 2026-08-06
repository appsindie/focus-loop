export const colors = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  primary: "#2D5A27",
  primaryText: "#FFFFFF",
  accent: "#D97706",
  danger: "#DC2626",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
} as const;

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
} as const;

export const typography = {
  display: { fontSize: 64, fontWeight: "700" as const },
  title: { fontSize: 28, fontWeight: "600" as const },
  headline: { fontSize: 20, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 14, fontWeight: "400" as const },
} as const;
