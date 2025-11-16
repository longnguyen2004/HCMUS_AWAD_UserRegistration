import Value from "typebox/value";
import { Elysia, status, t } from "elysia";
import { decodeJwt } from "jose";
import { jwtAccess, jwtAccessSchema, jwtRefresh } from "../../jwt/jwt.js";
import { AuthModel } from "./model.js";
import { AuthService } from "./service.js";

const ACCESS_TOKEN_EXP = 24 * 3600 * 1000; // 1 day
const REFRESH_TOKEN_EXP = 7 * 24 * 3600 * 1000 // 1 week

export const auth = new Elysia()
    .use(jwtAccess)
    .use(jwtRefresh)
    .post("/login", async ({ body, jwtAccess, jwtRefresh }) => {
        await AuthService.signIn(body);
        const now = Date.now();
        const accessToken = await jwtAccess.sign({ email: body.email, exp: Math.floor(now + ACCESS_TOKEN_EXP) });
        const refreshToken = await jwtRefresh.sign({ email: body.email, exp: Math.floor(now + REFRESH_TOKEN_EXP) });
        return { accessToken, refreshToken }
    }, {
        body: AuthModel.signInBody, response: {
            200: AuthModel.signInResponse,
            400: AuthModel.signInInvalid
        }
    })
    .post("/refresh", async ({ body, headers, jwtAccess, jwtRefresh }) => {
        if (!headers.Authorization?.startsWith("Bearer "))
            throw status(401, "Unauthorized")
        let claims;
        try {
            claims = Value.Parse(jwtAccessSchema, decodeJwt(headers.Authorization.replace("Bearer ", "")));
        }
        catch {
            throw status(401, "Unauthorized")
        }
        const refreshTokenBody = await jwtRefresh.verify(body.refreshToken);
        if (!refreshTokenBody || refreshTokenBody.email != claims.email)
            throw status(401, "Unauthorized")
        const now = Date.now();
        const accessToken = await jwtAccess.sign({ email: refreshTokenBody.email, exp: Math.floor(now + ACCESS_TOKEN_EXP) });
        return { accessToken }
    }, {
        body: AuthModel.refreshBody,
        response: {
            200: AuthModel.refreshResponse,
            401: t.Literal("Unauthorized")
        }
    })

export const authGuard = new Elysia()
    .use(jwtAccess)
    .resolve(async ({ jwtAccess, headers }) => {
        if (!headers.authorization?.startsWith("Bearer "))
            throw status(401, "Unauthorized");
        const verifyResult = await jwtAccess.verify(headers.authorization.replace("Bearer ", ""))
        if (!verifyResult)
            throw status(401, "Unauthorized");
        return { token: verifyResult }
    }
    )
    .as("scoped");
