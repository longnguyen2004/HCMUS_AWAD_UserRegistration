import { Elysia, status } from "elysia";
import { BusModel } from "./bus.model.js";
import { BusService } from "./bus.service.js";
import { authGuard } from "../auth/index.js";

export const BusController = new Elysia({ prefix: "/bus" })
  .use(authGuard)
  .post(
    "/create",
    async ({ body, user }) => {
      if (user.role != "admin")
        throw status(403, "Forbidden");
      const response = await BusService.create(body);
      return response;
    },
    {
      auth: true,
      body: BusModel.createBody,
      response: {
        200: BusModel.createResponse,
        400: BusModel.errorResponse,
        500: BusModel.errorResponse,
      },
    },
  )
  .get(
    "/",
    async ({ query }) => {
      const buses = await BusService.getAll(query);
      return buses;
    },
    {
      query: BusModel.getAllQuery,
      response: {
        200: BusModel.getAllResponse,
        500: BusModel.errorResponse,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const bus = await BusService.getOne(id);
      return bus;
    },
    {
      response: {
        200: BusModel.getOneResponse,
        404: BusModel.errorResponse,
        500: BusModel.errorResponse,
      },
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, user }) => {
      if (user.role != "admin")
        throw status(403, "Forbidden");
      const updated = await BusService.modify(id, body);
      return updated;
    },
    {
      auth: true,
      body: BusModel.modifyBody,
      response: {
        200: BusModel.modifyResponse,
        404: BusModel.errorResponse,
        409: BusModel.errorResponse,
        500: BusModel.errorResponse,
      },
    },
  );

export default BusController;
