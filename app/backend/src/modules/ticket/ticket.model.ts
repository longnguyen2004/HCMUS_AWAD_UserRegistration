import { t } from "elysia";

export namespace TicketModel {
  //this is for admin
  export const searchBody = t.Object({
    from: t.String(),
    to: t.String(),
    departure: t.Optional(t.String({ format: "date" })),
    email: t.Optional(t.String()),
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
  export type searchResponse = typeof searchResponse.static
}
