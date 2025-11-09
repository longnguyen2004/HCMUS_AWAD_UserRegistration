import { db } from "./src/db/db.js";

(async() => {
    await db.schema
        .createTable("users")
        .addColumn("id", "integer", (col) => col.generatedByDefaultAsIdentity().primaryKey())
        .addColumn("username", "text", (col) => col.unique())
        .addColumn("email", "text", (col) => col.unique())
        .addColumn("password", "text")
        .execute();
    await db.destroy();
})();
