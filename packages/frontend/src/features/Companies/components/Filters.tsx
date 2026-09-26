import { t } from "i18next";
import { type Dispatch, type SetStateAction } from "react";

import Search from "../../../ui/Search";
import ApproveFilter from "../../../ui/ApproveFilter";
import { TypeFilter } from "../../../ui/TypeFilter";

import type { CoQuery } from "../types";

import styles from "../Companies.module.css";

interface FiltersProps {
  query: CoQuery;
  onChange: Dispatch<SetStateAction<CoQuery>>;
}

export function Filters({ query, onChange }: FiltersProps) {
  function handleSearch(value: string) {
    onChange((cur) => ({ ...cur, search: value }));
  }

  function handleApprove(value: typeof query.approved) {
    onChange((cur) => ({ ...cur, approved: value }));
  }

  function handleType(value: typeof query.type) {
    onChange((cur) => ({ ...cur, type: value }));
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterField}>
        <Search
          text={query.search}
          handleChange={handleSearch}
          placeholder="searchByName"
        />
      </div>

      <div className={styles.filterField}>
        <ApproveFilter
          approvedTxt={t("filters.approved")}
          pendingTxt={t("filters.pending")}
          approved={query.approved}
          handleActive={handleApprove}
        />
      </div>

      <div className={styles.filterField}>
        <TypeFilter coType={query.type} handleActive={handleType} />
      </div>
    </div>
  );
}
