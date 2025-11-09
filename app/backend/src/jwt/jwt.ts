import { jwt as jwtPlugin } from "@elysiajs/jwt";

if (!process.env.JWT_SECRET)
    throw new Error("Please specify JWT secret key in JWT_SECRET")

export const jwt = jwtPlugin({
    name: "jwt",
    secret: process.env.JWT_SECRET
})
