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
        bus_id: t.Optional(t.String()),
        departure: t.Date(),
        price: t.Integer(),
        stops: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            order: t.Number(),
            duration: t.Nullable(t.Number()),
          }),
        ),
        capacity: t.Number(),
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
    departure: t.Date(),
    price: t.Integer(),
    stops: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        order: t.Number(),
        duration: t.Nullable(t.Number()),
      }),
    ),
    bus: t.Optional(
      t.Object({
        id: t.String(),
        seats: t.Array(
          t.Object({
            id: t.String(),
            label: t.String(),
            row: t.Number(),
            col: t.Number(),
          }),
        ),
      }),
    ),
  });
  export type getResponse = typeof getResponse.static;

  export const getSeatsOccupiedBody = t.Object({
    id: t.String({ format: "uuid" }),
  });
  export type getSeatsOccupiedBody = typeof getSeatsOccupiedBody.static;
  export const getSeatsOccupiedResponse = t.Array(t.String({ format: "uuid" }));
  export type getSeatsOccupiedResponse = typeof getSeatsOccupiedResponse.static;

  export const createBody = t.Object({
    busId: t.Optional(t.String()),
    departure: t.String({ format: "date-time" }),
    price: t.Optional(t.Integer()),
    status: t.Optional(t.String()),
    stops: t.Array(
      t.Object({
        id: t.String(),
        duration: t.Nullable(t.Number()),
      }),
    ),
  });
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    id: t.String(),
  });
  export type createResponse = typeof createResponse.static;

  export const notFound = t.Object({ message: t.String() });
  export type notFound = typeof notFound.static;
}
