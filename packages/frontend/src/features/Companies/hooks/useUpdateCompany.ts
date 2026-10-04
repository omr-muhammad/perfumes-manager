import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EditApproveCo } from "../types";
import { apiCoUpdate } from "../api";
import toast from "react-hot-toast";

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", "edit_company"],
    mutationFn: async ({ coId, updates }: EditApproveCo) =>
      apiCoUpdate(coId, updates),
    onSuccess: (data) => {
      toast.success(`${data.company.name} company was updated successfully.`);

      queryClient.invalidateQueries({
        queryKey: ["companies", `id_${data.company.id}`],
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return { mutate, isPending };
}
