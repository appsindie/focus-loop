// Localization — Tier 1 + Tier 2 locales per AppsIndie Localization Tiers.
//
// Dictionaries are keyed by the English source string (gettext-style): a
// missing translation falls back to the key itself, so English always works.
// Locale files are plain JSON maps { "<english>": "<translation>" }.
import { I18nManager } from "react-native";
import { getLocales } from "expo-localization";

import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import id from "./locales/id.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import nl from "./locales/nl.json";
import pl from "./locales/pl.json";
import ptBR from "./locales/pt-BR.json";
import ru from "./locales/ru.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import vi from "./locales/vi.json";
import zhHans from "./locales/zh-Hans.json";
import zhHant from "./locales/zh-Hant.json";

export const SUPPORTED_LOCALES = [
  "en",
  "es",
  "pt-BR",
  "de",
  "fr",
  "ja",
  "ko",
  "zh-Hans",
  "zh-Hant",
  "it",
  "ru",
  "tr",
  "id",
  "vi",
  "th",
  "pl",
  "nl",
  "ar",
  "hi",
] as const;

export type LocaleId = (typeof SUPPORTED_LOCALES)[number];

const DICTIONARIES: Record<LocaleId, Record<string, string>> = {
  en,
  es,
  "pt-BR": ptBR,
  de,
  fr,
  ja,
  ko,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  it,
  ru,
  tr,
  id,
  vi,
  th,
  pl,
  nl,
  ar,
  hi,
};

/** Map a BCP-47 device tag to a shipped locale. */
export function normalizeLocale(languageTag: string | null | undefined): LocaleId {
  if (!languageTag) return "en";
  const lower = languageTag.toLowerCase().replace(/_/g, "-");
  // Traditional-Chinese regions + any explicit Hant script tag.
  if (lower.includes("hant") || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-mo") {
    return "zh-Hant";
  }
  if (lower.startsWith("zh")) return "zh-Hans";
  if (lower === "pt" || lower.startsWith("pt-")) return "pt-BR";
  const language = lower.split("-")[0] ?? lower;
  const direct = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === lower);
  if (direct) return direct;
  const byLanguage = SUPPORTED_LOCALES.find(
    (l) => l.toLowerCase() === language || l.toLowerCase().startsWith(`${language}-`),
  );
  return byLanguage ?? "en";
}

const deviceLanguageTag = getLocales().map((l) => l.languageTag)[0];

let activeLocale: LocaleId = normalizeLocale(deviceLanguageTag);

export function locale(): LocaleId {
  return activeLocale;
}

// Test hook: locales.test.ts pins the locale without re-mocking getLocales.
export function setLocaleForTests(next: LocaleId): void {
  activeLocale = next;
}

// Arabic is RTL: let RN flip directional layout when the OS runs RTL. The
// actual direction switch happens at the native level on (re)start.
I18nManager.allowRTL(true);

export function isRTL(): boolean {
  return activeLocale === "ar";
}

/** Translate an English source string, interpolating {name} placeholders. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const translated = DICTIONARIES[activeLocale][key] ?? DICTIONARIES.en[key] ?? key;
  if (!vars) return translated;
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translated,
  );
}
