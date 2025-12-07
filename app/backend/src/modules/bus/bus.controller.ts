import { Elysia } from "elysia";
import { BusModel } from "./bus.model.js";
import { BusService } from "./bus.service.js";
import { authGuard } from "../auth/index.js";

export const BusController = new Elysia({ prefix: "/bus" }).use(authGuard).post(
  "/create",
  async ({ body }) => {
    const response = await BusService.create(body);
    return response;
  },
  {
    body: BusModel.createBody,
    response: {
      200: BusModel.createResponse,
      400: BusModel.errorResponse,
      500: BusModel.errorResponse,
    },
  },
);

export default BusController;
