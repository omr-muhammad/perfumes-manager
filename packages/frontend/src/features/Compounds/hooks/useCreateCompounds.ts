import { useMutation } from "@tanstack/react-query";
import { apiCreateCompound } from "../api";
import type { NewCompound } from "../types";
import toast from "react-hot-toast";

export function useCreateCompound() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["compounds", "new-compound"],
    mutationFn: (newComp: NewCompound) => apiCreateCompound(newComp),
    onSuccess: () => toast.success("Perfume Compound created."),
    onError: (error) => toast.error(error.message),
  });

  return { createCompound: mutate, creatingCompound: isPending };
}
