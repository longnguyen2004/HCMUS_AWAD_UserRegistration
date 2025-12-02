import { t } from "elysia";

export namespace CityModel {
    export const cityResponse = t.Array(t.Object({
        id: t.String(),
        name: t.String()
    }))
    export type cityResponse = typeof cityResponse.static
}
