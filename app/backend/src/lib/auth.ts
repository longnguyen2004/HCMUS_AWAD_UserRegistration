import { dbDialect } from "../db/db.js";
import { betterAuth } from "better-auth";

export const AuthService = betterAuth({
    database: dbDialect,
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: [
        "http://localhost:*"
    ]
})

export const auth = AuthService;
