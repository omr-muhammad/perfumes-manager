import Elysia from "elysia";
import { authPlugin } from "./jwtPlugin";

export const protect = new Elysia({ name: "protect" })
  .use(authPlugin)
  .resolve({ as: "scoped" }, async ({ cookie: { authToken }, authJWT }) => {
    if (!authToken || typeof authToken.value !== "string") {
      throw new Error("Unauthorized: No token provided");
    }

    const token = authToken.value;
    const payload = await authJWT.verify(token);

    if (!payload) {
      throw new Error("Unauthorized: Invalid or expired token");
    }

    return { authPayload: payload };
  });

export function restrictTo(...roles: string[]) {
  return new Elysia({ name: `restrict-${roles.join("-")}` })
    .use(protect) // Inherit the payload resolution
    .onBeforeHandle(({ authPayload }) => {
      if (!roles.includes(authPayload.role)) {
        throw new Error("Forbidden: Insufficient permissions");
      }
    });
}
