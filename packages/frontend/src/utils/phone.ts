import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

/** `number` holds national digits only, without the calling code. */
export type PhoneValue = { country: CountryCode; number: string };

export const DEFAULT_COUNTRY: CountryCode = "EG";

export const MAX_NATIONAL_DIGITS = 15;

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits -> ASCII. Other characters are untouched. */
export function normalizeDigits(text: string): string {
  return text
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** Keeps ASCII digits only (after converting Arabic / Persian digits). */
export function onlyDigits(text: string): string {
  return normalizeDigits(text).replace(/\D/g, "");
}

/** Turns the value stored in the DB (ideally E.164) into the component's value. */
export function parsePhone(stored?: string | null): PhoneValue {
  const raw = (stored ?? "").trim();
  if (!raw) return { country: DEFAULT_COUNTRY, number: "" };

  const parsed = parsePhoneNumberFromString(raw, DEFAULT_COUNTRY);
  if (parsed?.country) {
    return { country: parsed.country, number: parsed.nationalNumber };
  }
  return {
    country: DEFAULT_COUNTRY,
    number: onlyDigits(raw).slice(0, MAX_NATIONAL_DIGITS),
  };
}

/** E.164 string for the payload, or "" when empty / not a valid number. */
export function toE164(value: PhoneValue): string {
  if (!value.number) return "";
  const parsed = parsePhoneNumberFromString(value.number, value.country);
  return parsed?.isValid() ? parsed.number : "";
}

/** Empty is valid (the phone is optional). */
export function isPhoneValid(value: PhoneValue): boolean {
  return !value.number || isValidPhoneNumber(value.number, value.country);
}

/** Stable key for dirty detection. An empty number ignores the country. */
export function phoneKey(value: PhoneValue): string {
  return value.number ? `${value.country}:${value.number}` : "";
}
