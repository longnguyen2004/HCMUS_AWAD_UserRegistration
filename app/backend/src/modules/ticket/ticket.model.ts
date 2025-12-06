import { t } from "elysia";

export namespace TicketModel {
  export const searchBody = t.Object({
    from: t.String(),
    to: t.String(),
    departure: t.Optional(t.String({ format: "date" })),
    email: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    price: t.Optional(t.Integer()),
    status: t.Optional(t.String()),
    page: t.Optional(t.Integer()),
    order: t.Optional(t.Union([t.Literal("ASC"), t.Literal("DESC")])),
  });
  export type searchBody = typeof searchBody.static;

  export const searchResponse = t.Object({
    data: t.Array(
      t.Object({
        id: t.String(),
        tripId: t.String(),
        seatId: t.String(),
        email: t.String(),
        phone: t.String(),
        departure: t.Date(),
        arrival: t.Date(),
        price: t.Integer(),
        status: t.String(),
        createAt: t.Date(),
      }),
    ),
    total: t.Integer(),
    page: t.Integer(),
    per_page: t.Integer(),
  });
  export type searchResponse = typeof searchResponse.static;

  export const createBody = t.Union([
    t.Object({
      userId: t.String(),
      tripId: t.String(),
      seatId: t.String(),
    }),
    t.Object({
      tripId: t.String(),
      seatId: t.String(),
      email: t.String({ format: "email" }),
      phone: t.String({ pattern: "^[0-9\\s\\-]{7,20}$" }),
    }),
  ]);
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    id: t.String(),
  });
  export type createResponse = typeof createResponse.static;
}
