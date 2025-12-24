import { Elysia } from "elysia";
import { UserModel } from "./user.model.js";
import { UserService } from "./user.service.js";

export const UserController = new Elysia({ prefix: "/user" })
  .patch(
    "/:id",
    async ({ params: { id }, body }) => {
      const response = await UserService.modifyUser(id, body);
      return response;
    },
    {
      body: UserModel.modifyBody,
      response: {
        200: UserModel.modifyResponse,
      },
    },
  );
