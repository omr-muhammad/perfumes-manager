import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { apiGetLoggedUser, apiLogin, apiSignup, type LoginCredentials, type SignupUser } from "../../api/usersAPI";
import toast from "react-hot-toast";

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

export function useSignup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["user"],
    mutationFn: (signupUser: SignupUser) => apiSignup(signupUser),
    onSuccess: (data) => {
      toast.success("New user created successfully.");

      navigate("/dashboard");
      queryClient.setQueryData(["user"], data!.user);
    },
    onError: (error) => toast.error(error.message),
  });

  return { signup: mutate, signingUp: isPending };
}

export const loggedUserQuery = {
  queryKey: ["user"],
  queryFn: apiGetLoggedUser,
  staleTime: 5 * 60 * 1000
}
