import { t } from "elysia";

export namespace BusModel {
  export const createBody = t.Object({
    licensePlate: t.String(),
    model: t.String(),
    row: t.Number(),
    col: t.Number(),
    status: t.Union([t.Literal("active"), t.Literal("inactive")]),
  });
  export type createBody = typeof createBody.static;

  export const createResponse = t.Object({
    id: t.String(),
    seat: t.Array(
      t.Object({
        id: t.String(),
        seatNumber: t.String(),
        row: t.Number(),
        col: t.Number(),
      }),
    ),
  });
  export type createResponse = typeof createResponse.static;

  export const errorResponse = t.Object({
    error: t.String(),
    details: t.Optional(t.String()),
  });
  export type errorResponse = typeof errorResponse.static;
}
