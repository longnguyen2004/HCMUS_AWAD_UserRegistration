import { Elysia } from "elysia";
import { TicketModel } from "./ticket.model.js";
import { TicketService } from "./ticket.service.js";

export const TicketController = new Elysia({ prefix: "/ticket" })
  .get(
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
  )
  .post(
    "/create",
    async ({ body }) => {
      const response = await TicketService.create(body);
      return response;
    },
    {
      body: TicketModel.createBody,
      response: {
        200: TicketModel.createResponse,
      },
    },
  )
  .get(
    "/:id/initPayment",
    async ({ params: { id } }) => {
      const response = await TicketService.initPayment(id);
      return response;
    },
    {
      response: {
        200: TicketModel.initPayResponse,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const response = await TicketService.get(id);
      return response;
    },
    {
      response: {
        200: TicketModel.getResponse,
        404: TicketModel.notFound
      },
    },
  )
  .post(
    "/processPayment",
    async ({ body }) => {
      const response = await TicketService.processPayment(body);
      return response;
    },
    {
      body: TicketModel.processPaymentBody,
      response: {
        200: TicketModel.modifyResponse,
      },
    },
  );
