import { Elysia } from "elysia";
import { ReviewModel } from "./review.model.js";
import { ReviewService } from "./review.service.js";
import { authGuard } from "../auth/index.js";

export const ReviewController = new Elysia({ prefix: "/review" })
  .use(authGuard)
  .get(
    "/:id",
    async ({ params: { id }, query }) => {
      const response = await ReviewService.getAll(id,query);
      return response;
    },
    {
      query: ReviewModel.getAllQuery,
      response: {
        200: ReviewModel.getAllResponse,
      },
    },
  )
  .post(
    "/:tripId",
    async ({ body, params: { tripId }, user }) => {
      const response = await ReviewService.create(body, tripId, user);
      return response;
    },
    {
      auth: true,
      body: ReviewModel.createBody,
      response: {
        200: ReviewModel.createResponse,
      },
    },
  )
