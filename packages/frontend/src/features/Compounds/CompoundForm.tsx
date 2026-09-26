import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { useCombobox } from "downshift";
import { FiSearch, FiX, FiLoader, FiPlus, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

import styles from "./CompoundForm.module.css";
import { getCountryName, getFlagEmoji } from "../../utils/countries";
import { useUnpairedCompounds } from "./hooks";
import type {
  NewCompound,
  UnpairedCompoundsQuery,
  UnpairedItem,
} from "../../api/compoundsAPI";
import { useDebounce } from "../../hooks/useDebounce";
import i18n from "../../i18";

// ============================================================
// Temporary types — replace with Eden-generated equivalents
// ============================================================

type ComboboxType = UnpairedCompoundsQuery["type"];

export interface CompoundFormInitialData {
  perfume?: UnpairedItem;
  company?: UnpairedItem;
  density?: string;
}

interface CompoundFormProps {
  isEditMode?: boolean;
  initialData?: CompoundFormInitialData;
  onSubmit: (payload: NewCompound) => void;
  submitting: boolean;
}

// ============================================================
// Small internal helpers
// ============================================================
/** Accepts partial numeric input while typing (digits + one optional dot). */
const DENSITY_TYPING_PATTERN = /^\d*\.?\d*$/;

/** Returns a normalized "0.900"-style string, or null if invalid/empty. */
function formatDensity(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === ".") return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return null;
  return num.toFixed(3);
}

function displayValue(item: UnpairedItem | null): string {
  return item ? item.name : "";
}

// ============================================================
// CompoundSearchCombobox — internal only, not exported.
// Instantiated twice (perfume / company) by CompoundForm below.
// ============================================================

interface CompoundSearchComboboxProps {
  type: ComboboxType;
  label: string;
  placeholder: string;
  items: UnpairedItem[];
  loading: boolean;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedItem: UnpairedItem | null;
  onSelectedItemChange: (item: UnpairedItem | null) => void;
  readOnly: boolean;
}

function CompoundSearchCombobox({
  type,
  label,
  placeholder,
  items,
  loading,
  inputValue,
  onInputValueChange,
  selectedItem,
  onSelectedItemChange,
  readOnly,
}: CompoundSearchComboboxProps) {
  const { t } = useTranslation();

  // Hook is always called, unconditionally, regardless of readOnly —
  // we only branch on `readOnly` in the JSX below, never before this.
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items,
    inputValue,
    selectedItem,
    itemToString: (item) => displayValue(item),
    isItemDisabled: (item) => Boolean(item.paired),
    onInputValueChange: ({ inputValue: nextValue }) => {
      onInputValueChange(nextValue ?? "");
    },
    onSelectedItemChange: ({ selectedItem: nextItem }) => {
      onSelectedItemChange(nextItem ?? null);
    },
  });

  if (readOnly) {
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <div className={styles.readOnlyInputWrapper}>
          {type === "company" && selectedItem?.countryCode && (
            <span
              className={styles.flag}
              title={getCountryName(selectedItem.countryCode, i18n.language)}
            >
              {getFlagEmoji(selectedItem.countryCode)}
            </span>
          )}
          <input
            className={styles.input}
            type="text"
            readOnly
            value={displayValue(selectedItem)}
          />
        </div>
      </div>
    );
  }

  const showNoResults =
    !loading && inputValue.trim() !== "" && isOpen && items.length === 0;

  return (
    <div className={styles.field}>
      <label className={styles.label} {...getLabelProps()}>
        {label}
      </label>

      <div className={styles.comboboxWrapper}>
        <span className={styles.iconStart} aria-hidden="true">
          {loading ? <FiLoader className={styles.spinIcon} /> : <FiSearch />}
        </span>

        <input
          className={styles.input}
          placeholder={placeholder}
          {...getInputProps()}
        />

        {selectedItem && (
          <button
            type="button"
            className={styles.iconEnd}
            aria-label={t("compounds:form.clearSelection")}
            onClick={() => {
              onSelectedItemChange(null);
              onInputValueChange("");
            }}
          >
            <FiX />
          </button>
        )}

        <ul
          className={styles.menu}
          {...getMenuProps()}
          data-open={isOpen && items.length > 0}
        >
          {isOpen &&
            items.map((item, index) => (
              <li
                key={item.id}
                className={styles.menuItem}
                data-highlighted={highlightedIndex === index}
                data-paired={Boolean(item.paired)}
                {...getItemProps({ item, index })}
              >
                <span className={styles.menuItemName}>{item.name}</span>
                {type === "company" && item.countryCode && (
                  <span
                    className={styles.flag}
                    title={t(`countries:${item.countryCode}`)}
                  >
                    {getFlagEmoji(item.countryCode)}
                  </span>
                )}
                {item.paired && (
                  <span className={styles.pairedBadge}>
                    {t("compounds:form.alreadyPaired")}
                  </span>
                )}
              </li>
            ))}
        </ul>

        {showNoResults && (
          <p className={styles.noResults}>{t("compounds:form.noResults")}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CompoundForm
// ============================================================

export function CompoundForm({
  isEditMode = false,
  initialData,
  onSubmit,
  submitting,
}: CompoundFormProps) {
  const { t } = useTranslation();

  const [perfumeSearch, setPerfumeSearch] = useState(
    initialData?.perfume?.name ?? "",
  );
  const [companySearch, setCompanySearch] = useState(
    initialData?.company?.name ?? "",
  );
  const debouncedPerfumeSearch = useDebounce(perfumeSearch, 400);
  const debouncedCompanySearch = useDebounce(companySearch, 400);

  const [selectedPerfume, setSelectedPerfume] = useState<UnpairedItem | null>(
    initialData?.perfume ?? null,
  );
  const [selectedCompany, setSelectedCompany] = useState<UnpairedItem | null>(
    initialData?.company ?? null,
  );

  const bothSelected = selectedPerfume !== null && selectedCompany !== null;

  console.log("Selected Perfume: ", selectedPerfume);

  const [density, setDensity] = useState(initialData?.density ?? "");
  const [densityError, setDensityError] = useState<string | null>(null);

  const perfumeQuery: UnpairedCompoundsQuery = {
    search: isEditMode ? "" : debouncedPerfumeSearch,
    type: "perfume",
    mateId: selectedCompany?.id,
  };
  const companyQuery: UnpairedCompoundsQuery = {
    search: isEditMode ? "" : debouncedCompanySearch,
    type: "company",
    mateId: selectedPerfume?.id,
  };

  const { unpairedCompounds: perfumeResults, loading: perfumeLoading } =
    useUnpairedCompounds(perfumeQuery);
  const { unpairedCompounds: companyResults, loading: companyLoading } =
    useUnpairedCompounds(companyQuery);

  function handleDensityChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (!DENSITY_TYPING_PATTERN.test(next)) return;
    setDensity(next);
    if (densityError) setDensityError(null);
  }

  function validateDensityOnBlur() {
    if (density.trim() === "") return setDensityError(null);

    const formatted = formatDensity(density);
    if (formatted === null)
      return setDensityError(t("compounds:form.densityInvalid"));

    setDensity(formatted);
    setDensityError(null);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const formattedDensity = formatDensity(density);
    if (density.trim() !== "" && formattedDensity === null)
      return setDensityError(t("compounds:form.densityInvalid"));

    if (isEditMode) {
      if (!bothSelected) return toast.error(`compounds:form.errorGeneric`);

      onSubmit({
        perfumeId: selectedPerfume.id,
        companyId: selectedCompany.id,
        density: formattedDensity ?? undefined,
      });
      return;
    }

    if (!bothSelected) return toast.error(t("compounds:form.errorGeneric"));

    onSubmit({
      perfumeId: selectedPerfume.id,
      companyId: selectedCompany.id,
      density: formattedDensity ?? undefined,
    });

    // Reset after success
    setSelectedPerfume(null);
    setSelectedCompany(null);
    setDensity("");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <CompoundSearchCombobox
        type="perfume"
        label={t("compounds:form.perfumeLabel")}
        placeholder={t("compounds:form.perfumeSearchPlaceholder")}
        items={perfumeResults ?? []}
        loading={perfumeLoading}
        inputValue={perfumeSearch}
        onInputValueChange={setPerfumeSearch}
        selectedItem={selectedPerfume}
        onSelectedItemChange={setSelectedPerfume}
        readOnly={isEditMode}
      />

      <CompoundSearchCombobox
        type="company"
        label={t("compounds:form.companyLabel")}
        placeholder={t("compounds:form.companySearchPlaceholder")}
        items={companyResults ?? []}
        loading={companyLoading}
        inputValue={companySearch}
        onInputValueChange={setCompanySearch}
        selectedItem={selectedCompany}
        onSelectedItemChange={setSelectedCompany}
        readOnly={isEditMode}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="compound-density">
          {t("compounds:form.densityLabel")}
        </label>
        <input
          id="compound-density"
          className={styles.input}
          inputMode="decimal"
          placeholder={t("compounds:form.densityPlaceholder")}
          value={density}
          onChange={handleDensityChange}
          onBlur={validateDensityOnBlur}
          aria-invalid={Boolean(densityError)}
          aria-describedby={densityError ? "compound-density-error" : undefined}
        />
        {densityError && (
          <p id="compound-density-error" className={styles.errorText}>
            {densityError}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting ? (
            <FiLoader className={styles.spinIcon} />
          ) : isEditMode ? (
            <FiCheck />
          ) : (
            <FiPlus />
          )}
          {isEditMode
            ? t("compounds:form.editButton")
            : t("compounds:form.addButton")}
        </button>
      </div>
    </form>
  );
}
