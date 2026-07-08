import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { apiLogin, type LoginCredentials } from "../../api/usersAPI";
import toast from "react-hot-toast";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (credentials: LoginCredentials) => apiLogin(credentials),
    mutationKey: ["user"],
    onSuccess: (data) => {
      toast.success("Successfully logged in.");

      navigate("/");
      queryClient.setQueryData(["user"], data?.user);
    },
    onError: (error) => toast.error(error.message),
  });

  return { login: mutate, loggingIn: isPending };
}
