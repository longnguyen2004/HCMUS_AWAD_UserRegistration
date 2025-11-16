import { t } from "elysia";

export namespace AuthModel {
    export const signInBody = t.Object({
        email: t.String(),
        password: t.String()
    })
    export type signInBody = typeof signInBody.static;

    export const signInInvalid = t.Literal("Invalid email or password");
    export type signInInvalid = typeof signInInvalid.static;

    export const signInResponse = t.Object({
        accessToken: t.String(),
        refreshToken: t.String()
    });
    export type signInResponse = typeof signInResponse.static

    export const refreshBody = t.Object({
        refreshToken: t.String()
    });
    export type refreshBody = typeof refreshBody.static

    export const refreshResponse = t.Object({
        accessToken: t.String()
    });
    export type refreshResponse = typeof refreshResponse.static
}