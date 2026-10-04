import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { apiSignup } from "../api";

import type { SignupUser } from "../types";

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
