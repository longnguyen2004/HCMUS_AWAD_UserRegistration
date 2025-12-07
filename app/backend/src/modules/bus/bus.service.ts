import { Seat } from "../../db/models/seat.model.js";
import { Bus } from "../../db/models/bus.model.js";
import { db } from "../../db/db.js";
import { BusModel } from "./bus.model.js";
import { UniqueConstraintError } from "sequelize";
import { status } from "elysia";

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
}
