import { Trip } from "../../db/models/trip.model.js";
import { ReviewModel } from "./review.model.js";
import { status } from "elysia";
import { AuthService } from "../../lib/auth.js";
import { Review } from "../../db/models/review.model.js";

const REVIEWS_PER_PAGE = 5;

export abstract class ReviewService {
  static async create(
    body: ReviewModel.createBody,
    tripId: string,
    userId: string,
  ): Promise<ReviewModel.createResponse> {
    const trip = await Trip.findByPk(tripId);
    if (!trip) throw status(404, { message: "Trip not found" });

    const user = await AuthService.api.getUser({ query: { id: userId } });
    if (!user) throw status(404, { message: "User not found" });

    const payload = {
      tripId: trip.id,
      user: user.id,
      star: body.star,
      message: body.message,
    };

    const review = await Review.create(payload);
    return {
      email: user.email,
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

    const result = await Review.findAndCountAll({
      where: { tripId: trip.id },
      limit: per_page,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const rows = result.rows as Review[];

    const data = await Promise.all(
      rows.map(async (r) => {
        let email = "";
        const user = await AuthService.api.getUser({ query: { id: r.userId } });
        email = user?.email ?? "";
        return {
          email,
          star: r.star,
          message: r.message ?? undefined,
        };
      }),
    );

    return {
      data,
      total: result.count as number,
      page,
      per_page,
    };
  }
}
