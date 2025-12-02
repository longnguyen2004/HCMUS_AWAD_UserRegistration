import { Elysia } from "elysia";
import { RouteModel } from "./route.model.js";
import { RouteService } from "./route.service.js";
//import { authGuard } from "../auth/index.js";

export const RouteController = new Elysia({ prefix: "/route" })
  //.use(authGuard)
  .post(
    "/create",
    async ({ body }) => {
      const response = await RouteService.create(body);
      return response;
    },
    {
      body: RouteModel.createBody,
      response: {
        200: RouteModel.createBodyResponse,
        404: RouteModel.notFound,
      },
    },
  )
  //.use(authGuard)
  .get(
    "/search",
    async ({ query }) => {
      const response = await RouteService.search(query);
      return response;
    },
    {
      query: RouteModel.searchBody,
      response: { 200: RouteModel.searchBodyResponse },
    },
  );
