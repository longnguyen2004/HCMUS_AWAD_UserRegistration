import { Elysia, t } from "elysia";
import { jwt } from "../../jwt/jwt.js";
import { AuthModel } from "./model.js";
import { AuthService } from "./service.js";

export const auth = new Elysia()
    .use(jwt)
    .post("/login", async ({ body, jwt, cookie: { auth } }) => {
        await AuthService.signIn(body);
        const token = await jwt.sign({ email: body.email });
        auth.set({
            value: token,
            httpOnly: true,
            maxAge: 7 * 86400,
        })
        return "" as const;
    }, {
        body: AuthModel.signInBody, response: {
            200: t.Literal(""),
            400: AuthModel.signInInvalid
        }
    })
