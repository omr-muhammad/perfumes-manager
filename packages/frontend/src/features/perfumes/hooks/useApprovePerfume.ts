import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PerfumeUpdates } from "../types";
import { apiApprovePerfume } from "../api";
import toast from "react-hot-toast";

export function useApprovePerfume() {
  const queryClient = useQueryClient();

  const mutationFn = ({
    perfumeId,
    updates,
  }: {
    perfumeId: number;
    updates: PerfumeUpdates;
  }) => apiApprovePerfume(perfumeId, updates);

  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", `perfume_approve`],
    mutationFn,
    onSuccess: (perfume) => {
      toast.success(`${perfume?.perfume.name} was successfully approved.`);

      queryClient.invalidateQueries({ queryKey: ["perfumes"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { mutate, isPending };
}
