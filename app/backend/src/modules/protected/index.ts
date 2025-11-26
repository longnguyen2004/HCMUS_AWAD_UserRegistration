import { Elysia } from "elysia";
import { authGuard } from "../auth/index.js";

export const protectedRoutes = new Elysia()
  .use(authGuard)
  .get("/protected", async ({ user }) => `Hello ${user.email}`, { auth: true });
