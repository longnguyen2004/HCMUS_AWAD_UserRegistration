import { ReportModel } from "./report.model.js";
import { Ticket } from "../../db/models/index.js";
import { QueryTypes } from "sequelize";

export abstract class ReportService {
  static async getRevenue(
    body: ReportModel.getRevenueBody,
  ): Promise<ReportModel.getRevenueResponse> {
    const { rangeType, dataType, start, end } = body;

    const trunc =
      rangeType === "day" ? "day" : rangeType === "month" ? "month" : "year";
    const aggExpr = dataType === "money" ? "SUM(t.price)" : "COUNT(t.*)";

    const sql = `
      WITH agg AS (
        SELECT date_trunc('${trunc}', t."updatedAt") as period,
               ${aggExpr} as amount
        FROM "Tickets" t
        WHERE t."updatedAt" >= :start AND t."updatedAt" <= :end AND t."status" = 'booked'
        GROUP BY date_trunc('${trunc}', t."updatedAt")
      )
      SELECT gs.period as date, COALESCE(a.amount, 0) as amount
      FROM generate_series(
        date_trunc('${trunc}', :start::timestamp),
        date_trunc('${trunc}', :end::timestamp),
        '1 ${trunc}'::interval
      ) AS gs(period)
      LEFT JOIN agg a ON a.period = gs.period
      ORDER BY gs.period ASC;
    `;

    type RawRow = { date: string | Date; amount: string | number };

    const raw = (await Ticket.sequelize!.query<RawRow>(sql, {
      replacements: { start, end },
      type: QueryTypes.SELECT,
    })) as RawRow[];

    const data: Array<{ date: Date; amount: number }> = raw.map((r) => ({
      date: r.date instanceof Date ? r.date : new Date(r.date),
      amount: typeof r.amount === "number" ? r.amount : Number(r.amount ?? 0),
    }));
    const total = data.reduce((s, d) => s + d.amount, 0);

    return {
      data,
      total,
      start: body.start,
      end: body.end,
    };
  }

  static async getTopRoute(
    body: ReportModel.getTopRouteBody,
  ): Promise<ReportModel.getTopRouteResponse> {
    const { dataType, start, end } = body;
    const order = body.order === "DESC" ? "DESC" : "ASC";

    const aggExpr = dataType === "money" ? "SUM(t.price)" : "COUNT(*)";

    const sql = `
      SELECT cf.name as "fromCity", ct.name as "toCity", ${aggExpr} as amount, MIN(t."updatedAt") as date
      FROM "Tickets" t
      JOIN "Trips" tr ON tr.id = t."tripId"
      LEFT JOIN LATERAL (
        SELECT "busStopId" FROM "TripBusStops" tbs WHERE tbs."tripId" = tr.id ORDER BY tbs."order" ASC LIMIT 1
      ) fs("busStopId") ON true
      LEFT JOIN LATERAL (
        SELECT "busStopId" FROM "TripBusStops" tbs WHERE tbs."tripId" = tr.id ORDER BY tbs."order" DESC LIMIT 1
      ) ls("busStopId") ON true
      LEFT JOIN "BusStops" bf ON bf.id = fs."busStopId"
      LEFT JOIN "Cities" cf ON cf.id = bf."cityId"
      LEFT JOIN "BusStops" bt ON bt.id = ls."busStopId"
      LEFT JOIN "Cities" ct ON ct.id = bt."cityId"
      WHERE t."status" = 'booked' AND t."updatedAt" >= :start AND t."updatedAt" <= :end
      GROUP BY cf.name, ct.name
      ORDER BY amount ${order}
      LIMIT 1;
    `;

    type RawRow = {
      fromCity: string | null;
      toCity: string | null;
      amount: string | number | null;
      date: string | Date | null;
    };

    const rows = (await Ticket.sequelize!.query<RawRow>(sql, {
      replacements: { start, end },
      type: QueryTypes.SELECT,
    })) as RawRow[];

    if (!rows || rows.length === 0) {
      return {
        data: {
          fromCity: "",
          toCity: "",
          amount: 0,
          date: body.start,
        },
        total: 0,
        order,
        start: body.start,
        end: body.end,
      };
    }

    const r = rows[0];
    const amount =
      typeof r.amount === "number"
        ? r.amount
        : r.amount !== null && r.amount !== undefined
          ? Number(r.amount)
          : 0;

    const data = {
      fromCity: r.fromCity ?? "",
      toCity: r.toCity ?? "",
      amount,
      date:
        r.date instanceof Date
          ? r.date
          : r.date
            ? new Date(r.date)
            : body.start,
    };

    return {
      data,
      total: data.amount,
      order,
      start: body.start,
      end: body.end,
    };
  }
}
