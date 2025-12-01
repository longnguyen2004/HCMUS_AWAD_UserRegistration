import type { TripModel } from "./trip.model.js";
import { Trip } from "../../db/models/trip.model.js";
import { BusStop } from "../../db/models/busstop.model.js";
import { City } from "../../db/models/city.model.js";
import { Route } from "../../db/models/route.model.js";
import { Op, type WhereOptions } from "sequelize";

const TRIP_PER_PAGE = 2;

export abstract class TripService {
  static async search(body: TripModel.searchBody) {
    const page = body.page ?? 1;
    const limit = TRIP_PER_PAGE;
    const offset = (page - 1) * limit;

    const tripWhere: WhereOptions = {};
    if (body.departure) {
      const dep = new Date(body.departure);
      const startOfDay = new Date(dep);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dep);
      endOfDay.setHours(23, 59, 59, 999);
      tripWhere.departure = { [Op.between]: [startOfDay, endOfDay] };
    }

    const result = await Trip.findAndCountAll({
      where: tripWhere,
      include: [
        {
          model: Route,
          as: "route",
          required: true,
          include: [
            {
              model: BusStop,
              as: "from",
              required: true,
              include: [
                {
                  model: City,
                  required: true,
                  where: { id: body.from },
                },
              ],
            },
            {
              model: BusStop,
              as: "to",
              required: true,
              include: [
                {
                  model: City,
                  required: true,
                  where: { id: body.to },
                },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["departure", "ASC"]],
    });

    const data = result.rows.map((t: Trip) => {
      const route = t.route;
      const from = route?.from;
      const to = route?.to;
      return {
        id: t.id,
        departure: t.departure,
        arrival: t.arrival,
        price: t.price,
        from: {
          id: from?.id ?? "",
          name: from?.name ?? "",
          city: { id: from?.city?.id ?? "", name: from?.city?.name ?? "" },
        },
        to: {
          id: to?.id ?? "",
          name: to?.name ?? "",
          city: { id: to?.city?.id ?? "", name: to?.city?.name ?? "" },
        },
      };
    });

    return {
      data,
      total: result.count,
      page,
      perPage: limit,
    } satisfies TripModel.searchResponse;
  }

  static async create(
    body: TripModel.createBody,
  ): Promise<TripModel.createBodyResponse> {
    const route = await Route.findByPk(body.routeId, {
      include: [
        { model: BusStop, as: "from", include: [City] },
        { model: BusStop, as: "to", include: [City] },
      ],
    });

    if (!route)
      throw new Response(JSON.stringify({ message: "Route not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });

    type TripCreatePayload = {
      routeId: string;
      departure: Date;
      arrival: Date;
      price?: number;
      status?: string;
    };

    const payload: TripCreatePayload = {
      routeId: route.id,
      departure: body.departure,
      arrival: body.arrival,
      price: body.price ?? undefined,
      status: body.status ?? undefined,
    };
    
    const trip = await Trip.create(payload);

    const from = route.from;
    const to = route.to;

    const resp: TripModel.createBodyResponse = {
      id: trip.id,
      routeId: route.id,
      departure: trip.departure,
      arrival: trip.arrival,
      price: trip.price ?? undefined,
      status: trip.status ?? undefined,
      from: {
        id: from?.id ?? "",
        name: from?.name ?? "",
        city: { id: from?.city?.id ?? "", name: from?.city?.name ?? "" },
      },
      to: {
        id: to?.id ?? "",
        name: to?.name ?? "",
        city: { id: to?.city?.id ?? "", name: to?.city?.name ?? "" },
      },
    };

    return resp;
  }
}
