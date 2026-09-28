import { type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import Search from "../../../ui/Search";
import { SeasonsFilter } from "../../../ui/SeasonsFilter";

import type { PerfumeQuery, Season } from "../types";

import styles from "../Perfumes.module.css";
import { SegmentedFilter } from "../../../ui/SegmentedFilter";
import { SelectOne } from "../../../ui/SelectOne";

interface FiltersProps {
  query: PerfumeQuery;
  onChange: Dispatch<SetStateAction<PerfumeQuery>>;
}

export function Filters({ query, onChange }: FiltersProps) {
  const { t } = useTranslation();

  function handleChange<K extends keyof PerfumeQuery>(key: K) {
    return (value: PerfumeQuery[K]) => {
      onChange((cur) => ({ ...cur, [key]: value }));
    };
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
          handleChange={handleChange("search")}
          placeholder={t(`filters.searchPlaceholder`)}
        />
      </div>

      <div className={styles.filterField}>
        <SegmentedFilter
          options={[
            { value: true, label: t("filters.approved") },
            { value: false, label: t("filters.pending") },
          ]}
          value={query.approved}
          onChange={handleChange("approved")}
        />
      </div>

      <div className={styles.filterField}>
        <SelectOne
          options={[
            { value: "male", label: t("filters.male") },
            { value: "female", label: t("filters.female") },
            { value: "unisex", label: t("filters.unisex") },
          ]}
          placeholder={t("filters.selectSex")}
          value={t(query.sex ?? "")}
          // @ts-ignore
          handleSelect={handleChange("sex")}
        />
      </div>

      <div className={styles.filterField}>
        <SeasonsFilter selected={query.seasons} handleSelect={handleSeasons} />
      </div>
    </div>
  );
}
