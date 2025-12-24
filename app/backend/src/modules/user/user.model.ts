import { t } from "elysia";

export namespace UserModel {
  export const modifyBody = t.Object({
    name: t.Optional(t.String()),
    image: t.Optional(t.String()),
    phone: t.Optional(t.String()),
  });
  export type modifyBody = typeof modifyBody.static;

  export const modifyResponse = t.Object({
    id: t.String(),
    name: t.Optional(t.String()),
    image: t.Optional(t.String()),
    phone: t.Optional(t.String()),
  });
  export type modifyResponse = typeof modifyResponse.static;
}
