import { useCallback, useEffect, useState } from "react";
import { defaultEntitlement, loadEntitlement, onEntitlementChanged } from "./entitlement";
import type { Entitlement } from "./entitlement";

// Loads the stored entitlement once, then re-reads on every saveEntitlement
// (purchase, trial grant, lapse re-check) so hasAdsRemoval / history gating flip
// without a remount. Writers in other processes (widget headless task) read the
// key directly and never publish back, so an in-process listener suffices.
//
// CR-25: `loaded` distinguishes "not read yet" from "read, is free tier" — a
// Plus user must never see an ad request fly in the first render window.
export function useEntitlement(): {
  entitlement: Entitlement;
  loaded: boolean;
  refresh: () => Promise<void>;
} {
  const [entitlement, setEntitlement] = useState<Entitlement>(defaultEntitlement);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setEntitlement(await loadEntitlement());
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
    return onEntitlementChanged(() => {
      void refresh();
    });
  }, [refresh]);

  return { entitlement, loaded, refresh };
}
