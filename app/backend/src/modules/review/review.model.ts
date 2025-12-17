import { t } from "elysia";

export namespace ReviewModel {
  export const createBody = t.Object({
    star: t.Numeric(),
    message: t.Optional(t.String()),
  });
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    email: t.String(),
    star: t.Numeric(),
    message: t.Optional(t.String()),
  });
  export type createResponse = typeof createResponse.static;

  export const getAllQuery = t.Object({
    page: t.Optional(t.Integer()),
  });
  export type getAllQuery = typeof getAllQuery.static;

  export const getAllResponse = t.Object({
    data: t.Array(
      t.Object({
        email: t.String(),
        star: t.Numeric(),
        message: t.Optional(t.String()),
      }),
    ),
    total: t.Integer(),
    page: t.Integer(),
    per_page: t.Integer(),
  });
  export type getAllResponse = typeof getAllResponse.static;
}
