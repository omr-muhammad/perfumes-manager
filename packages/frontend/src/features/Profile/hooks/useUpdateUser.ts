import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api";
import toast from "react-hot-toast";

export function useUpdateUser() {
  const clientQuery = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["user"],
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      clientQuery.setQueryData(["user"], () => updatedUser);
      toast.success("Successfully updated.");
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateUserProfile: mutate, updatingUserProfile: isPending };
}
