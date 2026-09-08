import { codesList } from "./constants";

export interface CountryOption {
  code: string;
  name: string;
}

export function getLocalizedCountries(locale: string = "en"): CountryOption[] {
  // Native browser formatter for region names
  const formatter = new Intl.DisplayNames([locale], { type: "region" });

  return (
    codesList
      .map((code) => ({
        code,
        name: formatter.of(code) || code, // Fallback to code if invalid
      }))
      // Sort alphabetically according to current locale (handles Arabic vs English ordering properly)
      .sort((a, b) => a.name.localeCompare(b.name, locale))
  );
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}
