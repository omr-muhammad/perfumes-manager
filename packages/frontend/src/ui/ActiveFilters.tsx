import { useTranslation } from "react-i18next";
import styles from "./ActiveFilters.module.css";
import { LuX } from "react-icons/lu";

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
            aria-label={t("filters.remove")}
            onClick={tag.onRemove}
          >
            <LuX size={24} strokeWidth={3} />
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
