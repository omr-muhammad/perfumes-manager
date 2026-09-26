import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UnpairedCompoundsQuery } from "../types";
import { apiGetUnpairedCompounds } from "../api";

export function useUnpairedCompounds(query: UnpairedCompoundsQuery) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["compounds", "unpaired", query.type, query.search],
    queryFn: () => apiGetUnpairedCompounds(query),
    enabled: query.search !== "",
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { unpairedCompounds: data, loading: isLoading };
}
