import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EditApproveCo } from "../types";
import { apiCoApprove } from "../api";
import toast from "react-hot-toast";

export function useApproveCompany() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", `approve_company`],
    mutationFn: async ({ coId, updates }: EditApproveCo) =>
      apiCoApprove(coId, updates),
    onSuccess: (data) => {
      toast.success(`${data.company.name} company was approved successfully.`);

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
