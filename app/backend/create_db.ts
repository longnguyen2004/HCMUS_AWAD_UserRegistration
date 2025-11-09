import { sql } from "kysely";
import { db } from "./src/db/db.js";

(async() => {
    await db.schema
        .createTable("users")
        .addColumn("id", "integer", (col) => col.generatedByDefaultAsIdentity().primaryKey())
        .addColumn("email", "text", (col) => col.unique())
        .addColumn("password", "text")
        .addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();
    await db.destroy();
})();
