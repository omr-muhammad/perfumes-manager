import { useState } from "react";
import { useTranslation } from "react-i18next";

import { companiesActiveFiltersTags } from "../../../utils/buildTags";
import { ActiveFilters } from "../../../ui/ActiveFilters";
import LoadMore from "../../../ui/LoadMore";
import { CoMiniCard } from "../components/CoMiniCard";
import { Filters } from "../components/Filters";

import { useInfiniteCompanies } from "../hooks/useInfiniteCompanies";

import type { Tab } from "../../../ui/TabList/TabList";
import type { CoQuery } from "../types";

import { useDebounce } from "../../../hooks/useDebounce";

import styles from "./Companies.module.css";

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
