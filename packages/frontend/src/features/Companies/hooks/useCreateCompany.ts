import { useMutation } from "@tanstack/react-query";
import type { NewCompany } from "../types";
import toast from "react-hot-toast";
import { apiCoCreate } from "../api";

export function useCreateCompany() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["companies", "new_company"],
    mutationFn: async (newCo: NewCompany) => apiCoCreate(newCo),
    onSuccess: (data) =>
      toast.success(`${data.name} company was created successfully.`),
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return { createCo: mutate, creating: isPending };
}
