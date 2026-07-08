import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSignup, type SignupUser } from "../../api/usersAPI";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export function useSignup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["user"],
    mutationFn: (signupUser: SignupUser) => apiSignup(signupUser),
    onSuccess: (data) => {
      toast.success("New user created successfully.");

      navigate("/");
      queryClient.setQueryData(["user"], data!.user);
    },
    onError: (error) => toast.error(error.message),
  });

  return { signup: mutate, signingUp: isPending };
}
