import { useTranslation } from "react-i18next";
import styles from "./List.module.css";
import { getFlagEmoji } from "../../../utils/countries";
import type { NormalizedItem } from "../types";

interface ListProps {
  items: NormalizedItem[];
  selectedItemId: number | null;
  onSelectItem: (item: NormalizedItem | null) => void;
}

/**
 * Pure/presentational. Never touches raw API shapes, `search` state, or
 * knows which side it's on — it only ever sees `NormalizedItem[]`.
 */
export function List({ items, selectedItemId, onSelectItem }: ListProps) {
  const { t } = useTranslation();

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const isActive = item.id === selectedItemId;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
              aria-pressed={isActive}
              onClick={() => onSelectItem(isActive ? null : item)}
            >
              {item.countryCode && (
                <span
                  className={styles.flag}
                  title={t(`countries:${item.countryCode}`)}
                  aria-hidden="true"
                >
                  {getFlagEmoji(item.countryCode)}
                </span>
              )}
              <span className={styles.name}>{item.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
