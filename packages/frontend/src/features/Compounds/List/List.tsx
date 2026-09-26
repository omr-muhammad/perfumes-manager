import styles from "./List.module.css";
import { getCountryName, getFlagEmoji } from "../../../utils/countries";
import i18n from "../../../i18";
import type { CompoundsGetResponse } from "../../../api/compoundsAPI";

interface ListProps {
  items: CompoundsGetResponse;
  selectedItemId: number | null;
  onSelectItem: (id?: number) => void;
}

export function List({ items, selectedItemId, onSelectItem }: ListProps) {
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
              onClick={() => onSelectItem(isActive ? undefined : item.id)}
            >
              {item.countryCode && (
                <span
                  className={styles.flag}
                  title={getCountryName(item.countryCode, i18n.language)}
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
