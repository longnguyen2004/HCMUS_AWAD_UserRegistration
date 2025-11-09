import { treaty } from "@elysiajs/eden";
import type { App } from "backend";

export const backend = treaty<App>(import.meta.env.VITE_BACKEND_URL);
