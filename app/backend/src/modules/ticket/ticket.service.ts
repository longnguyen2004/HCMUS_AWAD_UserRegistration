import type { TicketModel } from "./ticket.model.js";
import {
  WhereOptions,
  IncludeOptions,
  Op,
  literal,
  ValidationError,
} from "sequelize";
import {
  Ticket,
  Trip,
  TripBusStop,
  BusStop,
  City,
  Seat,
} from "../../db/models/index.js";
import { status } from "elysia";
import { PayOS } from "@payos/node";
import { env } from "../../lib/env.js";

const TICKET_PER_PAGE = 5;

const payOS = new PayOS({
  clientId: env.PAYOS_CLIENT_ID,
  apiKey: env.PAYOS_API_KEY,
  checksumKey: env.PAYOS_CHECKSUM_KEY,
});

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

    type TicketRow = Ticket & { trip?: Trip; createdAt?: Date };

    const data = result.rows.map((t: TicketRow) => {
      const trip = t.trip;
      const departure = trip?.departure ?? trip?.departure ?? undefined;
      const arrival = trip?.arrival ?? trip?.arrival ?? undefined;
      return {
        id: t.id,
        tripId: t.tripId,
        seatId: t.seatId,
        email: t.email,
        phone: t.phone,
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
    } as TicketModel.searchResponse;
  }

  static async create(
    body: TicketModel.createBody,
  ): Promise<TicketModel.createResponse> {
    const trip = await Trip.findByPk(body.tripId);
    if (!trip) throw new Error("Trip not found");

    const seat = await Seat.findOne({
      where: {
        id: body.seatId,
        busId: trip.busId,
      },
    });
    if (!seat) throw new Error("Seat not found");

    const seatTaken = await Ticket.findOne({
      where: { tripId: body.tripId, seatId: body.seatId },
    });
    if (seatTaken) throw new Error("Seat already booked");

    const payload = {
      status: "pending",
      tripId: body.tripId,
      seatId: body.seatId,
      price: trip.price,
      userId: body.userId ?? null,
      email: body.email,
      phone: body.phone,
    };

    const ticket = await Ticket.create(payload);

    return { id: ticket.id };
  }

  static async modify(
    id: string,
    body: TicketModel.modifyBody,
  ): Promise<TicketModel.modifyResponse> {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw status(404, "Ticket not found");

    try {
      ticket.status = body.status;
      await ticket.save();
      return { id: ticket.id };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw status(400, { message: error.errors.map((e) => e.message) });
      }
      throw status(400, { message: (error as Error).message });
    }
  }

  static async initPayment(id: string): Promise<TicketModel.initPayResponse> {
    const YOUR_DOMAIN = env.FE_HOST;
    const orderCode = Math.floor(100000000 + Math.random() * 900000000);

    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw status(404, { message: "Ticket not found" });

    const body = {
      orderCode,
      amount: ticket.price,
      description: `Payment for trip ticket.`,
      returnUrl: `${YOUR_DOMAIN}`,
      cancelUrl: `${YOUR_DOMAIN}`,
    };

    try {
      const paymentLinkResponse = await payOS.paymentRequests.create(body);

      ticket.orderId = orderCode;
      await ticket.save();

      return { paymentLinkResponse };
    } catch (error) {
      throw status(400, { message: (error as Error).message });
    }
  }

  static async processPayment(
    body: TicketModel.processPaymentBody,
  ): Promise<TicketModel.modifyResponse> {
    const orderCode = Number(body.data.orderCode);
    const ticket = await Ticket.findOne({ where: { orderId: orderCode } });
    if (!ticket) throw status(404, { message: "Ticket not found" });

    if (body.success) {
      ticket.status = "booked";
      await ticket.save();
    } else {
      throw status(400, { message: body.data.desc });
    }

    return { id: ticket.id };
  }
}
