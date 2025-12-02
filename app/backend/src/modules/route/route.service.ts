import { Route } from "../../db/models/route.model.js";
import type { RouteModel } from "./route.model.js";
import type { WhereOptions } from "sequelize";

const ROUTES_PER_PAGE = 2;

export abstract class RouteService {
  static async create(body: RouteModel.createBody): Promise<RouteModel.createBodyResponse> {
    if (!Array.isArray(body.stops) || body.stops.length < 2) {
      throw new Response(JSON.stringify({ message: "stops must contain at least 2 stops" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const route = await Route.create({ tripId: body.tripId, stops: body.stops });

    return { id: route.id, tripId: route.tripId ?? undefined, stops: (route.stops as unknown as string[]) || [] };
  }

  static async search(body: RouteModel.searchBody): Promise<RouteModel.searchBodyResponse> {
    const page = body.page ?? 1;
    const limit = ROUTES_PER_PAGE;
    const offset = (page - 1) * limit;

    const where: WhereOptions = {};
    if (body.tripId) where.tripId = body.tripId;

    const result = await Route.findAndCountAll({ where, limit, offset });
    console.log(result)

    const data = result.rows.map((r) => ({ id: r.id, tripId: r.tripId ?? undefined, stops: (r.stops as unknown as string[]) || [] }));

    return { data, total: result.count, page, perPage: limit };
  }
}
