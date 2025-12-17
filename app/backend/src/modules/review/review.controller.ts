import { Elysia } from "elysia";
import { ReviewModel } from "./review.model.js";
import { ReviewService } from "./review.service.js";

export const ReviewController = new Elysia({ prefix: "/review" })
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
    "/:tripId/:userId",
    async ({ body, params: { tripId, userId } }) => {
      const response = await ReviewService.create(body, tripId, userId);
      return response;
    },
    {
      body: ReviewModel.createBody,
      response: {
        200: ReviewModel.createResponse,
      },
    },
  )
