import { useInfiniteQuery } from "@tanstack/react-query";
import { apiCoQuery, type CoQuery } from "../../api/companiesAPI";

export function useInfiniteCompanies(query?: CoQuery) {
  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["companies", query],
    queryFn: ({ pageParam }) =>
      apiCoQuery({ ...query, page: pageParam } as CoQuery),
    initialPageParam: 1,
    getNextPageParam: (lastPage /* the last fetched data */) =>
      lastPage?.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });

  if (error) throw error;

  const companies = data?.pages.flatMap((page) => page?.data) ?? [];

  return {
    companies,
    loading: isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
