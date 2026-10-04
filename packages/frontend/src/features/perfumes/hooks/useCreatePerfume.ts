import { useMutation } from "@tanstack/react-query";
import type { NewPerfume } from "../types";
import { apiAddPerfume } from "../api";
import toast from "react-hot-toast";

export function useCreatePerfume() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["perfumes", `new_perfume`],
    mutationFn: async (newPerfume: NewPerfume) => apiAddPerfume(newPerfume),
    onSuccess: (data) => {
      toast.success(`${data.name} perfume was created successfully.`);
    },
    onError: (error) => toast.error(error.message),
  });

  return { createPerfume: mutate, creating: isPending };
}
