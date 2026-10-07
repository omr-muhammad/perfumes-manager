import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUserPassword } from "../api";
import { useTranslation } from "react-i18next";

export function useUpdatePassword() {
  const { t } = useTranslation();

  const { mutate, isPending } = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => toast.success(t("profile:toasts.passwordChanged")),
    onError: (err) => {
      console.log("Updating User Password ERR: ", err);
      toast.error(t("profile:toasts.passwordChangeFailed"));
    },
  });

  return { updatePassword: mutate, updatingPassword: isPending };
}
