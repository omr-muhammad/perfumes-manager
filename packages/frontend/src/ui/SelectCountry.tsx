import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useState, useMemo } from "react";
import i18n from "../i18";
import { getLocalizedCountries } from "../utils/countries";
import styles from "./styles/select-country.module.css";

export interface SelectCountryProps {
  /** Currently selected ISO 3166-1 alpha-2 code ("" for none). Controlled — comes from the parent form. */
  value: string;
  /** Called with the newly selected ISO code */
  onValueChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder: string;
  disabled?: boolean;
}

export function SelectCountry({
  value,
  onValueChange,
  id,
  name,
  placeholder,
  disabled,
}: SelectCountryProps) {
  // Popover requires manual state control so we can close it after a selection is made
  const [open, setOpen] = useState(false);

  const lang = i18n.language;
  const options = useMemo(() => getLocalizedCountries(lang), [lang]);

  // Because value is just "EG" or "US", we need to find the localized name for the trigger button
  const selectedCountry = options.find((opt) => opt.code === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        {/* We use a native button here styled identically to your old Select trigger */}
        <button
          id={id}
          name={name}
          className={styles.trigger}
          aria-label="Country"
          type="button"
        >
          <span className={!value ? styles.placeholder : undefined}>
            {selectedCountry ? selectedCountry.name : placeholder}
          </span>
          <FiChevronDown size={12} className={styles.icon} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          dir={lang === "ar" ? "rtl" : "ltr"}
          align="start"
          sideOffset={4}
        >
          {/* cmdk Command wrapper replaces the standard Select Content */}
          <Command>
            <Command.Input
              placeholder={
                lang === "ar" ? "ابحث عن دولة..." : "Search country..."
              }
              className={styles.searchInput}
            />

            <Command.List className={styles.viewport}>
              <Command.Empty className={styles.empty}>
                {lang === "ar" ? "لا توجد نتائج." : "No country found."}
              </Command.Empty>

              <Command.Group>
                {options.map((option) => (
                  <Command.Item
                    key={option.code}
                    // We pass the localized name to value so cmdk filters the text properly
                    value={option.name}
                    onSelect={() => {
                      onValueChange(option.code);
                      setOpen(false); // Close the dropdown automatically
                    }}
                    className={styles.item}
                  >
                    {option.name}
                    {value === option.code && (
                      <FiCheck size={12} className={styles.indicator} />
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
