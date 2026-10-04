import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGetCompoundById } from "../api";

export function useGetCompound(id: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ["compounds", `compound_${id}`],
    queryFn: () => apiGetCompoundById(id),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { perfumeCompound: data, loading: isPending };
}
