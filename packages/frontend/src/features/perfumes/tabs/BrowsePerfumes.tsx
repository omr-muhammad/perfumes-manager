import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Filters } from "../components/Filters";
import { PerfumeCardMini } from "../components/PerfumeCardMini";
import { ActiveFilters } from "../../../ui/ActiveFilters";
import { LoadMore } from "../../../ui/LoadMore";

import { useInfinitePerfumes } from "../hooks/useInfinitePerfumes";

import { perfumesActiveFiltersTags } from "../../../utils/buildTags";
import { useDebounce } from "../../../hooks/useDebounce";

import styles from "../Perfumes.module.css";
import type { PerfumeQuery } from "../types";

interface BrowseTabProps {
  isAdmin: boolean;
  onEdit: (perfumeId: number, perfumeName: string) => void;
  onApprove: (perfumeId: number, perfumeName: string) => void;
}

export function BrowsePerfumes({ isAdmin, onEdit, onApprove }: BrowseTabProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState<PerfumeQuery>({
    search: "",
    sex: undefined,
    seasons: undefined,
    approved: undefined,
    page: 1,
    limit: 10,
  });
  const { tags, clearAll } = perfumesActiveFiltersTags({
    filters: query,
    handleChange: setQuery,
    t,
  });

  const debouncedSearch = useDebounce(query.search, 400);

  const queryFilters: PerfumeQuery = {
    ...query,
    search: debouncedSearch,
  };

  const { perfumes, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfinitePerfumes(queryFilters);

  return (
    <>
      <Filters query={query} onChange={setQuery} />
      <ActiveFilters tags={tags} onClear={clearAll} />

      {loading && (
        <p className={styles.stateMessage}>{t("perfumes:loadingPerfumes")}</p>
      )}

      {!loading && perfumes.length === 0 && (
        <p className={styles.stateMessage}>{t("perfumes:noPerfumesFound")}</p>
      )}

      {!loading && perfumes.length > 0 && (
        <div className={`${styles.grid} hide-scrollbar`}>
          {perfumes.map((perfume) => (
            <PerfumeCardMini
              key={perfume!.id}
              perfume={{
                id: perfume!.id,
                name: perfume!.name,
                sex: perfume!.sex,
                approved: perfume!.approved,
              }}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onApprove={onApprove}
            />
          ))}

          <LoadMore
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoadingMore={isFetchingNextPage}
          />
        </div>
      )}
    </>
  );
}
