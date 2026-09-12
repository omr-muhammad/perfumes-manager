import { useState } from "react";
import type { CoQuery } from "../../api/companiesAPI";
import { companiesActiveFiltersTags } from "../../utils/buildTags";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../hooks/useDebounce";
import { ActiveFilters } from "../../ui/ActiveFilters";
import styles from "./companies.module.css";
import { useInfiniteCompanies } from "./hooks";
import LoadMore from "../../ui/LoadMore";
import { CoMiniCard } from "./CoMiniCard";
import { Filters } from "./Filters";
import type { Tab } from "../../ui/TabList/TabList";

interface BrowseTabProps {
  isAdmin: boolean;
  handleTabActivation: (tab: Tab) => void;
}

export function BrowseTab({ isAdmin, handleTabActivation }: BrowseTabProps) {
  const { t } = useTranslation("companies");
  const [query, setQuery] = useState<CoQuery>({
    search: "",
    type: undefined,
    approved: undefined,
    page: 1,
    limit: 10,
  });

  const { tags, clearAll } = companiesActiveFiltersTags({
    filters: query,
    handleChange: setQuery,
    t,
  });

  const debouncedSearch = useDebounce(query.search, 400);

  const queryFilters: CoQuery = {
    ...query,
    search: debouncedSearch,
  };

  const { companies, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteCompanies(queryFilters);

  return (
    <>
      <Filters query={query} onChange={setQuery} />
      <ActiveFilters tags={tags} onClear={clearAll} />

      {loading && (
        <p className={styles.stateMessage}>{t("loadingCompanies")}</p>
      )}

      {!loading && companies.length === 0 && (
        <p className={styles.stateMessage}>{t("noCoFound")}</p>
      )}

      {!loading && companies.length > 0 && (
        <div className={`${styles.grid} hide-scrollbar`}>
          {companies.map((company) => (
            <CoMiniCard
              key={company.id}
              company={{
                id: company.id,
                name: company.name,
                hqCountryCode: company.hqCountryCode,
                type: company.type,
                approved: company.approved!,
              }}
              isAdmin={isAdmin}
              handleTabActivation={handleTabActivation}
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
