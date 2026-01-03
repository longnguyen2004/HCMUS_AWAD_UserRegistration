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
  Bus,
} from "../../db/models/index.js";
import { EmailService } from "../email/email.service.js";
import { status } from "elysia";
import { PayOS } from "@payos/node";
import { env } from "../../lib/env.js";
import { EmailModel } from "../email/email.model.js";
import PDFDocument from "pdfkit";

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
    const countInclude: IncludeOptions[] = [];

    if (body.price) where.price = body.price;
    if (body.status) where.status = body.status;
    if (body.phone) where.phone = body.phone;
    if (body.email) where.email = body.email;

    // Build Trip include with conditional where clause for counting
    const tripWhere: WhereOptions = {};
    const whereClauses: ReturnType<typeof literal>[] = [];

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

        tripWhere.departure = {
          [Op.between]: [start.toISOString(), end.toISOString()],
        };
      }
    }

    if (body.from && body.to) {
      whereClauses.push(literal(`
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
    `));
    }

    // Combine where clauses
    const finalTripWhere = whereClauses.length > 0 
      ? { [Op.and]: [...whereClauses, tripWhere] }
      : tripWhere;

    // Include Trip for counting (without nested includes to avoid inflating count)
    countInclude.push({
      model: Trip,
      as: "trip",
      where: Object.keys(finalTripWhere).length > 0 ? finalTripWhere : undefined,
      attributes: [], // Don't select any attributes for counting
      required: body.from && body.to ? true : false,
    });

    // First query: Get count and IDs
    const countResult = await Ticket.findAndCountAll({
      where,
      include: countInclude,
      attributes: ['id'],
      distinct: true,
      col: 'id',
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

    // Extract ticket IDs
    const ticketIds = countResult.rows.map(t => t.id);

    // Second query: Fetch full ticket data with all joins
    const tickets = ticketIds.length > 0 
      ? await Ticket.findAll({
          where: { id: { [Op.in]: ticketIds } },
          include: [
            {
              model: Trip,
              as: "trip",
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
            },
          ],
          order: [
            [
              "createdAt",
              body?.order && String(body.order).toUpperCase() === "ASC"
                ? "ASC"
                : "DESC",
            ],
          ],
        })
      : [];

    type TicketRow = Ticket & { trip?: Trip; createdAt?: Date };

    const data = tickets.map((t: TicketRow) => {
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
      total: countResult.count as number,
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

  static async get(id: string): Promise<TicketModel.getResponse> {
    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Trip,
          as: "trip",
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
        },
        { model: Seat, as: "seat", include: [{ model: Bus, as: "bus" }] },
      ],
    });

    if (!ticket) throw status(404, { message: "Ticket not found" });

    const sortedStops = (ticket.trip?.tripBusStops || []).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    const createdAt = ticket.get("createdAt") as Date;

    return {
      id: ticket.id,
      status: ticket.status,
      price: ticket.price,
      email: ticket.email,
      phone: ticket.phone,
      seatNumber: ticket.seat?.seatNumber,
      busPlate: ticket.seat?.bus?.licensePlate,
      orderId: ticket.orderId ?? undefined,
      createdAt,
      trip: {
        id: ticket.tripId,
        departure: ticket.trip?.departure as Date,
        arrival: ticket.trip?.arrival as Date,
        fromCity: sortedStops.at(0)!.busStop.city.name,
        toCity: sortedStops.at(-1)!.busStop.city.name,
      },
    } satisfies TicketModel.getResponse;
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
      await TicketService.sendEmailTicket(ticket.id);
    } else {
      throw status(400, { message: body.data.desc });
    }

    return { id: ticket.id };
  }

  static async sendEmailTicket(id: string) {
    try {
      const ticket = await Ticket.findByPk(id);
      if (!ticket) throw status(404, { message: "Ticket not found" });

      const recipient = ticket.email;
      if (!recipient)
        throw status(400, { message: "Ticket has no email address" });

      const pdf = await TicketService.createPdf(id);

      const mailBody = {
        email: recipient,
        subject: `Your TravelHub Ticket ${ticket.id}`,
        text: `Thank you for booking with TravelHub.`,
        filename: pdf.filename,
        content: Buffer.from(pdf.content).toString("base64"),
      };

      const info = await EmailService.sendMail(mailBody as EmailModel.sendBody);
      return { ok: true, info };
    } catch (err) {
      if (err && typeof err === "object" && "status" in err) throw err;
      throw status(500, { message: String(err) });
    }
  }
  static async createPdf(id: string): Promise<TicketModel.createPdfResponse> {
    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Trip,
          as: "trip",
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
        },
        { model: Seat, as: "seat", include: [{ model: Bus, as: "bus" }] },
      ],
    });
    if (!ticket) throw status(404, { message: "Ticket not found" });
    let fromCity: string | undefined = undefined;
    let toCity: string | undefined = undefined;
    const t = ticket.trip as unknown as
      | {
          tripBusStops?: Array<{ busStop?: { city?: { name?: string } } }>;
          departure?: Date;
          arrival?: Date;
        }
      | undefined;
    if (t?.tripBusStops && t.tripBusStops.length > 0) {
      const first = t.tripBusStops[0];
      const last = t.tripBusStops[t.tripBusStops.length - 1];
      fromCity = first?.busStop?.city?.name;
      toCity = last?.busStop?.city?.name;
    }

    const body = {
      ticketId: ticket.id,
      passengerName: undefined,
      tripId: ticket.tripId,
      licensePlate: ticket.seat.bus.licensePlate,
      seat: ticket.seat?.seatNumber,
      departure: ticket.trip?.departure?.toISOString(),
      arrival: ticket.trip?.arrival?.toISOString(),
      fromCity,
      toCity,
      price: ticket.price,
      orderId: ticket.orderId,
    };
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A6", margin: 20 });
        const chunks: Uint8Array[] = [];

        const pad = (n: number) => String(n).padStart(2, "0");
        const formatDate = (iso?: string) => {
          if (!iso) return undefined;
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return undefined;
          const day = pad(d.getDate());
          const month = pad(d.getMonth() + 1);
          const year = String(d.getFullYear());
          const hours = pad(d.getHours());
          const minutes = pad(d.getMinutes());
          const seconds = pad(d.getSeconds());
          return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        };

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const result = Buffer.concat(chunks);
          const filename = `ticket-${id}.pdf`;
          resolve({ filename, content: result.buffer });
        });

        doc.fontSize(20).text("TravelHub - Ticket", { align: "center" });
        doc.moveDown();

        doc.fontSize(10).text(`Ticket ID: ${body.ticketId}`);
        if (body.orderId) doc.text(`Order ID: ${body.orderId}`);
        if (body.passengerName) doc.text(`Passenger: ${body.passengerName}`);
        if (body.licensePlate)
          doc.text(`Bus license plate: ${body.licensePlate}`);
        if (body.seat) doc.text(`Seat: ${body.seat}`);
        if (body.tripId) doc.text(`Trip ID: ${body.tripId}`);
        if (body.fromCity) doc.text(`From: ${body.fromCity}`);
        if (body.toCity) doc.text(`To: ${body.toCity}`);
        if (body.departure)
          doc.text(`Departure: ${formatDate(body.departure)}`);
        if (body.arrival) doc.text(`Arrival: ${formatDate(body.arrival)}`);
        if (body.price !== undefined) doc.text(`Price: ${body.price}`);

        doc.moveDown();
        doc.text("Thank you for booking with TravelHub.");

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
