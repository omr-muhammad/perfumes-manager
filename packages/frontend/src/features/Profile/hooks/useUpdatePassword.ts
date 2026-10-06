import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUserPassword } from "../api";

export function useUpdatePassword() {
  const { mutate, isPending } = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => toast.success("Password updated successfully."),
    onError: (err) => toast.error(err.message),
  });

  return { updatePassword: mutate, updatingPassword: isPending };
}
