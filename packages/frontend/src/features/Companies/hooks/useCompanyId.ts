import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGetCoById } from "../api";

export function useCompanyId(coId: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ["companies", `id_${coId}`],
    queryFn: () => apiGetCoById(coId),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { company: data?.company, loading: isPending };
}
