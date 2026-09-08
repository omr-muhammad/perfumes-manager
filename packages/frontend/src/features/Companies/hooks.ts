import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  apiCoApprove,
  apiCoCreate,
  apiCoDelete,
  apiCoQuery,
  apiCoUpdate,
  apiGetCoById,
  type CoQuery,
  type CoUpdates,
  type NewCompany,
} from "../../api/companiesAPI";
import toast from "react-hot-toast";
import { uploadImgToCloudinary } from "../../utils/uploadImage";

type EditApproveCo = { coId: number; updates: CoUpdates };

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

export function useCompanyById(coId: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ["companies", `id_${coId}`],
    queryFn: () => apiGetCoById(coId),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { company: data?.company, loading: isPending };
}

export function useCreateCompany() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", "new_company"],
    mutationFn: async (newCo: NewCompany) => apiCoCreate(newCo),
    onSuccess: (data) =>
      toast.success(`${data.name} company was created successfully.`),
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return { createCo: mutate, creating: isPending };
}

export function useUploadLogo() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: uploadImgToCloudinary,
  });

  return { uploadCoLogo: mutateAsync, uploadingLogo: isPending };
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", "edit_company"],
    mutationFn: async ({ coId, updates }: EditApproveCo) =>
      apiCoUpdate(coId, updates),
    onSuccess: (data) => {
      toast.success(`${data.company.name} company was updated successfully.`);

      queryClient.invalidateQueries({
        queryKey: ["companies", `id_${data.company.id}`],
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return { mutate, isPending };
}

export function useApproveCompany() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", `approve_company`],
    mutationFn: async ({ coId, updates }: EditApproveCo) =>
      apiCoApprove(coId, updates),
    onSuccess: (data) => {
      toast.success(`${data.company.name} company was approved successfully.`);

      queryClient.invalidateQueries({
        queryKey: ["companies", `id_${data.company.id}`],
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return { mutate, isPending };
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", `delete_company`],
    mutationFn: async (coId: number) => apiCoDelete(coId),
    onSuccess: (data) => {
      toast.success(`${data.name} company was deleted successfully.`);

      queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return { deleteCo: mutate, deleting: isPending };
}
