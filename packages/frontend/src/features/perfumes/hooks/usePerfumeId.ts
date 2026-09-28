import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGetPerfumeById } from "../api";

export function usePerfumeId(perfumeId: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ["perfumes", `id_${perfumeId}`],
    queryFn: () => apiGetPerfumeById(perfumeId),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return { perfume: data, loading: isPending };
}
