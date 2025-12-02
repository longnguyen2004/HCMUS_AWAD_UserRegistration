import type { TripModel } from "./trip.model.js";
import { Trip } from "../../db/models/trip.model.js";
import { BusStop } from "../../db/models/busstop.model.js";
import { City } from "../../db/models/city.model.js";
import { TripBusStop } from "../../db/models/tripbusstop.model.js";
import { db } from "../../db/db.js";
import { literal, Op } from "sequelize";

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
      limit, offset,
    });

    if (trips.length === 0) {
      return {
        data: [],
        total: count,
        page: Math.ceil(count / limit),
        per_page: limit
      } satisfies TripModel.searchResponse
    }

    const tripsWithRoute = await Trip.findAll({
      where: {
        id: {
          [Op.in]: trips.map(t => t.id)
        }
      },
      include: [
        {
          model: TripBusStop,
          as: 'tripBusStops',
          include: [
            {
              model: BusStop,
              as: 'busStop',
              include: [
                {
                  model: City,
                  as: 'city',
                }
              ]
            }
          ]
        }
      ],
      order: [
        ['departure', 'ASC'],
        [{ model: TripBusStop, as: 'tripBusStops' }, 'order', 'ASC']
      ]
    });

    const prettyTrips = tripsWithRoute.map(trip => ({
      id: trip.id,
      departure: trip.departure,
      arrival: trip.arrival,
      price: trip.price,
      stops: trip.tripBusStops.map(el => ({
        id: el.busStopId,
        name: el.busStop.name,
        order: el.order
      }))
    }))
    return {
      data: prettyTrips,
      total: count,
      page,
      per_page: limit
    } satisfies TripModel.searchResponse
  }

  static async create(
    body: TripModel.createBody,
  ): Promise<TripModel.createResponse> {
    const payload = {
      departure: body.departure,
      arrival: body.arrival,
      price: body.price ?? undefined,
      status: body.status ?? undefined,
    };
    const result = await db.transaction(async t => {
      const trip = await Trip.create(payload, { transaction: t });
      await TripBusStop.bulkCreate(
        body.stops.map((stop, i) => ({ tripId: trip.id, busStopId: stop, order: i + 1 }))
      );
      return trip.id;
    })

    return { id: result };
  }
}
