import z from "zod"
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
    server: {
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string(),
        DB_CONNECTION_STRING: z.url()
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true
})
