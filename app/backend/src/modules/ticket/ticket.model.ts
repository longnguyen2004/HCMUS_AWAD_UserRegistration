import { t } from "elysia";

export namespace TicketModel {
  //this is for admin
  export const searchBody = t.Object({
    from: t.String(),
    to: t.String(),
    departure: t.Optional(t.String({ format: "date" })),
    userName: t.Optional(t.String()),
    price: t.Optional(t.Integer()),
    status: t.Optional(t.String()),
    createAt: t.Optional(t.String({ format: "date" })),
    page: t.Optional(t.Integer()),
  });
}
