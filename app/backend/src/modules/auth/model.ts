import { t } from "elysia";

export namespace AuthModel {
    export const signInBody = t.Object({
        email: t.String(),
        password: t.String()
    })

    export type signInBody = typeof signInBody.static;

    export const signInInvalid = t.Literal("Invalid email or password");
    export type signInInvalid = typeof signInInvalid.static;
}