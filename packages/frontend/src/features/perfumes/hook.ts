import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  apiAddPerfume,
  apiPerfumesQuery,
  type NewPerfume,
  type PerfumeQuery,
} from "../../api/perfumesAPI";
import toast from "react-hot-toast";

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

export function useAddPerfume() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["newPerfume"],
    mutationFn: async (newPerfume: NewPerfume) => apiAddPerfume(newPerfume),
    onSuccess: (data) => {
      toast.success(`${data.name} perfume was created successfully.`);
    },
    onError: (error) => toast.error(error.message),
  });

  return { createNewPerfume: mutate, creating: isPending };
}
