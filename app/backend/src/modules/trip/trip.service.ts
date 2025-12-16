import type { TripModel } from "./trip.model.js";
import {
  Trip,
  BusStop,
  Bus,
  Seat,
  City,
  TripBusStop,
  Ticket,
} from "../../db/models/index.js";
import { db } from "../../db/db.js";
import { literal, Op } from "sequelize";
import { status } from "elysia";

const TRIP_PER_PAGE = 2;

export abstract class TripService {
  static async search(body: TripModel.searchBody) {
    const page = body.page ?? 1;
    const limit = TRIP_PER_PAGE;
    const offset = (page - 1) * limit;

    const { count, rows: trips } = await Trip.findAndCountAll({
      attributes: ["id", "departure"],
      where: literal(`
      EXISTS (
        SELECT 1 
        FROM "TripBusStops" tbs1
        INNER JOIN "BusStops" bs1 ON tbs1."busStopId" = bs1.id
        WHERE tbs1."tripId" = "Trip".id 
          AND bs1."cityId" = '${body.from}'
          AND tbs1."order" < (
            SELECT MIN(tbs2."order")
            FROM "TripBusStops" tbs2
            INNER JOIN "BusStops" bs2 ON tbs2."busStopId" = bs2.id
            WHERE tbs2."tripId" = "Trip".id 
              AND bs2."cityId" = '${body.to}'
          )
      )
    `),
      order: [["departure", "ASC"]],
      limit,
      offset,
    });

    if (trips.length === 0) {
      return {
        data: [],
        total: count,
        page: Math.ceil(count / limit),
        per_page: limit,
      } satisfies TripModel.searchResponse;
    }

    const tripsWithRoute = await Trip.findAll({
      where: {
        id: {
          [Op.in]: trips.map((t) => t.id),
        },
      },
      include: [
        {
          model: TripBusStop,
          as: "tripBusStops",
          include: [
            {
              model: BusStop,
              as: "busStop",
              include: [
                {
                  model: City,
                  as: "city",
                },
              ],
            },
          ],
        },
        {
          model: Bus,
          as: "bus",
          attributes: ["id"],
          include: [
            {
              model: Seat,
              as: "seats",
              attributes: ["id"],
            },
          ],
        },
      ],
      order: [
        ["departure", "ASC"],
        [{ model: TripBusStop, as: "tripBusStops" }, "order", "ASC"],
      ],
    });
    const prettyTrips = tripsWithRoute.map((trip) => ({
      id: trip.id,
      departure: trip.departure,
      arrival: trip.arrival,
      price: trip.price,
      stops: trip.tripBusStops.map((el) => ({
        id: el.busStopId,
        name: el.busStop.name,
        order: el.order,
        duration: el.duration,
      })),
      capacity: trip.bus?.seats?.length ?? 0,
    }));
    return {
      data: prettyTrips,
      total: count,
      page,
      per_page: limit,
    } satisfies TripModel.searchResponse;
  }

  static async get(body: TripModel.getBody): Promise<TripModel.getResponse> {
    const trip = await Trip.findOne({
      where: {
        id: body.id,
      },
      include: [
        {
          model: TripBusStop,
          as: "tripBusStops",
          include: [
            {
              model: BusStop,
              as: "busStop",
              include: [
                {
                  model: City,
                  as: "city",
                },
              ],
            },
          ],
        },
        {
          model: Bus,
          as: "bus",
          include: [
            {
              model: Seat,
              as: "seats",
            },
          ],
        },
      ],
      order: [[{ model: TripBusStop, as: "tripBusStops" }, "order", "ASC"]],
    });
    if (!trip)
      throw status(404, { message: "Not found" } satisfies TripModel.notFound);
    return {
      id: trip.id,
      departure: trip.departure,
      price: trip.price,
      stops: trip.tripBusStops.map((el) => ({
        id: el.busStopId,
        name: el.busStop.name,
        order: el.order,
        duration: el.duration,
      })),
      bus: !trip.bus
        ? undefined
        : {
            id: trip.bus.id,
            seats: trip.bus.seats.map((el) => ({
              id: el.id,
              label: el.seatNumber,
              row: el.row,
              col: el.col,
            })),
          },
    };
  }

  static async getSeatsOccupied(
    body: TripModel.getSeatsOccupiedBody,
  ): Promise<TripModel.getSeatsOccupiedResponse> {
    const seats = await Ticket.findAll({
      attributes: ["seatId"],
      where: {
        tripId: body.id,
      },
    });
    return seats.map(
      (el) => el.seatId,
    ) satisfies TripModel.getSeatsOccupiedResponse;
  }

  static async create(
    body: TripModel.createBody,
  ): Promise<TripModel.createResponse> {
    if (body.busId) {
      const bus = await Bus.findByPk(body.busId);
      if (!bus) throw status(400, { message: "Bus not found" });
    }

    const payload = {
      busId: body.busId,
      departure: body.departure,
      price: body.price ?? undefined,
      status: body.status ?? undefined,
    };

    const result = await db.transaction(async (t) => {
      const trip = await Trip.create(payload, { transaction: t });
      await TripBusStop.bulkCreate(
        body.stops.map((stop, i) => ({
          tripId: trip.id,
          busStopId: stop,
          order: i + 1,
          duration: i == 0 ? null : stop.duration
        })),
        { transaction: t },
      );
      return trip.id;
    });

    return { id: result };
  }

  static async edit(
    id: string,
    body: TripModel.createBody,
  ): Promise<TripModel.createResponse> {
    const trip = await Trip.findByPk(id);
    if (!trip) throw status(404, { message: "Trip not found" });

    if (body.busId) {
      const bus = await Bus.findByPk(body.busId);
      if (!bus) throw status(400, { message: "Bus not found" });
    }

    const payload = {
      busId: body.busId,
      departure: body.departure,
      price: body.price ?? undefined,
      status: body.status ?? undefined,
    };

    const result = await db.transaction(async (t) => {
      await trip.update(payload, { transaction: t });
      
      // Delete existing trip bus stops
      await TripBusStop.destroy({
        where: { tripId: trip.id },
        transaction: t,
      });
      
      // Create new trip bus stops
      await TripBusStop.bulkCreate(
        body.stops.map((stop, i) => ({
          tripId: trip.id,
          busStopId: stop.id,
          order: i + 1,
          duration: i == 0 ? null : stop.duration
        })),
        { transaction: t },
      );
      
      return trip.id;
    });

    return { id: result };
  }
}
