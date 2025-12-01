import { t } from "elysia";

export namespace RouteModel {
  export const createBody = t.Object({
    fromId: t.String(),
    toId: t.String(),
    stops: t.Array(t.String()),
  });
  export type createBody = typeof createBody.static;

  export const createBodyResponse = t.Object({
    id: t.String(),
    from: t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) }),
    to: t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) }),
    stops: t.Array(
      t.Object({
        order: t.Integer(),
        busStop: t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) }),
      })
    ),
  });
  export type createBodyResponse = typeof createBodyResponse.static;
  export const notFound = t.Object({ message: t.String() });
  export type notFound = typeof notFound.static;
  
  export const searchBody = t.Object({
    from: t.Optional(t.String()),
    to: t.Optional(t.String()),
    page: t.Optional(t.Integer()),
  });
  export type searchBody = typeof searchBody.static;

  export const searchBodyResponse = t.Object({
    data: t.Array(
      t.Object({
        id: t.String(),
        from: t.Optional(t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) })),
        to: t.Optional(t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) })),
        stops: t.Array(
          t.Object({
            order: t.Integer(),
            busStop: t.Object({ id: t.String(), name: t.String(), city: t.Object({ id: t.String(), name: t.String() }) }),
          })
        ),
      })
    ),
    total: t.Integer(),
    page: t.Integer(),
    perPage: t.Integer(),
  });
  export type searchBodyResponse = typeof searchBodyResponse.static;
}
