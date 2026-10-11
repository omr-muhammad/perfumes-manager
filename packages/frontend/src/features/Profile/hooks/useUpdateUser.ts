import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useUpdateUser() {
  const { t } = useTranslation();
  const clientQuery = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["user"],
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      clientQuery.setQueryData(["user"], () => updatedUser);
      toast.success(t("profile:toasts.profileUpdated"));
    },
    onError: (err) => {
      console.log("Updating User Profile ERR: ", err);
      toast.error("profile:toasts.profileUpdateFailed");
    },
  });

  return { updateUserProfile: mutate, updatingUserProfile: isPending };
}
