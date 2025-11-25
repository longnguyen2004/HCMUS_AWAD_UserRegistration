import { dbDialect } from "../db/db.js";
import { betterAuth } from "better-auth";

export const AuthService = betterAuth({
    database: dbDialect,
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    trustedOrigins: [
        "http://localhost:*"
    ]
})

export const auth = AuthService;
