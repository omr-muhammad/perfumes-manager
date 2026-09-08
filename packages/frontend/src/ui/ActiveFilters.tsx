import { useTranslation } from "react-i18next";
import styles from "./styles/active-filters.module.css";

interface Tag {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  tags: Tag[];
  onClear: () => void;
}

export function ActiveFilters({ tags, onClear }: ActiveFiltersProps) {
  const { t } = useTranslation();

  if (tags.length <= 0) return;

  return (
    <div className={styles.activeFilters}>
      {tags.map((tag) => (
        <span className={styles.filterTag} key={tag.key}>
          {tag.label}
          <button
            type="button"
            className={styles.filterTagRemove}
            aria-label={t("removeFilter")}
            onClick={tag.onRemove}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      <button
        type="button"
        className={styles.clearFiltersButton}
        onClick={onClear}
      >
        {t("filters.clear")}
      </button>
    </div>
  );
}
