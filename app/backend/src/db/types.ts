import type { Generated } from "kysely";

export interface UserTable {
    id: Generated<number>,
    username: string,
    email: string,
    password: string
}

export interface Database {
    users: UserTable
}
