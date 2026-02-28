---
name: i18n
description: Sets up internationalization for web (Astro/React) and native (Expo) apps. Handles translation files, locale detection, pluralization, RTL support, and type-safe translation keys. Use when adding multi-language support, managing translations, or configuring locale detection.
allowed-tools: Read Write Edit Glob Grep Bash
---

# i18n

The `i18n` part provides internationalization across all platforms. Translation files live in a shared workspace package — web and native apps import locale data and helpers from it.

## Decision Tree

- What are you doing?
  - **Setting up i18n from scratch** → see "Initial setup" below
  - **Adding a new language** → see "Adding locales" below
  - **Adding translations to a component** → see "Using translations" below
  - **Setting up locale detection** → see "Locale detection" below
  - **Handling RTL languages** → see "RTL support" below
  - **Checking for missing translations** → run `tools/translation-check.ts`
  - **Listing locale coverage** → run `tools/locale-coverage.ts`

## Initial setup

1. Create the i18n workspace package: `packages/i18n/`
2. Structure:

```
packages/i18n/
  src/
    index.ts          # exports
    locales/
      en.json         # English (base locale)
      nl.json         # Dutch
      de.json         # German
    types.ts          # generated type-safe keys
    utils.ts          # formatting helpers
```

3. Define the base locale in `src/locales/en.json`:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "auth": {
    "signIn": "Sign in",
    "signOut": "Sign out",
    "email": "Email address"
  },
  "errors": {
    "notFound": "Page not found",
    "generic": "Something went wrong"
  }
}
```

4. Generate type-safe keys in `src/types.ts`:

```ts
import type en from "./locales/en.json";

type NestedKeys<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? NestedKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
        : never;
    }[keyof T]
  : Prefix;

export type TranslationKey = NestedKeys<typeof en>;
```

5. Create the translation function in `src/utils.ts`:

```ts
import type { TranslationKey } from "./types";

export function t(
  translations: Record<string, unknown>,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let value: unknown = translations;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`));
}
```

6. Export from `src/index.ts`:

```ts
export { t } from "./utils";
export type { TranslationKey } from "./types";
export { default as en } from "./locales/en.json";
export { default as nl } from "./locales/nl.json";
```

## Adding locales

1. Copy `en.json` to `<locale>.json` (e.g., `nl.json`)
2. Translate all values — keep the same key structure
3. Export the new locale from `src/index.ts`
4. Run `tools/translation-check.ts` to verify all keys are present
5. Add the locale to the locale list in your app config

## Using translations

### Web (Astro/React)

```tsx
import { t, en, nl } from "@scope/i18n";

function Component({ locale }: { locale: string }) {
  const translations = locale === "nl" ? nl : en;
  return <h1>{t(translations, "common.save")}</h1>;
}
```

### Expo (React Native)

```tsx
import { t, en, nl } from "@scope/i18n";
import { getLocales } from "expo-localization";

const deviceLocale = getLocales()[0]?.languageCode ?? "en";
const translations = deviceLocale === "nl" ? nl : en;

function Screen() {
  return <Text>{t(translations, "auth.signIn")}</Text>;
}
```

## Locale detection

### Web

```ts
// Server-side (Hono middleware)
function detectLocale(request: Request): string {
  // 1. URL path prefix: /nl/about
  const pathLocale = new URL(request.url).pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(pathLocale)) return pathLocale;

  // 2. Cookie
  const cookieLocale = getCookie(request, "locale");
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  // 3. Accept-Language header
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0]?.split("-")[0]?.trim();
    if (preferred && SUPPORTED_LOCALES.includes(preferred)) return preferred;
  }

  return DEFAULT_LOCALE;
}
```

### Expo

```ts
import { getLocales } from "expo-localization";

function detectLocale(): string {
  const deviceLocale = getLocales()[0]?.languageCode ?? "en";
  return SUPPORTED_LOCALES.includes(deviceLocale) ? deviceLocale : DEFAULT_LOCALE;
}
```

## Pluralization

Use ICU-style plural rules:

```json
{
  "items": {
    "count_zero": "No items",
    "count_one": "{{count}} item",
    "count_other": "{{count}} items"
  }
}
```

```ts
export function tPlural(
  translations: Record<string, unknown>,
  key: string,
  count: number,
  params?: Record<string, string | number>
): string {
  const rule = new Intl.PluralRules("en").select(count);
  const pluralKey = `${key}_${rule}`;
  return t(translations, pluralKey as TranslationKey, { count, ...params });
}
```

## RTL support

For Arabic, Hebrew, and other RTL languages:

```ts
const RTL_LOCALES = ["ar", "he", "fa", "ur"];

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}
```

### Web

```html
<html dir={isRTL(locale) ? "rtl" : "ltr"} lang={locale}>
```

### Expo

```ts
import { I18nManager } from "react-native";

I18nManager.forceRTL(isRTL(locale));
I18nManager.allowRTL(true);
```

- RTL changes in Expo require an app restart to take effect
- Use `start` and `end` instead of `left` and `right` in styles

## Key references

| File | What it covers |
|---|---|
| `tools/translation-check.ts` | Missing keys, untranslated strings, stale keys |
| `tools/locale-coverage.ts` | Per-locale translation completeness percentage |
