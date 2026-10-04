import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Palette, typography } from "../../../shared/theme";
import { PrimaryButton, TextButton } from "../../../shared/ui/Buttons";
import { trackEvent } from "../../analytics/events";
import { buyPlus, restorePlus } from "../purchase";
import { getDefaultPlusStore, type PlusStore, type StoreProduct } from "../iapPort";
import { type PlusPlan } from "../plusProducts";

const BENEFITS = [
  "No ads — ever",
  "All themes & sounds",
  "Full focus history",
  "Unlimited share cards",
  "Support independent work",
] as const;

// P14: five benefits, plan picker (Yearly 7-day trial / Lifetime), prices from
// the store, × always visible, Restore/Terms/Privacy. Products that fail to
// load show the generic error and a retry — never raw SDK text (error registry).
type PaywallState =
  { kind: "loading" } | { kind: "error" } | { kind: "ready"; products: StoreProduct[] };

export function PaywallScreen({
  colors,
  // getDefaultPlusStore() is a module singleton — a per-render factory here
  // once re-fired the load effect on every render (CR-27).
  store = getDefaultPlusStore(),
  onClose,
  onPurchased,
  onRestored,
}: {
  colors: Palette;
  store?: PlusStore;
  onClose: () => void;
  onPurchased: () => void;
  onRestored: () => void;
}) {
  const [state, setState] = useState<PaywallState>({ kind: "loading" });
  const [plan, setPlan] = useState<PlusPlan>("yearly");
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setState({ kind: "loading" });
    store
      .loadProducts()
      .then((products) => {
        // Keep every plan renderable even when one product is missing — the
        // missing row hides rather than blocking the whole paywall.
        setState(products.length === 0 ? { kind: "error" } : { kind: "ready", products });
      })
      .catch(() => setState({ kind: "error" }));
  }, [store]);

  useEffect(load, [load]);
  useEffect(() => {
    trackEvent("paywall_shown", { entry: "route" });
  }, []);

  const buy = useCallback(async () => {
    setBusy("buy");
    setNotice(null);
    const outcome = await buyPlus(plan, store);
    setBusy(null);
    if (outcome === "purchased") {
      onPurchased();
    } else if (outcome === "pending") {
      setNotice("Payment is still being approved — Plus turns on when it clears.");
    } else if (outcome === "failed") {
      // Generic copy per the error registry; the store error is never shown raw.
      setNotice("We couldn't reach the store. Check your connection and try again.");
    }
  }, [plan, store, onPurchased]);

  const restore = useCallback(async () => {
    setBusy("restore");
    setNotice(null);
    const outcome = await restorePlus(store);
    setBusy(null);
    if (outcome === "restored") {
      onRestored();
    } else {
      setNotice(
        outcome === "none"
          ? "No purchases found for this store account."
          : "We couldn't reach the store. Check your connection and try again.",
      );
    }
  }, [store, onRestored]);

  const selectedProduct =
    state.kind === "ready" ? state.products.find((p) => p.plan === plan) : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View style={styles.closeSlot} />
        <Pressable
          accessibilityLabel="Close paywall"
          accessibilityRole="button"
          onPress={onClose}
          hitSlop={8}
          style={styles.closeButton}
        >
          <Text style={[styles.closeText, { color: colors.muted }]}>×</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.ink }]} allowFontScaling>
          Focus Loop Plus
        </Text>
        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => (
            <Text key={benefit} style={[styles.benefit, { color: colors.ink2 }]} allowFontScaling>
              {benefit}
            </Text>
          ))}
        </View>

        {state.kind === "loading" ? (
          <ActivityIndicator color={colors.focus} style={styles.loading} />
        ) : null}
        {state.kind === "error" ? (
          <View style={styles.errorBox}>
            <Text style={[styles.notice, { color: colors.ink2 }]} allowFontScaling>
              We couldn't load prices. Check your connection and try again.
            </Text>
            <TextButton label="Try again" onPress={load} colors={colors} />
          </View>
        ) : null}
        {state.kind === "ready" ? (
          <View style={styles.plans}>
            {state.products.map((product) => {
              const selected = product.plan === plan;
              return (
                <Pressable
                  key={product.plan}
                  accessibilityRole="button"
                  accessibilityLabel={`${product.title} ${product.priceText}`}
                  accessibilityState={{ selected }}
                  onPress={() => setPlan(product.plan)}
                  style={[
                    styles.planCard,
                    {
                      borderColor: selected ? colors.focus : colors.rule,
                      backgroundColor: colors.surface,
                    },
                    selected && { backgroundColor: colors.chip },
                  ]}
                >
                  <Text style={[styles.planName, { color: colors.ink }]} allowFontScaling>
                    {product.plan === "yearly" ? "Yearly" : "Lifetime"}
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.ink2 }]} allowFontScaling>
                    {product.priceText}
                  </Text>
                  {product.plan === "yearly" ? (
                    <Text style={[styles.planNote, { color: colors.muted }]} allowFontScaling>
                      7-day free trial
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {notice != null ? (
          <Text style={[styles.notice, { color: colors.ink2 }]} allowFontScaling>
            {notice}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {busy == null && selectedProduct != null ? (
          <PrimaryButton
            label={plan === "yearly" ? "Start free trial" : "Get Plus"}
            onPress={() => void buy()}
            colors={colors}
          />
        ) : (
          <View style={styles.busySlot}>
            <ActivityIndicator color={colors.focus} />
          </View>
        )}
        <View style={styles.legalRow}>
          <TextButton
            label={busy === "restore" ? "Restoring…" : "Restore purchases"}
            onPress={() => {
              if (busy == null) {
                void restore();
              }
            }}
            colors={colors}
          />
          <TextButton
            label="Terms"
            onPress={() => void Linking.openURL(TERMS_URL)}
            colors={colors}
          />
          <TextButton
            label="Privacy"
            onPress={() => void Linking.openURL(PRIVACY_URL)}
            colors={colors}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const TERMS_URL = "https://appsindie.com/focus-loop/terms";
const PRIVACY_URL = "https://appsindie.com/focus-loop/privacy";

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
  closeSlot: { flex: 1 },
  closeButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 32, lineHeight: 36 },
  body: { flex: 1, justifyContent: "center" },
  title: { ...typography.h1Screen, textAlign: "center", marginBottom: 24 },
  benefits: { gap: 10, marginBottom: 28 },
  benefit: { ...typography.body, textAlign: "center" },
  loading: { marginVertical: 40 },
  errorBox: { alignItems: "center", gap: 4 },
  plans: { gap: 12 },
  planCard: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  busySlot: { height: 64, alignItems: "center", justifyContent: "center" },
  planName: { ...typography.title },
  planPrice: { ...typography.body, marginTop: 2 },
  planNote: { ...typography.caption, marginTop: 4 },
  notice: { ...typography.caption, textAlign: "center", marginTop: 16, lineHeight: 18 },
  footer: { paddingBottom: 8, gap: 8 },
  legalRow: { flexDirection: "row", justifyContent: "center", gap: 18 },
});
