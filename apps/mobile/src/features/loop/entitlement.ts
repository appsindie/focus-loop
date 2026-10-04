import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const DEFAULT_ENTITLEMENT: Entitlement = {
  isPlus: false,
  productId: null,
  plusExpiresAt: null,
  lastVerifiedAt: null,
  trials: [],
};

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
      return DEFAULT_ENTITLEMENT;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isEntitlement(parsed)) {
      return DEFAULT_ENTITLEMENT;
    }
    return parsed;
  } catch {
    return DEFAULT_ENTITLEMENT;
  }
}

export async function saveEntitlement(entitlement: Entitlement): Promise<void> {
  await AsyncStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(entitlement));
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

// Called on app start and whenever the expiry timestamp passes (ADR-003 re-check);
// the real re-verify goes through the store entitlement query — this applies its
// result so a lapsed/refunded yearly revokes Plus without user action.
export async function applyVerification(
  storeReportsPlus: boolean,
  productId: string | null,
  plusExpiresAt: string | null,
  verifiedAt: Date,
): Promise<Entitlement> {
  const entitlement = await loadEntitlement();
  const next: Entitlement = {
    ...entitlement,
    isPlus: storeReportsPlus,
    productId: storeReportsPlus ? productId : entitlement.productId,
    plusExpiresAt: storeReportsPlus ? plusExpiresAt : entitlement.plusExpiresAt,
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

export function isItemUnlocked(entitlement: Entitlement, itemId: string, now: Date): boolean {
  if (entitlement.isPlus) {
    return true;
  }
  const trial = entitlement.trials.find((t) => t.itemId === itemId);
  return trial != null && new Date(trial.expiresAt).getTime() > now.getTime();
}

export function pruneExpiredTrials(entitlement: Entitlement, now: Date): Entitlement {
  return {
    ...entitlement,
    trials: entitlement.trials.filter(
      (trial) => new Date(trial.expiresAt).getTime() > now.getTime(),
    ),
  };
}
