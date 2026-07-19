import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import styles from "./perfumes.module.css";
import { useDebounce } from "../../hooks/useDebounce";
import { loggedUserQuery } from "../Auth/hooks";
import { useInfinitePerfumes } from "./hook";
import type { PerfumeQuery } from "../../api/perfumesAPI";
import { Filters } from "./Filters";
import PerfumeCardMini from "./PerfumeCardMini";
import { ActiveFilters } from "../../ui/ActiveFilters";
import { perfumesActiveFiltersTags } from "./buildTags";
import LoadMore from "../../ui/LoadMore";

export function BrowseTab() {
  const { t } = useTranslation("perfumes");
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

  const { data: user } = useQuery(loggedUserQuery);
  const isAdmin = user?.role === "admin";

  const { perfumes, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfinitePerfumes(queryFilters);

  return (
    <>
      <Filters query={query} onChange={setQuery} />
      <ActiveFilters tags={tags} onClear={clearAll} />

      {loading && <p className={styles.stateMessage}>{t("loadingPerfumes")}</p>}

      {!loading && perfumes.length === 0 && (
        <p className={styles.stateMessage}>{t("noPerfumesFound")}</p>
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
              nsFile="perfumes"
            />
          ))}

          <LoadMore
            loadText={t("common:loadingBtnTxt")}
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoadingMore={isFetchingNextPage}
            noMoreText={t("common:noMoreTxt")}
            errorText={t("common:loadingErrorTxt")}
          />
        </div>
      )}
    </>
  );
}
