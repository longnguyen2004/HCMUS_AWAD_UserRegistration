import { Elysia } from "elysia";
import { TicketModel } from "./ticket.model.js";
import { TicketService } from "./ticket.service.js";
import { AuthService } from "../../lib/auth.js";
import { authGuard } from "../auth/index.js";

export const TicketController = new Elysia({ prefix: "/ticket" })
  .use(authGuard)
  .get(
    "/my-bookings",
    async ({ user, query }) => {
      const response = await TicketService.getUserBookings(user.id, query);
      return response;
    },
    {
      auth: true,
      query: TicketModel.getUserBookingsQuery,
      response: {
        200: TicketModel.getUserBookingsResponse,
      },
    },
  )
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
    async ({ body, request: { headers } }) => {
      const session = await AuthService.api.getSession({
        headers,
      });
      const response = await TicketService.create(body, session?.user.id);
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
        404: TicketModel.notFound,
      },
    },
  )
  .get("/:id/pdf", async ({ params: { id } }) => {
    const file = await TicketService.createPdf(id);
    return new Response(file.content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  })
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
