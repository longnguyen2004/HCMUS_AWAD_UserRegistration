import { Elysia, status } from "elysia";
import { BusStopModel } from "./busstop.model.js";
import { BusStopService } from "./busstop.service.js";
import { authGuard } from "../auth/index.js";

export const BusStopController = new Elysia({ prefix: "/busstop" })
  .use(authGuard)
  .get(
    "/search",
    async ({ query }) => {
      const response = await BusStopService.search(query);
      return response;
    },
    {
      query: BusStopModel.searchBody,
      response: {
        200: BusStopModel.searchResponse,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const response = await BusStopService.get({ id });
      return response;
    },
    {
      response: {
        200: BusStopModel.getResponse,
        404: BusStopModel.notFound,
      },
    },
  )
  .post(
    "/create",
    async ({ body, user }) => {
      if (user.role != "admin")
        throw status(403, "Forbidden");
      const response = await BusStopService.create(body);
      return response;
    },
    {
      auth: true,
      body: BusStopModel.createBody,
      response: {
        200: BusStopModel.createResponse,
      },
    },
  );
