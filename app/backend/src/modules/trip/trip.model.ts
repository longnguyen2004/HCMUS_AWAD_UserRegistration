import { t } from "elysia";

export namespace TripModel {
    export const searchBody = t.Object({
        from: t.String(),
        to: t.String(),
        departure: t.Optional(t.Date()),
        page: t.Optional(t.Integer())
    })
    export type searchBody = typeof searchBody.static;
    export const searchResponse = t.Object({
        data: t.Array(
            t.Object({
                id: t.String(),
                departure: t.Date(),
                arrival: t.Date(),
                price: t.Integer(),
                from: t.Object({
                    id: t.String(),
                    name: t.String(),
                    city: t.Object({ id: t.String(), name: t.String() }),
                }),
                to: t.Object({
                    id: t.String(),
                    name: t.String(),
                    city: t.Object({ id: t.String(), name: t.String() }),
                }),
            })
        ),
        total: t.Integer(),
        page: t.Integer(),
        perPage: t.Integer(),
    })
    export type searchResponse = typeof searchResponse.static;
    
    export const createBody = t.Object({
        routeId: t.Optional(t.String()),
        departure: t.Date(),
        arrival: t.Date(),
        price: t.Optional(t.Integer()),
        status: t.Optional(t.String())
    })
    export type createBody = typeof createBody.static;

    export const createBodyResponse = t.Object({
        id: t.String(),
        routeId: t.Optional(t.String()),
        departure: t.Date(),
        arrival: t.Date(),
        price: t.Optional(t.Integer()),
        status: t.Optional(t.String()),
        from: t.Object({
            id: t.String(),
            name: t.String(),
            city: t.Object({ id: t.String(), name: t.String() }),
        }),
        to: t.Object({
            id: t.String(),
            name: t.String(),
            city: t.Object({ id: t.String(), name: t.String() }),
        }),
    })
    export type createBodyResponse = typeof createBodyResponse.static;
    
    export const notFound = t.Object({ message: t.String() });
    export type notFound = typeof notFound.static;
    
}