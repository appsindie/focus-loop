import { useWindowDimensions } from "react-native";

// DESIGN.md §4: tablet is a layout of the same screens, not new journeys.
// The 600pt shortest-side breakpoint is the standard phone/tablet split —
// an iPad mini (744pt) counts, a Pro Max phone (~430pt) does not.
export const TABLET_MIN_SHORT_SIDE = 600;
export const TABLET_PADDING = 48;

export type Area = { width: number; height: number };

export function fitDiscSize(area: Area, reservedHeight: number, cap = Infinity): number {
  return Math.floor(Math.max(160, Math.min(area.width, area.height - reservedHeight, cap)));
}

export function fitTimerFontSize(area: Area): number {
  return Math.floor(Math.min(area.height * 0.6, area.width * 0.45));
}

export function discStrokeWidth(size: number): number {
  return Math.max(12, Math.round(size / 20));
}

export function useIsTablet(): boolean {
  const { width, height } = useWindowDimensions();
  return Math.min(width, height) >= TABLET_MIN_SHORT_SIDE;
}

export function useIsLandscape(): boolean {
  const { width, height } = useWindowDimensions();
  return width > height;
}
