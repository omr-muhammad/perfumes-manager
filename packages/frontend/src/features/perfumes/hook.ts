import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  apiAddPerfume,
  apiApprovePerfume,
  apiDeletePerfume,
  apiEditPerfume,
  apiGetPerfumeById,
  apiPerfumesQuery,
  type NewPerfume,
  type PerfumeQuery,
  type PerfumeUpdates,
} from "../../api/perfumesAPI";
import toast from "react-hot-toast";

type EditPerfumeVariables = {
  perfumeId: number;
  updates: PerfumeUpdates;
};

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

export function usePerfumeById(perfumeId: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ["perfumes", `id_${perfumeId}`],
    queryFn: () => apiGetPerfumeById(perfumeId),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { perfume: data, loading: isPending };
}

export function useAddPerfume() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", `new_perfume`],
    mutationFn: async (newPerfume: NewPerfume) => apiAddPerfume(newPerfume),
    onSuccess: (data) => {
      toast.success(`${data.name} perfume was created successfully.`);
    },
    onError: (error) => toast.error(error.message),
  });

  return { createNewPerfume: mutate, creating: isPending };
}

export function useEditPerfume() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", "perfume_edit"],
    mutationFn: async ({ perfumeId, updates }: EditPerfumeVariables) =>
      apiEditPerfume(perfumeId, updates),
    onSuccess: (data) => {
      toast.success(`${data.perfume.name} perfume was updated successfully.`);

      queryClient.invalidateQueries({
        queryKey: ["perfumes"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  // Those names must match the `useApprovePerfume` hook
  return { mutate, isPending };
}

export function useApprovePerfume() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", `perfume_approve`],
    mutationFn: async ({
      perfumeId,
      updates,
    }: {
      perfumeId: number;
      updates: PerfumeUpdates;
    }) => apiApprovePerfume(perfumeId, updates),
    onSuccess: (perfume) => {
      toast.success(`${perfume?.perfume.name} was successfully approved.`);

      queryClient.invalidateQueries({ queryKey: ["perfumes"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { mutate, isPending };
}

export function useDeletePerfume() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", "perfume_delete"],
    mutationFn: async (perfumeId: number) => apiDeletePerfume(perfumeId),
    onSuccess: (data) => {
      toast.success(`${data.name} perfume was successfully deleted.`);

      queryClient.invalidateQueries({
        queryKey: ["perfumes"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { deletePerfume: mutate, deleting: isPending };
}
