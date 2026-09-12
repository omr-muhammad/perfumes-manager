import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import styles from "./Slot.module.css";
import type {
  SlotTitle,
  SearchState,
  PerfumeSearchResult,
  PerfumeRef,
  CompanySearchResult,
  CompanyRef,
} from "./BrowseCompounds";
import { getFlagEmoji } from "../../utils/countries";

type RawItem =
  | PerfumeSearchResult
  | PerfumeRef
  | CompanySearchResult
  | CompanyRef;

interface NormalizedListItem {
  id: string;
  name: string;
  countryCode?: string;
  compoundId?: string;
}

function getRawId(raw: RawItem): string {
  if ("perfumeId" in raw) return raw.perfumeId;
  if ("companyId" in raw) return raw.companyId;
  return raw.id;
}

function normalizeItem(raw: RawItem, title: SlotTitle): NormalizedListItem {
  if (title === "perfume") {
    if ("perfumeId" in raw) {
      return { id: raw.perfumeId, name: raw.perfumeName };
    }
    const perfume = raw as PerfumeRef;
    return {
      id: perfume.id,
      name: perfume.name,
      compoundId: perfume.compoundId,
    };
  }
  if ("companyId" in raw) {
    const company = raw as CompanySearchResult;
    return {
      id: company.companyId,
      name: company.companyName,
      countryCode: company.countryCode,
    };
  }
  const company = raw as CompanyRef;
  return {
    id: company.id,
    name: company.name,
    countryCode: company.code,
    compoundId: company.compoundId,
  };
}

/* ------------------------------------------------------------
 * List — has no knowledge of which API produced the data. It only
 * understands the normalized { id, name, countryCode?, compoundId? }
 * shape.
 * ---------------------------------------------------------- */
interface ListProps {
  list: NormalizedListItem[];
  selectedItemId: string | null;
  onSelect: (id: string) => void;
}

function List({ list, selectedItemId, onSelect }: ListProps) {
  const { t } = useTranslation();

  return (
    <ul className={styles.list}>
      {list.map((item) => {
        const isActive = selectedItemId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`${styles.listItem} ${isActive ? styles.listItemActive : ""}`}
              onClick={() => onSelect(item.id)}
            >
              {isActive && (
                <FiCheck className={styles.activeIcon} aria-hidden="true" />
              )}
              <span className={styles.listItemName}>{item.name}</span>
              {item.countryCode && (
                <span
                  className={styles.flag}
                  title={t(`countries:${item.countryCode}`)}
                >
                  {getFlagEmoji(item.countryCode)}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export interface SlotProps {
  title: SlotTitle;
  search: SearchState;
  setSearch: Dispatch<SetStateAction<SearchState>>;
  itemsList: RawItem[];
  selectedItemId: string | null;
  onSelectItem: (raw: RawItem) => void;
  emptyStateMessage: string;
  hasOpponentSelection: boolean;
  onAddClick: () => void;
  showActionToolbar: boolean;
  compoundLabel: string;
  onEditCompound: () => void;
  onDeleteCompound: () => void;
}

export function Slot({
  title,
  search,
  setSearch,
  itemsList,
  selectedItemId,
  onSelectItem,
  emptyStateMessage,
  hasOpponentSelection,
  onAddClick,
  showActionToolbar,
  compoundLabel,
  onEditCompound,
  onDeleteCompound,
}: SlotProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const isOwnSearch = search.type === title;
  const hasValue = isOwnSearch && search.text !== "";
  // Rule: the opposite slot's input disappears entirely once this
  // slot's own search has a value; it comes back once that value clears.
  const showInput = isOwnSearch || search.text === "";
  const isExpanded = isFocused || hasValue;

  const normalizedList = useMemo(
    () => itemsList.map((raw) => normalizeItem(raw, title)),
    [itemsList, title],
  );

  const showAddButton =
    (isOwnSearch && search.text !== "") || hasOpponentSelection;
  // "No search term" is about this slot's own search — a slot fed by the
  // opposite slot's selection never has a search term of its own, so an
  // empty related list always counts as an empty state for it.
  const showEmptyState =
    normalizedList.length === 0 && (!isOwnSearch || search.text === "");

  function handleSelect(id: string) {
    const raw = itemsList.find((item) => getRawId(item) === id);
    if (raw) onSelectItem(raw);
  }

  return (
    // Column of independently-sized rows: the toolbar and search input
    // always reserve their own row (shrink: 0) *above* the slot box, so
    // the slot box itself never has to carve reserved-but-empty space out
    // of its own content — the list inside it can always start flush at
    // the top. Visibility of the toolbar/input is animated with
    // transform + opacity, not by taking them in/out of flow.
    <div className={styles.container}>
      <div
        className={`${styles.toolbarRow} ${!showActionToolbar ? styles.toolbarHidden : ""}`}
      >
        <span className={styles.toolbarLabel}>{compoundLabel}</span>
        <div className={styles.toolbarActions}>
          <button
            type="button"
            onClick={onEditCompound}
            aria-label={t("compounds:edit")}
          >
            <FiEdit2 aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDeleteCompound}
            aria-label={t("compounds:delete")}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>
      </div>

      {showInput && (
        // Origin/default (no extra class) = full width, sitting properly
        // above the slot. `.collapsed` is added only while idle (not
        // focused, no value yet) and translates it down + narrows it so
        // it reads as tucked inside the slot's top edge; focusing removes
        // the class and it springs back up to its default position.
        <div
          className={`${styles.searchRow} ${!isExpanded ? styles.collapsed : ""}`}
        >
          <label
            className={`${styles.label} ${hasValue ? styles.labelVisible : ""}`}
          >
            {t(`compounds:${title}`)}
          </label>
          <div className={styles.inputRow}>
            <FiSearch className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              className={styles.input}
              value={isOwnSearch ? search.text : ""}
              placeholder={t(`compounds:searchPlaceholder.${title}`)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearch({ type: title, text: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className={styles.slotBox}>
        <div className={`${styles.listArea} hide-scrollbar`}>
          {showEmptyState ? (
            <p className={styles.emptyState}>{emptyStateMessage}</p>
          ) : (
            <List
              list={normalizedList}
              selectedItemId={selectedItemId}
              onSelect={handleSelect}
            />
          )}
        </div>

        {showAddButton && (
          <button
            type="button"
            className={styles.addButton}
            onClick={onAddClick}
          >
            <FiPlus aria-hidden="true" />
            {t(`compounds:addNew.${title}`)}
          </button>
        )}
      </div>
    </div>
  );
}
