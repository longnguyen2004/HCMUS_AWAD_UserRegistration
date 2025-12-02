import { t } from "elysia";

export namespace TripModel {
  export const searchBody = t.Object({
    from: t.String(),
    to: t.String(),
    departure: t.Optional(t.String({ format: "date" })),
    page: t.Optional(t.Integer()),
  });
  export type searchBody = typeof searchBody.static;
  export const searchResponse = t.Object({
    data: t.Array(
      t.Object({
        id: t.String(),
        departure: t.Date(),
        arrival: t.Date(),
        price: t.Integer(),
        stops: t.Array(
          t.Object({
            id: t.String(),
            order: t.Number(),
          }),
        ),
      }),
    ),
    total: t.Integer(),
    page: t.Integer(),
    per_page: t.Integer(),
  });
  export type searchResponse = typeof searchResponse.static;

  export const createBody = t.Object({
    departure: t.Date(),
    arrival: t.Date(),
    price: t.Optional(t.Integer()),
    status: t.Optional(t.String()),
    stops: t.Array(t.String()),
  });
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    id: t.String(),
  });
  export type createResponse = typeof createResponse.static;

  export const notFound = t.Object({ message: t.String() });
  export type notFound = typeof notFound.static;
}
