import { t } from "elysia";
import { jwt as jwtPlugin } from "@elysiajs/jwt";

if (!process.env.JWT_SECRET)
  throw new Error("Please specify JWT secret key in JWT_SECRET");
if (!process.env.JWT_REFRESH_SECRET)
  throw new Error(
    "Please specify JWT refresh secret key in JWT_REFRESH_SECRET",
  );

export const jwtAccessSchema = t.Object({
  email: t.String({ format: "email" }),
});
export type jwtAccessSchema = typeof jwtAccessSchema.static;

export const jwtRefreshSchema = t.Object({
  email: t.String({ format: "email" }),
});
export type jwtRefreshSchema = typeof jwtRefreshSchema.static;

export const jwtAccess = jwtPlugin({
  name: "jwtAccess",
  secret: process.env.JWT_SECRET,
  schema: jwtAccessSchema,
});
export const jwtRefresh = jwtPlugin({
  name: "jwtRefresh",
  secret: process.env.JWT_REFRESH_SECRET,
  schema: jwtRefreshSchema,
});
