import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateCompound } from "../types";
import { apiUpdateCompound } from "../api";
import toast from "react-hot-toast";

export function useUpdateCompound() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["compounds", "update-compound"],
    mutationFn: ({ id, updates }: { id: number; updates: UpdateCompound }) =>
      apiUpdateCompound(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compounds"] }),
    onError: (error) => toast.error(error.message),
  });

  return { updateCompound: mutate, updatingCompound: isPending };
}
