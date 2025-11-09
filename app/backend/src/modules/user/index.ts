import { Elysia, t } from "elysia";
import { UserModel } from "./model.js";
import { UserService } from "./service.js";

export const user = new Elysia()
    .post("/register", async ({ body }) => {
        const response = await UserService.register(body);
        return response;
    }, {
        body: UserModel.registerBody, response: {
            200: t.Object({ email: t.String() }),
            400: UserModel.registerEmailAlreadyExists
        }
    })
