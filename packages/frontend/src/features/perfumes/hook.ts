import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiPerfumesQuery, type PerfumeQuery } from "../../api/perfumesAPI";

export function usePerfumes(query?: PerfumeQuery) {
  const { data, isPending, error } = useQuery({
    queryKey: ["perfumes", query],
    queryFn: () => apiPerfumesQuery(query),
    staleTime: 5 * 60 * 1000, // 5min
    // prevent loading state per query change be keeping old data until new arrives
    placeholderData: keepPreviousData
  });

  if (error) throw error;

  return { data, loading: isPending };
}
