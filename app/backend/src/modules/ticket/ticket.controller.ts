import { Elysia } from "elysia";
import { TicketModel } from "./ticket.model.js";
import { TicketService } from "./ticket.service.js";

export const TicketController = new Elysia({ prefix: "/ticket" }).get(
  "/search",
  async ({ query }) => {
    const response = await TicketService.search(query);
    return response;
  },
  {
    query: TicketModel.searchBody,
    response: {
      200: TicketModel.searchResponse,
    },
  },
);
