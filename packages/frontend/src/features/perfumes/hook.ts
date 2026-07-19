import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { apiPerfumesQuery, type PerfumeQuery } from "../../api/perfumesAPI";

export function usePerfumes(query?: PerfumeQuery) {
  const { data, isPending, error } = useQuery({
    queryKey: ["perfumes", query],
    queryFn: () => apiPerfumesQuery(query),
    staleTime: 5 * 60 * 1000, // 5min
    // prevent loading state per query change be keeping old data until new arrives
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { data, loading: isPending };
}

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
    queryFn: ({ pageParam }) =>
      apiPerfumesQuery({ ...query, page: pageParam, limit: 2 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage /* the last fetched page data */) =>
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
