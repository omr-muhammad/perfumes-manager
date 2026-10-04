import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompoundsQuery } from "../types";
import { apiDeleteCompound } from "../api";
import toast from "react-hot-toast";

export function useDeleteCompound(query: CompoundsQuery) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (compoundId: number) => apiDeleteCompound(compoundId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["compounds", query] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { deleteCompound: mutate, deletingCompound: isPending };
}
