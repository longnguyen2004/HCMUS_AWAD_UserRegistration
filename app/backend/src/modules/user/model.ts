import { t } from "elysia";

export namespace UserModel {
    export const registerBody = t.Object({
        username: t.String(),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 })
    });

    export type registerBody = typeof registerBody.static;

    export const registerEmailAlreadyExists = t.Literal("Email already exists");
    export type registerEmailAlreadyExists = typeof registerEmailAlreadyExists.static;

    export const registerUsernameAlreadyExists = t.Literal("Username already exists");
    export type registerUsernameAlreadyExists = typeof registerUsernameAlreadyExists.static;
}