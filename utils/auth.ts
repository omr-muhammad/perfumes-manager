import Elysia from "elysia";
import { authPlugin } from "./jwtPlugin";
import * as userService from "../modules/users/service";
import { AppError } from "./AppError";

export const protect = new Elysia({ name: "protect" })
  .use(authPlugin)
  .resolve({ as: "scoped" }, async ({ cookie: { authToken }, authJWT }) => {
    if (!authToken || typeof authToken.value !== "string")
      throw new AppError(401, "Unauthorized: No token provided, please login.");

    const token = authToken.value;
    const payload = await authJWT.verify(token);

    if (!payload)
      throw new AppError(
        401,
        "Unauthorized: Invalid or expired token, please login.",
      );

    const user = await userService.getById(payload.userId);

    if (user.tokenVersion !== payload.tokenV)
      throw new AppError(
        401,
        "Unautorized: token is invalid or expired, please login.",
      );

    return { authPayload: payload };
  });

export function restrictTo(...roles: string[]) {
  return new Elysia({ name: `restrict-${roles.join("-")}` })
    .use(protect)
    .onBeforeHandle(({ authPayload }) => {
      if (!roles.includes(authPayload.role))
        throw new AppError(403, "Forbidden: Insufficient permissions");
    });
}
