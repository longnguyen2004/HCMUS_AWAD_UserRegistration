import { t } from "elysia";

export namespace BusStopModel {
  export const searchBody = t.Object({
    name: t.Optional(t.String()),
    page: t.Optional(t.Integer()),
  });
  export type searchBody = typeof searchBody.static;
  export const searchResponse = t.Object({
    data: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
      }),
    ),
    total: t.Integer(),
    page: t.Integer(),
    per_page: t.Integer(),
  });
  export type searchResponse = typeof searchResponse.static;

  export const getBody = t.Object({
    id: t.String({ format: "uuid" }),
  });
  export type getBody = typeof getBody.static;

  export const getResponse = t.Object({
    id: t.String(),
    name: t.String(),
  });
  export type getResponse = typeof getResponse.static;

  export const createBody = t.Object({
    name: t.String(),
    cityId: t.String(),
  });
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    id: t.String(),
  });
  export type createResponse = typeof createResponse.static;

  export const notFound = t.Object({ message: t.String() });
  export type notFound = typeof notFound.static;
}
