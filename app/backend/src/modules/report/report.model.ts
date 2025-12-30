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
    data: t.Object({
      amount: t.Number(),
      date: t.Date(),
    }),
    start: t.Date(),
    end: t.Date(),
  });
  export type getRevenueResponse = typeof getRevenueResponse.static;

  export const getTopRoute = t.Object({
    rangeType: t.UnionEnum(["day", "month", "year"]),
    start: t.Date(),
    end: t.Date(),
  });
  export type getTopRoute = typeof getTopRoute.static;

  export const getTopRouteResponse = t.Object({
    data: t.Object({
      amount: t.Number(),
      date: t.Date(),
    }),
    start: t.Date(),
    end: t.Date(),
  });
  export type getTopRouteResponse = typeof getTopRouteResponse.static;
}
