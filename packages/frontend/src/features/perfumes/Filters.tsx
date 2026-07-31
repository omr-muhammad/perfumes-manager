import styles from "./perfumes.module.css";
import Search from "../../ui/Search";
import type { PerfumeQuery, Season } from "../../api/perfumesAPI";
import { SexFilter } from "../../ui/SexFilter";
import ApproveFilter from "../../ui/ApproveFilter";
import { SeasonsFilter } from "../../ui/SeasonsFilter";
import { type Dispatch, type SetStateAction } from "react";

interface FiltersProps {
  query: PerfumeQuery;
  onChange: Dispatch<SetStateAction<PerfumeQuery>>;
}

export function Filters({ query, onChange }: FiltersProps) {
  function handleSearch(value: string) {
    onChange((cur) => ({ ...cur, search: value }));
  }

  function handleSex(value: typeof query.sex) {
    onChange((cur) => ({ ...cur, sex: value }));
  }

  function handleApprove(value: typeof query.approved) {
    onChange((cur) => ({ ...cur, approved: value }));
  }

  function handleSeasons(value: Season) {
    onChange((cur) => {
      const currentSeasons = cur.seasons ?? [];
      const newSeasons = currentSeasons?.includes(value)
        ? currentSeasons.filter((s) => s !== value)
        : currentSeasons.concat(value);

      return { ...cur, seasons: newSeasons };
    });
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterField}>
        <Search
          text={query.search}
          handleChange={handleSearch}
          placeholder="searchByName"
          nsFile="perfumes"
        />
      </div>

      <div className={styles.filterField}>
        <ApproveFilter
          approved={query.approved}
          handleActive={handleApprove}
          nsFile="perfumes"
        />
      </div>

      <div className={styles.filterField}>
        <SexFilter sex={query.sex} handleSelect={handleSex} nsFile="perfumes" />
      </div>

      <div className={styles.filterField}>
        <SeasonsFilter
          selected={query.seasons}
          handleSelect={handleSeasons}
          nsFile="perfumes"
        />
      </div>
    </div>
  );
}
