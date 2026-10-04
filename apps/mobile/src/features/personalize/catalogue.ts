// J8 / P15: the personalisation catalogue — disc colours and focus sounds.
// Source of truth for what exists and which tier each item sits on; the
// settings screen and the lock logic both read this, never hard-coded lists.
export type CatalogueKind = "disc-color" | "focus-sound";
// free = always usable; trial = locked until Plus or a 24h rewarded trial;
// plus = Plus only, no trial offered (spec J8-R4).
export type CatalogueTier = "free" | "trial" | "plus";

export type CatalogueItem = {
  id: string;
  kind: CatalogueKind;
  name: string;
  tier: CatalogueTier;
  // Hex accent applied to the disc palette while this colour is selected.
  swatch?: string;
};

// P15 palette values taken from docs/product/design/source/P15-Themes.dc.html.
// Ember is the shipped default accent (theme.ts focus=#D9480F).
export const DISC_COLORS: CatalogueItem[] = [
  { id: "ember", kind: "disc-color", name: "Ember", tier: "free", swatch: "#D9480F" },
  { id: "ocean", kind: "disc-color", name: "Ocean", tier: "trial", swatch: "#2563A8" },
  { id: "moss", kind: "disc-color", name: "Moss", tier: "trial", swatch: "#5B7F2A" },
  { id: "plum", kind: "disc-color", name: "Plum", tier: "trial", swatch: "#7A3B69" },
];

// Sound ids are also the keys into focusSounds.ts's asset map; "silence" is
// the absence of playback, not an asset.
export const FOCUS_SOUNDS: CatalogueItem[] = [
  { id: "silence", kind: "focus-sound", name: "Silence", tier: "free" },
  { id: "white-noise", kind: "focus-sound", name: "White noise", tier: "free" },
  { id: "brown-noise", kind: "focus-sound", name: "Brown noise", tier: "free" },
  { id: "rain-on-window", kind: "focus-sound", name: "Rain on a window", tier: "plus" },
];

export const CATALOGUE: CatalogueItem[] = [...DISC_COLORS, ...FOCUS_SOUNDS];

export const DEFAULT_DISC_COLOR_ID = "ember";
export const DEFAULT_FOCUS_SOUND_ID = "silence";

export function catalogueItem(id: string | null | undefined): CatalogueItem | null {
  return CATALOGUE.find((item) => item.id === id) ?? null;
}

// Stored settings can name a removed item — fall back to the free default
// rather than locking the user out of their own disc colour (CR-04 class).
export function normalizeDiscColorId(id: string | null | undefined): string {
  const item = catalogueItem(id);
  return item?.kind === "disc-color" ? item.id : DEFAULT_DISC_COLOR_ID;
}

export function normalizeFocusSoundId(id: string | null | undefined): string {
  const item = catalogueItem(id);
  return item?.kind === "focus-sound" ? item.id : DEFAULT_FOCUS_SOUND_ID;
}

// Darken a #RRGGBB hex by `factor` for the focusText role — the design ships
// one swatch per colour; the text-on-disc variant derives from it (Ember:
// #D9480F → #B93C0A ≈ 0.83).
export function shadeHex(hex: string, factor: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (match == null) {
    return hex;
  }
  const value = Number.parseInt(match[1] ?? "0", 16);
  const channel = (shift: number) => Math.min(255, Math.round(((value >> shift) & 0xff) * factor));
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, "0")}`;
}
