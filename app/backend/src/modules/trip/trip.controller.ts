import { Elysia } from "elysia";
import { TripModel } from "./trip.model.js";
import { TripService } from "./trip.service.js";
import { authGuard } from "../auth/index.js";

export const TripController = new Elysia({ prefix: "/trip" })
  .use(authGuard)
  .get(
    "/search",
    async ({ query }) => {
      const response = await TripService.search(query);

      return response;
    },
    {
      query: TripModel.searchBody,
      response: {
        200: TripModel.searchResponse,
        404: TripModel.notFound,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const response = await TripService.get({ id });
      return response;
    },
    {
      response: {
        200: TripModel.getResponse,
        404: TripModel.notFound,
      },
    },
  )
  .get(
    "/:id/seats_occupied",
    async ({ params: { id } }) => {
      const response = await TripService.getSeatsOccupied({ id });
      return response;
    },
    {
      response: {
        200: TripModel.getSeatsOccupiedResponse,
      },
    },
  )
  .post(
    "/create",
    async ({ body }) => {
      const response = await TripService.create(body);
      return response;
    },
    {
      auth: true,
      body: TripModel.createBody,
      response: {
        200: TripModel.createResponse,
        404: TripModel.notFound,
      },
    },
  );
