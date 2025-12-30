import { Elysia, t } from "elysia";
import { authGuard } from "../auth/index.js";
import { UserService } from "./user.service.js";
import { UserModel } from "./user.model.js";

export const UserController = new Elysia({ prefix: "/user" })
  .use(authGuard)
  .patch(
    "/update",
    async ({ body, user }) => {
      const response = await UserService.changeAvatar(body, user.id);
      return response;
    },
    {
      auth: true,
      body: UserModel.changeAvatarBody,
      response: {
        200: t.Object({ url: t.String() }),
      },
    },
  );
