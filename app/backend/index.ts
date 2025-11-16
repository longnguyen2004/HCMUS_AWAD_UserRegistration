import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { auth } from "./src/modules/auth/index.js";
import { user } from "./src/modules/user/index.js";
import { protectedRoutes } from "./src/modules/protected/index.js";

const app = new Elysia({ adapter: node() })
  .use(cors())
  .use(auth)
  .use(user)
  .use(protectedRoutes)
  .listen(3000);

export type App = typeof app;
export default app;

console.log(`Listening on http://localhost:3000`);
