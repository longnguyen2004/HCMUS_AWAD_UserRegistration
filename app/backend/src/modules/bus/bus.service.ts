import { Seat } from "../../db/models/seat.model.js";
import { Bus } from "../../db/models/bus.model.js";
import { db } from "../../db/db.js";
import { BusModel } from "./bus.model.js";
import { UniqueConstraintError } from "sequelize";
import { status } from "elysia";
import cloudinaryService from "../../lib/cloudinary.js";

const BUS_PER_PAGE = 5;

export abstract class BusService {
  static async create(
    body: BusModel.createBody,
  ): Promise<BusModel.createResponse> {
    const payload = {
      licensePlate: body.licensePlate,
      model: body.model,
      capacity: body.row * body.col,
      body: body.status,
    };

    const transaction = await db.transaction();
    try {
      const bus = await Bus.create(payload, { transaction });

      type SeatPayload = {
        busId: string;
        seatNumber: string;
        type: string;
        row: number;
        col: number;
      };

      const seatsToCreate: SeatPayload[] = [];

      for (let r = 0; r < body.row; r++) {
        for (let c = 0; c < body.col; c++) {
          const colLetter = String.fromCharCode(65 + c);
          const seatNumber = `${colLetter}${r + 1}`;
          seatsToCreate.push({
            busId: bus.id,
            seatNumber,
            type: "regular",
            row: r,
            col: c,
          });
        }
      }

      const createdSeats = await Seat.bulkCreate(seatsToCreate, {
        returning: true,
        transaction,
      });

      await transaction.commit();

      return {
        id: bus.id,
        seat: createdSeats.map((s) => ({
          id: s.id,
          seatNumber: s.seatNumber,
          row: s.row,
          col: s.col,
        })),
      };
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw status(409, { error: "Duplicate", details: err.errors });
      }
      throw status(500, {
        error: "Internal server error",
        details: String(err),
      });
    }
  }
  static async getAll(
    query?: Partial<BusModel.getAllQuery>,
  ): Promise<BusModel.getAllResponse> {
    const page = query?.page ?? 1;
    const limit = BUS_PER_PAGE;
    const offset = (page - 1) * limit;
    const { count, rows } = await Bus.findAndCountAll({
      order: [["licensePlate", "ASC"]],
      limit,
      offset,
    });

    const data = rows.map((b) => ({
      id: b.id,
      licensePlate: b.licensePlate,
      model: b.model,
      capacity: b.capacity,
      status: b.status,
    }));

    return {
      data,
      total: count,
      page,
      per_page: limit,
    };
  }

  static async getOne(id: string): Promise<BusModel.getOneResponse> {
    const bus = await Bus.findByPk(id, {
      include: [
        {
          model: Seat,
          as: "seats",
        },
      ],
      order: [
        [{ model: Seat, as: "seats" }, "row", "ASC"],
        [{ model: Seat, as: "seats" }, "col", "ASC"],
      ],
    });

    if (!bus) throw status(404, { error: "Not found" });

    return {
      id: bus.id,
      licensePlate: bus.licensePlate,
      model: bus.model,
      capacity: bus.capacity,
      status: bus.status,
      seats: (bus.seats || []).map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
      })),
    };
  }

  static async modify(
    id: string,
    body: BusModel.modifyBody,
  ): Promise<BusModel.modifyResponse> {
    try {
      const bus = await Bus.findByPk(id);
      if (!bus) {
        throw status(404, { error: "Not found" });
      }

      await db.transaction(async (tx) => {
        const updates: Partial<Record<string, unknown>> = {};
        if (body.licensePlate) updates.licensePlate = body.licensePlate;
        if (body.model) updates.model = body.model;
        if (body.status) updates.status = body.status;

        await bus.update(updates, { transaction: tx });

        if (body.seats) {
          for (const seat of body.seats) {
            await Seat.update(
              { seatNumber: seat.seatNumber, row: seat.row, col: seat.col },
              { where: { id: seat.id, busId: id }, transaction: tx },
            );
          }
        }
      });

      const updated = await bus.reload();

      return {
        id: updated.id,
        licensePlate: updated.licensePlate,
        model: updated.model,
        capacity: updated.capacity,
        status: updated.status,
        seats: (updated.seats || []).map((s) => ({
          id: s.id,
          seatNumber: s.seatNumber,
          row: s.row,
          col: s.col,
        })),
      };
    } catch (err) {
      if (err && typeof err === "object" && "status" in err) throw err;

      if (err instanceof UniqueConstraintError) {
        throw status(409, { error: "Duplicate", details: err.errors });
      }

      throw status(500, {
        error: "Internal server error",
        details: String(err),
      });
    }
  }

    static async changeAvatar(
      body: BusModel.changeAvatarBody,
      id: string,
    ): Promise<{ url: string }> {
      const res = await cloudinaryService.uploadAndAutoCropSquare(
        body.source,
        500,
        {
          folder: "avatars",
        },
      );
  
      const url = res.secureUrl ?? res.url;
  
      await db.query(`UPDATE "Buses" b SET image = :url WHERE b.id::text = :id`, {
        replacements: { url, id },
      });
  
      return {
        url,
      };
    }
}
