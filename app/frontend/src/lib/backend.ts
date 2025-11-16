import ky from "ky";
import { treaty } from "@elysiajs/eden";
import type { App } from "backend";

export const tokens = {
  get accessToken() {
    return localStorage.getItem("accessToken");
  },
  get refreshToken() {
    return localStorage.getItem("refreshToken");
  },
  set accessToken(v: string | null) {
    if (!v)
      localStorage.removeItem("accessToken");
    else
      localStorage.setItem("accessToken", v);
  },
  set refreshToken(v: string | null) {
    if (!v)
      localStorage.removeItem("refreshToken");
    else
      localStorage.setItem("refreshToken", v);
  }
}

const client = ky.create({
  credentials: "include",
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [(request, options, { retryCount }) => {
      if (tokens.accessToken)
        request.headers.set("Authorization", `Bearer ${tokens.accessToken}`)
    }],
    afterResponse: [async (req, opt, res) => {
      if (res.status === 401 && !req.url.includes("/refresh") && tokens.accessToken && tokens.refreshToken)
      {
        const refresh = await backend.refresh.post({ refreshToken: tokens.refreshToken });
        if (refresh.status === 200)
        {
          tokens.accessToken = refresh.data!.accessToken;
          return ky.retry();
        }
        else
        {
          tokens.accessToken = tokens.refreshToken = null
        }
      }
      return res;
    }]
  }
})
export const backend = treaty<App>(import.meta.env.VITE_BACKEND_URL, {
  fetcher: client
})
