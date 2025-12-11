import { t } from "elysia";

export namespace EmailModel {
  export const sendBody = t.Object({
    email: t.String(),
    subject: t.Optional(t.String()),
    text: t.Optional(t.String()),
    html: t.Optional(t.Undefined()),
    pdf: t.Optional(t.Undefined()),
    filename: t.Optional(t.String()),
    content: t.Optional(t.String()),
  });
  export type sendBody = typeof sendBody.static;

  export const createPdfBody = t.Object({
    ticketId: t.String(),
    passengerName: t.Optional(t.String()),
    tripId: t.Optional(t.String()),
    licensePlate: t.Optional(t.String()),
    seat: t.Optional(t.String()),
    departure: t.Optional(t.String()),
    arrival: t.Optional(t.String()),
    fromCity: t.Optional(t.String()),
    toCity: t.Optional(t.String()),
    price: t.Optional(t.Integer()),
    orderId: t.Optional(t.Number()),
  });
  export type createPdfBody = typeof createPdfBody.static;

  export const createPdfResponse = t.Object({
    filename: t.String(),
    content: t.String(), 
  });
  export type createPdfResponse = typeof createPdfResponse.static;
}
