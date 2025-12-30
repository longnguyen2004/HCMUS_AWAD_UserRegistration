import { Elysia } from "elysia";
import { ReportModel } from "./report.model.js";
import { ReportService } from "./report.service.js";

export const ReportController = new Elysia({ prefix: "/report" })
  .get(
    "revenue",
    async ({ query }) => {
      const response = await ReportService.getRevenue(query);
      return response;
    },
    {
      query: ReportModel.getRevenueBody,
      response: {
        200: ReportModel.getRevenueResponse,
      },
    },
  )
  .get(
    "topRoute",
    async ({ query }) => {
      const response = await ReportService.getTopRoute(query);
      return response;
    },
    {
      query: ReportModel.getTopRouteBody,
      response: {
        200: ReportModel.getTopRouteResponse,
      },
    },
  );
