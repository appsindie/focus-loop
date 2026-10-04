import { useCallback, useEffect, useState } from "react";
import { DEFAULT_ENTITLEMENT, loadEntitlement, onEntitlementChanged } from "./entitlement";
import type { Entitlement } from "./entitlement";

// Loads the stored entitlement once, then re-reads on every saveEntitlement
// (purchase, trial grant, lapse re-check) so hasAdsRemoval / history gating flip
// without a remount. Writers in other processes (widget headless task) read the
// key directly and never publish back, so an in-process listener suffices.
export function useEntitlement(): {
  entitlement: Entitlement;
  refresh: () => Promise<void>;
} {
  const [entitlement, setEntitlement] = useState<Entitlement>(DEFAULT_ENTITLEMENT);

  const refresh = useCallback(async () => {
    setEntitlement(await loadEntitlement());
  }, []);

  useEffect(() => {
    void refresh();
    return onEntitlementChanged(() => {
      void refresh();
    });
  }, [refresh]);

  return { entitlement, refresh };
}
