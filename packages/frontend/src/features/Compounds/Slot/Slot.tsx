import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import type { CompoundSearch, EntityType, NormalizedItem } from "../types";
import styles from "./Slot.module.css";
import twoSlotStyles from "../TwoSlot/TwoSlot.module.css";
import { List } from "../List/List";
import LoadMore from "../../../ui/LoadMore";
import { Spinner } from "../../../ui/Spinner";

interface SlotProps {
  title: EntityType;
  search: CompoundSearch;
  setSearch: (s: CompoundSearch) => void;
  itemsList: NormalizedItem[];
  selectedItemId: number | null;
  onSelectItem: (item: NormalizedItem | null) => void;
  emptyStateMessage: string;
  showInlineInput: boolean;
  loading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function Slot({
  title,
  search,
  setSearch,
  itemsList,
  selectedItemId,
  onSelectItem,
  emptyStateMessage,
  showInlineInput,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  loading,
}: SlotProps) {
  const { t } = useTranslation();

  const isLiveSide = search.type === title;
  // The opposite slot can only ever have items here because a selection was
  // made on the live side (Architecture Decision 1) — so this is a reliable
  // stand-in for "the opposite slot has a selected item" without needing an
  // extra prop outside the locked SlotProps shape.
  const opponentHasSelection = !isLiveSide && itemsList.length > 0;
  const showAddNew = (isLiveSide && search.text !== "") || opponentHasSelection;
  // const noMatches = isLiveSide && search.text !== "" && itemsList.length === 0;

  const handleAddNew = () => {
    if (isLiveSide) {
      // Placeholder — real "create new entity" flow comes later.
      console.log("[compounds] add new entity", {
        entityType: title,
        query: search.text,
      });
      toast(t("compounds:addNew"));
    } else {
      // Placeholder — real "switch to add panel, carrying the opponent's
      // selection over" flow comes later. `itemsList` is exactly the set
      // derived from that opponent selection (Architecture Decision 1), so
      // it's the best available stand-in payload until an actual selected
      // opponent object is threaded through as real state.
      console.log("[compounds] switch to add panel", {
        entityType: title,
        opponentType: search.type,
        opponentQuery: search.text,
        opponentDerivedItems: itemsList,
      });
      toast(t("compounds:addNew"));
    }
  };

  return (
    <div className={styles.slot}>
      {showInlineInput && (
        <input
          className={`${twoSlotStyles.morphingInput} ${styles.inlineInput}`}
          // view-transition-name must be globally unique to work
          style={{ viewTransitionName: `search-input-${title}` }}
          type="text"
          value={search.text}
          placeholder={t(`compounds:searchPlaceholder.${title}`)}
          onFocus={() => setSearch({ type: title, text: search.text })}
          onChange={(e) => setSearch({ type: title, text: e.target.value })}
        />
      )}

      {(loading && search.type === title) || isFetchingNextPage ? (
        <Spinner size="2.4rem" />
      ) : (
        <div className={`${styles.listArea} hide-scrollbar`}>
          {search.text && itemsList.length === 0 ? (
            search.type === title ? (
              <p className={styles.emptyState}>{t("noResultsFound")}</p>
            ) : (
              <p className={styles.emptyState}>{emptyStateMessage}</p>
            )
          ) : search.text ? (
            <>
              <List
                items={itemsList}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
              />

              <LoadMore
                loadText={t("loadingBtnTxt")}
                onLoadMore={fetchNextPage}
                hasMore={hasNextPage}
                isLoadingMore={isFetchingNextPage}
                noMoreText={t("noMoreTxt")}
                errorText={t("loadingErrorTxt")}
              />
            </>
          ) : (
            <p className={styles.emptyState}>{emptyStateMessage}</p>
          )}
        </div>
      )}

      {showAddNew && (
        <button
          type="button"
          className={styles.addNewButton}
          onClick={handleAddNew}
        >
          <FiPlus aria-hidden="true" />
          <span>{t("compounds:addNew")}</span>
        </button>
      )}
    </div>
  );
}
