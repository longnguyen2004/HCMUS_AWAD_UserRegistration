import * as argon2 from "argon2";
import { status } from "elysia";
import { db } from "../../db/db.js";
import type { AuthModel } from "./model.js";

export abstract class AuthService {
    static async signIn({ email, password }: AuthModel.signInBody) {
        const user = await db.selectFrom("users")
            .select("password")
            .where("email", "=", email)
            .executeTakeFirst()
        if (!user || !await argon2.verify(user.password, password))
            throw status(400, "Invalid email or password" satisfies AuthModel.signInInvalid);
        return true;
    }
}