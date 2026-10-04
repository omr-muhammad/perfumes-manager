import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCoDelete } from "../api";
import toast from "react-hot-toast";

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
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
