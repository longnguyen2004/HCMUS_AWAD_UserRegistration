import { Route } from "../../db/models/route.model.js";
import { RouteStop } from "../../db/models/routeStop.model.js";
import { BusStop } from "../../db/models/busstop.model.js";
import { City } from "../../db/models/city.model.js";
import type { RouteModel } from "./route.model.js";
import type { IncludeOptions } from "sequelize";

const ROUTES_PER_PAGE = 2;

export abstract class RouteService {
  static async create(
    body: RouteModel.createBody,
  ): Promise<RouteModel.createBodyResponse> {
    const route = await Route.create({ fromId: body.fromId, toId: body.toId });

    if (Array.isArray(body.stops) && body.stops.length) {
      const creations = body.stops.map((busStopId, idx) =>
        RouteStop.create({ routeId: route.id, busStopId, order: idx + 1 }),
      );
      await Promise.all(creations);
    }

    const loaded = await Route.findByPk(route.id, {
      include: [
        {
          model: RouteStop,
          include: [{ model: BusStop, include: [City] }],
          order: [[RouteStop, "order", "ASC"]],
        },
        { model: BusStop, as: "from", include: [City] },
        { model: BusStop, as: "to", include: [City] },
      ],
    });

    if (!loaded)
      throw new Response(JSON.stringify({ message: "Route not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });

    type StopResp = {
      order: number;
      busStop: { id: string; name: string; city: { id: string; name: string } };
    };

    const stops: StopResp[] = (loaded.stops || [])
      .map((s: RouteStop | unknown) => {
        const holder = s as unknown as { busStop?: BusStop; BusStop?: BusStop; order?: number };
        const bus = holder.busStop ?? holder.BusStop;
        if (!bus) return null;
        const city = bus.city
          ? { id: bus.city.id ?? "", name: bus.city.name ?? "" }
          : { id: "", name: "" };
        return {
          order: holder.order ?? 0,
          busStop: { id: bus.id ?? "", name: bus.name ?? "", city },
        } as StopResp;
      })
      .filter(Boolean) as StopResp[];
    const resp: RouteModel.createBodyResponse = {
      id: loaded.id,
      from: loaded.from
        ? {
            id: loaded.from.id ?? "",
            name: loaded.from.name ?? "",
            city: loaded.from.city
              ? { id: loaded.from.city.id ?? "", name: loaded.from.city.name ?? "" }
              : { id: "", name: "" },
          }
        : { id: "", name: "", city: { id: "", name: "" } },
      to: loaded.to
        ? {
            id: loaded.to.id ?? "",
            name: loaded.to.name ?? "",
            city: loaded.to.city
              ? { id: loaded.to.city.id ?? "", name: loaded.to.city.name ?? "" }
              : { id: "", name: "" },
          }
        : { id: "", name: "", city: { id: "", name: "" } },
      stops,
    };

    return resp;
  }

  static async search(
    body: RouteModel.searchBody,
  ): Promise<RouteModel.searchBodyResponse> {
    const page = body.page ?? 1;
    const limit = ROUTES_PER_PAGE;
    const offset = (page - 1) * limit;

    const routeStopInclude: IncludeOptions = {
      model: RouteStop,
      include: [{ model: BusStop, include: [{ model: City }] }],
      required: false,
    };

    const fromInclude: IncludeOptions = {
      model: BusStop,
      as: "from",
      include: [{ model: City }],
      required: false,
    };

    const toInclude: IncludeOptions = {
      model: BusStop,
      as: "to",
      include: [{ model: City }],
      required: false,
    };

    if (body.from) {
      fromInclude.required = true;
      const inner = fromInclude.include && (fromInclude.include[0] as IncludeOptions);
      if (inner) inner.where = { name: body.from };
    }

    if (body.to) {
      toInclude.required = true;
      const inner = toInclude.include && (toInclude.include[0] as IncludeOptions);
      if (inner) inner.where = { name: body.to };
    }

    const include: IncludeOptions[] = [routeStopInclude, fromInclude, toInclude];

    const result = await Route.findAndCountAll({
      include,
      limit,
      offset,
      order: [[RouteStop, "order", "ASC"]],
    });

    const data = result.rows.map((r: Route) => {
      const stops = (r.stops || [])
        .map((s: RouteStop | unknown) => {
          const holder = s as unknown as { busStop?: BusStop; BusStop?: BusStop; order?: number };
          const bus = holder.busStop ?? holder.BusStop;
          if (!bus) return null;
          const city = bus.city
            ? { id: bus.city.id ?? "", name: bus.city.name ?? "" }
            : { id: "", name: "" };
          return {
            order: holder.order ?? 0,
            busStop: { id: bus.id ?? "", name: bus.name ?? "", city },
          };
        })
        .filter(Boolean) as {
        order: number;
        busStop: {
          id: string;
          name: string;
          city: { id: string; name: string };
        };
      }[];

      const from = r.from
        ? {
            id: r.from.id ?? "",
            name: r.from.name ?? "",
            city: r.from.city
              ? { id: r.from.city.id ?? "", name: r.from.city.name ?? "" }
              : { id: "", name: "" },
          }
        : undefined;
      const to = r.to
        ? {
            id: r.to.id ?? "",
            name: r.to.name ?? "",
            city: r.to.city
              ? { id: r.to.city.id ?? "", name: r.to.city.name ?? "" }
              : { id: "", name: "" },
          }
        : undefined;

      return {
        id: r.id,
        from,
        to,
        stops,
      };
    });

    return {
      data,
      total: result.count,
      page,
      perPage: limit,
    };
  }
}
