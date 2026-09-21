import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import styles from "./Slot.module.css";
import twoSlotStyles from "../TwoSlot/TwoSlot.module.css";
import { List } from "../List/List";
import LoadMore from "../../../ui/LoadMore";
import { Spinner } from "../../../ui/Spinner";
import type {
  CompoundsGetResponse,
  CompoundsQuery,
} from "../../../api/compoundsAPI";

interface SlotProps {
  title: CompoundsQuery["type"];
  query: CompoundsQuery;
  onFocusChange: (q: CompoundsQuery) => void;
  itemsList: CompoundsGetResponse;
  selectedItemId: number | null;
  onSelectItem: (id?: number) => void;
  emptyStateMessage: string;
  showInlineInput: boolean;
  loading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function Slot({
  title,
  query,
  onFocusChange,
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

  const isLiveSide = query.type === title;
  // The opposite slot can only ever have items here because a selection was
  // made on the live side (Architecture Decision 1) — so this is a reliable
  // stand-in for "the opposite slot has a selected item" without needing an
  // extra prop outside the locked SlotProps shape.
  const opponentHasSelection = !isLiveSide && itemsList.length > 0;
  const showAddNew =
    (isLiveSide && query.search !== "") || opponentHasSelection;
  // const noMatches = isLiveSide && search.text !== "" && itemsList.length === 0;

  const handleAddNew = () => {
    if (isLiveSide) {
      // Placeholder — real "create new entity" flow comes later.
      console.log("[compounds] add new entity", {
        entityType: title,
        query: query.search,
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
        opponentType: query.type,
        opponentQuery: query.search,
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
          value={query.search}
          placeholder={t(`compounds:searchPlaceholder.${title}`)}
          onFocus={() =>
            onFocusChange({ ...query, type: title, search: query.search })
          }
          onChange={(e) =>
            onFocusChange({ ...query, type: title, search: e.target.value })
          }
        />
      )}

      {(loading && query.type === title) || isFetchingNextPage ? (
        <Spinner size="2.4rem" />
      ) : (
        <div className={`${styles.listArea} hide-scrollbar`}>
          {query.search && itemsList.length === 0 ? (
            query.type === title ? (
              <p className={styles.emptyState}>{t("noResultsFound")}</p>
            ) : (
              <p className={styles.emptyState}>{emptyStateMessage}</p>
            )
          ) : query.search ? (
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
