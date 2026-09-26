import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { FiPlus } from "react-icons/fi";

import { List } from "./List";
import LoadMore from "../../../ui/LoadMore";
import { Spinner } from "../../../ui/Spinner";

import type { CompoundsGetResponse, CompoundsQuery } from "../types";

import browseCompoundsStyles from "../tabs/BrowseCompounds.module.css";
import styles from "./Slot.module.css";

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
  navToAddWithPreFilled: () => void;
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
  navToAddWithPreFilled,
}: SlotProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isLiveSide = query.type === title;
  const opponentHasSelection = !isLiveSide && itemsList.length > 0;
  const showAddNew =
    (isLiveSide && query.search !== "") || opponentHasSelection;

  function handleAddNew() {
    if (isLiveSide) {
      const dest = title === "perfume" ? "perfumes" : "companies";

      navigate(`/dashboard/${dest}`, { state: { activeTab: "add" } });
    } else {
      navToAddWithPreFilled();
    }
  }

  return (
    <div className={styles.slot}>
      {showInlineInput && (
        <input
          className={`${browseCompoundsStyles.morphingInput} ${styles.inlineInput}`}
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
