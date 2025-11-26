import { AuthService } from "../../lib/auth.js";
import { Elysia } from "elysia";
import type { Context } from "elysia";

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return AuthService.handler(context.request);
  } else {
    context.status(405);
  }
};
export const auth = new Elysia().all("/api/auth/*", betterAuthView);

export const authGuard = new Elysia()
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await AuthService.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .as("scoped");
