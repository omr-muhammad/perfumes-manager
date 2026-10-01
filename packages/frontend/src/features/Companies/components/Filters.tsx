import { t } from "i18next";
import { type Dispatch, type SetStateAction } from "react";

import Search from "../../../ui/Search";
import { SegmentedFilter } from "../../../ui/SegmentedFilter";

import type { CoQuery } from "../types";

import styles from "../Companies.module.css";

interface FiltersProps {
  query: CoQuery;
  onChange: Dispatch<SetStateAction<CoQuery>>;
}

type QueryKeys = Pick<CoQuery, "type" | "search" | "approved">;

export function Filters({ query, onChange }: FiltersProps) {
  function handleChange<K extends keyof QueryKeys>(key: K) {
    return (value: QueryKeys[K]) => {
      onChange((cur) => ({ ...cur, [key]: value }));
    };
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterField}>
        <Search
          text={query.search}
          handleChange={handleChange("search")}
          placeholder={t("filters.searchPlaceholder")}
        />
      </div>

      <div className={styles.filterField}>
        <SegmentedFilter
          value={query.approved}
          onChange={handleChange("approved")}
          options={[
            { value: true, label: t("filters.approved") },
            { value: false, label: t("filters.pending") },
          ]}
        />
      </div>

      <div className={styles.filterField}>
        <SegmentedFilter
          value={query.type}
          onChange={handleChange("type")}
          options={[
            { value: "global", label: t("filters.global") },
            { value: "local", label: t("filters.local") },
          ]}
        />
      </div>
    </div>
  );
}
