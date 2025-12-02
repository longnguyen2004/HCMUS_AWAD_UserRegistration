import { t } from "elysia";

export namespace RouteModel {
  export const createBody = t.Object({
    tripId: t.String(),
    stops: t.Array(t.String()),
  });
  export type createBody = typeof createBody.static;

  export const createBodyResponse = t.Object({
    id: t.String(),
    tripId: t.Optional(t.String()),
    stops: t.Array(t.String()),
  });
  export type createBodyResponse = typeof createBodyResponse.static;
  export const notFound = t.Object({ message: t.String() });
  export type notFound = typeof notFound.static;
  
  export const searchBody = t.Object({
    tripId: t.Optional(t.String()),
    page: t.Optional(t.Integer()),
  });
  export type searchBody = typeof searchBody.static;

  export const searchBodyResponse = t.Object({
    data: t.Array(
      t.Object({
        id: t.String(),
        from: t.Optional(t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) })),
        to: t.Optional(t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) })),
        stops: t.Array(t.String()),
      })
    ),
    total: t.Integer(),
    page: t.Integer(),
    perPage: t.Integer(),
  });
  export type searchBodyResponse = typeof searchBodyResponse.static;
}
