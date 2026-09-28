import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEditPerfume } from "../api";
import toast from "react-hot-toast";
import type { PerfumeUpdates } from "../types";

export function useEditPerfume() {
  const queryClient = useQueryClient();

  const mutationFn = ({
    perfumeId,
    updates,
  }: {
    perfumeId: number;
    updates: PerfumeUpdates;
  }) => apiEditPerfume(perfumeId, updates);

  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", "perfume_edit"],
    mutationFn,
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
