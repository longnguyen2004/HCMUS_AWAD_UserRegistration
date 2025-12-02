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
      limit,
      offset,
      order: [["departure", "ASC"]],
    });

    const trips = result.rows as Trip[];
    const tripIds = trips.map((t) => t.id);

    const routes = await Route.findAll({ where: { tripId: tripIds } });
    const routesByTrip: Record<string, Route[]> = {};
    for (const r of routes) {
      if (!r.tripId) continue;
      routesByTrip[r.tripId] = routesByTrip[r.tripId] || [];
      routesByTrip[r.tripId].push(r);
    }

    const allStopIds = new Set<string>();
    for (const r of routes) {
      const s = (r.stops as unknown as string[]) || [];
      for (const id of s) allStopIds.add(id);
    }

    const stopIdsArray = Array.from(allStopIds);
    const busStops = stopIdsArray.length
      ? await BusStop.findAll({ where: { id: stopIdsArray }, include: [City] })
      : [];
    type BusStopMapItem = { id: string; name: string; city?: { id: string; name: string } | null };
    const busStopMap: Record<string, BusStopMapItem> = {};
    for (const b of busStops) {
      busStopMap[b.id] = {
        id: b.id,
        name: b.name,
        city: b.city ? { id: b.city.id ?? "", name: b.city.name ?? "" } : undefined,
      };
    }

    const data: TripModel.searchResponse["data"] = [];

    for (const t of trips) {
      const candidateRoutes = routesByTrip[t.id] || [];
      let matched = false;
      for (const r of candidateRoutes) {
        const sids = (r.stops as unknown as string[]) || [];
        const stops = sids.map((id) => busStopMap[id]).filter(Boolean);
        if (!stops.length) continue;

        const first = stops[0];
        const last = stops[stops.length - 1];
        if (!first || !last) continue;
        if (body.from && first.city?.id !== body.from) continue;
        if (body.to && last.city?.id !== body.to) continue;

        const from = first;
        const to = last;

        data.push({
          id: t.id,
          departure: t.departure,
          arrival: t.arrival,
          price: t.price,
          from: {
            id: from.id ?? "",
            name: from.name ?? "",
            city: { id: from.city?.id ?? "", name: from.city?.name ?? "" },
          },
          to: {
            id: to.id ?? "",
            name: to.name ?? "",
            city: { id: to.city?.id ?? "", name: to.city?.name ?? "" },
          },
        });
        matched = true;
        break;
      }
      if (!matched && !body.from && !body.to && candidateRoutes.length) {
        const r = candidateRoutes[0];
        const sids = (r.stops as unknown as string[]) || [];
        const stops = sids.map((id) => busStopMap[id]).filter(Boolean);
        const from = stops[0];
        const to = stops[stops.length - 1];
        if (from && to) {
          data.push({
            id: t.id,
            departure: t.departure,
            arrival: t.arrival,
            price: t.price,
            from: {
              id: from.id ?? "",
              name: from.name ?? "",
              city: { id: from.city?.id ?? "", name: from.city?.name ?? "" },
            },
            to: {
              id: to.id ?? "",
              name: to.name ?? "",
              city: { id: to.city?.id ?? "", name: to.city?.name ?? "" },
            },
          });
        }
      }
    }

    return {
      data,
      total: result.count as number,
      page,
      perPage: limit,
    } satisfies TripModel.searchResponse;
  }

  static async create(
    body: TripModel.createBody,
  ): Promise<TripModel.createBodyResponse> {
    let route: Route | null = null;
    let respFrom: BusStop | null = null;
    let respTo: BusStop | null = null;
    if (body.routeId) {
      route = await Route.findByPk(body.routeId);
      if (!route)
        throw new Response(JSON.stringify({ message: "Route not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });

      const sids = (route.stops as unknown as string[]) || [];
      if (sids.length) {
        const needed = [sids[0], sids[sids.length - 1]].filter(Boolean);
        const stops = await BusStop.findAll({
          where: { id: needed },
          include: [City],
        });
        const map: Record<string, BusStop | undefined> = {};
        for (const b of stops) map[b.id] = b;
        respFrom = map[sids[0]] ?? null;
        respTo = map[sids[sids.length - 1]] ?? null;
      }
    }

    const payload = {
      departure: body.departure,
      arrival: body.arrival,
      price: body.price ?? undefined,
      status: body.status ?? undefined,
    };

    const trip = await Trip.create(payload);

    if (route) {
      route.tripId = trip.id;
      await route.save();
    }

    const from = respFrom;
    const to = respTo;

    const resp: TripModel.createBodyResponse = {
      id: trip.id,
      routeId: route?.id ?? "",
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
