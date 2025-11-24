import ky from "ky";
import { treaty } from "@elysiajs/eden";
import { createAuthClient } from "better-auth/react";
import type { App } from "backend";

const client = ky.create({
  credentials: "include",
  throwHttpErrors: false
})
export const backend = treaty<App>(import.meta.env.VITE_BACKEND_URL, { fetcher: client });
export const backendAuth = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL
});
