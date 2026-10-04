import { useInfiniteQuery } from "@tanstack/react-query";
import type { PerfumeQuery } from "../types";
import { apiPerfumesQuery } from "../api";

export function useInfinitePerfumes(query?: PerfumeQuery) {
  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["perfumes", query],
    queryFn: ({ pageParam }) => apiPerfumesQuery({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage /* the last fetched data */) =>
      lastPage?.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });

  if (error) throw error;

  const perfumes = data?.pages.flatMap((page) => page?.data) ?? [];

  return {
    perfumes,
    loading: isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
