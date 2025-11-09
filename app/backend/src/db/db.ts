import postgres from "postgres";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import type { Database } from "./types.js";

if (!process.env.DB_CONNECTION_STRING)
    throw new Error("DB connection string not specified");

export const db = new Kysely<Database>({
    dialect: new PostgresJSDialect({
        postgres: postgres(process.env.DB_CONNECTION_STRING)
    })
});
