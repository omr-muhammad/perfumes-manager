import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { LoginCredentials } from "../types";
import toast from "react-hot-toast";
import { apiLogin } from "../api";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (credentials: LoginCredentials) => apiLogin(credentials),
    mutationKey: ["user"],
    onSuccess: (data) => {
      toast.success("Successfully logged in.");

      navigate("/dashboard");
      queryClient.setQueryData(["user"], data?.user);
    },
    onError: (error) => toast.error(error.message),
  });

  return { login: mutate, loggingIn: isPending };
}
