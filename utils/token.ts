import type { CtxCookie, UserPayload } from "./globalSchema";
import type { AuthJWT } from "./jwtPlugins";

export async function signToken(
  jwt: AuthJWT,
  payload: UserPayload,
  keepLogin?: boolean,
) {
  const duration = keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

  return jwt.sign({
    userId: payload.userId,
    role: payload.role,
    exp: Math.floor(Date.now() / 1000) + duration,
  });
}

export function setCookie(
  cookie: CtxCookie,
  name: string,
  token: string,
  maxAge: number,
) {
  const inProduction = process.env.NODE_ENV === "production";
  cookie[name]?.set({
    value: token,
    secrets: process.env.jwt_secret,
    httpOnly: inProduction, // true => client cannot access with document.cookie
    maxAge,
    secure: inProduction, // true => only send with https
  });
}
