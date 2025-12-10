import z from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    DB_CONNECTION_STRING: z.url(),
    FE_HOST: z.url(),
    GOOGLE_APP_PASSWORD: z.string(),
    EMAIL_SENDER: z.email(),
    PAYOS_CLIENT_ID: z.string(),
    PAYOS_API_KEY: z.string(),
    PAYOS_CHECKSUM_KEY: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
