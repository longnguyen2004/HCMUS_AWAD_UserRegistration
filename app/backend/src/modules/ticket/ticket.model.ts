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

  export const createBody = t.Object({
    tripId: t.String(),
    seatId: t.String(),
    userId: t.Optional(t.String()),
    email: t.String({ format: "email" }),
    phone: t.String({ pattern: "^[0-9\\s\\-]{7,20}$" }),
  });
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    id: t.String(),
  });
  export type createResponse = typeof createResponse.static;

  export const getResponse = t.Object({
    id: t.String(),
    status: t.String(),
    price: t.Integer(),
    email: t.String(),
    phone: t.String(),
    seatNumber: t.Optional(t.String()),
    busPlate: t.Optional(t.String()),
    orderId: t.Optional(t.Number()),
    createdAt: t.Date(),
    trip: t.Object({
      id: t.String(),
      departure: t.Date(),
      arrival: t.Date(),
      fromCity: t.Optional(t.String()),
      toCity: t.Optional(t.String()),
    }),
  });
  export type getResponse = typeof getResponse.static;

  export const modifyBody = t.Object({
    status: t.UnionEnum(["pending", "booked"]),
  });
  export type modifyBody = typeof modifyBody.static;

  export const modifyResponse = createResponse;
  export type modifyResponse = typeof modifyResponse.static;

  export const initPayResponse = t.Object({
    paymentLinkResponse: t.Record(t.String(), t.Unknown()),
    orderCode: t.Optional(t.Number()),
  });
  export type initPayResponse = typeof initPayResponse.static;

  export const processPaymentBody = t.Object({
    code: t.String(),
    desc: t.String(),
    success: t.Optional(t.Boolean()),
    data: t.Object({
      orderCode: t.Number(),
      amount: t.Number(),
      currency: t.String(),
      desc: t.String(),
    }),
    signature: t.String(),
  });
  export type processPaymentBody = typeof processPaymentBody.static;

  export const notFound = t.Object({
    message: t.String(),
  });
  export type notFound = typeof notFound.static;
}
