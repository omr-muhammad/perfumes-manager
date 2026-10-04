import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import {
  getCountryCallingCode,
  isSupportedCountry,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import { LabeledInput } from "@/ui/LabeledInput";
import {
  getCountryName,
  getFlagEmoji,
  getLocalizedCountries,
} from "@/utils/countries";
import styles from "./Phone.module.css";

/* ============================================
   Types + helpers (also used by UserProfile)
   ============================================ */

/** `number` holds national digits only, without the calling code. */
export type PhoneValue = { country: CountryCode; number: string };

export const DEFAULT_COUNTRY: CountryCode = "EG";

const MAX_NATIONAL_DIGITS = 15;

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits -> ASCII, then keep digits only. */
function onlyDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
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

/* ============================================
   Country list (built lazily, cached per language)
   ============================================ */

type PhoneCountry = {
  code: CountryCode;
  name: string;
  dial: string;
  search: string;
};

const countriesCache = new Map<string, PhoneCountry[]>();

/** Lowercase + strip diacritics (also Arabic tashkeel) for forgiving search. */
function simplify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function getPhoneCountries(locale: string): PhoneCountry[] {
  const cached = countriesCache.get(locale);
  if (cached) return cached;

  const english =
    locale === "en"
      ? null
      : new Map(getLocalizedCountries("en").map((c) => [c.code, c.name]));

  const list: PhoneCountry[] = [];
  for (const { code, name } of getLocalizedCountries(locale)) {
    if (!isSupportedCountry(code)) continue;
    list.push({
      code,
      name,
      dial: getCountryCallingCode(code),
      search: simplify(`${name} ${english?.get(code) ?? ""} ${code}`),
    });
  }

  countriesCache.set(locale, list);
  return list;
}

function filterCountries(all: PhoneCountry[], query: string): PhoneCountry[] {
  const q = simplify(onlyDigitsOrText(query.trim().replace(/^\+/, "")));
  if (!q) return all;
  if (/^\d+$/.test(q)) return all.filter((c) => c.dial.startsWith(q));
  return all.filter((c) => c.search.includes(q));
}

/** Converts Arabic digits in a query, leaves letters untouched. */
function onlyDigitsOrText(text: string): string {
  return text
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/* ============================================
   CountryPopover: virtualized, mounted only while open
   ============================================ */

// Row height is in px because the virtualizer needs numbers.
const ROW_HEIGHT = 40;
const LIST_HEIGHT = ROW_HEIGHT * 5.5; // 5.5 rows: the half row hints it scrolls

type CountryPopoverProps = {
  selected: CountryCode;
  locale: string;
  listId: string;
  onSelect: (code: CountryCode) => void;
  onClose: () => void;
};

function CountryPopover({
  selected,
  locale,
  listId,
  onSelect,
  onClose,
}: CountryPopoverProps) {
  const { t } = useTranslation();
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => getPhoneCountries(locale), [locale]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      all.findIndex((c) => c.code === selected),
    ),
  );
  const items = useMemo(() => filterCountries(all, query), [all, query]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
  });

  // On open: focus the search box and bring the selected country into view.
  useEffect(() => {
    searchRef.current?.focus();
    virtualizer.scrollToIndex(active, { align: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function moveTo(index: number) {
    if (items.length === 0) return;
    const next = Math.min(Math.max(index, 0), items.length - 1);
    setActive(next);
    virtualizer.scrollToIndex(next);
  }

  function handleQuery(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActive(0);
    virtualizer.scrollToOffset(0);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveTo(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveTo(active - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) onSelect(item.code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  }

  const activeItem = items[active];

  return (
    <div className={styles.popover}>
      <div className={styles.searchWrap}>
        <LuSearch className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={searchRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeItem ? `${listId}-${activeItem.code}` : undefined
          }
          aria-label={t("searchCountry")}
          placeholder={t("searchCountry")}
          className={styles.search}
          value={query}
          onChange={handleQuery}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>

      <div
        ref={listRef}
        className={styles.list}
        style={{ blockSize: LIST_HEIGHT }}
      >
        {items.length === 0 ? (
          <p className={styles.empty}>{t("noResultsFound")}</p>
        ) : (
          <ul
            id={listId}
            role="listbox"
            className={styles.options}
            style={{ blockSize: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((row) => {
              const country = items[row.index];
              return (
                <li
                  key={country.code}
                  id={`${listId}-${country.code}`}
                  role="option"
                  aria-selected={country.code === selected}
                  aria-label={`${country.name} +${country.dial}`}
                  title={country.name}
                  data-active={row.index === active}
                  data-selected={country.code === selected}
                  className={styles.option}
                  style={{
                    blockSize: row.size,
                    transform: `translateY(${row.start}px)`,
                  }}
                  // Keep focus in the search box while clicking an option.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(row.index)}
                  onClick={() => onSelect(country.code)}
                >
                  <span className={styles.flag} aria-hidden="true">
                    {getFlagEmoji(country.code)}
                  </span>
                  <span className={styles.dial}>+{country.dial}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================================
   CountrySelect: trigger + popover
   ============================================ */

type CountrySelectProps = {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
  invalid?: boolean;
  disabled?: boolean;
};

function CountrySelect({
  value,
  onChange,
  invalid,
  disabled,
}: CountrySelectProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function select(code: CountryCode) {
    onChange(code);
    close();
  }

  const dial = getCountryCallingCode(value);
  const name = getCountryName(value, i18n.language) ?? value;

  return (
    <div
      ref={wrapRef}
      className={styles.selectWrap}
      onBlur={(e) => {
        // Focus left the whole selector (Tab away): close.
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        data-invalid={Boolean(invalid)}
        data-open={open}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("phoneCountry")}: ${name} +${dial}`}
        title={name}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.flag} aria-hidden="true">
          {getFlagEmoji(value)}
        </span>
        <span className={styles.dial}>+{dial}</span>
        <LuChevronDown className={styles.chevron} aria-hidden="true" />
      </button>

      {open && (
        <CountryPopover
          selected={value}
          locale={i18n.language}
          listId={listId}
          onSelect={select}
          onClose={close}
        />
      )}
    </div>
  );
}

/* ============================================
   Phone
   ============================================ */

type PhoneProps = {
  label?: string;
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
  error?: string;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
};

export function Phone({
  label,
  value,
  onChange,
  error,
  onBlur,
  name = "phone",
  disabled,
}: PhoneProps) {
  const { t } = useTranslation();

  function handleNumber(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    // A pasted international number ("+20 10 1234 5678") sets both parts.
    if (raw.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country) {
        onChange({ country: parsed.country, number: parsed.nationalNumber });
        return;
      }
    }

    onChange({
      country: value.country,
      number: onlyDigits(raw).slice(0, MAX_NATIONAL_DIGITS),
    });
  }

  return (
    <div className={styles.row}>
      <CountrySelect
        value={value.country}
        onChange={(country) => onChange({ ...value, country })}
        invalid={Boolean(error)}
        disabled={disabled}
      />
      <LabeledInput
        className={styles.number}
        name={name}
        label={
          label || `${t("auth.fields.phone")} ${t("auth.fields.optional")}`
        }
        value={value.number}
        onChange={handleNumber}
        onBlur={onBlur}
        error={error}
        type="tel"
        inputMode="tel"
        dir="ltr"
        disabled={disabled}
      />
    </div>
  );
}
