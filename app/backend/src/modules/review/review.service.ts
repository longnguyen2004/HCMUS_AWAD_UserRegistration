import { Trip } from "../../db/models/trip.model.js";
import { ReviewModel } from "./review.model.js";
import { status } from "elysia";
import { Review } from "../../db/models/review.model.js";
import { db } from "../../db/db.js";
import { QueryTypes } from "sequelize";

interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

const REVIEWS_PER_PAGE = 5;

export abstract class ReviewService {
  static async create(
    body: ReviewModel.createBody,
    tripId: string,
    user: AuthUser,
  ): Promise<ReviewModel.createResponse> {

    const trip = await Trip.findByPk(tripId);
    if (!trip) throw status(404, { message: "Trip not found" });

    console.log(user.id)

    const payload = {
      tripId: trip.id,
      userId: user.id,
      star: body.star,
      message: body.message ?? null,
    };

    const review = await Review.create(payload);
    return {
      name: user.name ?? user.email ?? "",
      star: review.star,
      message: review.message ?? undefined,
    };
  }

  static async getAll(
    id: string,
    body: ReviewModel.getAllQuery,
  ): Promise<ReviewModel.getAllResponse> {
    const trip = await Trip.findByPk(id);
    if (!trip) throw status(404, { message: "Trip not found" });

    const page = body.page ?? 1;
    const per_page = REVIEWS_PER_PAGE;
    const offset = (page - 1) * per_page;

    const countResult = await db.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "Reviews" WHERE "tripId" = :tripId`,
      {
        type: QueryTypes.SELECT,
        replacements: { tripId: trip.id },
      },
    );
    const total = Number(countResult[0]?.count ?? 0);

    const rows = await db.query<{
      name?: string | null;
      star: number;
      message?: string | null;
    }>(
      `SELECT r.*, COALESCE(NULLIF(u.name, ''), u.email) as name
       FROM "Reviews" r
       LEFT JOIN "user" u ON u.id::text = r."userId"
       WHERE r."tripId" = :tripId
       ORDER BY r."createdAt" DESC
       LIMIT :limit OFFSET :offset`,
      {
        type: QueryTypes.SELECT,
        replacements: { tripId: trip.id, limit: per_page, offset },
      },
    );

    const data = rows.map((r) => ({
      name: r.name ?? "",
      star: r.star,
      message: r.message ?? undefined,
    }));

    return {
      data,
      total,
      page,
      per_page,
    };
  }
}
