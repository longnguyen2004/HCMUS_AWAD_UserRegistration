import { treaty } from "@elysiajs/eden";
import type { App } from "backend";

export const backend = treaty<App>("http://localhost:3000");
