import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDeletePerfume } from "../api";
import toast from "react-hot-toast";

export function useDeletePerfume() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (perfumeId: number) => apiDeletePerfume(perfumeId),
    onSuccess: (data) => {
      toast.success(`${data.name} perfume was successfully deleted.`);

      queryClient.invalidateQueries({
        queryKey: ["perfumes"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { deletePerfume: mutate, deleting: isPending };
}
