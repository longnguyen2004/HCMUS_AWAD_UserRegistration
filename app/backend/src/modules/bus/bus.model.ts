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

  export const getAllQuery = t.Object({
    page: t.Optional(t.Integer()),
  });
  export type getAllQuery = typeof getAllQuery.static;

  const BusListItem = t.Object({
    id: t.String(),
    licensePlate: t.String(),
    model: t.String(),
    capacity: t.Number(),
    status: t.String(),
  });

  export type BusListItem = typeof BusListItem.static;

  export const getAllResponse = t.Object({
    data: t.Array(BusListItem),
    total: t.Integer(),
    page: t.Integer(),
    per_page: t.Integer(),
  });
  export type getAllResponse = typeof getAllResponse.static;

  export const getOneResponse = t.Object({
    id: t.String(),
    licensePlate: t.String(),
    model: t.String(),
    capacity: t.Number(),
    status: t.String(),
    seats: t.Array(
      t.Object({
        id: t.String(),
        seatNumber: t.String(),
        row: t.Number(),
        col: t.Number(),
      }),
    ),
  });
  export type getOneResponse = typeof getOneResponse.static;

  export const modifyBody = t.Object({
    licensePlate: t.Optional(t.String()),
    model: t.Optional(t.String()),
    status: t.Optional(t.UnionEnum(["active", "inactive"])),
    seats: t.Optional(
      t.Array(
        t.Object({
          id: t.String(),
          seatNumber: t.String(),
          row: t.Number(),
          col: t.Number(),
        }),
      ),
    ),
  });
  export type modifyBody = typeof modifyBody.static;

  export const modifyResponse = getOneResponse;
  export type modifyResponse = typeof modifyResponse.static;

  export const errorResponse = t.Object({
    error: t.String(),
    details: t.Optional(t.String()),
  });
  export type errorResponse = typeof errorResponse.static;

  export const changeAvatarBody = t.Object({
    source: t.String(),
  });
  export type changeAvatarBody = typeof changeAvatarBody.static;
}
