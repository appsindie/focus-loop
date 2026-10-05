import AsyncStorage from "@react-native-async-storage/async-storage";
import { catalogueItem } from "../personalize/catalogue";

const ENTITLEMENT_KEY = "focus-loop/v1/entitlement";
const TRIAL_HOURS = 24;

// ADR-003: Plus is a local flag backed by the store receipt, re-verified on every app
// start and at the subscription expiry. Rewarded trials are per-item 24h records.
export type Entitlement = {
  isPlus: boolean;
  productId: string | null;
  // Subscription expiry timestamp (ISO) for yearly; null for lifetime or free.
  plusExpiresAt: string | null;
  // Last successful store-entitlement re-check (ISO).
  lastVerifiedAt: string | null;
  trials: { itemId: string; expiresAt: string }[];
};

const DEFAULT_ENTITLEMENT: Entitlement = {
  isPlus: false,
  productId: null,
  plusExpiresAt: null,
  lastVerifiedAt: null,
  trials: [],
};

// CR-26: callers may push into `trials` (J8) — never hand out the shared
// default or later empty-store reads inherit earlier state (same bug class
// the reviewPrompt shared-default had).
export function defaultEntitlement(): Entitlement {
  return { ...DEFAULT_ENTITLEMENT, trials: [] };
}

function isEntitlement(value: unknown): value is Entitlement {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["isPlus"] === "boolean" &&
    (candidate["productId"] === null || typeof candidate["productId"] === "string") &&
    (candidate["plusExpiresAt"] === null || typeof candidate["plusExpiresAt"] === "string") &&
    (candidate["lastVerifiedAt"] === null || typeof candidate["lastVerifiedAt"] === "string") &&
    Array.isArray(candidate["trials"])
  );
}

export async function loadEntitlement(): Promise<Entitlement> {
  try {
    const raw = await AsyncStorage.getItem(ENTITLEMENT_KEY);
    if (raw == null) {
      return defaultEntitlement();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isEntitlement(parsed)) {
      return defaultEntitlement();
    }
    // The parsed object is used as-is; saveEntitlement callers spread it before
    // writing, so sharing it is safe.
    return parsed;
  } catch {
    return defaultEntitlement();
  }
}

// In-process change notification: AsyncStorage has no event system, and the only
// writers of this key run in the JS runtime (purchase, trial grant, re-check), so a
// synchronous listener set is enough for useEntitlement to re-read on any write.
type EntitlementListener = () => void;
const entitlementListeners = new Set<EntitlementListener>();

export function onEntitlementChanged(listener: EntitlementListener): () => void {
  entitlementListeners.add(listener);
  return () => {
    entitlementListeners.delete(listener);
  };
}

export async function saveEntitlement(entitlement: Entitlement): Promise<void> {
  await AsyncStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(entitlement));
  for (const listener of entitlementListeners) {
    listener();
  }
}

export async function grantPlus(
  productId: string,
  plusExpiresAt: string | null,
  verifiedAt: Date,
): Promise<Entitlement> {
  const entitlement = await loadEntitlement();
  const next: Entitlement = {
    ...entitlement,
    isPlus: true,
    productId,
    plusExpiresAt,
    lastVerifiedAt: verifiedAt.toISOString(),
  };
  await saveEntitlement(next);
  return next;
}

// Called on app start and whenever the expiry timestamp passes (ADR-003 re-check).
// Tri-state: a store query that fails (offline, error) is "unknown" — it must neither
// revoke a paying user nor extend Plus (code review CR-02).
export type VerificationResult = "plus" | "not-plus" | "unknown";

export async function applyVerification(
  result: VerificationResult,
  productId: string | null,
  plusExpiresAt: string | null,
  verifiedAt: Date,
): Promise<Entitlement> {
  if (result === "unknown") {
    return loadEntitlement();
  }
  const entitlement = await loadEntitlement();
  const next: Entitlement = {
    ...entitlement,
    isPlus: result === "plus",
    productId: result === "plus" ? productId : entitlement.productId,
    plusExpiresAt: result === "plus" ? plusExpiresAt : entitlement.plusExpiresAt,
    lastVerifiedAt: verifiedAt.toISOString(),
  };
  await saveEntitlement(next);
  return next;
}

// J8: a rewarded video grants exactly a 24h trial of one item (spec J8-R2).
export async function startTrial(itemId: string, now: Date): Promise<Entitlement> {
  const entitlement = await loadEntitlement();
  const expiresAt = new Date(now.getTime() + TRIAL_HOURS * 3600 * 1000).toISOString();
  const trials = entitlement.trials.filter((trial) => trial.itemId !== itemId);
  const next: Entitlement = { ...entitlement, trials: [...trials, { itemId, expiresAt }] };
  await saveEntitlement(next);
  return next;
}

// Slow store renewals: keep Plus unlocked for a short grace past the expiry stamp so a
// renewal that settles a few hours late doesn't flicker the paywall (CR-02).
const RENEWAL_GRACE_MS = 48 * 3600 * 1000;

// J7-R3 ad-removal flag and J6-R3 history gate share this: lifetime has no expiry
// stamp; a yearly stays Plus until expiry + renewal grace.
export function isPlusActive(entitlement: Entitlement, now: Date): boolean {
  if (!entitlement.isPlus) {
    return false;
  }
  if (entitlement.plusExpiresAt == null) {
    return true;
  }
  return new Date(entitlement.plusExpiresAt).getTime() + RENEWAL_GRACE_MS > now.getTime();
}

export function isItemUnlocked(entitlement: Entitlement, itemId: string, now: Date): boolean {
  // Free-tier catalogue items are always usable — the trial/Plus checks below
  // only exist for locked tiers. Without this, a free install locked its own
  // free rows (picker opened the trial card; the session-sound fallback in
  // App.tsx dropped a free pick back to silence). Found via E2E on sim.
  if (catalogueItem(itemId)?.tier === "free") {
    return true;
  }
  if (isPlusActive(entitlement, now)) {
    return true;
  }
  // An ex-Plus user past the renewal grace is a free user — a live trial still counts.
  const trial = entitlement.trials.find((t) => t.itemId === itemId);
  return trial != null && new Date(trial.expiresAt).getTime() > now.getTime();
}

// Picker caption: while a trial is live, show when it ends; null when free/
// Plus-covered or expired.
export function activeTrialEndsAt(
  entitlement: Entitlement,
  itemId: string,
  now: Date,
): Date | null {
  if (catalogueItem(itemId)?.tier === "free" || isPlusActive(entitlement, now)) {
    return null;
  }
  const trial = entitlement.trials.find((t) => t.itemId === itemId);
  if (trial == null) {
    return null;
  }
  const ends = new Date(trial.expiresAt);
  return ends.getTime() > now.getTime() ? ends : null;
}

export function pruneExpiredTrials(entitlement: Entitlement, now: Date): Entitlement {
  return {
    ...entitlement,
    trials: entitlement.trials.filter(
      (trial) => new Date(trial.expiresAt).getTime() > now.getTime(),
    ),
  };
}
