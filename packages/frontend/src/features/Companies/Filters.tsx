import styles from "./companies.module.css";
import Search from "../../ui/Search";
import ApproveFilter from "../../ui/ApproveFilter";
import { type Dispatch, type SetStateAction } from "react";
import type { CoQuery } from "../../api/companiesAPI";
import { TypeFilter } from "../../ui/TypeFilter";

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
          nsFile="companies"
        />
      </div>

      <div className={styles.filterField}>
        <ApproveFilter
          approved={query.approved}
          handleActive={handleApprove}
          nsFile="companies"
        />
      </div>

      <div className={styles.filterField}>
        <TypeFilter
          coType={query.type}
          handleActive={handleType}
          nsFile="companies"
        />
      </div>
    </div>
  );
}
