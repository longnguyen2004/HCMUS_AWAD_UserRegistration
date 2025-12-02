import { Elysia } from "elysia";
import { CityModel } from "./city.model.js";
import { CityService } from "./city.service.js";
import { authGuard } from "../auth/index.js";

export const CityController = new Elysia({ prefix: "/city" })
  .use(authGuard)
  .get(
    "/",
    async () => {
      const response = await CityService.getAll();

      return response;
    },
    {
      response: {
        200: CityModel.cityResponse,
      },
    },
  );
