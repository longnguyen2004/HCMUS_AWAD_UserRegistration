import type { Generated } from "kysely";

export interface UserTable {
  id: Generated<number>;
  email: string;
  password: string;
  createdAt: Date | null;
}

export interface Database {
  users: UserTable;
}
