import { treaty } from "@elysia/eden";
import type { App } from "../../../backend/index";

const apiUrl = import.meta.env.PROD
  ? import.meta.env.VITE_API_PROD_URL
  : import.meta.env.VITE_API_DEV_URL;

// @ts-ignore - Bypassing Bun's duplicate instance cache hash mismatch
export const backend = treaty<App>(apiUrl, {
  fetch: {
    credentials: "include",
  },
});
