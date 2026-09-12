import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  apiCreateCompound,
  apiDeleteCompound,
  apiGetCompoundById,
  apiGetCompounds,
  apiUpdateCompound,
  type CompoundsGetResponse,
  type CompoundsQuery,
  type NewCompound,
  type UpdateCompound,
} from "../../api/compoundsAPI";
import toast from "react-hot-toast";

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

export function useGetCompound(id: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ["compounds", "get-one"],
    queryFn: () => apiGetCompoundById(id),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { perfumeCompound: data, loading: isPending };
}

export function useCreateCompound() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["compounds", "new-compound"],
    mutationFn: (newComp: NewCompound) => apiCreateCompound(newComp),
    onSuccess: () => toast.success("Perfume Compound created."),
    onError: (error) => toast.error(error.message),
  });

  return { createCompound: mutate, creatingCompound: isPending };
}

export function useUpdateCompound() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["compounds", "update-compound"],
    mutationFn: ({ id, updates }: { id: number; updates: UpdateCompound }) =>
      apiUpdateCompound(id, updates),
    onSuccess: () => {
      toast.success("Perfume Compound updated.");

      queryClient.invalidateQueries({ queryKey: ["compounds"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { updateCompound: mutate, isUpdatingCompound: isPending };
}

export function useDeleteCompound() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["compounds", "delete-compound"],
    mutationFn: (id: number) => apiDeleteCompound(id),
    onSuccess: () => {
      toast.success("Perfume Compound updated.");

      queryClient.invalidateQueries({ queryKey: ["compounds"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { deleteCompound: mutate, isDeletingCompound: isPending };
}
