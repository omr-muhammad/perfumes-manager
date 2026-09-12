import { useInfiniteQuery } from "@tanstack/react-query";
import {
  apiGetCompounds,
  type CompoundsGetResponse,
  type CompoundsQuery,
} from "../../api/compoundsAPI";

export function useInfiniteCompounds(query: CompoundsQuery) {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["compounds", query],
    queryFn: ({ pageParam }) => apiGetCompounds({ ...query, page: pageParam }),
    enabled: query.search.trim() !== "",
    initialPageParam: 1,
    getNextPageParam: (lastPage /* the last fetched data */) =>
      lastPage?.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });

  if (error) throw error;

  const compounds = (data?.pages.flatMap((page) => page.data as any) ??
    []) as CompoundsGetResponse;

  return {
    compounds,
    loading: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
