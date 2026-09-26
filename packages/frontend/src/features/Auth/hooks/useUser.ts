import { apiGetLoggedUser } from "../api";

export const loggedUserQuery = {
  queryKey: ["user"],
  queryFn: apiGetLoggedUser,
  staleTime: 5 * 60 * 1000,
};
