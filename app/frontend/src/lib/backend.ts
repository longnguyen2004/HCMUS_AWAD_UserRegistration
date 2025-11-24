import { treaty } from "@elysiajs/eden";
import { createAuthClient } from "better-auth/react";
import type { App } from "backend";

export const backend = treaty<App>(import.meta.env.VITE_BACKEND_URL);
export const backendAuth = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL
});
