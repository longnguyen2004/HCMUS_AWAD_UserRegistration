import { t } from "elysia";

export namespace ReportModel {
  export const getRevenueBody = t.Object({
    rangeType: t.UnionEnum(["day", "month", "year"]),
    dataType: t.UnionEnum(["booking", "money"]),
    start: t.Date(),
    end: t.Date(),
  });
  export type getRevenueBody = typeof getRevenueBody.static;

  export const getRevenueResponse = t.Object({
    data: t.Array(
      t.Object({
        amount: t.Number(),
        date: t.Date(),
      }),
    ),
    total: t.Number(),
    start: t.Date(),
    end: t.Date(),
  });
  export type getRevenueResponse = typeof getRevenueResponse.static;

  export const getTopRouteBody = t.Object({
    dataType: t.UnionEnum(["booking", "money"]),
    start: t.Date(),
    end: t.Date(),
    order: t.Optional(t.UnionEnum(["ASC", "DESC"])),
  });
  export type getTopRouteBody = typeof getTopRouteBody.static;

  export const getTopRouteResponse = t.Object({
    data: t.Object({
      fromCity: t.String(),
      toCity: t.String(),
      amount: t.Number(),
      date: t.Date(),
    }),
    total: t.Number(),
    order: t.Optional(t.UnionEnum(["ASC", "DESC"])),
    start: t.Date(),
    end: t.Date(),
  });
  export type getTopRouteResponse = typeof getTopRouteResponse.static;
}
