import { Elysia } from "elysia";
import { EmailService } from "./email.service.js";
import { EmailModel } from "./email.model.js";

export const EmailController = new Elysia({ prefix: "/email" })
  .onError(({ error }) => {
    console.log(error);
    return error;
  })
  .post(
    "/send",
    async ({ body }) => {
      const response = await EmailService.sendMail(body);
      return response;
    },
    {
      body: EmailModel.sendBody,
    },
  );
