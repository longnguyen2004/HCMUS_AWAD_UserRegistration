import type { TicketModel } from "./ticket.model.js";
import { User } from "../../db/models/user.model.js";
import { Ticket } from "../../db/models/ticket.model.js";
import { WhereOptions, IncludeOptions, Op, literal } from "sequelize";
import { Trip } from "../../db/models/trip.model.js";
import { TripBusStop } from "../../db/models/tripbusstop.model.js";
import { BusStop } from "../../db/models/busstop.model.js";
import { City } from "../../db/models/city.model.js";
import { Seat } from "../../db/models/seat.model.js";

const TICKET_PER_PAGE = 5;

export abstract class TicketService {
  static async search(body: TicketModel.searchBody) {
    const page = body.page ?? 1;
    const limit = TICKET_PER_PAGE;
    const offset = (page - 1) * limit;

    const where: WhereOptions = {};
    const include: IncludeOptions[] = [];

    if (body.price) where.price = body.price;
    if (body.status) where.status = body.status;
    if (body.phone) where.phone = body.phone;
    if (body.email) where.email = body.email;

    if (body.departure) {
      const parsed = new Date(String(body.departure));
      if (!Number.isNaN(parsed.getTime())) {
        const start = new Date(
          Date.UTC(
            parsed.getUTCFullYear(),
            parsed.getUTCMonth(),
            parsed.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
        const end = new Date(
          Date.UTC(
            parsed.getUTCFullYear(),
            parsed.getUTCMonth(),
            parsed.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        );

        include.push({
          model: Trip,
          as: "trip",
          where: {
            departure: {
              [Op.between]: [start.toISOString(), end.toISOString()],
            },
          },
          required: false,
        });
      }
    }

    if (body.from && body.to) {
      include.push({
        model: Trip,
        as: "trip",
        where: literal(`
      EXISTS (
        SELECT 1 
        FROM "TripBusStops" tbs1
        INNER JOIN "BusStops" bs1 ON tbs1."busStopId" = bs1.id
        WHERE tbs1."tripId" = "Ticket"."tripId" 
          AND bs1."cityId" = '${body.from}'
          AND tbs1."order" < (
            SELECT MIN(tbs2."order")
            FROM "TripBusStops" tbs2
            INNER JOIN "BusStops" bs2 ON tbs2."busStopId" = bs2.id
            WHERE tbs2."tripId" = "Ticket"."tripId" 
              AND bs2."cityId" = '${body.to}'
          )
      )
    `),
        include: [
          {
            model: TripBusStop,
            as: "tripBusStops",
            include: [
              {
                model: BusStop,
                as: "busStop",
                include: [{ model: City, as: "city" }],
              },
            ],
          },
        ],
        required: true,
      });
    }

    const result = await Ticket.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [
        [
          "createdAt",
          body?.order && String(body.order).toUpperCase() === "ASC"
            ? "ASC"
            : "DESC",
        ],
      ],
    });

    type TicketRow = Ticket & { trip?: Trip; user?: User; createdAt?: Date };

    const data = result.rows.map((t: TicketRow) => {
      const trip = t.trip;
      const user = t.user;
      const departure = trip?.departure ?? trip?.departure ?? undefined;
      const arrival = trip?.arrival ?? trip?.arrival ?? undefined;
      return {
        id: t.id,
        tripId: t.tripId,
        seatId: t.seatId,
        email: t.email ?? user?.email ?? "",
        phone: t.phone ?? user?.phone ?? "",
        departure,
        arrival,
        price: t.price,
        status: t.status,
        createAt: t.createdAt,
      };
    });

    return {
      data,
      total: result.count as number,
      page,
      per_page: limit,
    } as unknown as TicketModel.searchResponse;
  }

  static async create(
    body: TicketModel.createBody,
  ): Promise<TicketModel.createResponse> {
    const trip = await Trip.findByPk(body.tripId);
    if (!trip) throw new Error("Trip not found");

    const seat = await Seat.findByPk(body.seatId);
    if (!seat) throw new Error("Seat not found");

    const seatTaken = await Ticket.findOne({
      where: { tripId: body.tripId, seatId: body.seatId },
    });
    if (seatTaken) throw new Error("Seat already booked");

    const isUserBooking = "userId" in body;
    const isGuestBooking = "email" in body && "phone" in body;

    const payload: {
      status: string;
      tripId: typeof body.tripId;
      seatId: typeof body.seatId;
      price: typeof trip.price;
      userId: string | null;
      email: string | null;
      phone: string | null;
    } = {
      status: "pending",
      tripId: body.tripId,
      seatId: body.seatId,
      price: trip.price,
      userId: null,
      email: null,
      phone: null,
    };

    if (isUserBooking) {
      const user = await User.findByPk(body.userId);
      if (!user) throw new Error("User not found");

      payload.userId = user.id;
      payload.email = user.email;
      payload.phone = user.phone;
    } else if (isGuestBooking) {
      payload.email = body.email;
      payload.phone = body.phone;
    }

    const ticket = await Ticket.create(payload);

    return { id: ticket.id };
  }
}
