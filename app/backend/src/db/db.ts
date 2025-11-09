import postgres from "postgres";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import type { Database } from "./types.js";

if (!process.env.DB_HOST)
    throw new Error("DB host not specified");
if (!process.env.DB_PORT)
    throw new Error("DB port not specified");
if (!process.env.DB_USER)
    throw new Error("DB user not specified");
if (!process.env.DB_PASS)
    throw new Error("DB pass not specified");

export const db = new Kysely<Database>({
    dialect: new PostgresJSDialect({
        postgres: postgres({
            host: process.env.DB_HOST,
            port: Number.parseInt(process.env.DB_PORT, 10),
            user: process.env.DB_USER,
            pass: process.env.DB_PASS
        })
    })
});
