import { env } from "./env.js";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
export const AuthService = betterAuth({
  database: new Pool({
    connectionString: env.DB_CONNECTION_STRING
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: ["http://localhost:*"],
});

export const auth = AuthService;
