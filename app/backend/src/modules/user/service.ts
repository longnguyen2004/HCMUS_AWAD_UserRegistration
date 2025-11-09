import * as argon2 from "argon2";
import { status } from "elysia";
import { db } from "../../db/db.js";
import type { PostgresError } from "postgres";
import type { UserModel } from "./model.js";

export abstract class UserService {
    static async register({ email, password }: UserModel.registerBody) {
        try {
            const hash = await argon2.hash(password);
            await db
                .insertInto("users")
                .values({ email, password: hash })
                .execute();
            return { email };
        }
        catch (e) {
            if ((e as Error).name === "PostgresError") {
                let postgresError = e as PostgresError;
                console.log(e);
                if (postgresError.code == "23505" && postgresError.column_name == "email")
                    throw status(400, "Email already exists" satisfies UserModel.registerEmailAlreadyExists);
            }
            throw e;
        }
    }
}