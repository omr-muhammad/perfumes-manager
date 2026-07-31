import { type Dispatch, type SetStateAction } from "react";
import type { PerfumeQuery } from "../../api/perfumesAPI";
import type { TFunction } from "i18next";

interface Params {
  filters: PerfumeQuery;
  handleChange: Dispatch<SetStateAction<PerfumeQuery>>;
  t: TFunction<"translation", undefined>;
}

export function perfumesActiveFiltersTags({
  filters,
  handleChange,
  t,
}: Params) {
  const tags = [];

  function clearAll() {
    handleChange({});
  }

  if (filters.search) {
    tags.push({
      key: "search",
      label: `${t("search")}: ${filters.search}`,
      onRemove: () => handleChange((cur) => ({ ...cur, search: undefined })),
    });
  }

  if (filters.approved !== undefined) {
    tags.push({
      key: "approved",
      label: filters.approved ? t("approved") : t("pending"),
      onRemove: () => handleChange((cur) => ({ ...cur, approved: undefined })),
    });
  }

  for (const season of filters.seasons ?? []) {
    tags.push({
      key: `season-${season}`,
      label: t(season),
      onRemove: () =>
        handleChange((cur) => ({
          ...cur,
          seasons: cur.seasons!.filter((s) => s !== season),
        })),
    });
  }

  if (filters.sex) {
    tags.push({
      key: "sex",
      label: t(filters.sex),
      onRemove: () => handleChange((cur) => ({ ...cur, sex: undefined })),
    });
  }

  return { tags, clearAll };
}
