import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { apiLogout } from "../api";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationKey: ["logout"],
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.removeQueries();

      toast.success("Successfully logged out");

      navigate("/auth/login", { replace: true });
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    logout: mutate,
    loggingOut: isPending,
  };
}
