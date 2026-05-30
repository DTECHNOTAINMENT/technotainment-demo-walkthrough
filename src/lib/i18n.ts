/**
 * i18n scaffold (Phase 5). A minimal message catalogue + `t()` resolver so copy is centralised
 * and ready for translation. Locale comes from the request (Accept-Language / a future cookie);
 * the 6 launch regions live in Admin → settings → regions. A full library (next-intl) can drop
 * in behind this same `t()` surface without touching call sites.
 */
export type Locale = "en-GB" | "en-US" | "de-DE" | "fr-FR" | "es-ES" | "nl-NL";

export const DEFAULT_LOCALE: Locale = "en-GB";
export const LOCALES: Locale[] = ["en-GB", "en-US", "de-DE", "fr-FR", "es-ES", "nl-NL"];

type Messages = Record<string, string>;

const catalog: Record<Locale, Messages> = {
  "en-GB": {
    "wallet.topup": "top up",
    "wallet.balance": "balance",
    "action.tip": "tip",
    "action.join": "join",
    "live.chat.placeholder": "say something…",
    "live.slowdown": "slow down",
  },
  "en-US": {},
  "de-DE": {},
  "fr-FR": {},
  "es-ES": {},
  "nl-NL": {},
};

/** Resolve a message key for a locale, falling back to en-GB then the key itself. */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return catalog[locale]?.[key] ?? catalog[DEFAULT_LOCALE][key] ?? key;
}

/** Pick the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0].trim();
    const match = LOCALES.find((l) => l.toLowerCase() === tag.toLowerCase() || l.startsWith(tag.split("-")[0]));
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
