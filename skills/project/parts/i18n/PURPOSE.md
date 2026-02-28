# i18n

Internationalization module: translations, locale detection, and formatting.

## Responsibilities

- Scaffold an i18n package in a bun workspace monorepo
- Organize translation files by locale and feature namespace
- Provide a type-safe translation function with ICU MessageFormat support
- Integrate locale detection for web (URL-based) and native (device locale)
- Handle RTL language support for both web and React Native
- Provide locale-aware number, date, and currency formatting

## Tools

- `tools/translation-check.ts` — find missing translation keys by comparing all locales against the base locale
- `tools/key-extract.ts` — scan source files for translation key usage and report unused or undefined keys
